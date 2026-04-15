import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Upload as UploadIcon, MapPin, CheckSquare, Square, ShieldCheck, AlertCircle } from 'lucide-react';
import './Upload.css';

const SAFETY_CHECKLIST = [
  'Food has been stored at proper temperature',
  'Packaging is sealed and undamaged',
  'Expiry date has been verified',
  'Food is free from cross-contamination',
  'Prepared in a clean & hygienic environment',
];

export const Upload: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(SAFETY_CHECKLIST.length).fill(false));
  const allChecked = checkedItems.every(Boolean);

  const toggleCheck = (i: number) => {
    setCheckedItems(prev => prev.map((v, idx) => idx === i ? !v : v));
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
          <Card className="success-card">
            <div className="success-icon-wrap">✅</div>
            <h2>Donation Listed Successfully!</h2>
            <p>Your food donation has been submitted and is now being matched with nearby NGOs and individuals in need. You'll receive a notification once claimed.</p>
            <div className="success-stats">
              <div className="success-stat">
                <span className="success-stat-val">~5 mins</span>
                <span className="success-stat-lbl">Avg Claim Time</span>
              </div>
              <div className="success-stat">
                <span className="success-stat-val">3 NGOs</span>
                <span className="success-stat-lbl">Being Notified</span>
              </div>
              <div className="success-stat">
                <span className="success-stat-val">+Kindness</span>
                <span className="success-stat-lbl">Score Updated</span>
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
              <div className="form-group">
                <Input label="Food Name / Type" placeholder="e.g., 50 Servings of Pasta, Fresh Bread" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Food Category</label>
                  <select className="input-field" required>
                    <option value="">Select category</option>
                    <option>Main Course</option>
                    <option>Bakery</option>
                    <option>Dessert</option>
                    <option>Healthy / Salad</option>
                    <option>Snacks</option>
                    <option>Beverages</option>
                    <option>Mixed / Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <Input label="Quantity (approx.)" placeholder="e.g., 20 kg, 50 portions" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Input label="Expiry Date & Time" type="datetime-local" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Dietary Info</label>
                  <select className="input-field">
                    <option value="">Not specified</option>
                    <option>Vegan</option>
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Gluten Free</option>
                    <option>Nut Free</option>
                  </select>
                </div>
              </div>

              <div className="form-group location-group">
                <Input label="Pickup Location" placeholder="Enter address or use current location" required />
                <button type="button" className="fetch-location-btn">
                  <MapPin size={15} /> Use Current Location
                </button>
              </div>

              <div className="form-group">
                <label className="input-label">Additional Instructions (Optional)</label>
                <textarea
                  className="input-field textarea-field"
                  placeholder="Pickup notes, allergies, preparation method..."
                  rows={3}
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
                {isSubmitting ? 'Uploading...' : <><UploadIcon size={18} /> List Food Donation</>}
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
              <li>Join 450+ verified donors on CFRN</li>
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
            <Button variant="outline" size="sm">Request Volunteer</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
