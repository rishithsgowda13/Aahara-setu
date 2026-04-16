import React, { useState, useEffect } from 'react';
import { Card } from '../../donor/components/ui/Card/Card';
import { Button } from '../../donor/components/ui/Button/Button';
import { Search, Map as MapIcon, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../donor/context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
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

const MOCK_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'mock-1',
    name: 'Assorted Pastries',
    donor: 'Gaurav Sweets',
    quantity: '25 portions',
    expiresIn: '45 mins',
    distance: '0.4 km',
    demand: 'High',
    category: 'Bakery',
    urgencyScore: 98,
    urgencyLevel: 'high'
  },
  {
    id: 'mock-2',
    name: 'Paneer Tikka Thali',
    donor: 'Skyline Hotels',
    quantity: '10 packs',
    expiresIn: '2 hrs',
    distance: '1.2 km',
    demand: 'Medium',
    category: 'Cooked Meals',
    urgencyScore: 85,
    urgencyLevel: 'medium'
  },
  {
    id: 'mock-disaster-1',
    name: 'Survival Kits (Bread & Milk)',
    donor: 'Central Relief Hub',
    quantity: '50 units',
    expiresIn: 'ASAP',
    distance: '2.5 km',
    demand: 'Critical',
    category: 'Emergency',
    urgencyScore: 100,
    urgencyLevel: 'critical',
    isDisaster: true
  }
];

export const Explore: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [claimQty, setClaimQty] = useState(1);

  // Sync claim quantity when selected item changes
  useEffect(() => {
    if (selectedItem) {
      const maxQty = parseInt(selectedItem.quantity) || 10;
      setClaimQty(Math.floor(maxQty / 2) || 1);
    }
  }, [selectedItem]);

  useEffect(() => {
    // 1. Fetch existing items
    const fetchItems = async () => {
      const { data } = await supabase
        .from('donations')
        .select('*, profiles(organization_name)')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (data) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          name: d.food_name,
          donor: d.profiles?.organization_name || 'Anonymous Donor',
          category: d.category,
          quantity: `${d.quantity_value} ${d.quantity_unit}`,
          expiresIn: new Date(d.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          distance: '0.4 km', // Default for demo
          demand: 'High',
          urgencyScore: d.urgency_score,
          urgencyLevel: (d.urgency_score > 90 ? 'high' : d.urgency_score > 60 ? 'medium' : 'low') as 'high' | 'medium' | 'low' | 'critical',
          isDisaster: d.is_disaster
        }));
        setFoodItems([...formatted, ...MOCK_FOOD_ITEMS]);
      }
    };

    fetchItems();

    // 2. Subscribe to real-time updates
    const channel = supabase
      .channel('realtime_food')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload) => {
        const newItem = payload.new as any;
        const formatted: FoodItem = {
          id: newItem.id,
          name: newItem.food_name,
          donor: 'New Donor', // Profile join not easy in single real-time payload
          category: newItem.category,
          quantity: `${newItem.quantity_value} ${newItem.quantity_unit}`,
          expiresIn: new Date(newItem.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          distance: '0.4 km',
          demand: 'High',
          urgencyScore: newItem.urgency_score,
          urgencyLevel: (newItem.urgency_score > 90 ? 'high' : newItem.urgency_score > 60 ? 'medium' : 'low') as 'high' | 'medium' | 'low' | 'critical',
          isDisaster: newItem.is_disaster
        };
        setFoodItems(prev => [formatted, ...prev]);
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

      {/* --- CLAIM POPUP MODAL --- */}
      {selectedItem && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="claim-modal-box glass animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-split">
              
              {/* Left Side: Receiver & Interactive Claim */}
              <div className="modal-left-receiver">
                <h2 className="modal-title">Initiate <span className="gradient-text">Claim</span></h2>
                <div className="receiver-meta-info">
                  <div className="receiver-badge">NGO RECEIVER</div>
                  <h4 className="receiver-org">{user?.email?.split('@')[0].toUpperCase() || 'HOPE NGO'}</h4>
                  <p className="receiver-email">{user?.email}</p>
                </div>

                <div className="quantity-interaction-box">
                  <label className="section-label">HOW MUCH QUANTITY DO YOU NEED?</label>
                  <div className="qty-visual-row">
                    <input 
                      type="range" 
                      min="1" 
                      max={parseInt(selectedItem.quantity) || 50} 
                      value={claimQty}
                      onChange={(e) => setClaimQty(parseInt(e.target.value))}
                      className="pretty-slider"
                    />
                    <input 
                      type="number" 
                      className="quantity-val-box"
                      min="1"
                      max={parseInt(selectedItem.quantity) || 50}
                      value={claimQty}
                      onChange={(e) => setClaimQty(Math.min(parseInt(e.target.value) || 1, parseInt(selectedItem.quantity) || 50))}
                    />
                  </div>
                  <p className="qty-helper-text">Max available: {selectedItem.quantity}</p>
                </div>

                <div className="modal-actions-footer">
                  <Button variant="outline" className="btn-cancel" style={{ background: '#e7e5d8', color: '#333' }} onClick={() => setSelectedItem(null)}>CANCEL</Button>
                  <Button 
                    className="btn-confirm" 
                    onClick={() => {
                        alert(`Claiming ${claimQty} portions of ${selectedItem.name}. Success!`);
                        setSelectedItem(null);
                    }}
                  >
                    {t('claim_now').toUpperCase()}
                  </Button>
                </div>

                <Button className="btn-google-maps" onClick={() => handleOpenGoogleMaps(selectedItem.donor + " " + selectedItem.distance)}>
                  <MapIcon size={18} /> OPEN IN GOOGLE MAPS (Leaflet)
                </Button>
              </div>

              {/* Right Side: Donor & Item Details */}
              <div className="modal-right-donor">
                <label className="section-label-light">DONOR DETAILS</label>
                <div className="donor-brand-box">
                   <div className="donor-avatar-mini">{selectedItem.donor.charAt(0)}</div>
                   <div className="donor-brand-text">
                      <h3 className="donor-org-name">{selectedItem.donor}</h3>
                      <span className="donor-verified-badge">✓ Verified Donor</span>
                   </div>
                </div>

                <div className="item-details-list">
                   <div className="item-detail-row">
                      <span className="det-lbl">Item Name</span>
                      <span className="det-val">{selectedItem.name}</span>
                   </div>
                   <div className="item-detail-row">
                      <span className="det-lbl">Category</span>
                      <span className="det-val">{selectedItem.category}</span>
                   </div>
                   <div className="item-detail-row">
                      <span className="det-lbl">Expiry</span>
                      <span className="det-val text-danger">{selectedItem.expiresIn}</span>
                   </div>
                </div>

                <Card className="safety-info-card glass" style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="safety-header" style={{ fontWeight: 800, color: '#fff' }}>🛡️ Safety Assured</div>
                    <p className="safety-text" style={{ fontSize: '0.8rem', opacity: 0.8, color: '#fff' }}>This donor has passed all 5 points of the Aahara Safety Audit for this batch.</p>
                </Card>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal CSS in file */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .claim-modal-box {
          background: #fff;
          width: 100%;
          max-width: 900px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .modal-split { display: flex; min-height: 500px; }
        .modal-left-receiver { flex: 1.2; padding: 40px; display: flex; flex-direction: column; gap: 24px; }
        .modal-right-donor { flex: 0.8; padding: 40px; background: #2c3e2e; color: white; display: flex; flex-direction: column; gap: 24px; }
        
        .modal-title { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
        .receiver-meta-info { 
           background: rgba(79, 99, 61, 0.05);
           padding: 20px;
           border-radius: 16px;
           border: 1px solid rgba(79, 99, 61, 0.1);
        }
        .receiver-badge { font-size: 0.65rem; font-weight: 800; color: #4f633d; margin-bottom: 4px; }
        .receiver-org { font-size: 1.2rem; font-weight: 800; color: #333; }
        .receiver-email { font-size: 0.9rem; color: #666; }

        .qty-visual-row { display: flex; align-items: center; gap: 20px; }
        .quantity-val-box { 
          width: 80px; 
          padding: 12px; 
          border-radius: 12px; 
          border: 2px solid #e2e8f0;
          font-weight: 800;
          font-size: 1.1rem;
          text-align: center;
          outline: none;
        }
        .quantity-val-box:focus { border-color: #4f633d; }
        .qty-helper-text { font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-top: 8px; }

        .modal-actions-footer { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; margin-top: auto; }
        .btn-google-maps { width: 100%; margin-top: 16px; gap: 10px !important; background: #4f633d !important; color: white !important; }

        .section-label-light { color: rgba(255,255,255,0.5); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .donor-brand-box { display: flex; align-items: center; gap: 16px; }
        .donor-avatar-mini { 
          width: 50px; height: 50px; background: #4f633d; border-radius: 14px; 
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;
        }
        .donor-brand-text { display: flex; flex-direction: column; }
        .donor-verified-badge { font-size: 0.75rem; color: #a3e635; font-weight: 600; }
        
        .item-details-list { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
        .item-detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
        .det-lbl { font-size: 0.85rem; color: rgba(255,255,255,0.6); }
        .det-val { font-size: 0.95rem; font-weight: 700; }

        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .modal-split { flex-direction: column; }
          .modal-right-donor { display: none; }
        }
      `}</style>
    </div>
  );
};
