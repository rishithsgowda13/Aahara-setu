import React, { useState } from 'react';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { useToast } from '../../../context/ToastContext';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { MapPin, CheckSquare, Square, AlertOctagon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import './Upload.css';

const SAFETY_CHECKLIST = [
  'Food has been stored at proper temperature',
  'Packaging is sealed and undamaged',
  'Expiry date has been verified',
  'Food is free from cross-contamination',
  'Prepared in a clean & hygienic environment',
];

const FSSAI_STORAGE_KEY = 'aahara_setu_fssai_id';

const FOOD_CATEGORIES = [
  { value: 'Main Course', label: 'Main Course' },
  { value: 'Fast Food', label: 'Fast Food' },
  { value: 'Bakery & Sweets', label: 'Bakery & Sweets' },
  { value: 'Beverages (Juices, Water, Soda)', label: 'Beverages (Juices, Water, Soda)' },
  { value: 'Packaged Snacks (Biscuits, Chocolates)', label: 'Packaged Snacks (Biscuits, Chocolates)' },
  { value: 'Fresh Fruits & Vegetables', label: 'Fresh Fruits & Vegetables' },
  { value: 'Groceries & Staples', label: 'Groceries & Staples' },
  { value: 'Mixed / Other', label: 'Mixed / Other' },
];

const DIETARY_INFO = [
  { value: 'None', label: 'Not specified' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
  { value: 'Gluten Free', label: 'Gluten Free' },
  { value: 'Nut Free', label: 'Nut Free' },
];

export const Upload: React.FC = () => {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDisaster = location.state?.isDisaster || false;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(SAFETY_CHECKLIST.length).fill(false));
  const [category, setCategory] = useState('');
  const [dietary, setDietary] = useState('None');
  const [unit, setUnit] = useState('portions');
  const allChecked = checkedItems.every(Boolean);
  const fssaiId = localStorage.getItem(FSSAI_STORAGE_KEY);

  const toggleCheck = (i: number) => {
    setCheckedItems(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  const [address, setAddress] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      addToast('Error', 'Geolocation is not supported by your browser', 'warning');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        
        try {
          // Reverse geocoding using OpenStreetMap (Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const locationName = data.display_name.split(',')[0] || data.address.suburb || data.address.city || 'Unknown Area';
          
          setAddress(`${coordsStr} — ${locationName} (Detected)`);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setAddress(`${coordsStr} (Detected Location)`);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error('Error fetching location:', error);
        addToast('Error', 'Unable to retrieve your location', 'warning');
        setIsDetecting(false);
      }
    );
  };

  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;
    setIsSubmitting(true);

    try {
      // 1. Get or Ensure profile exists (since real auth might not be linked yet in demo)
      let donorId = '00000000-0000-0000-0000-000000000000'; // Default fallback
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user?.email)
        .single();
        
      if (profile) {
        donorId = profile.id;
      } else {
        // Create a dummy profile if it doesn't exist to allow foreign key to pass
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: '77420000-0000-0000-0000-000000007742', // Stable dummy for demo
            full_name: 'System Donor',
            organization_name: 'McDonald\'s - VVCE',
            email: user?.email || 'donor@test.com',
            role: 'donor'
          }])
          .select()
          .single();
          
        if (newProfile) donorId = newProfile.id;
        // If it still fails, it might be a conflict, so try to fetch again
        if (profileError) {
          const { data: retry } = await supabase.from('profiles').select('id').eq('email', user?.email).single();
          if (retry) donorId = retry.id;
        }
      }

      // 2. Validate Date
      const expiryDate = new Date(expiry);
      if (isNaN(expiryDate.getTime())) {
        throw new Error('Invalid expiry date provided.');
      }

      // 3. Insert Donation
      const { error } = await supabase
        .from('donations')
        .insert([{
          food_name: itemName,
          donor_id: donorId,
          category: category,
          is_disaster: isDisaster,
          quantity_value: parseFloat(itemQty) || 0,
          quantity_unit: unit,
          expiry_time: expiryDate.toISOString(),
          pickup_location: 'POINT(77.6413 12.9719)', // Geometry string
          urgency_score: isDisaster ? 100 : 95,
          status: 'available'
        }]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }
      
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error uploading:', error);
      addToast('Error', `Upload failed: ${error.message || 'Check console.'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }

  };

  if (submitted) {
    return (
      <div className="upload-container">
        <div className="success-state">
          <Card className="success-card hover-lift">
            <div className="success-icon-wrap">🎊</div>
            <h2 className="gradient-text">Massive Impact Awaits!</h2>
            <p>Your surplus has been transformed into a community bridge. Verified NGOs and nearby shelters have been alerted in real-time.</p>
            
            <div className="success-stats">
              <div className="success-stat">
                <span className="success-stat-val">~4 mins</span>
                <span className="success-stat-lbl">Dispatch Speed</span>
              </div>
              <div className="success-stat">
                <span className="success-stat-val">4 NGOs</span>
                <span className="success-stat-lbl">Nearest Matched</span>
              </div>
              <div className="success-stat">
                <span className="success-stat-val">+25 XP</span>
                <span className="success-stat-lbl">Kindness Score</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <Button onClick={() => setSubmitted(false)} variant="glass">New Donation</Button>
              <Button onClick={() => window.location.href = '/profile'}>View Dashboard</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!fssaiId) {
    return (
      <div className="upload-container force-single-page">
        <div className="verification-side-layout">
          <div className="verification-info-side">
            <div className="lock-icon-premium">🔒</div>
            <h2 className="gradient-text">License Required</h2>
            <p className="verification-desc">
              To ensure public safety, all donors must provide a verified **FSSAI License ID** before initiating a food rescue listing.
            </p>
          </div>
          
          <div className="verification-action-side">
            <div className="why-box-premium">
              <h4>Why is this needed?</h4>
              <ul>
                <li><span>🇮🇳</span> Indian Food Safety Compliance</li>
                <li><span>🤝</span> Builds trust with NGOs & shelters</li>
                <li><span>🛡️</span> Full legal traceability for every batch</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/profile', { state: { highlightFssai: true } })} fullWidth size="lg" className="activate-license-btn">
              ACTIVATE DONOR LICENSE
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="page-title">{t('upload_title')}</h1>
        <p className="page-subtitle">{t('upload_sub')}</p>
      </div>

      <div className="demo-presets-row" style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          className="demo-btn" 
          onClick={() => {
            setItemName('Survival Kits (Bread & Milk)');
            setCategory('Groceries & Staples');
            setItemQty('50');
            setUnit('pieces');
            setExpiry(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
            setAddress('2.5 km - Central Relief Hub');
            setCheckedItems(new Array(SAFETY_CHECKLIST.length).fill(true));
            navigate('/upload', { state: { isDisaster: true } });
          }}
          style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '100px', cursor: 'pointer', fontWeight: 600 }}
        >
          SOS: Survival Kits
        </button>
        <button 
          className="demo-btn" 
          onClick={() => {
            setItemName('Assorted Pastries');
            setCategory('Bakery & Sweets');
            setItemQty('25');
            setUnit('portions');
            setExpiry(new Date(Date.now() + 2700000).toISOString().slice(0, 16));
            setAddress('0.4 km - Gaurav Sweets');
            setCheckedItems(new Array(SAFETY_CHECKLIST.length).fill(true));
          }}
          style={{ padding: '8px 16px', background: 'rgba(79, 99, 61, 0.1)', border: '1px solid #4F633D', color: '#4F633D', borderRadius: '100px', cursor: 'pointer', fontWeight: 600 }}
        >
          Demo: Pastries
        </button>
        <button 
          className="demo-btn" 
          onClick={() => {
            setItemName('Paneer Tikka Thali');
            setCategory('Main Course');
            setItemQty('10');
            setUnit('portions');
            setExpiry(new Date(Date.now() + 7200000).toISOString().slice(0, 16));
            setAddress('1.2 km - Skyline Hotels');
            setCheckedItems(new Array(SAFETY_CHECKLIST.length).fill(true));
          }}
          style={{ padding: '8px 16px', background: 'rgba(139, 161, 148, 0.1)', border: '1px solid #8BA194', color: '#4F633D', borderRadius: '100px', cursor: 'pointer', fontWeight: 600 }}
        >
          Demo: Tikka Thali
        </button>
      </div>

      {isDisaster && (
        <div className="disaster-relief-banner animate-pulse-border">
          <AlertOctagon size={24} />
          <div className="banner-text">
            <h4>DISASTER RELIEF MODE ACTIVE</h4>
            <p>Your listing will be prioritized and exclusively visible to Disaster Response NGOs.</p>
          </div>
        </div>
      )}


      <div className="upload-layout">
        <div className="upload-main">
          <Card className="upload-card">
            <h3 className="card-section-title">📦 {t('item_info')}</h3>
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <Input 
                  label={t('item_name_label')}
                  placeholder="e.g., 20 Meal Kits, 5kg Fresh Fruit" 
                  required 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Select 
                    label={t('food_cat')}
                    options={FOOD_CATEGORIES} 
                    value={category} 
                    onChange={setCategory} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">{t('qty_assess')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="Qty" 
                      min="1" 
                      required 
                      style={{ width: '90px' }} 
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                    />
                    <div style={{ flex: 1 }}>
                      <Select 
                        options={[
                          { value: 'portions', label: 'portions' },
                          { value: 'kg', label: 'kg' },
                          { value: 'liters', label: 'liters' },
                          { value: 'pieces', label: 'pieces' },
                          { value: 'packets', label: 'packets' },
                          { value: 'bottles', label: 'bottles' },
                        ]} 
                        value={unit} 
                        onChange={setUnit} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Input 
                    label={t('calc_expiry')}
                    type="datetime-local" 
                    required 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Select 
                    label={t('diet_class')}
                    options={DIETARY_INFO} 
                    value={dietary} 
                    onChange={setDietary} 
                  />
                </div>
              </div>

              <div className="form-group">
                <Input 
                  label={t('pickup_addr')}
                  placeholder="Street, Building, landmark..." 
                  required 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button 
                  type="button" 
                  className={`fetch-location-btn ${isDetecting ? 'loading' : ''}`} 
                  onClick={handleFetchLocation}
                  disabled={isDetecting}
                >
                  <MapPin size={16} /> {isDetecting ? 'Detecting...' : t('detect_loc')}
                </button>
              </div>

              <div className="safety-checklist">
                <div className="checklist-header">
                  <h4>🛡️ {t('qa_audit')}</h4>
                  <span className="checklist-badge">{checkedItems.filter(Boolean).length}/{SAFETY_CHECKLIST.length}</span>
                </div>
                <p className="checklist-sub">Check all boxes to verify food safety compliance.</p>
                <div className="checklist-items">
                  {SAFETY_CHECKLIST.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`checklist-item ${checkedItems[i] ? 'checked' : ''}`}
                      onClick={() => toggleCheck(i)}
                    >
                      {checkedItems[i] ? <CheckSquare size={18} /> : <Square size={18} />}
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" fullWidth disabled={isSubmitting || !allChecked} className="hover-lift">
                {isSubmitting ? 'Verifying...' : t('publish_btn')}
              </Button>
            </form>
          </Card>
        </div>

        <div className="upload-sidebar">
          <Card className="impact-preview-card hover-lift" glass={false}>
            <h4>📈 {t('social_impact')}</h4>
            <div className="impact-metrics">
              <div className="impact-metric">
                <span className="impact-lbl">{t('people_fed')}</span>
                <span className="impact-val">12</span>
              </div>
              <div className="impact-metric">
                <span className="impact-lbl">{t('carbon_offset')}</span>
                <span className="impact-val">3.4kg</span>
              </div>
              <div className="impact-metric">
                <span className="impact-lbl">{t('network_xp')}</span>
                <span className="impact-val">+50</span>
              </div>
            </div>
          </Card>

          <Card className="volunteer-card">
            <h4>🚚 SMART LOGISTICS</h4>
            <p>Our AI automatically matches your listing with the nearest verified transport volunteers.</p>
            <Button variant="outline" size="sm" fullWidth onClick={() => addToast('Coming Soon', 'Live matching with 12 available logistics partners in your zone.', 'info')}>VIEW LOGISTICS PARTNERS</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
