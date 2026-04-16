import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../donor/components/ui/Button/Button';
import { Card } from '../../../donor/components/ui/Card/Card';
import { 
  AlertTriangle, MapPin, Users, Heart, 
  Zap, Plus, X, Globe, Send
} from 'lucide-react';
import './Disasters.css';
import { supabase } from '../../../lib/supabase';

interface DisasterAlert {
  id: string;
  type: string;
  location: string;
  urgency: string;
  peopleInNeed: number;
  suppliesNeeded: string;
  impact: string;
  timeRemaining: string;
}

export const Disasters: React.FC = () => {
  const [activeDisasters, setActiveDisasters] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    location: '',
    severity: 'high',
    needs: '',
    people_in_need: ''
  });

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('disaster_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    const MOCK_DISASTERS: DisasterAlert[] = [
      {
        id: 'mock-d-1',
        type: 'Flood Relief',
        location: 'Assam High-Waste Zone B',
        urgency: 'CRITICAL',
        peopleInNeed: 1200,
        suppliesNeeded: 'Ready-to-eat meals, Water, Biscuits',
        impact: 'Severely affected by monsoon',
        timeRemaining: 'ASAP'
      }
    ];

    if (data && data.length > 0) {
      const formatted = data.map((d: any) => ({
        id: d.id,
        type: d.title,
        location: d.location_name,
        urgency: d.severity?.toUpperCase() || 'HIGH',
        peopleInNeed: d.people_in_need || 500,
        suppliesNeeded: d.needs?.join(', ') || 'Various food items',
        impact: d.impact_desc || 'Urgent support required',
        timeRemaining: 'ASAP'
      }));
      setActiveDisasters(formatted);
    } else {
      setActiveDisasters(MOCK_DISASTERS);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to new alerts
    const subscription = supabase
      .channel('disaster_alerts_live')
      .on('postgres_changes', { event: '*', table: 'disaster_alerts', schema: 'public' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  const handleBroadcast = async () => {
    const { error } = await supabase.from('disaster_alerts').insert({
      title: broadcastData.title,
      location_name: broadcastData.location,
      severity: broadcastData.severity,
      needs: broadcastData.needs.split(',').map(s => s.trim()),
      people_in_need: parseInt(broadcastData.people_in_need) || 0,
      location_point: 'POINT(77.5946 12.9716)' // Default for demo, usually GPS
    });

    if (!error) {
      showToast('Emergency Alert Broadcasted Globally!');
      setIsModalOpen(false);
      setBroadcastData({ title: '', location: '', severity: 'high', needs: '', people_in_need: '' });
    } else {
      showToast('Error broadcasting alert');
    }
    setLoading(false);
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleSendReport = async () => {
    if (!reportMessage.trim()) return;
    setIsReporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('emergency_reports').insert({
        user_id: user?.id,
        user_role: 'receiver',
        reporter_name: user?.email || 'Receiver',
        message: reportMessage,
        location_name: 'Near Receiver Location'
      });

      if (error) throw error;
      showToast('Help report sent to Admin.');
      setIsReportModalOpen(false);
      setReportMessage('');
    } catch (err) {
      console.error(err);
      showToast('Error sending report.');
    } finally {
      setIsReporting(false);
    }
  };
  
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="disasters-container">
      <header className="disasters-header">
        <div className="header-top-row">
          <div className="emergency-badge">
            <Siren size={16} /> EMERGENCY RESPONSE ACTIVE
          </div>
        </div>
        
        <h1 className="disasters-title">Disaster <span className="relief-text">Relief</span> Portal</h1>
        <p className="disasters-subtitle">
          Reporting from the ground? Broadcast high-priority food requirements 
          to institutional donors and relief networks instantly.
        </p>
      </header>

      <section className="active-alerts">
        <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="alert-section-title" style={{ margin: 0 }}>
            <AlertTriangle className="alert-icon-pulse" /> Active Critical Zones
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              className="broadcast-btn animate-pulse" 
              onClick={() => setIsReportModalOpen(true)}
              style={{ borderRadius: '100px', background: '#e11d48', color: 'white', gap: '8px', height: '40px', fontSize: '0.9rem' }}
            >
              <Plus size={18} /> Broadcast Emergency
            </Button>
            <span className="live-badge" style={{ margin: 0 }}>LIVE UPDATES</span>
          </div>
        </div>
        
        <div className="alerts-grid">
          {activeDisasters.map(disaster => (
            <Card key={disaster.id} className="disaster-alert-card">
              <div className="disaster-card-header">
                <div>
                  <h3 className="disaster-type">{disaster.type}</h3>
                  <div className="disaster-loc">
                    <MapPin size={14} /> {disaster.location}
                  </div>
                </div>
                <div className={`urgency-pill ${disaster.urgency.toLowerCase()}`}>
                  {disaster.urgency}
                </div>
              </div>

              <div className="disaster-stats">
                <div className="dstat">
                  <Users size={18} />
                  <span><strong>{disaster.peopleInNeed}+</strong> in need</span>
                </div>
                <div className="dstat">
                  <Zap size={18} />
                  <span>Need: {disaster.suppliesNeeded}</span>
                </div>
              </div>

              <div className="disaster-footer">
                <Link to="/receiver/explore" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button fullWidth variant="primary" className="emergency-btn">
                    View Relief Food <Heart size={16} fill="white" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Emergency Report Modal */}
      {isReportModalOpen && (
        <div className="modal-overlay glass animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div className="broadcast-modal-box" style={{
            background: '#FFFDF7', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '40px',
            width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} /> Emergency SOS
            </h2>
            <p style={{ color: '#4F633D', marginBottom: '24px' }}>Reporting on-ground emergency? This broadcast will notify the Admin response team immediately.</p>
            
            <textarea 
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Tell us what's happening. Help is just a broadcast away..."
              style={{ width: '100%', height: '150px', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1rem', marginBottom: '24px', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" fullWidth onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
              <Button fullWidth variant="primary" style={{ background: '#e11d48' }} disabled={isReporting} onClick={handleSendReport}>
                {isReporting ? 'Broadcasting...' : 'Signal Admin'}
              </Button>
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                Need to create a global public alert instead? 
                <button onClick={() => { setIsReportModalOpen(false); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer', marginLeft: '8px' }}>
                  Create Public SOS
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-primary)', color: 'white', padding: '16px 32px', borderRadius: '100px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10000, fontWeight: 700
        }}>
          🚀 {toast}
        </div>
      )}
    </div>
  );
};

const Siren = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11v8a5 5 0 0 0 10 0v-8" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    <path d="M12 2v2" />
    <path d="M21 12h2" />
    <path d="M1 12h2" />
    <path d="M20 7l-2 2" />
    <path d="M6 9L4 7" />
  </svg>
);
