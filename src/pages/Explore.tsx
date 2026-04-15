import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, MapPin, Clock, AlertCircle, Zap, ShieldCheck, Users } from 'lucide-react';
import './Explore.css';

interface FoodItem {
  id: string;
  name: string;
  type: string;
  quantity: string;
  distance: string;
  expiry: string;
  donor: string;
  urgencyScore: number; // 0-100
  urgencyLevel: 'high' | 'medium' | 'low';
  urgencyLabel: string;
  verified: boolean;
  demand: string;
}

const MOCK_FOOD_ITEMS: FoodItem[] = [
  {
    id: '1', name: 'KFC Fried Chicken Bucket', type: 'Fast Food',
    quantity: '15 pieces', distance: '0.8 km', expiry: '30 mins',
    donor: 'KFC', urgencyScore: 95, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority - 30 min', verified: true, demand: 'Very High'
  },
  {
    id: '2', name: 'Veg Dum Biryani', type: 'Main Course',
    quantity: '10 portions', distance: '1.2 km', expiry: '4 hours',
    donor: 'Taj Hotel', urgencyScore: 60, urgencyLevel: 'medium',
    urgencyLabel: '⏰ Medium - 4 hr', verified: true, demand: 'High'
  },
  {
    id: '3', name: 'Masala Dosa & Sambar', type: 'South Indian',
    quantity: '5 portions', distance: '2.5 km', expiry: '1 hour',
    donor: 'MTR (Mavalli Tiffin Room)', urgencyScore: 85, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority - 1 hr', verified: false, demand: 'Medium'
  },
  {
    id: '4', name: 'McDonald\'s Happy Meals', type: 'Fast Food',
    quantity: '3 meals', distance: '3.1 km', expiry: '5 hours',
    donor: 'McDonald\'s', urgencyScore: 30, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority - 5 hr', verified: true, demand: 'Low'
  },
  {
    id: '5', name: 'Paneer Butter Masala', type: 'North Indian',
    quantity: '20 portions', distance: '0.4 km', expiry: '45 mins',
    donor: 'Haldiram\'s', urgencyScore: 92, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority - 45 min', verified: true, demand: 'Very High'
  },
  {
    id: '6', name: 'Chole Bhature', type: 'North Indian',
    quantity: '8 portions', distance: '1.8 km', expiry: '8 hours',
    donor: 'Bikanerwala', urgencyScore: 20, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority - 8 hr', verified: true, demand: 'Moderate'
  },
];

export const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [items, setItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [claimQuantity, setClaimQuantity] = useState<string>('');

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || item.urgencyLevel === filter;
    return matchSearch && matchFilter && !claimedIds.includes(item.id);
  });

  const handleConfirmClaim = () => {
    if (selectedFoodId) {
      setClaimedIds(prev => [...prev, selectedFoodId]);
      setSelectedFoodId(null);
      // Simulating a success toast or notification
      alert(`Claim confirmed for ${claimQuantity || 'selected quantity'}! The donor has been notified.`);
    }
  };

  const selectedFood = items.find(i => i.id === selectedFoodId);

  return (
    <div className="explore-container">
      {/* Dynamic Pop-up Modal for Claiming */}
      {selectedFood && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <Card className="glass" style={{ maxWidth: '450px', width: '90%', padding: '24px', position: 'relative' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.4rem', borderBottom: '1px solid rgba(139, 161, 148, 0.3)', paddingBottom: '12px' }}>Claim Donation</h2>
            
            <div style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.05)', padding: '16px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Left Column: Donor Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px dashed rgba(139, 161, 148, 0.2)', paddingRight: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary)' }}>Donor Details</h4>
                <p><strong>Donor:</strong> {selectedFood.donor}</p>
                <p><strong>Item:</strong> {selectedFood.name}</p>
                <p><strong>Type:</strong> {selectedFood.type}</p>
                <p><strong>Available:</strong> <strong style={{ color: 'var(--color-primary)' }}>{selectedFood.quantity}</strong></p>
              </div>

              {/* Right Column: Receiver Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary)' }}>Receiver Context</h4>
                <p><strong>Distance:</strong> {selectedFood.distance}</p>
                <p><strong>Expires In:</strong> <span style={{ color: selectedFood.urgencyLevel === 'high' ? 'var(--color-error)' : 'inherit', fontWeight: 'bold' }}>{selectedFood.expiry}</span></p>
                <p><strong>Demand:</strong> {selectedFood.demand}</p>
              </div>

            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text)' }}>How much quantity do you need?</label>
              <input 
                type="text" 
                value={claimQuantity} 
                onChange={(e) => setClaimQuantity(e.target.value)} 
                placeholder="e.g., 5 portions, or 'all'" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-secondary-light)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '1rem' }}
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <Button onClick={() => setSelectedFoodId(null)} variant="outline" style={{ flex: 1 }}>Cancel</Button>
              <Button onClick={handleConfirmClaim} style={{ flex: 1 }}>Confirm Claim</Button>
            </div>

            <Button 
              onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(selectedFood.donor)}`, '_blank')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}
            >
              <MapPin size={16} /> View Location on Map
            </Button>
          </Card>
        </div>
      )}
      <div className="explore-header">
        <h1 className="page-title">Find Food <span className="gradient-text">Nearby</span></h1>
        <p className="page-subtitle">Real-time surplus food available, sorted by urgency. Claim before it expires!</p>
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
        <Button variant="glass" className="map-btn" onClick={() => alert('Interactive Map View is loading...')}>
          <MapPin size={16} /> Map View
        </Button>
      </div>

      {/* Fallback alert for high urgency */}
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
                  <span className="meta-value">{item.quantity}</span>
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

              <Button fullWidth onClick={() => { setSelectedFoodId(item.id); setClaimQuantity(''); }}>
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
            <p>There is currently no surplus food matching your filters. Try expanding your search or check back soon.</p>
            <div className="fallback-info">
              <RefreshCwIcon />
              <p><strong>Auto-Redistribution Active:</strong> We are notifying backup NGOs and nearest shelters automatically.</p>
            </div>
            <Button variant="outline" onClick={() => { setItems(MOCK_FOOD_ITEMS); setFilter('all'); setSearchQuery(''); setClaimedIds([]); }}>
              Refresh Listings
            </Button>
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
