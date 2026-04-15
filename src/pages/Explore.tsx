import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, MapPin, Clock, AlertCircle, Zap, ShieldCheck, Users, X, Upload } from 'lucide-react';
import './Explore.css';

interface FoodItem {
  id: string;
  name: string;
  type: string;
  totalQuantity: number;
  unit: string;
  distance: string;
  expiry: string;
  donor: string;
  urgencyScore: number;
  urgencyLevel: 'high' | 'medium' | 'low';
  urgencyLabel: string;
  verified: boolean;
  demand: string;
}

const MOCK_FOOD_ITEMS: FoodItem[] = [
  {
    id: '1', name: 'Assorted Gourmet Pastries', type: 'Bakery',
    totalQuantity: 15, unit: 'pieces', distance: '0.8 km', expiry: '30 mins',
    donor: 'Baskin & Scones', urgencyScore: 95, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority – expires in 30 mins', verified: true, demand: 'Very High'
  },
  {
    id: '2', name: 'Vegetable Biryani', type: 'Main Course',
    totalQuantity: 10, unit: 'portions', distance: '1.2 km', expiry: '4 hours',
    donor: 'Heritage Heights Hotel', urgencyScore: 60, urgencyLevel: 'medium',
    urgencyLabel: '⏰ Medium – expires in 4 hrs', verified: true, demand: 'High'
  },
  {
    id: '3', name: 'Fresh Salad Bowls', type: 'Healthy',
    totalQuantity: 5, unit: 'bowls', distance: '2.5 km', expiry: '1 hour',
    donor: 'Green Leaf Cafe', urgencyScore: 85, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority – expires in 1 hr', verified: false, demand: 'Medium'
  },
  {
    id: '4', name: 'Mixed Fruit Platters', type: 'Dessert',
    totalQuantity: 3, unit: 'platters', distance: '3.1 km', expiry: '5 hours',
    donor: 'The Grand Palace', urgencyScore: 30, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority – 5 hrs remaining', verified: true, demand: 'Low'
  },
  {
    id: '5', name: 'Paneer Tikka (Surplus Event)', type: 'Main Course',
    totalQuantity: 20, unit: 'portions', distance: '0.4 km', expiry: '45 mins',
    donor: 'Skyline Banquets', urgencyScore: 92, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority – expires in 45 mins', verified: true, demand: 'Very High'
  },
  {
    id: '6', name: 'Bread Loaves (Assorted)', type: 'Bakery',
    totalQuantity: 8, unit: 'loaves', distance: '1.8 km', expiry: '8 hours',
    donor: 'Morning Dew Bakery', urgencyScore: 20, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority – 8 hrs remaining', verified: true, demand: 'Moderate'
  },
];

export const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [items, setItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
  const [claimModaltem, setClaimModalItem] = useState<FoodItem | null>(null);
  const [claimAmount, setClaimAmount] = useState<number>(1);
  
  // Verification State
  const [claimsMade, setClaimsMade] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || item.urgencyLevel === filter;
    return matchSearch && matchFilter && item.totalQuantity > 0;
  });

  const openClaimModal = (item: FoodItem) => {
    setClaimModalItem(item);
    setClaimAmount(1);
  };

  const handleClaimConfirm = () => {
    if (!claimModaltem) return;

    if (!isVerified && claimsMade >= 1) {
      setClaimModalItem(null);
      setShowVerifyModal(true);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === claimModaltem.id) {
        return { ...item, totalQuantity: Math.max(0, item.totalQuantity - claimAmount) };
      }
      return item;
    }));
    
    setClaimsMade(prev => prev + 1);
    setClaimModalItem(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingProof(true);
      // Simulate verification upload
      setTimeout(() => {
        setUploadingProof(false);
        setIsVerified(true);
        setShowVerifyModal(false);
        if (claimModaltem) {
          openClaimModal(claimModaltem); // re-open the claim modal they were trying to access
        }
      }, 1500);
    }
  };

  return (
    <div className="explore-container relative">
      <div className="explore-header">
        <h1 className="page-title">Find Food <span className="gradient-text">Nearby</span></h1>
        <p className="page-subtitle">Real-time surplus food available, sorted by urgency. Claim what you need before it expires!</p>
      </div>

      {/* Stats row for demo state */}
      <div className="user-verification-status">
        <div className="status-pill">
          Claims Made: <strong>{claimsMade}</strong>
        </div>
        <div className={`status-pill ${isVerified ? 'verified-true' : 'verified-false'}`}>
          Status: <strong>{isVerified ? '✅ Verified ID' : '❌ Unverified'}</strong>
        </div>
      </div>

      <div className="search-filter-bar glass">
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search food name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-inner-input"
          />
        </div>
        <div className="filter-chips">
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''} chip-${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🌐 All' : f === 'high' ? '⚡ High' : f === 'medium' ? '⏰ Medium' : '✅ Low'}
            </button>
          ))}
        </div>
        <Button variant="glass" className="map-btn">
          <MapPin size={16} /> Map View
        </Button>
      </div>

      {filteredItems.some(i => i.urgencyLevel === 'high') && (
        <div className="urgency-alert">
          <Zap size={16} />
          <span>
            <strong>{filteredItems.filter(i => i.urgencyLevel === 'high').length} high-priority items</strong> available near you — claim now before auto-redistribution triggers!
          </span>
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className="food-grid">
          {filteredItems.sort((a, b) => b.urgencyScore - a.urgencyScore).map((item) => (
            <Card key={item.id} className={`food-card urgency-border-${item.urgencyLevel}`}>
              <div className="food-card-top">
                <span className="food-type-badge">{item.type}</span>
                <span className={`urgency-badge ${item.urgencyLevel}`}>
                  {item.urgencyLabel}
                </span>
              </div>
              <div className="food-card-title-row">
                <h3 className="food-name">{item.name}</h3>
                {item.verified && (
                  <span className="verified-badge"><ShieldCheck size={14} /> Verified</span>
                )}
              </div>
              <p className="donor-name">from {item.donor}</p>

              <div className="food-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Quantity</span>
                  <span className="meta-value">{item.totalQuantity} {item.unit}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Clock size={12} /> Expires in</span>
                  <span className={`meta-value ${item.urgencyLevel === 'high' ? 'text-danger' : ''}`}>{item.expiry}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><MapPin size={12} /> Distance</span>
                  <span className="meta-value">{item.distance}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Users size={12} /> Demand</span>
                  <span className="meta-value">{item.demand}</span>
                </div>
              </div>

              <div className="urgency-bar-wrap">
                <div className="urgency-bar-label">
                  <Zap size={12} /> Urgency Score
                  <span className="urgency-score-num">{item.urgencyScore}/100</span>
                </div>
                <div className="urgency-bar">
                  <div
                    className={`urgency-bar-fill ${item.urgencyLevel}`}
                    style={{ width: `${item.urgencyScore}%` }}
                  />
                </div>
              </div>

              <Button fullWidth onClick={() => openClaimModal(item)}>
                Claim Now
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Card className="empty-card">
            <AlertCircle size={48} className="empty-icon" />
            <h3>No Food Available</h3>
            <p>There is currently no surplus food matching your filters or all items have been fully claimed.</p>
            <div className="fallback-info">
              <RefreshCwIcon />
              <p><strong>Auto-Redistribution Active:</strong> We are notifying backup NGOs and nearest shelters automatically.</p>
            </div>
            <Button variant="outline" onClick={() => { setItems(MOCK_FOOD_ITEMS); setFilter('all'); setSearchQuery(''); setClaimsMade(0); setIsVerified(false); }}>
              Reset App Data
            </Button>
          </Card>
        </div>
      )}

      {/* Claim Modal Overlay */}
      {claimModaltem && !showVerifyModal && (
        <div className="claim-modal-overlay">
          <Card className="claim-modal-card">
            <div className="claim-modal-header">
              <h3>Claim: {claimModaltem.name}</h3>
              <button className="close-modal-btn" onClick={() => setClaimModalItem(null)}>
                <X size={20} />
              </button>
            </div>
            
            <p className="claim-modal-desc">
              How many <strong>{claimModaltem.unit}</strong> do you need? 
              <br/>Total available: {claimModaltem.totalQuantity} {claimModaltem.unit}
            </p>

            <div className="claim-slider-area">
              <input 
                type="range" 
                className="claim-slider" 
                min="1" 
                max={claimModaltem.totalQuantity} 
                value={claimAmount} 
                onChange={(e) => setClaimAmount(Number(e.target.value))}
              />
              <div className="slider-labels">
                <span>1</span>
                <span>{claimModaltem.totalQuantity}</span>
              </div>
            </div>

            <div className="claim-input-area">
              <label className="input-label">Enter exact amount</label>
              <div className="claim-input-row">
                <input 
                  type="number"
                  className="input-field claim-number-input"
                  min="1"
                  max={claimModaltem.totalQuantity}
                  value={claimAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0 && val <= claimModaltem.totalQuantity) setClaimAmount(val);
                    else if (e.target.value === '') setClaimAmount(0); // temporary state for typing
                  }}
                  onBlur={() => {
                    if (claimAmount < 1) setClaimAmount(1);
                    if (claimAmount > claimModaltem.totalQuantity) setClaimAmount(claimModaltem.totalQuantity);
                  }}
                />
                <span className="claim-unit">{claimModaltem.unit}</span>
              </div>
            </div>

            <Button fullWidth onClick={handleClaimConfirm}>
              Confirm Claim
            </Button>
          </Card>
        </div>
      )}

      {/* Verification Modal for Unverified Individual claiming > 1 */}
      {showVerifyModal && (
        <div className="claim-modal-overlay">
          <Card className="claim-modal-card verification-card-center">
            <div className="claim-modal-header">
              <h3>Verification Required</h3>
              <button className="close-modal-btn" onClick={() => setShowVerifyModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="verify-icon-wrap">
              <ShieldCheck size={48} className="verify-shield" />
            </div>

            <p className="claim-modal-desc text-center">
              You have already used your <strong>free one-time claim</strong>. To prevent platform misuse and ensure food reaches genuine individuals and NGOs, please verify your identity to continue unrestricted access.
            </p>

            <div className="proof-upload-area">
              <input 
                type="file" 
                id="proof-upload" 
                style={{display: 'none'}} 
                onChange={handleFileUpload} 
              />
              <label htmlFor="proof-upload" className={`upload-btn-label ${uploadingProof ? 'uploading' : ''}`}>
                <Upload size={18} /> 
                {uploadingProof ? 'Checking Identity...' : 'Upload Govt ID / Certificate'}
              </label>
            </div>

            <p className="verify-note text-center">
              Aahar Setu employs a strict Anti-Misuse policy. Verified profiles get unlimited access and Priority status.
            </p>
          </Card>
        </div>
      )}

    </div>
  );
};

const RefreshCwIcon = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
  </div>
);
