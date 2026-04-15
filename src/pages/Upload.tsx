import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { supabase } from '../lib/supabase';
import { Upload as UploadIcon, MapPin, CheckSquare, Square, ShieldCheck, AlertCircle } from 'lucide-react';
import './Upload.css';

const SAFETY_CHECKLIST = [
  'Food has been stored at proper temperature',
  'Packaging is sealed and undamaged',
  'Expiry date has been verified',
  'Food is free from cross-contamination',
  'Prepared in a clean & hygienic environment',
];

const FOOD_CATEGORIES = [
  { value: 'Main Course', label: 'Main Course' },
  { value: 'Bakery', label: 'Bakery' },
  { value: 'Dessert', label: 'Dessert' },
  { value: 'Healthy', label: 'Healthy & Salad' },
  { value: 'Raw', label: 'Raw Ingredients' },
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
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [dietary, setDietary] = useState('None');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [instructions, setInstructions] = useState('');
  
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(SAFETY_CHECKLIST.length).fill(false));
  const [errorMsg, setErrorMsg] = useState('');
  
  const allChecked = checkedItems.every(Boolean);

  const toggleCheck = (i: number) => {
    setCheckedItems(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddress(`GPS Data: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          alert("Could not fetch location. Please enter your address manually.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!allChecked) return;
    if (!category) {
      setErrorMsg("Please select a valid food category.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be legally logged in to list a food donation.");
      }

      // Convert coordinates to PostGIS POINT string. Default to generic center if none provided.
      const pointStr = coords ? `POINT(${coords.lng} ${coords.lat})` : 'POINT(77.5946 12.9716)';

      const { error } = await supabase.from('donations').insert([
        {
          donor_id: user.id,
          title: title,
          food_type: category,
          quantity: quantity,
          expiry_time: (new Date(expiryTime)).toISOString(),
          pickup_location: pointStr,
          status: 'available'
        }
      ]);

      if (error) {
        throw error;
      }
      
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit donation to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="upload-container">
        <div className="success-state">
          <Card className="success-card">
            <div className="success-icon-wrap">✅</div>
            <h2>Donation Listed Successfully!</h2>
            <p>Your food donation has been stored securely in our network and is now being matched with nearby NGOs.</p>
            <div className="success-stats">
              <div className="success-stat">
                <span className="success-stat-val">~5 mins</span>
                <span className="success-stat-lbl">Avg Claim Time</span>
              </div>
              <div className="success-stat">
                <span className="success-stat-val">Live</span>
                <span className="success-stat-lbl">Broadcasting</span>
              </div>
              <div className="success-stat">
                <span className="success-stat-val">+10</span>
                <span className="success-stat-lbl">Kindness Pts</span>
              </div>
            </div>
            <Button onClick={() => setSubmitted(false)} variant="outline">Donate More Food</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="page-title">Donate <span className="gradient-text">Food</span></h1>
        <p className="page-subtitle">List your surplus food to help feed the community. Takes under 2 minutes.</p>
      </div>

      <div className="upload-layout">
        <div className="upload-main">
          <Card className="upload-card">
            <h3 className="card-section-title">🍽️ Food Details</h3>
            <form onSubmit={handleSubmit} className="upload-form">
              
              {errorMsg && (
                <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px' }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <Input 
                  label="Food Name / Type" 
                  placeholder="e.g., 50 Servings of Pasta, Fresh Bread" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ minWidth: '220px' }}>
                  <Select 
                    label="Food Category" 
                    options={FOOD_CATEGORIES} 
                    value={category} 
                    onChange={setCategory} 
                    placeholder="Select category"
                    required 
                  />
                </div>
                <div className="form-group">
                  <Input 
                    label="Quantity (approx.)" 
                    placeholder="e.g., 20 kg, 50 portions" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Input 
                    label="Expiry Date & Time" 
                    type="datetime-local" 
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group" style={{ minWidth: '220px' }}>
                  <Select 
                    label="Dietary Info" 
                    options={DIETARY_INFO} 
                    value={dietary} 
                    onChange={setDietary} 
                  />
                </div>
              </div>

              <div className="form-group location-group">
                <Input 
                  label="Pickup Location" 
                  placeholder="Enter address or use current location" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required 
                />
                <button type="button" className="fetch-location-btn" onClick={fetchLocation}>
                  <MapPin size={15} /> Use Current Location
                </button>
              </div>

              <div className="form-group">
                <label className="input-label">Additional Instructions (Optional)</label>
                <textarea
                  className="input-field textarea-field"
                  placeholder="Pickup notes, allergies, preparation method..."
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              {/* Safety Checklist */}
              <div className="safety-checklist">
                <div className="checklist-header">
                  <ShieldCheck size={18} />
                  <h4>Food Safety Checklist</h4>
                  <span className="checklist-badge">{checkedItems.filter(Boolean).length}/{SAFETY_CHECKLIST.length} checked</span>
                </div>
                <p className="checklist-sub">Please confirm all safety standards before submitting.</p>
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

              {!allChecked && (
                <div className="checklist-warning">
                  <AlertCircle size={15} />
                  <span>Please complete the safety checklist to submit.</span>
                </div>
              )}

              <Button type="submit" size="lg" fullWidth disabled={isSubmitting || !allChecked}>
                {isSubmitting ? 'Uploading to Network...' : <><UploadIcon size={18} /> List Food Donation</>}
              </Button>
            </form>
          </Card>
        </div>

        <div className="upload-sidebar">
          <Card className="why-card">
            <h3>💚 Why Donate?</h3>
            <ul className="why-list">
              <li>Reduce food waste & greenhouse gas emissions</li>
              <li>Directly feed people in your community</li>
              <li>Earn Kindness Score points & recognition</li>
              <li>Improve your organization's social impact</li>
              <li>Join 450+ verified donors on Aahar Setu</li>
            </ul>
          </Card>

          <Card className="impact-preview-card">
            <h4>📊 Your Estimated Impact</h4>
            <div className="impact-metrics">
              <div className="impact-metric">
                <span className="impact-val">~8</span>
                <span className="impact-lbl">Meals Created</span>
              </div>
              <div className="impact-metric">
                <span className="impact-val">~2.1kg</span>
                <span className="impact-lbl">CO₂ Saved</span>
              </div>
              <div className="impact-metric">
                <span className="impact-val">+10</span>
                <span className="impact-lbl">Kindness Pts</span>
              </div>
            </div>
          </Card>

          <Card className="volunteer-card">
            <h4>🚚 Need Pickup Help?</h4>
            <p>We can connect you with nearby volunteers or delivery partners for hassle-free pickup.</p>
            <Button variant="outline" size="sm" onClick={() => alert('Broadcasting request to local volunteer network...')}>Request Volunteer</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
