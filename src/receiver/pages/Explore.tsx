import React, { useState } from 'react';
import { Card } from '../../donor/components/ui/Card/Card';
import { Button } from '../../donor/components/ui/Button/Button';
import { Search, Map as MapIcon, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../donor/context/LanguageContext';
import '../styles/Explore.css';

import { useEffect } from 'react';

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
    name: 'Orange Juice Bottles',
    donor: "FreshPress Juices",
    category: 'Beverages',
    quantity: '12 bottles',
    expiresIn: '4 hours',
    distance: '1.5 km',
    demand: 'High',
    urgencyScore: 70,
    urgencyLevel: 'medium'
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
    name: 'Marie Gold Biscuits',
    donor: 'More Retail Store',
    category: 'Packaged Snacks',
    quantity: '25 packets',
    expiresIn: '6 months',
    distance: '2.1 km',
    demand: 'Medium',
    urgencyScore: 20,
    urgencyLevel: 'low'
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
  const [foodItems, setFoodItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);

  useEffect(() => {
    // 1. Fetch existing items
    const fetchItems = async () => {
      const { data, error } = await supabase
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
          urgencyLevel: d.urgency_score > 90 ? 'high' : d.urgency_score > 60 ? 'medium' : 'low',
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
          urgencyLevel: newItem.urgency_score > 90 ? 'high' : newItem.urgency_score > 60 ? 'medium' : 'low',
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
  });

  const highUrgencyCount = foodItems.filter(i => i.urgencyLevel === 'high').length;

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
                <Link to={`/receiver/claim/${item.id}`} style={{ textDecoration: 'none' }}>
                    <Button 
                      fullWidth 
                      className={`claim-now-btn ${item.isDisaster ? 'disaster-btn' : ''}`}
                    >
                      {item.isDisaster ? 'Verify & Claim Relief' : t('claim_now')}
                    </Button>
                </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
