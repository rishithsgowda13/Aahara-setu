import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, MapPin, Clock, AlertCircle, Zap, ShieldCheck, Users, X, Phone, Navigation } from 'lucide-react';
import { LeafletMap } from '../components/ui/LeafletMap';
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
  phone?: string;
  locationLink?: string;
}

import { findMatch } from './AaharaAI';

const MOCK_FOOD_ITEMS: FoodItem[] = [
  {
    id: '7', name: 'Steamed Basmati Rice', type: 'Main Course',
    quantity: '40 portions', distance: '0.5 km', expiry: '2 hours',
    donor: 'Royal Biryani House', urgencyScore: 88, urgencyLevel: 'high',
    urgencyLabel: '⚡ High - 2 hr', verified: true, demand: 'High',
    phone: '+91 98765 43210'
  },
  {
    id: '8', name: 'Mixed Vegetable Sambar', type: 'Side Dish',
    quantity: '2 large containers', distance: '1.1 km', expiry: '3 hours',
    donor: 'Udupi Point', urgencyScore: 75, urgencyLevel: 'medium',
    urgencyLabel: '⏰ Medium - 3 hr', verified: true, demand: 'Medium',
    phone: '+91 99887 76655'
  },
  {
    id: '1', name: 'KFC Fried Chicken Bucket', type: 'Fast Food',
    quantity: '15 pieces', distance: '0.8 km', expiry: '30 mins',
    donor: 'KFC', urgencyScore: 95, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority - 30 min', verified: true, demand: 'Very High',
    phone: '+91 88776 65544'
  },
  {
    id: '2', name: 'Haldiram\'s Paneer Butter Masala', type: 'Main Course',
    quantity: '20 portions', distance: '0.4 km', expiry: '45 mins',
    donor: 'Haldiram\'s', urgencyScore: 90, urgencyLevel: 'high',
    urgencyLabel: '⚡ High - 45 min', verified: true, demand: 'Very High',
    phone: '+91 91234 56789'
  },

  {
    id: '9', name: 'Veg Dum Biryani', type: 'Main Course',
    quantity: '10 portions', distance: '1.2 km', expiry: '4 hours',
    donor: 'Taj Hotel', urgencyScore: 60, urgencyLevel: 'medium',
    urgencyLabel: '⏰ Medium - 4 hr', verified: true, demand: 'High',
    phone: '+91 98888 77777'
  },
  {
    id: '3', name: 'Masala Dosa & Sambar', type: 'South Indian',
    quantity: '5 portions', distance: '2.5 km', expiry: '1 hour',
    donor: 'MTR (Mavalli Tiffin Room)', urgencyScore: 85, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority - 1 hr', verified: false, demand: 'Medium',
    phone: '+91 97777 66666'
  },
  {
    id: '4', name: 'McDonald\'s Happy Meals', type: 'Fast Food',
    quantity: '3 meals', distance: '3.1 km', expiry: '5 hours',
    donor: 'McDonald\'s', urgencyScore: 30, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority - 5 hr', verified: true, demand: 'Low',
    phone: '+91 96666 55555'
  },
  {
    id: '5', name: 'Paneer Butter Masala', type: 'North Indian',
    quantity: '20 portions', distance: '0.4 km', expiry: '45 mins',
    donor: 'Haldiram\'s', urgencyScore: 92, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority - 45 min', verified: true, demand: 'Very High',
    phone: '+91 95555 44444'
  },
  {
    id: '6', name: 'Chole Bhature', type: 'North Indian',
    quantity: '8 portions', distance: '1.8 km', expiry: '8 hours',
    donor: 'Bikanerwala', urgencyScore: 20, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority - 8 hr', verified: true, demand: 'Moderate',
    phone: '+91 94444 33333'
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
        <div className="modal-overlay" onClick={() => setSelectedFoodId(null)}>
          <Card className="claim-modal glass" onClick={e => e.stopPropagation()}>
            <div className="claim-modal-header">
              <h2 className="modal-title">Claim Donation</h2>
              <button className="close-x" onClick={() => setSelectedFoodId(null)}><X size={20} /></button>
            </div>
            
            <div className="claim-info-container">
              {/* Left Column: Donor Info */}
              <div className="info-column">
                <div className="info-label-group">DONOR DETAILS</div>
                <div className="info-row"><strong>Name:</strong> {selectedFood.donor}</div>
                <div className="info-row"><strong>Item:</strong> {selectedFood.name}</div>
                <div className="info-row">
                  <strong>Available:</strong> 
                  <span className="text-primary-bold"> {selectedFood.quantity}</span>
                </div>
                <a href={`tel:${selectedFood.phone || '+919876543210'}`} className="contact-link">
                  <Phone size={14} /> {selectedFood.phone || '+91 98765 43210'}
                </a>
              </div>

              <div className="info-divider"></div>

              {/* Right Column: Logistics Info */}
              <div className="info-column">
                <div className="info-label-group">LOGISTICS INFO</div>
                <div className="info-row"><strong>Distance:</strong> {selectedFood.distance}</div>
                <div className="info-row">
                  <strong>Expires In:</strong> 
                  <span className="text-danger-bold"> {selectedFood.expiry}</span>
                </div>
                <div className="info-row"><strong>Demand:</strong> {selectedFood.demand}</div>
                <div className="contact-link">
                   <Phone size={14} /> +91 98221 00334 <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>(Receiver Logistics)</span>
                </div>
              </div>
            </div>

            {/* Embedded Interactive Map */}
            <div className="map-view-container">
              <LeafletMap location={selectedFood.donor} />
            </div>
            
            <div className="quantity-section">
              <p className="quantity-prompt">How much quantity do you need?</p>
              
              <div className="quantity-interaction">
                <div className="quantity-bubble">{claimQuantity || 1}</div>
                <input 
                  type="range"
                  min="1"
                  max={parseInt(selectedFood.quantity) || 1} 
                  value={claimQuantity || 1} 
                  onChange={(e) => setClaimQuantity(e.target.value)} 
                  className="pretty-slider"
                />
              </div>
              <div className="quantity-labels-flex">
                <span>1</span>
                <span>Max: {selectedFood.quantity}</span>
              </div>
            </div>
            
            <div className="modal-primary-actions">
              <Button onClick={() => setSelectedFoodId(null)} variant="outline" className="modal-close-btn">Close</Button>
              <Button onClick={handleConfirmClaim} className="modal-confirm-btn">Confirm Claim</Button>
            </div>

            <Button 
              variant="outline"
              className="google-maps-action"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFood.donor)}`, '_blank')}
            >
              <MapPin size={18} /> Open in Google Maps
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
                {/* Aahara AI Smart Match Badge */}
                {findMatch(item.name, items.filter(i => i.id !== item.id).map(i => i.name)) && (
                  <div className="ai-pairing-badge">
                    <Zap size={14} /> AI: Complete Meal Match Found
                  </div>
                )}
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
