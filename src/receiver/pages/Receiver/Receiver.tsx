import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../../donor/components/ui/Card/Card';
import { Button } from '../../../donor/components/ui/Button/Button';
import { MapPin, Clock, Truck, ChevronRight, PackageOpen, Utensils, AlertTriangle, ShieldCheck, UploadCloud, X, ImagePlus, Zap, Loader2, Sparkles } from 'lucide-react';
import '../../styles/Receiver.css';
import { supabase } from '../../../lib/supabase';
import { findMatch, type MatchResult } from '../../lib/AaharaAI';

interface ClaimedItem {
  id: string;
  name: string;
  donor: string;
  quantity: string;
  status: 'pending' | 'in_transit' | 'proof_required' | 'proof_submitted' | 'completed';
  eta: string;
  distance: string;
}

// Mock data removed. Using real-time Supabase fetches.

export const Receiver: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending_proofs' | 'history' | 'ai_match'>('ai_match');
  
  const [items, setItems] = useState({
    active: [] as ClaimedItem[],
    proofs: [] as ClaimedItem[],
    history: [] as ClaimedItem[]
  });

  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<{url: string, file: File}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const files = Array.from(e.target.files);
        const newImgs = files.map(f => ({
          url: URL.createObjectURL(f),
          file: f
        }));
        setSelectedImages(prev => [...prev, ...newImgs]);
     }
  };

  const handleRemoveImage = (index: number) => {
     setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProof = async () => {
    if (selectedImages.length < 3 || !uploadingForId) return;
    
    setIsSubmitting(true);
    try {
      // Convert images to Base64 strings
      const base64Promises = selectedImages.map(img => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(img.file);
        });
      });

      const base64Images = await Promise.all(base64Promises);

      // FALLBACK: Save to localStorage so Admin can see it on this machine
      localStorage.setItem(`proof_${uploadingForId}`, JSON.stringify(base64Images));

      // Save directly to the claims table (Text Array)
      const { error: updateError } = await supabase
        .from('claims')
        .update({ 
          proof_images: base64Images,
          status: 'proof_submitted'
        })
        .eq('id', uploadingForId);

      // FALLBACK: If DB fails (missing column), we still update the UI for the demo
      if (updateError) {
        console.warn('Database update failed (probably missing column), but proceeding with local UI update for demo.');
      }

      // Update local state (This makes the banner turn Orange)
      setItems(prev => ({
          ...prev,
          proofs: prev.proofs.filter(i => i.id !== uploadingForId),
          history: [
            { 
              ...prev.proofs.find(i => i.id === uploadingForId) || { id: uploadingForId, name: 'Food Item', donor: 'Donor', status: 'proof_submitted' }, 
              status: 'proof_submitted',
              eta: 'Under Admin Review' 
            },
            ...prev.history
          ]
      }));
      
      setUploadingForId(null);
      setSelectedImages([]);
      
      if (updateError) {
        console.error("Supabase Update Error:", updateError);
        alert(`Database Sync Issue: ${updateError.message}. (Using local storage fallback for demo)`);
      } else {
        alert('Proof submitted successfully! Awaiting admin verification.');
      }
    } catch (err: any) {
      console.error('Error uploading proof:', err);
      alert('Database error: Make sure you added the "proof_images" column to your "claims" table.');
    } finally {
      setIsSubmitting(false);
    }
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

  const [availableItems, setAvailableItems] = useState<{name: string, id: string, donor?: string}[]>([]);
  const [aiMatches, setAiMatches] = useState<(MatchResult & { donor?: string, quantity?: string, id: string })[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // 1. Fetch available donations initially and subscribe to real-time updates
  useEffect(() => {
    const fetchDonations = async () => {
      const { data } = await supabase
        .from('donations')
        .select('id, food_name, profiles(organization_name), quantity_value, quantity_unit')
        .eq('status', 'available');
      
      if (data) {
        setAvailableItems(data.map(d => ({
          id: d.id,
          name: d.food_name,
          donor: (d.profiles as any)?.organization_name || 'Anonymous',
          quantity: `${d.quantity_value} ${d.quantity_unit}`
        })));
      }
    };

    const fetchUserClaims = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('claims')
        .select(`
          id, 
          status, 
          created_at,
          donations (
            food_name, 
            profiles (organization_name)
          )
        `)
        .eq('receiver_id', user.id);

      if (data) {
        setItems({
          active: data.filter(c => c.status === 'pending' || c.status === 'approved').map(c => ({
            id: c.id,
            name: c.donations?.food_name || 'Food Item',
            donor: (c.donations?.profiles as any)?.organization_name || 'Donor',
            quantity: 'Active Rescue',
            status: c.status === 'approved' ? 'in_transit' : 'pending',
            eta: 'View details',
            distance: '--'
          })),
          proofs: data.filter(c => c.status === 'delivered' || c.status === 'proof_required').map(c => ({
            id: c.id,
            name: c.donations?.food_name || 'Food Item',
            donor: (c.donations?.profiles as any)?.organization_name || 'Donor',
            quantity: 'Proof Needed',
            status: 'proof_required',
            eta: new Date(c.created_at).toLocaleDateString(),
            distance: '--'
          })),
          history: data.filter(c => c.status === 'completed' || c.status === 'proof_submitted' || c.status === 'closed').map(c => ({
            id: c.id,
            name: c.donations?.food_name || 'Food Item',
            donor: (c.donations?.profiles as any)?.organization_name || 'Donor',
            quantity: c.status === 'completed' ? 'Verified' : 'Verification In-Progress',
            status: c.status === 'completed' ? 'completed' : 'proof_submitted',
            eta: c.status === 'completed' ? 'Successfully Verified' : 'Under Admin Review',
            distance: '--'
          }))
        });
      }
    };

    fetchDonations();
    fetchUserClaims();

    const channel = supabase
      .channel('ai_matches_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload) => {
        const newItem = payload.new as any;
        setAvailableItems(prev => [{
          id: newItem.id,
          name: newItem.food_name,
          donor: 'New Donor',
          quantity: `${newItem.quantity_value} ${newItem.quantity_unit}`
        }, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Run AI Match whenever demands or available items change
  useEffect(() => {
    if (demands.length === 0 || availableItems.length === 0) {
      setAiMatches([]);
      return;
    }

    setIsAiSearching(true);
    
    // Simulate complex AI processing time
    const timer = setTimeout(() => {
      const newMatches: any[] = [];
      
      demands.forEach(demand => {
        const match = findMatch(demand.item, availableItems);
        if (match) {
          const detailedAvail = availableItems.find(a => a.name === match.itemName);
          newMatches.push({
            ...match,
            donor: detailedAvail?.donor,
            quantity: detailedAvail?.quantity,
            id: detailedAvail?.id
          });
        }
      });

      setAiMatches(newMatches);
      setIsAiSearching(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [demands, availableItems]);

  const matchedDemand = demands.find(d => d.status === 'matched');

  return (
    <div className="receiver-dashboard-container">
      {/* ... header ... */}
      <div className="receiver-header">
        <h1 className="page-title">Receiver <span className="gradient-text">Dashboard</span></h1>
        <p className="page-subtitle">Welcome back, Hope Shelter! Manage your rescues and set priority demands.</p>
      </div>

      {/* Multi-Status Verification Banner */}
      <div className="verification-status-banner">
        {items.proofs.length > 0 ? (
          <div className="account-lock-banner banner-danger animate-pulse">
            <AlertTriangle size={24} />
            <div className="lock-banner-content">
              <h3>Action Required: Delivery Verification</h3>
              <p>You have {items.proofs.length} order(s) awaiting proof of utilization. Please upload photos to maintain your account standing.</p>
            </div>
          </div>
        ) : items.history.some(i => i.status === 'proof_submitted') ? (
          <div className="account-lock-banner banner-warning">
            <Clock size={24} />
            <div className="lock-banner-content">
              <h3>Verification In Progress</h3>
              <p>Thank you for submitting proof! Our admin team is currently reviewing your photos. Your status will update shortly.</p>
            </div>
          </div>
        ) : items.history.some(i => i.status === 'completed') ? (
          <div className="account-lock-banner banner-success">
            <ShieldCheck size={24} />
            <div className="lock-banner-content">
              <h3>Organization Verified</h3>
              <p>Great job! All your recent distributions have been successfully verified. You have full access to all priority claims.</p>
            </div>
          </div>
        ) : null}
      </div>

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
               {isAiSearching ? (
                 <div className="ai-searching-indicator glass">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p>Aahara AI is scanning nearby donations...</p>
                 </div>
               ) : aiMatches.length > 0 ? (
                 <div className="ai-matches-grid">
                   {aiMatches.map((match, idx) => (
                     <Card key={`${match.id}-${idx}`} className="ai-discovery-card matched-alert animate-float">
                        <div className="ai-discovery-header">
                           <div className="ai-tag urgency-critical">
                             {match.type === 'direct' ? '🎯 DIRECT MATCH FOUND!' : 
                              match.type === 'core' ? '🍱 COMPLEMENTARY PAIR FOUND' : '🥗 COMPLEMENTARY PAIR FOUND'}
                           </div>
                           <h3>{match.itemName} available now!</h3>
                        </div>
                        <div className="match-visual-row">
                           <div className="match-item-bubble highlight">
                              <span className="bubble-label">You Asked For</span>
                              <p>{match.matchedWith}</p>
                           </div>
                           <div className="match-connector">
                             <div className="match-score-badge">{match.score}% Match</div>
                             <Zap size={24} className="text-warning pulse-infinite" />
                           </div>
                           <div className="match-item-bubble success">
                              <span className="bubble-label">{match.type === 'direct' ? 'Found Identical' : 'AI Pairing'}</span>
                              <p>{match.itemName}</p>
                           </div>
                        </div>
                        <div className="ai-match-details">
                           <div className="match-detail"><span>Donor:</span> <strong>{match.donor}</strong></div>
                           <div className="match-detail"><span>Quantity:</span> <strong>{match.quantity}</strong></div>
                        </div>
                        <p className="ai-suggestion-text">
                           {match.type === 'direct' ? 
                             `Great news! Exactly what you needed is available at ${match.donor}.` :
                             `Aahara AI suggests: Pairing your demand for ${match.matchedWith} with ${match.itemName} creates a complete, balanced meal.`
                           }
                        </p>
                        <Button fullWidth className="btn-claim-matched">
                          <Sparkles size={16} /> Claim Early with Priority Access
                        </Button>
                      </Card>
                   ))}
                 </div>
               ) : demands.length > 0 ? (
                 <div className="ai-no-match glass">
                    <Sparkles size={24} className="text-secondary opacity-50" />
                    <p>No active matches found. Aahara AI is monitoring new donations 24/7 for your {demands.length} demands.</p>
                 </div>
               ) : null}

               {/* 3. Static Smart Suggestions if no demands set */}
               {demands.length === 0 && (
                 <Card className="ai-discovery-card glass opacity-70" style={{ marginTop: '20px' }}>
                  <div className="ai-discovery-header">
                    <div className="ai-tag">AI SUGGESTION</div>
                    <h3>Set a demand to see smart pairings</h3>
                  </div>
                  <div className="match-visual-row">
                     <div className="match-item-bubble">
                        <span className="bubble-label">Input</span>
                        <p>Rice</p>
                     </div>
                     <div className="match-connector"><Zap size={20} className="text-warning" /></div>
                     <div className="match-item-bubble highlight">
                        <span className="bubble-label">AI Match</span>
                        <p>Sambar / Dal</p>
                     </div>
                  </div>
                  <p className="ai-suggestion-text">
                    By setting your needs, Aahara AI can cross-reference nutrition data to suggest complementary pairings from different donors.
                  </p>
                </Card>
               )}
            </div>
          ) : (
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
                    
                    {(item.status === 'pending' || item.status === 'in_transit') && (
                      <Button variant="primary" className="track-btn" onClick={() => handleUploadClick(item.id)}>
                        <UploadCloud size={16} /> Test Proof Upload
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
            )
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
                        <img src={img.url} alt="preview" className="img-preview" />
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
                  disabled={selectedImages.length < 3 || isSubmitting} 
                  onClick={handleSubmitProof}
               >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : (
                    `Submit Proof (${selectedImages.length}/3)`
                  )}
               </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
