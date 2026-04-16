import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { 
  Flame, AlertTriangle, MapPin, Users, Heart, 
  ArrowRight, Zap, Shield, Plus, X, Globe, Send, Siren
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

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
  
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="disasters-container">
      <header className="disasters-header">
        <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="emergency-badge">
            <Siren size={16} /> EMERGENCY RESPONSE ACTIVE
          </div>
          <Button 
            className="broadcast-btn animate-pulse" 
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: '100px', background: '#e11d48', color: 'white', gap: '8px' }}
          >
            <Plus size={20} /> Broadcast Emergency
          </Button>
        </div>
        
        <h1 className="disasters-title">Disaster <span className="relief-text">Relief</span> Portal</h1>
        <p className="disasters-subtitle">
          Reporting from the ground? Broadcast high-priority food requirements 
          to institutional donors and relief networks instantly.
        </p>
      </header>

      <section className="active-alerts">
        <div className="section-header-row">
          <h2 className="alert-section-title">
            <AlertTriangle className="alert-icon-pulse" /> Active Critical Zones
          </h2>
          <span className="live-badge">LIVE UPDATES</span>
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

      {/* --- BROADCAST MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay glass animate-fade-in" onClick={() => setIsModalOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div className="broadcast-modal-box" onClick={e => e.stopPropagation()} style={{
            background: '#111', border: '1px solid #333', borderRadius: '24px', padding: '40px',
            width: '100%', maxWidth: '500px', boxShadow: '0 0 50px rgba(225, 29, 72, 0.2)'
          }}>
            <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
               <h2 style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                 <Globe size={24} /> Broadcast SOS
               </h2>
               <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#666' }}><X /></button>
            </div>

            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Disaster Title</label>
                 <input 
                   required
                   placeholder="e.g. Flash Floods Relief"
                   value={broadcastData.title}
                   onChange={e => setBroadcastData({...broadcastData, title: e.target.value})}
                   style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '12px', borderRadius: '12px', color: 'white', marginTop: '4px' }}
                 />
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Location</label>
                 <input 
                   required
                   placeholder="Affected Zone / Neighborhood"
                   value={broadcastData.location}
                   onChange={e => setBroadcastData({...broadcastData, location: e.target.value})}
                   style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '12px', borderRadius: '12px', color: 'white', marginTop: '4px' }}
                 />
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Severity</label>
                 <select 
                   value={broadcastData.severity}
                   onChange={e => setBroadcastData({...broadcastData, severity: e.target.value})}
                   style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '12px', borderRadius: '12px', color: 'white', marginTop: '4px' }}
                 >
                   <option value="critical">🆘 CRITICAL</option>
                   <option value="high">🟠 HIGH</option>
                   <option value="medium">🟡 MEDIUM</option>
                 </select>
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Needs (Comma separated)</label>
                 <input 
                   required
                   placeholder="e.g. Rice, Water, Biscuits"
                   value={broadcastData.needs}
                   onChange={e => setBroadcastData({...broadcastData, needs: e.target.value})}
                   style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '12px', borderRadius: '12px', color: 'white', marginTop: '4px' }}
                 />
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>People Affected</label>
                 <input 
                   type="number"
                   required
                   placeholder="Approx. count"
                   value={broadcastData.people_in_need}
                   onChange={e => setBroadcastData({...broadcastData, people_in_need: e.target.value})}
                   style={{ width: '100%', background: '#222', border: '1px solid #333', padding: '12px', borderRadius: '12px', color: 'white', marginTop: '4px' }}
                 />
               </div>

               <Button type="submit" className="sumbit-sos-btn" fullWidth style={{ background: '#e11d48', height: '50px', fontSize: '1rem', marginTop: '10px' }}>
                 {loading ? 'Broadcasting...' : 'Publish LIVE Alert'} <Send size={18} style={{ marginLeft: '10px' }} />
               </Button>
            </form>
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
