import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  CheckCircle, 
  XCircle, 
  User, 
  Users, 
  Package, 
  AlertCircle,
  Clock,
  LogOut,
  Settings,
  Bell,
  Search,
  Siren,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { Card } from '../../donor/components/ui/Card/Card';
import { Button } from '../../donor/components/ui/Button/Button';
import '../styles/Admin.css';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface VerificationRequest {
  id: string;
  receiverName: string;
  itemName: string;
  claimedAt: string;
  images: string[];
  status: 'pending' | 'approved' | 'declined';
}

interface EmergencyReport {
  id: string;
  reporterName: string;
  role: string;
  message: string;
  location: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'verification' | 'profile' | 'emergencies'>('verification');
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fetchRealVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          id, 
          status, 
          created_at,
          proof_images,
          profiles (
            organization_name,
            full_name
          ),
          donations (
            food_name
          )
        `)
        .eq('status', 'proof_submitted');

      if (error) throw error;
      if (data) {
        const transformed: VerificationRequest[] = data.map((item: any) => {
          let images = item.proof_images || [];
          if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch(e) { images = []; }
          }
          
          // CRITICAL DEMO FALLBACK: If DB is empty, check if this browser has the local proof
          if ((!images || images.length === 0)) {
            const localProof = localStorage.getItem(`proof_${item.id}`);
            if (localProof) {
              try { images = JSON.parse(localProof); } catch(e) { images = []; }
            }
          }

          return {
            id: item.id,
            receiverName: item.profiles?.organization_name || item.profiles?.full_name || 'Organization',
            itemName: item.donations?.food_name || 'Donation Item',
            claimedAt: new Date(item.created_at).toLocaleDateString(),
            images: images,
            status: 'pending'
          };
        });
        setRequests(transformed as VerificationRequest[]);
      }
    } catch (err) {
      console.error('Error fetching verifications:', err);
    }
  };

  const fetchRealEmergencies = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setEmergencies(data.map((d: any) => ({
          id: d.id,
          reporterName: d.reporter_name,
          role: d.user_role,
          message: d.message,
          location: d.location_name,
          createdAt: new Date(d.created_at).toLocaleString(),
          status: d.status
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'declined') => {
    setLoading(true);
    try {
      // If approved -> completed (unlocked)
      // If declined -> delivered (which triggers 'Proof Required' UI for re-upload)
      const finalStatus = action === 'approved' ? 'completed' : 'delivered';
      
      const { error } = await supabase
        .from('claims')
        .update({ status: finalStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state to reflect the change visually
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRealVerifications();
    fetchRealEmergencies();

    const claimSub = supabase
      .channel('admin_claims_live')
      .on('postgres_changes', { event: '*', table: 'claims', schema: 'public' }, () => {
        fetchRealVerifications();
      })
      .subscribe();

    const emergencySub = supabase
      .channel('admin_emergencies_live')
      .on('postgres_changes', { event: '*', table: 'emergency_reports', schema: 'public' }, () => {
        fetchRealEmergencies();
      })
      .subscribe();

    return () => {
       supabase.removeChannel(claimSub);
       supabase.removeChannel(emergencySub);
    };
  }, []);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="admin-layout">
      {/* Sidebar - RESTORED */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <ShieldCheck size={24} />
          <span>Aahar Setu Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <CheckCircle size={20} />
            Verifications
            {pendingCount > 0 && <span className="admin-badge">{pendingCount}</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'emergencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergencies')}
          >
            <Siren size={20} />
            Emergencies
            {emergencies.filter(e => e.status === 'pending').length > 0 && 
              <span className="admin-badge">
                {emergencies.filter(e => e.status === 'pending').length}
              </span>
            }
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            My Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"><User size={20} /></div>
            <div className="user-details">
              <p className="user-name">Admin User</p>
              <p className="user-role">Full Access</p>
            </div>
          </div>
          
          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'verification' && (
          <section className="admin-section">
            <header className="admin-header">
              <h1>Proof <span className="gradient-text">Verification</span></h1>
              <p>Review photo evidence from reward/impact claims.</p>
            </header>

            <div className="verification-grid">
              {requests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="empty-subtle">
                   <div className="empty-icon"><CheckCircle size={40} /></div>
                   <p>All distributions verified.</p>
                </div>
              ) : (
                requests.filter(r => r.status === 'pending').map(req => (
                  <Card key={req.id} className="verify-card animate-slide-up">
                    <div className="verify-card-header">
                      <div>
                        <h3>{req.receiverName}</h3>
                        <p>{req.itemName}</p>
                      </div>
                      <span className="time-tag">{req.claimedAt}</span>
                    </div>

                    <div className="evidence-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '15px 0' }}>
                      {req.images.map((img, i) => (
                        <div 
                          key={i} 
                          className="evidence-img-wrap" 
                          style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #ddd' }}
                          onClick={() => setZoomImage(img)}
                        >
                           <img src={img} alt="Evidence" className="evidence-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>

                    <div className="verify-actions">
                      <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => handleAction(req.id, 'declined')}
                        className="btn-decline"
                        style={{ height: '40px' }}
                      >
                        <XCircle size={18} /> Decline
                      </Button>
                      <Button 
                        fullWidth 
                        onClick={() => handleAction(req.id, 'approved')}
                        className="btn-approve"
                        style={{ height: '40px' }}
                      >
                        <CheckCircle size={18} /> Approve
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'emergencies' && (
           <section className="admin-section">
            <header className="admin-header">
              <h1>Crisis <span className="gradient-text">Command Feed</span></h1>
              <p>Real-time distress signals and broadcast monitoring.</p>
            </header>

            <div className="crisis-feed">
              {emergencies.length === 0 ? (
                <div className="empty-subtle"><p>No active distress signals.</p></div>
              ) : (
                emergencies.map(e => (
                  <div key={e.id} className={`crisis-card ${e.status === 'pending' ? 'urgent' : 'resolved'} animate-slide-up`}>
                    <div className="crisis-side-indicator"></div>
                    
                    <div className="crisis-content">
                      <div className="crisis-header">
                        <div className="reporter-profile">
                           <div className={`role-avatar ${e.role.toLowerCase()}`}>
                              {e.role === 'Donor' ? <Package size={16} /> : <Users size={16} />}
                           </div>
                           <div className="reporter-meta">
                              <h4>{e.reporterName}</h4>
                              <span className={`role-tag ${e.role.toLowerCase()}`}>{e.role}</span>
                           </div>
                        </div>
                        <div className="crisis-timing">
                           <Clock size={12} /> {e.createdAt}
                        </div>
                      </div>

                      <div className="crisis-body">
                         <div className="distress-message">
                            <AlertTriangle size={18} className="alert-icon" />
                            <p>{e.message}</p>
                         </div>
                         <div className="crisis-location">
                            <MapPin size={14} />
                            <span>{e.location}</span>
                         </div>
                      </div>

                      <div className="crisis-footer">
                         <div className="status-pill">
                            <span className="dot"></span> {e.status.toUpperCase()}
                         </div>
                         {e.status === 'pending' && (
                           <button className="resolve-action-btn" onClick={async () => {
                              await supabase.from('emergency_reports').update({ status: 'resolved' }).eq('id', e.id);
                              fetchRealEmergencies();
                           }}>
                              <CheckCircle size={16} /> Mark as Resolved
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="admin-section">
            <header className="admin-header">
              <h1>Admin <span className="gradient-text">Profile</span></h1>
              <p>Manage your account settings and preferences.</p>
            </header>

            <div className="profile-container animate-float">
              <div className="profile-header">
                <div className="profile-avatar">A</div>
                <div className="profile-title">
                  <h2>System Administrator</h2>
                  <p>Lead Coordinator • Aahar Setu Network</p>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="info-group">
                  <label>Full Name</label>
                  <p>Admin User</p>
                </div>
                <div className="info-group">
                  <label>Email Address</label>
                  <p>vvce25cse0500@vvce.ac.in</p>
                </div>
                <div className="info-group">
                  <label>Role</label>
                  <p>Global Administrator</p>
                </div>
                <div className="info-group">
                  <label>Status</label>
                  <p className="status-primary">Active / Verified</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* LIGHTBOX OVERLAY */}
      {zoomImage && (
        <div 
          className="admin-lightbox-overlay animate-fade-in"
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '40px'
          }}
        >
          <div className="lightbox-content animate-zoom-in" style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={zoomImage} 
              alt="Zoomed Proof" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
            />
            <button 
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setZoomImage(null)}
            >
              <XCircle size={24} /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
