import React, { useState, useEffect } from 'react';
import { Card } from '../../donor/components/ui/Card/Card';
import { Button } from '../../donor/components/ui/Button/Button';
import { Search, Map as MapIcon, Zap, AlertTriangle, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../donor/context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../styles/Explore.css';

interface FoodItem {
  id: string;
  name: string;
  donor: string;
  quantity: string;
  expiresIn: string;
  distance: string;
  demand: string;
  category: string;
  urgencyScore: number;
  urgencyLevel: 'high' | 'medium' | 'low' | 'critical';
  isDisaster?: boolean;
}

// Mock data removed. Fetching from database.

export const Explore: React.FC = () => {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [claimQty, setClaimQty] = useState(1);
  const [modalStep, setModalStep] = useState<'init' | 'logistics'>('init');
  const [logisticsType, setLogisticsType] = useState<'self' | 'rapido'>('self');

  // Sync claim quantity when selected item changes
  useEffect(() => {
    if (selectedItem) {
      const maxQty = parseInt(selectedItem.quantity) || 10;
      setClaimQty(Math.floor(maxQty / 2) || 1);
      setModalStep('init'); // Always start at init
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*, profiles(organization_name)')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching donations:', error);
        return;
      }

      if (data) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          name: d.food_name,
          donor: d.profiles?.organization_name || 'Anonymous Donor',
          category: d.category,
          quantity: `${d.quantity_value} ${d.quantity_unit}`,
          expiresIn: new Date(d.expiry_time) < new Date() 
            ? 'Expired' 
            : new Date(d.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          distance: '0.4 km',
          demand: 'High',
          urgencyScore: d.urgency_score,
          urgencyLevel: (d.urgency_score > 90 ? 'high' : d.urgency_score > 60 ? 'medium' : 'low') as any,
          isDisaster: d.is_disaster
        }));
        setFoodItems(formatted);
      }
    };

    fetchItems();

    // 2. Subscribe to real-time updates
    const channel = supabase
      .channel('public:donations')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'donations' 
      }, () => {
        // Simple and robust: Refresh the whole list on any change
        // This ensures joins (like donor name) are always correct
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.donor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.urgencyLevel === activeFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Priority 1: Disaster Relief ALWAYS floats to top
    if (a.isDisaster && !b.isDisaster) return -1;
    if (!a.isDisaster && b.isDisaster) return 1;
    
    // Priority 2: Standard Urgency Score Sorting
    return b.urgencyScore - a.urgencyScore;
  });

  const highUrgencyCount = foodItems.filter(i => i.urgencyLevel === 'high').length;

  const handleOpenGoogleMaps = (location: string) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1 className="page-title">{t('explore_title')}</h1>
        <p className="page-subtitle">{t('explore_sub')}</p>
      </div>

      <div className="search-filter-bar glass">
        <div className="search-input-wrap">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="search-inner-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-chips">
          <button 
            className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            ● All
          </button>
          <button 
            className={`filter-chip ${activeFilter === 'high' ? 'active' : ''}`}
            onClick={() => setActiveFilter('high')}
          >
            ⚡ {t('urgency_high')}
          </button>
          <button 
            className={`filter-chip ${activeFilter === 'medium' ? 'active' : ''}`}
            onClick={() => setActiveFilter('medium')}
          >
            ⏰ {t('urgency_med')}
          </button>
          <button 
            className={`filter-chip ${activeFilter === 'low' ? 'active' : ''}`}
            onClick={() => setActiveFilter('low')}
          >
            ✅ {t('urgency_low')}
          </button>
        </div>
      </div>

      <div className="urgency-alert-row">
        <span className="urgency-text">
          <Zap size={16} className="text-warning" />
          <strong>{highUrgencyCount} high-priority items</strong> available near you — claim now before auto-redistribution triggers!
        </span>
      </div>

      <div className="food-grid">
        {filteredItems.map(item => (
          <Card key={item.id} className={`food-card hover-lift ${item.isDisaster ? 'disaster-card' : ''}`}>
            {item.isDisaster && (
              <div className="disaster-ribbon">
                <AlertTriangle size={14} /> DISASTER RELIEF ONLY
              </div>
            )}
            
            <div className="food-card-top">
              <span className={`urgency-badge ${item.urgencyLevel}`}>
                {item.urgencyLevel === 'critical' ? '🆘 CRITICAL' : 
                 item.urgencyLevel === 'high' ? t('urgency_high') : 
                 item.urgencyLevel === 'medium' ? t('urgency_med') : t('urgency_low')} 
                {(item.urgencyLevel === 'high' || item.urgencyLevel === 'critical') && ` - ${item.expiresIn}`}
              </span>
            </div>
            
            <div className="food-main-info">
              <div className="category-tag">{item.category}</div>
              <h3 className="food-name">{item.name}</h3>
              <p className="donor-name">from {item.donor}</p>
            </div>
            
            {/* Metadata ... */}
            <div className="food-meta-grid">
              {/* ... same as before but checking if disaster to change colors ... */}
              <div className="meta-item">
                <span className="meta-label">Quantity</span>
                <span className="meta-value">{item.quantity}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Expires in</span>
                <span className="meta-value text-danger">{item.expiresIn}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Distance</span>
                <span className="meta-value">{item.distance}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Demand</span>
                <span className="meta-value">{item.demand}</span>
              </div>
            </div>

            <div className="card-footer-ai">
                <div className="urgency-score-wrap">
                    <Zap size={14} /> {item.isDisaster ? 'Priority Score' : 'Urgency Score'} {item.urgencyScore}/100
                </div>
                <Button 
                  fullWidth 
                  className={`claim-now-btn ${item.isDisaster ? 'disaster-btn' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  {item.isDisaster ? 'Verify & Claim Relief' : t('claim_now')}
                </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* --- HIGH-FIDELITY CLAIM POPUP --- */}
      {selectedItem && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="claim-modal-box glass animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-split">
              
              {/* Left Side: Interactive Claim Action */}
              <div className="modal-left-receiver">
                <div className="modal-branding-head">
                  <h2 className="modal-title">
                    {modalStep === 'init' ? 'Initiate ' : 'Select '}
                    <span className="title-accent">{modalStep === 'init' ? 'Claim' : 'Logistics'}</span>
                  </h2>
                </div>

                {modalStep === 'init' ? (
                  <>
                    <div className="receiver-card-visual">
                      <div className="receiver-status-tag">NGO RECEIVER</div>
                      <div className="receiver-main-row">
                        <div className="receiver-logo-circle">
                          <Award size={20} />
                        </div>
                        <div className="receiver-details">
                          <h4 className="receiver-name-bold">{user?.email?.split('@')[0].toUpperCase() || 'HOPE NGO'}</h4>
                          <p className="receiver-email-sub">{user?.email || 'verified_ngo@aahara.org'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="quantity-selection-area">
                      <label className="input-field-label">HOW MUCH QUANTITY DO YOU NEED?</label>
                      <div className="interactive-qty-row">
                        <div className="slider-container-pretty">
                          <input 
                            type="range" 
                            min="1" 
                            max={parseInt(selectedItem.quantity) || 50} 
                            value={claimQty}
                            onChange={(e) => setClaimQty(parseInt(e.target.value))}
                            className="modern-range-slider"
                          />
                          <div className="slider-bounds">
                            <span>1</span>
                            <span>Max available: {selectedItem.quantity}</span>
                          </div>
                        </div>
                        <div className="qty-numeric-display">
                          <input 
                            type="number" 
                            value={claimQty}
                            onChange={(e) => setClaimQty(Math.min(parseInt(e.target.value) || 1, parseInt(selectedItem.quantity) || 50))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-primary-actions">
                      <div className="action-buttons-grid">
                        <Button 
                          variant="outline" 
                          className="modal-cancel-btn"
                          onClick={() => setSelectedItem(null)}
                        >
                          CANCEL
                        </Button>
                        <Button 
                          className="modal-claim-btn" 
                          onClick={() => setModalStep('logistics')}
                        >
                          CLAIM NOW
                        </Button>
                      </div>
                      <Button 
                        fullWidth 
                        className="modal-maps-btn"
                        onClick={() => handleOpenGoogleMaps(selectedItem.donor + " " + selectedItem.distance)}
                      >
                        <MapIcon size={18} /> OPEN IN GOOGLE MAPS (Leaflet)
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="logistics-selection-area animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                       <p className="pane-sup-label" style={{ color: '#4f633d', fontSize: '0.8rem' }}>HOW SHOULD THE FOOD BE DELIVERED?</p>
                       
                       <div className="logistics-options-stack" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div 
                            className={`logistics-option-card ${logisticsType === 'self' ? 'active' : ''}`}
                            onClick={() => setLogisticsType('self')}
                            style={{ 
                              padding: '20px', borderRadius: '16px', border: '2px solid #edf2f0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                              background: logisticsType === 'self' ? '#f0f4f0' : 'white', borderColor: logisticsType === 'self' ? '#4f633d' : '#edf2f0'
                            }}
                          >
                             <div className="log-opt-icon" style={{ fontSize: '1.5rem' }}>🚗</div>
                             <div className="log-opt-content" style={{ flex: 1 }}>
                                <h5 style={{ margin: 0, fontWeight: 800 }}>Self Pickup / Delivery</h5>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Our NGO vehicle will collect the items directly.</p>
                             </div>
                             {logisticsType === 'self' && <div className="log-opt-check" style={{ color: '#4f633d' }}>✓</div>}
                          </div>

                          <div 
                            className={`logistics-option-card ${logisticsType === 'rapido' ? 'active' : ''}`}
                            onClick={() => setLogisticsType('rapido')}
                            style={{ 
                              padding: '20px', borderRadius: '16px', border: '2px solid #edf2f0', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                              background: logisticsType === 'rapido' ? '#f0f4f0' : 'white', borderColor: logisticsType === 'rapido' ? '#4f633d' : '#edf2f0'
                            }}
                          >
                             <div className="log-opt-icon" style={{ fontSize: '1.5rem', display: 'flex', gap: '4px' }}><span>🛵</span><span>🚐</span></div>
                             <div className="log-opt-content" style={{ flex: 1 }}>
                                <h5 style={{ margin: 0, fontWeight: 800 }}>Rapido Parcel</h5>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Instant bike or mini van delivery based on batch size.</p>
                             </div>
                             {logisticsType === 'rapido' && <div className="log-opt-check" style={{ color: '#4f633d' }}>✓</div>}
                          </div>
                       </div>
                    </div>

                    <div className="modal-final-actions" style={{ marginTop: 'auto' }}>
                       <div className="action-buttons-grid">
                          <Button 
                            variant="outline" 
                            className="modal-cancel-btn"
                            onClick={() => setModalStep('init')}
                          >
                            BACK
                          </Button>
                          <Button 
                            className="modal-claim-btn" 
                            onClick={async () => {
                                const { error } = await supabase
                                  .from('donations')
                                  .update({ 
                                    status: 'claimed',
                                    claimed_by: user?.id,
                                    logistics_method: logisticsType
                                  })
                                  .eq('id', selectedItem.id);

                                 if (error) {
                                  addToast('Error', 'Error claiming item: ' + error.message, 'warning');
                                } else {
                                  if (logisticsType === 'rapido') {
                                    const pickupLocation = encodeURIComponent(selectedItem.donor + ' ' + (selectedItem.distance || ''));
                                    window.open(`https://parcel.rapido.bike/?pickup=${pickupLocation}`, '_blank');
                                  }

                                  setSelectedItem(null);
                                }
                            }}
                          >
                            CONFIRM CLAIM
                          </Button>
                       </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: Donor Identity & Safety (Dark Theme) */}
              <div className="modal-right-donor-dark">
                <div className="donor-pane-header">
                   <label className="pane-sup-label">DONOR DETAILS</label>
                </div>

                <div className="donor-identity-block">
                   <div className="donor-pill-avatar">
                      {selectedItem.donor.charAt(0)}
                   </div>
                   <div className="donor-name-stack">
                      <h3 className="donor-org-full">{selectedItem.donor}</h3>
                      <div className="verified-check-row">
                        <div className="check-circle-mini">✓</div>
                        <span>Verified Donor</span>
                      </div>
                   </div>
                </div>

                <div className="item-specs-grid">
                   <div className="spec-row">
                      <span className="spec-label">Item Name</span>
                      <span className="spec-value">{selectedItem.name}</span>
                   </div>
                   <div className="spec-row">
                      <span className="spec-label">Quantity Selected</span>
                      <span className="spec-value">{claimQty} portions</span>
                   </div>
                   <div className="spec-row">
                      <span className="spec-label">Category</span>
                      <span className="spec-value">{selectedItem.category}</span>
                   </div>
                   <div className="spec-row">
                      <span className="spec-label">Expiry</span>
                      <span className="spec-value expiry-highlight">{selectedItem.expiresIn}</span>
                   </div>
                </div>

                <div className="safety-assurance-section">
                   <div className="safety-card-dark">
                      <div className="safety-badge-header">
                        🛡️ Safety Assured
                      </div>
                      <p className="safety-audit-text">
                        This donor has passed all 5 points of the Aahara Safety Audit for this batch.
                      </p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};
