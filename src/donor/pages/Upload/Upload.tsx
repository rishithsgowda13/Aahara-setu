import React, { useState } from 'react';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { MapPin, CheckSquare, Square } from 'lucide-react';
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
  { value: 'Bakery', label: 'Bakery' },
  { value: 'Dessert', label: 'Dessert' },
  { value: 'Healthy / Salad', label: 'Healthy / Salad' },
  { value: 'Snacks', label: 'Snacks' },
  { value: 'Beverages', label: 'Beverages' },
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
      alert('Geolocation is not supported by your browser');
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
        alert('Unable to retrieve your location');
        setIsDetecting(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
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
      <div className="upload-container">
        <div className="verification-required-state" style={{ 
          maxWidth: '600px', margin: '80px auto', textAlign: 'center' 
        }}>
          <Card className="verification-card glass-card hover-lift" style={{ padding: '60px', borderRadius: '40px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '32px' }}>🔒</div>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px' }}>License Required</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
              To ensure public safety, all donors must provide a verified **FSSAI License ID** before initiating a food rescue listing.
            </p>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.03)', padding: '32px', borderRadius: '24px', 
              textAlign: 'left', marginBottom: '40px' 
            }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Why is this needed?</h4>
              <ul style={{ paddingLeft: '24px', color: 'var(--color-text)' }}>
                <li style={{ marginBottom: '12px' }}>Indian Food Safety Compliance (FSSAI)</li>
                <li style={{ marginBottom: '12px' }}>Builds trust with matched NGOs and shelters</li>
                <li>Full legal traceability for every batch</li>
              </ul>
            </div>

            <Button onClick={() => window.location.href = '/profile'} fullWidth size="lg" style={{ height: '64px', fontSize: '1.1rem' }}>
              ACTIVATE DONOR LICENSE
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="page-title">Initiate <span className="gradient-text">Food Rescue</span></h1>
        <p className="page-subtitle">Premium circular redistribution. List your surplus in under 60 seconds.</p>
      </div>

      <div className="upload-layout">
        <div className="upload-main">
          <Card className="upload-card">
            <h3 className="card-section-title">📦 Item Information</h3>
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <Input label="What are you rescued today?" placeholder="e.g., 20 Meal Kits, 5kg Fresh Fruit" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Select 
                    label="Food Category" 
                    options={FOOD_CATEGORIES} 
                    value={category} 
                    onChange={setCategory} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Quantity Assessment</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" className="input-field" placeholder="Qty" min="1" required style={{ width: '90px' }} />
                    <div style={{ flex: 1 }}>
                      <Select 
                        options={[
                          { value: 'portions', label: 'portions' },
                          { value: 'kg', label: 'kg' },
                          { value: 'liters', label: 'liters' },
                          { value: 'pieces', label: 'pieces' },
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
                  <Input label="Calculated Expiry" type="datetime-local" required />
                </div>
                <div className="form-group">
                  <Select 
                    label="Dietary Classification" 
                    options={DIETARY_INFO} 
                    value={dietary} 
                    onChange={setDietary} 
                  />
                </div>
              </div>

              <div className="form-group">
                <Input 
                  label="Precise Pickup Address" 
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
                  <MapPin size={16} /> {isDetecting ? 'Detecting...' : 'Auto-detect Location'}
                </button>
              </div>

              <div className="safety-checklist">
                <div className="checklist-header">
                  <h4>🛡️ Quality Assurance Audit</h4>
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
                {isSubmitting ? 'Verifying...' : 'PUBLISH RESCUE LISTING'}
              </Button>
            </form>
          </Card>
        </div>

        <div className="upload-sidebar">
          <Card className="impact-preview-card hover-lift">
            <h4>📈 PREDICTED SOCIAL IMPACT</h4>
            <div className="impact-metrics">
              <div className="impact-metric">
                <span className="impact-lbl">PEOPLE FED</span>
                <span className="impact-val">12</span>
              </div>
              <div className="impact-metric">
                <span className="impact-lbl">CARBON OFFSET</span>
                <span className="impact-val">3.4kg</span>
              </div>
              <div className="impact-metric">
                <span className="impact-lbl">NETWORK XP</span>
                <span className="impact-val">+50</span>
              </div>
            </div>
          </Card>

          <Card className="volunteer-card">
            <h4>🚚 SMART LOGISTICS</h4>
            <p>Our AI automatically matches your listing with the nearest verified transport volunteers.</p>
            <Button variant="outline" size="sm" fullWidth onClick={() => alert('Feature coming soon: Live matching with 12 available logistics partners in your zone.')}>VIEW LOGISTICS PARTNERS</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
