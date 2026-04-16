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
import '../styles/Admin.css';
import { supabase } from '../../lib/supabase';

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

const MOCK_REQUESTS: VerificationRequest[] = [
  {
    id: 'req-1',
    receiverName: 'Hope Foundation',
    itemName: 'Fresh Salad Bowls (50 portions)',
    claimedAt: '2 hours ago',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1540189567005-5b306a3ac70e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
    ],
    status: 'pending'
  },
  {
    id: 'req-2',
    receiverName: 'Skyline Community Kitchen',
    itemName: 'Vegetable Pulao (20 portions)',
    claimedAt: '5 hours ago',
    images: [
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=400&q=80'
    ],
    status: 'pending'
  }
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'profile' | 'emergencies'>('verification');
  const [requests, setRequests] = useState<VerificationRequest[]>(MOCK_REQUESTS);
  const [emergencies, setEmergencies] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  React.useEffect(() => {
    fetchRealVerifications();
    fetchRealEmergencies();

    // Subscribe to new verifications
    const claimSub = supabase
      .channel('admin_claims_live')
      .on('postgres_changes', { event: '*', table: 'claims', schema: 'public' }, () => {
        fetchRealVerifications();
      })
      .subscribe();

    // Subscribe to new emergency reports
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

  const fetchRealVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          id, 
          status, 
          proof_images,
          created_at,
          profiles (full_name, organization_name),
          donations (food_name)
        `)
        .or('status.eq.proof_submitted,status.eq.pending');

      if (error) throw error;

      if (data) {
        console.log("Admin Fetched Claims:", data); // DEBUG LOG
        const transformed: VerificationRequest[] = data.map((item: any) => {
          // 1. Get images from DB or Fallback to localStorage
          let images = item.proof_images || [];
          const localKey = `proof_${item.id}`;
          const localData = localStorage.getItem(localKey);
          
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (parsed.length > 0) images = parsed;
            } catch (e) {
              console.error("Local data parse error", e);
            }
          }

          return {
            id: item.id,
            receiverName: item.profiles?.organization_name || item.profiles?.full_name || 'Organization',
            itemName: item.donations?.food_name || 'Donation Item',
            claimedAt: new Date(item.created_at).toLocaleDateString(),
            images: images,
            status: 'pending' // Force to pending for verification list
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
      const finalStatus = action === 'approved' ? 'completed' : 'cancelled'; // Corrected terminal status
      
      const { error } = await supabase
        .from('claims')
        .update({ status: finalStatus })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    } catch (err) {
      console.error('Action failed:', err);
      alert('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <ShieldCheck size={32} />
          <span>Aahar<span className="gradient-text">Admin</span></span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <CheckCircle size={20} />
            Verifications
            {pendingCount > 0 && <span style={{ marginLeft: 'auto', background: 'var(--admin-danger)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{pendingCount}</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'emergencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergencies')}
          >
            <Siren size={20} />
            Emergencies
            {emergencies.filter(e => e.status === 'pending').length > 0 && 
              <span style={{ marginLeft: 'auto', background: 'var(--admin-danger)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
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

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--admin-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Admin User</p>
              <p style={{ color: 'var(--admin-text-light)', fontSize: '0.75rem' }}>Full Access</p>
            </div>
          </div>
          
          <button 
            className="nav-item logout-btn" 
            onClick={handleLogout}
            style={{ width: '100%', color: 'var(--admin-danger)', background: 'rgba(225, 29, 72, 0.05)', border: 'none', transition: 'all 0.3s ease' }}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'overview' && (
          <section className="admin-section">
            <header className="admin-header">
              <h1>Dashboard <span className="gradient-text">Overview</span></h1>
              <p>Real-time insights and system status.</p>
            </header>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Pending Reviews</div>
                <div className="stat-value">{pendingCount}</div>
                <div style={{ color: 'var(--admin-warning)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                  <Clock size={14} /> Action required
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Rescues Today</div>
                <div className="stat-value">124</div>
                <div style={{ color: 'var(--admin-success)', fontSize: '0.875rem' }}>+12% from yesterday</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Receivers</div>
                <div className="stat-value">42</div>
                <div style={{ color: 'var(--admin-text-light)', fontSize: '0.875rem' }}>Verified organizations</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">System Health</div>
                <div className="stat-value">Optimal</div>
                <div style={{ color: 'var(--admin-success)', fontSize: '0.875rem' }}>All services online</div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'verification' && (
          <section className="admin-section">
            <header className="admin-header">
              <h1>Claim <span className="gradient-text">Verifications</span></h1>
              <p>Review proof-of-utilization images and approve meal distributions.</p>
            </header>

            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--admin-text-light)' }}>
                <CheckCircle size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <h3>All Caught Up!</h3>
                <p>No pending verification requests at the moment.</p>
              </div>
            ) : (
              <div className="verification-grid">
                {requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className="verification-card">
                    <div className="v-card-header">
                      <div className="v-receiver-info">
                        <h3>{req.receiverName}</h3>
                        <p>{req.itemName} • <Clock size={12} /> {req.claimedAt}</p>
                      </div>
                      <div style={{ background: 'var(--admin-primary-light)', color: 'var(--admin-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {req.images.length} IMAGES ATTACHED
                      </div>
                    </div>
                    
                    <div className="v-card-gallery">
                      {req.images.map((img, i) => (
                        <div key={i} className="v-image-wrapper">
                          <img src={img} alt={`Proof ${i+1}`} />
                        </div>
                      ))}
                    </div>

                    <div className="v-card-footer">
                      <button className="btn-decline" onClick={() => handleAction(req.id, 'declined')}>
                        <XCircle size={18} /> Decline
                      </button>
                      <button className="btn-approve" onClick={() => handleAction(req.id, 'approved')}>
                        <CheckCircle size={18} /> Approve Distribution
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'emergencies' && (
          <section className="admin-section">
            <header className="admin-header">
              <h1>Emergency <span className="relief-text">Broadcasts</span></h1>
              <p>Live reports from the field requiring immediate attention.</p>
            </header>

            <div className="emergencies-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {emergencies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>No active emergency reports.</div>
              ) : (
                emergencies.map(report => (
                  <div key={report.id} className="verification-card" style={{ borderLeft: report.status === 'pending' ? '4px solid #e11d48' : '4px solid #10b981' }}>
                    <div className="v-card-header">
                       <div className="v-receiver-info">
                         <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {report.reporterName} 
                            <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{report.role}</span>
                         </h3>
                         <p><MapPin size={12} /> {report.location} • <Clock size={12} /> {report.createdAt}</p>
                       </div>
                       {report.status === 'pending' && <div className="urgency-pill critical animate-pulse">ACTION REQUIRED</div>}
                    </div>
                    
                    <div style={{ padding: '0 24px 20px', fontSize: '1.1rem', color: '#2D3A2A', lineHeight: 1.5 }}>
                      "{report.message}"
                    </div>

                    <div className="v-card-footer">
                       <div style={{ flex: 1 }} />
                       {report.status === 'pending' ? (
                         <button 
                            className="btn-approve" 
                            onClick={async () => {
                              await supabase.from('emergency_reports').update({ status: 'resolved' }).eq('id', report.id);
                              fetchRealEmergencies();
                            }}
                         >
                           <CheckCircle size={18} /> Mark as Resolved
                         </button>
                       ) : (
                         <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <CheckCircle size={18} /> RESOLVED
                         </span>
                       )}
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
                  <p>admin@aaharsetu.org</p>
                </div>
                <div className="info-group">
                  <label>Role</label>
                  <p>Global Administrator</p>
                </div>
                <div className="info-group">
                  <label>Status</label>
                  <p style={{ color: 'var(--admin-success)' }}>Active / Verified</p>
                </div>
                <div className="info-group" style={{ gridColumn: 'span 2' }}>
                  <label>Permissions</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {['Verify Claims', 'User Management', 'Analytics', 'System Config'].map(p => (
                      <span key={p} style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px', fontSize: '0.875rem' }}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
