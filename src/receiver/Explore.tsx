import React, { useState } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Search, Map as MapIcon, Zap, Clock, MapPin, Filter, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Explore.css';

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
  urgencyLevel: 'high' | 'medium' | 'low';
}

const MOCK_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'f1',
    name: 'KFC Fried Chicken Bucket',
    donor: 'KFC Indiranagar',
    category: 'Fast Food',
    quantity: '15 pieces',
    expiresIn: '30 mins',
    distance: '0.8 km',
    demand: 'Very High',
    urgencyScore: 95,
    urgencyLevel: 'high'
  },
  {
    id: 'f2',
    name: 'Paneer Butter Masala',
    donor: "Haliram's",
    category: 'North Indian',
    quantity: '20 portions',
    expiresIn: '45 mins',
    distance: '0.4 km',
    demand: 'Very High',
    urgencyScore: 92,
    urgencyLevel: 'high'
  },
  {
    id: 'f3',
    name: "Haliram's Paneer Butter Masala",
    donor: "Haliram's",
    category: 'Main Course',
    quantity: '20 portions',
    expiresIn: '45 mins',
    distance: '0.4 km',
    demand: 'Very High',
    urgencyScore: 90,
    urgencyLevel: 'high'
  },
  {
    id: 'f4',
    name: 'Mixed Veg Sandwiches',
    donor: 'Subway',
    category: 'Snacks',
    quantity: '10 units',
    expiresIn: '2 hours',
    distance: '1.2 km',
    demand: 'Medium',
    urgencyScore: 65,
    urgencyLevel: 'medium'
  },
  {
    id: 'f5',
    name: 'Fruit Salad Bowls',
    donor: 'Fruit Shop On Greams Road',
    category: 'Healthy',
    quantity: '8 bowls',
    expiresIn: '4 hours',
    distance: '2.5 km',
    demand: 'Low',
    urgencyScore: 30,
    urgencyLevel: 'low'
  }
];

export const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredItems = MOCK_FOOD_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.donor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.urgencyLevel === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const highUrgencyCount = MOCK_FOOD_ITEMS.filter(i => i.urgencyLevel === 'high').length;

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1 className="page-title">Find Food <span className="gradient-text">Nearby</span></h1>
        <p className="page-subtitle">Real-time surplus food available, sorted by urgency. Claim before it expires!</p>
      </div>

      <div className="search-filter-bar glass">
        <div className="search-input-wrap">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search food name or category..." 
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
            ⚡ High
          </button>
          <button 
            className={`filter-chip ${activeFilter === 'medium' ? 'active' : ''}`}
            onClick={() => setActiveFilter('medium')}
          >
            ⏰ Medium
          </button>
          <button 
            className={`filter-chip ${activeFilter === 'low' ? 'active' : ''}`}
            onClick={() => setActiveFilter('low')}
          >
            ✅ Low
          </button>
          <Button variant="outline" size="sm" className="filter-chip map-btn">
            <MapIcon size={16} /> Map View
          </Button>
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
          <Card key={item.id} className="food-card hover-lift">
            <div className="food-card-top">
              <span className={`urgency-badge ${item.urgencyLevel}`}>
                {item.urgencyLevel === 'high' ? '⚡ High Priority' : 
                 item.urgencyLevel === 'medium' ? '⏰ Medium Priority' : '✅ Low Priority'} 
                {item.urgencyLevel === 'high' && ` - ${item.expiresIn}`}
              </span>
            </div>
            
            <div className="food-main-info">
              <div className="category-tag">{item.category}</div>
              <h3 className="food-name">{item.name}</h3>
              <p className="donor-name">from {item.donor}</p>
            </div>

            <div className="food-meta-grid">
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
                    <Zap size={14} /> Urgency Score {item.urgencyScore}/100
                </div>
                <Link to={`/receiver/claim/${item.id}`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth className="claim-now-btn">Claim Now</Button>
                </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
