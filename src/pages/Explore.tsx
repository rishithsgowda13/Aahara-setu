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
    id: '1', name: 'Assorted Gourmet Pastries', type: 'Bakery',
    quantity: '15 pieces', distance: '0.8 km', expiry: '30 mins',
    donor: 'Baskin & Scones', urgencyScore: 95, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority – expires in 30 mins', verified: true, demand: 'Very High'
  },
  {
    id: '2', name: 'Vegetable Biryani', type: 'Main Course',
    quantity: '10 portions', distance: '1.2 km', expiry: '4 hours',
    donor: 'Heritage Heights Hotel', urgencyScore: 60, urgencyLevel: 'medium',
    urgencyLabel: '⏰ Medium – expires in 4 hrs', verified: true, demand: 'High'
  },
  {
    id: '3', name: 'Fresh Salad Bowls', type: 'Healthy',
    quantity: '5 bowls', distance: '2.5 km', expiry: '1 hour',
    donor: 'Green Leaf Cafe', urgencyScore: 85, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority – expires in 1 hr', verified: false, demand: 'Medium'
  },
  {
    id: '4', name: 'Mixed Fruit Platters', type: 'Dessert',
    quantity: '3 platters', distance: '3.1 km', expiry: '5 hours',
    donor: 'The Grand Palace', urgencyScore: 30, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority – 5 hrs remaining', verified: true, demand: 'Low'
  },
  {
    id: '5', name: 'Paneer Tikka (Surplus Event)', type: 'Main Course',
    quantity: '20 portions', distance: '0.4 km', expiry: '45 mins',
    donor: 'Skyline Banquets', urgencyScore: 92, urgencyLevel: 'high',
    urgencyLabel: '⚡ High Priority – expires in 45 mins', verified: true, demand: 'Very High'
  },
  {
    id: '6', name: 'Bread Loaves (Assorted)', type: 'Bakery',
    quantity: '8 loaves', distance: '1.8 km', expiry: '8 hours',
    donor: 'Morning Dew Bakery', urgencyScore: 20, urgencyLevel: 'low',
    urgencyLabel: '✅ Low Priority – 8 hrs remaining', verified: true, demand: 'Moderate'
  },
];

export const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [items, setItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || item.urgencyLevel === filter;
    return matchSearch && matchFilter && !claimedIds.includes(item.id);
  });

  const handleClaim = (id: string) => {
    setClaimedIds(prev => [...prev, id]);
  };

  return (
    <div className="explore-container">
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
        <Button variant="glass" className="map-btn">
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

              <Button fullWidth onClick={() => handleClaim(item.id)}>
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
