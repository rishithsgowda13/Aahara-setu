import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Clock, Truck, ChevronRight, PackageOpen, Utensils, Camera, AlertTriangle, ShieldCheck, UploadCloud, X, ImagePlus, Zap } from 'lucide-react';
import './Receiver.css';

interface ClaimedItem {
  id: string;
  name: string;
  donor: string;
  quantity: string;
  status: 'pending' | 'in_transit' | 'proof_required' | 'proof_submitted' | 'completed';
  eta: string;
  distance: string;
}

const ACTIVE_CLAIMS: ClaimedItem[] = [
  { 
    id: 'c1', 
    name: 'Assorted Gourmet Pastries', 
    donor: 'Baskin & Scones', 
    quantity: '15 pieces', 
    status: 'pending' as const, 
    eta: 'Pick up by 6:00 PM today', 
    distance: '0.8 km' 
  }
];

const PROOF_REQUIRED_CLAIMS: ClaimedItem[] = [
  { 
    id: 'p1', 
    name: 'Fresh Salad Bowls', 
    donor: 'Green Leaf Cafe', 
    quantity: '50 bowls', 
    status: 'proof_required', 
    eta: 'Delivered Today at 2:00 PM', 
    distance: '2.5 km' 
  },
  { 
    id: 'p2', 
    name: 'Vegetable Pulao', 
    donor: 'Skyline Banquets', 
    quantity: '20 portions', 
    status: 'proof_submitted', 
    eta: 'Delivered Yesterday', 
    distance: '1.2 km' 
  }
];

const PAST_CLAIMS: ClaimedItem[] = [
  { 
    id: 'p3', 
    name: 'Mixed Fruit Platters', 
    donor: 'The Grand Palace', 
    quantity: '3 platters', 
    status: 'completed', 
    eta: 'Approved on Oct 12', 
    distance: '3.1 km' 
  }
];

export const Receiver: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending_proofs' | 'history' | 'ai_match'>('ai_match');
  
  const [items, setItems] = useState({
    active: ACTIVE_CLAIMS,
    proofs: PROOF_REQUIRED_CLAIMS,
    history: PAST_CLAIMS
  });

  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayItems = 
    activeTab === 'active' ? items.active : 
    activeTab === 'pending_proofs' ? items.proofs : 
    items.history;

  const requiresProof = items.proofs.some(i => i.status === 'proof_required');
  const awaitingAdmin = items.proofs.some(i => i.status === 'proof_submitted');

  const unverifiedCount = items.proofs.length;
  const accountLocked = unverifiedCount >= 2;

  const handleUploadClick = (id: string) => {
    setUploadingForId(id);
    setSelectedImages([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
        // Create local object URLs to preview images immediately
        const newImgs = Array.from(e.target.files).map(f => URL.createObjectURL(f));
        setSelectedImages(prev => [...prev, ...newImgs]);
     }
  };

  const handleRemoveImage = (index: number) => {
     setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProof = () => {
    if (selectedImages.length < 3) return; // Prevent submission if less than 3
    
    // In a real app, you would send Files to an API here
    setItems(prev => ({
        ...prev,
        proofs: prev.proofs.map(i => i.id === uploadingForId ? { ...i, status: 'proof_submitted' as const } : i)
    }));
    
    setUploadingForId(null);
    setSelectedImages([]);
  };

  return (
    <div className="receiver-dashboard-container">
      <div className="receiver-header">
        <h1 className="page-title">Receiver <span className="gradient-text">Dashboard</span></h1>
        <p className="page-subtitle">Welcome back, Hope Shelter! Validate your deliveries and track orders here.</p>
      </div>

      {/* Account Status Banners */}
      {accountLocked && (
        <div className={`account-lock-banner ${requiresProof ? 'banner-danger' : 'banner-warning'}`}>
          {requiresProof ? <AlertTriangle size={24} /> : <Clock size={24} />}
          <div className="lock-banner-content">
            <h3>Account Locked: Order Limit Reached</h3>
            {requiresProof ? (
              <p>You have reached the maximum limit of 2 unverified deliveries! Please upload images showing the proper utilization of your received food to unlock your account and place new orders.</p>
            ) : (
              <p>Your uploaded proofs are currently under review by an Admin. Since you have hit the 2-order limit, you must wait for approval before placing new claims.</p>
            )}
          </div>
        </div>
      )}

      {unverifiedCount === 1 && (
        <div className="account-lock-banner banner-info">
          <AlertTriangle size={24} />
          <div className="lock-banner-content">
            <h3>Note: Pending Proof of Utilization</h3>
            <p>You have 1 unverified order! Please make sure to upload images showing the proper utilization of the food you received. <strong>If you accumulate 2 or more unverified orders, your account will be frozen and you will not be able to place new orders.</strong></p>
          </div>
        </div>
      )}


      <div className="receiver-kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-icon-row">
            <div className="kpi-icon text-primary bg-primary-light"><Utensils size={22} /></div>
          </div>
          <div className="kpi-value">1,204</div>
          <div className="kpi-label">Total Meals Served</div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-icon-row">
            <div className="kpi-icon text-warning bg-warning-light"><PackageOpen size={22} /></div>
          </div>
          <div className="kpi-value">{items.active.length}</div>
          <div className="kpi-label">Active Claims</div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-icon-row">
            <div className="kpi-icon text-danger bg-danger-light"><Camera size={22} /></div>
          </div>
          <div className="kpi-value">{items.proofs.length}</div>
          <div className="kpi-label">Pending Proofs</div>
        </Card>
      </div>

      <div className="claims-section">
        <div className="claims-tabs">
          <button 
            className={`claims-tab ${activeTab === 'active' ? 'active' : ''}`} 
            onClick={() => setActiveTab('active')}
          >
            Active Deliveries
          </button>
          <button 
            className={`claims-tab ${activeTab === 'pending_proofs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('pending_proofs')}
          >
            Proof Required
             {items.proofs.length > 0 && <span className="tab-badge">{items.proofs.length}</span>}
          </button>
          <button 
            className={`claims-tab ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            Completed History
          </button>
          <button 
            className={`claims-tab ai-match-tab ${activeTab === 'ai_match' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ai_match')}
          >
            <Zap size={14} /> Aahara AI Match
            <span className="tab-badge pulse-badge">1</span>
          </button>
        </div>

        <div className="claims-list">
          {activeTab === 'ai_match' ? (
            <div className="ai-match-view">
              <Card className="ai-discovery-card glass">
                <div className="ai-discovery-header">
                  <div className="ai-tag">SMART BUNDLE READY</div>
                  <h3>We found a perfect pairing!</h3>
                </div>
                <div className="match-visual-row">
                  <div className="match-item-bubble">
                    <span className="bubble-label">You Claimed</span>
                    <p>Rice</p>
                  </div>
                  <div className="match-connector">
                    <Zap size={20} className="text-warning" />
                  </div>
                  <div className="match-item-bubble highlight">
                    <span className="bubble-label">AI Suggests</span>
                    <p>Sambar</p>
                  </div>
                </div>
                <p className="ai-suggestion-text">
                  Distributing <strong>Rice</strong> alone often leads to lower satisfaction. 
                  A donor just listed <strong>Mixed Vegetable Sambar</strong> 0.6km away. 
                  Claiming them together increases your impact score by <strong>+45%</strong>.
                </p>
                <Button fullWidth className="ai-primary-btn">Claim Matching Sambar Now</Button>
              </Card>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="empty-claims">No records found.</div>
          ) : (
            displayItems.map(item => (
              <Card key={item.id} className={`claim-card ${item.status === 'proof_required' ? 'border-danger' : ''}`}>
                <div className="claim-info">
                  <h3 className="claim-name">{item.name}</h3>
                  <p className="claim-donor">From: {item.donor}</p>
                  <div className="claim-meta">
                    <span><PackageOpen size={14} className="text-primary" /> {item.quantity}</span>
                    <span><MapPin size={14} className="text-secondary" /> {item.distance}</span>
                  </div>
                </div>
                
                <div className="claim-status-col">
                  <div className={`status-badge status-${item.status}`}>
                    {item.status === 'in_transit' && <><Truck size={14} /> On the way</>}
                    {item.status === 'pending' && <><MapPin size={14} /> Self-Pickup</>}
                    {item.status === 'proof_required' && <><AlertTriangle size={14} /> Needs Proof</>}
                    {item.status === 'proof_submitted' && <><Clock size={14} /> Admin Reviewing</>}
                    {item.status === 'completed' && <><ShieldCheck size={14} /> Verified</>}
                  </div>
                  
                  <div className="eta-text">{item.eta}</div>
                  
                  {item.status === 'pending' && (
                    <Button variant="outline" className="track-btn">
                      Required <ChevronRight size={14} />
                    </Button>
                  )}

                  {item.status === 'proof_required' && (
                    <Button className="track-btn danger-btn" onClick={() => handleUploadClick(item.id)}>
                      <UploadCloud size={18} style={{ marginRight: '6px' }} /> Upload Utilization Photos
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal Overlay */}
      {uploadingForId && (
        <div className="modal-overlay" onClick={() => setUploadingForId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Proof of Utilization</h3>
              <button className="close-btn" onClick={() => setUploadingForId(null)}>
                <X size={20} />
              </button>
            </div>
            
            <p className="modal-desc">
              Please upload at least <strong>3 images</strong> showing that the food 
              ({items.proofs.find(i => i.id === uploadingForId)?.name}) was successfully distributed without waste.
            </p>

            <div className="upload-area">
              <input 
                 type="file" 
                 multiple 
                 accept="image/*" 
                 capture="environment" 
                 className="hidden-file-input" 
                 ref={fileInputRef}
                 onChange={handleFileChange}
              />
              <Button variant="outline" className="trigger-upload-btn" onClick={() => fileInputRef.current?.click()}>
                 <ImagePlus size={20} style={{ marginRight: '8px' }} /> Select or Capture Images
              </Button>
              <div className="upload-hint">Minimum 3 images required. Currently selected: {selectedImages.length}</div>
            </div>

            {selectedImages.length > 0 && (
              <div className="image-preview-grid">
                 {selectedImages.map((img, i) => (
                    <div key={i} className="img-preview-wrap">
                       <img src={img} alt="preview" className="img-preview" />
                       <button className="remove-img-btn" onClick={() => handleRemoveImage(i)}>
                          <X size={14} />
                       </button>
                    </div>
                 ))}
              </div>
            )}

            <div className="modal-actions">
              <Button variant="outline" onClick={() => setUploadingForId(null)}>Cancel</Button>
              <div style={{ flex: 1 }} />
              <Button 
                 variant="primary" 
                 disabled={selectedImages.length < 3} 
                 onClick={handleSubmitProof}
              >
                 Submit Proof ({selectedImages.length}/3)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
