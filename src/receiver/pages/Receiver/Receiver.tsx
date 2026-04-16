import React, { useState, useRef } from 'react';
import { Card } from '../../../donor/components/ui/Card/Card';
import { Button } from '../../../donor/components/ui/Button/Button';
import { MapPin, Clock, Truck, ChevronRight, PackageOpen, Utensils, AlertTriangle, ShieldCheck, UploadCloud, X, ImagePlus, Zap } from 'lucide-react';
import '../../styles/Receiver.css';

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

  const [demands, setDemands] = useState([
    { id: 'd1', item: 'Rice & Sambar', priority: 'High', status: 'monitoring' },
    { id: 'd2', item: 'Baby Food', priority: 'Critical', status: 'matched' }
  ]);
  const [newDemand, setNewDemand] = useState('');

  const handleAddDemand = () => {
    if (!newDemand.trim()) return;
    const demand = {
      id: Math.random().toString(36).substr(2, 9),
      item: newDemand,
      priority: 'High',
      status: 'monitoring'
    };
    setDemands(prev => [demand, ...prev]);
    setNewDemand('');
  };

  const matchedDemand = demands.find(d => d.status === 'matched');

  return (
    <div className="receiver-dashboard-container">
      {/* ... header ... */}
      <div className="receiver-header">
        <h1 className="page-title">Receiver <span className="gradient-text">Dashboard</span></h1>
        <p className="page-subtitle">Welcome back, Hope Shelter! Manage your rescues and set priority demands.</p>
      </div>

      {/* Account Status Banners ... */}
      {/* (keeping current logic) */}
      {accountLocked && (
        <>
          {requiresProof ? (
            <div className="account-lock-banner banner-danger">
              <AlertTriangle size={24} />
              <div className="lock-banner-content">
                <h3>Account Locked: Verification Required</h3>
                <p>You have reached the limit of 2 unverified deliveries. Please upload utilization images to unlock your account.</p>
              </div>
            </div>
          ) : (
            <div className="account-lock-banner banner-warning">
              <Clock size={24} />
              <div className="lock-banner-content">
                <h3>Account Standing: Under Review</h3>
                <p>Thank you for uploading! Your photos are now being verified by our Admin. Your account limit will be lifted once approval is complete.</p>
              </div>
            </div>
          )}
        </>
      )}

      {unverifiedCount === 1 && (
        <div className="account-lock-banner banner-info">
          {requiresProof ? (
            <>
              <AlertTriangle size={24} />
              <div className="lock-banner-content">
                <h3>Pending Proof of Utilization</h3>
                <p>You have 1 order awaiting verification photos. Upload them now to avoid account limits.</p>
              </div>
            </>
          ) : (
            <>
              <Clock size={24} />
              <div className="lock-banner-content">
                <h3>Verification in Progress</h3>
                <p>Your delivery proof is currently being reviewed by our team.</p>
              </div>
            </>
          )}
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
            <div className="kpi-icon text-primary bg-primary-light"><Zap size={22} /></div>
          </div>
          <div className="kpi-value">{demands.length}</div>
          <div className="kpi-label">Priority Demands</div>
        </Card>
      </div>

      <div className="claims-section">
        <div className="claims-tabs">
          <button 
            className={`claims-tab ${activeTab === 'pending_proofs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('pending_proofs')}
          >
            Proof Required {items.proofs.length > 0 && <span className="tab-badge">{items.proofs.length}</span>}
          </button>
          <button className={`claims-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Completed History</button>
          <button className={`claims-tab ai-match-tab ${activeTab === 'ai_match' ? 'active' : ''}`} onClick={() => setActiveTab('ai_match')}>
            <Zap size={14} /> Aahara AI Match
            <span className="tab-badge pulse-badge">{demands.filter(d => d.status === 'matched').length + 1}</span>
          </button>
        </div>

        <div className="claims-list">
          {activeTab === 'ai_match' ? (
            <div className="ai-match-container">
               {/* 1. Demand Management Area */}
               <Card className="demand-management-card glass">
                  <div className="demand-header">
                    <h4><Utensils size={18} /> SET PRIORITY DEMANDS</h4>
                    <p>Tell Aahara AI what you need most. We'll notify you instantly when a match is listed.</p>
                  </div>
                  <div className="add-demand-row">
                    <input 
                       type="text" 
                       placeholder="e.g. Rice & Sambar, Milk, Biscuits..." 
                       value={newDemand}
                       onChange={(e) => setNewDemand(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleAddDemand()}
                    />
                    <Button onClick={handleAddDemand} size="sm">Add Demand</Button>
                  </div>
                  <div className="active-demands-pills">
                    {demands.map(d => (
                       <div key={d.id} className={`demand-pill ${d.status}`}>
                          <span className="p-dot" /> {d.item}
                          <button className="remove-p" onClick={() => setDemands(prev => prev.filter(x => x.id !== d.id))}>×</button>
                       </div>
                    ))}
                  </div>
               </Card>

               {/* 2. MATCHED DEMAND ALERTS */}
               {matchedDemand && (
                  <Card className="ai-discovery-card matched-alert animate-pulse-border">
                    <div className="ai-discovery-header">
                       <div className="ai-tag urgency-critical">DEMAND MATCH FOUND!</div>
                       <h3>Targeted Supply Found: {matchedDemand.item}</h3>
                    </div>
                    <div className="match-visual-row">
                       <div className="match-item-bubble highlight">
                          <span className="bubble-label">Your Demand</span>
                          <p>{matchedDemand.item}</p>
                       </div>
                       <div className="match-connector"><Zap size={24} className="text-warning" /></div>
                       <div className="match-item-bubble success">
                          <span className="bubble-label">Available Now</span>
                          <p>Baskin & Scones</p>
                       </div>
                    </div>
                    <p className="ai-suggestion-text">
                       A matching item for your priority demand <strong>"{matchedDemand.item}"</strong> was just listed 
                       by <strong>Baskin & Scones</strong> (0.8km away). Claim it now before others!
                    </p>
                    <Button fullWidth className="btn-claim-matched">Claim Early (Priority Access)</Button>
                  </Card>
               )}

               {/* 3. Existing Smart Pairs */}
               <Card className="ai-discovery-card glass" style={{ marginTop: '20px' }}>
                <div className="ai-discovery-header">
                  <div className="ai-tag">SMART BUNDLE READY</div>
                  <h3>Complementary Pairing Found!</h3>
                </div>
                {/* ... same visual row as before ... */}
                <div className="match-visual-row">
                   <div className="match-item-bubble">
                      <span className="bubble-label">You Claimed</span>
                      <p>Rice</p>
                   </div>
                   <div className="match-connector"><Zap size={20} className="text-warning" /></div>
                   <div className="match-item-bubble highlight">
                      <span className="bubble-label">AI Suggests</span>
                      <p>Sambar</p>
                   </div>
                </div>
                <p className="ai-suggestion-text">
                  A donor just listed <strong>Mixed Vegetable Sambar</strong> nearby. 
                  Pairing this with your rice increases impact score by <strong>+45%</strong>.
                </p>
                <Button fullWidth variant="outline">Claim Matching Item</Button>
              </Card>
            </div>
          ) : 
displayItems.length === 0 ? (
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
