import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Flame, AlertTriangle, MapPin, Users, Heart, ArrowRight, Zap, Shield } from 'lucide-react';
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
  const [activeDisasters, setActiveDisasters] = React.useState<DisasterAlert[]>([]);
  const [loading, setLoading] = React.useState(true);

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
      },
      {
        id: 'mock-d-2',
        type: 'Earthquake Support',
        location: 'North-East Sector 4',
        urgency: 'HIGH',
        peopleInNeed: 850,
        suppliesNeeded: 'Protein bars, Canned food, Milk powder',
        impact: 'Structural damage in residential areas',
        timeRemaining: 'Within 4 hours'
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

  React.useEffect(() => {
    fetchAlerts();

    // Subscribe to new alerts
    const subscription = supabase
      .channel('disaster_alerts_donor_live')
      .on('postgres_changes', { event: '*', table: 'disaster_alerts', schema: 'public' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  const [toast, setToast] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="disasters-container">
      <header className="disasters-header">
        <div className="emergency-badge">
          <Siren size={16} /> EMERGENCY RESPONSE ACTIVE
        </div>
        <h1 className="disasters-title">Disaster <span className="relief-text">Relief</span> Portal</h1>
        <p className="disasters-subtitle">
          Whenever natural calamities strike, every second counts. Coordinate high-priority food donations 
          directly to verified NGOs operating in affected zones.
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
                <Link to="/upload" state={{ isDisaster: true }} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" className="emergency-btn">
                    Donate Now <Heart size={16} fill="white" />
                  </Button>
                </Link>
                <div className="eta-tag">
                  Target: {disaster.timeRemaining}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="disaster-process">
        <div className="process-header">
          <h2>How Emergency Donation Works</h2>
          <p>Bypassing standard logistics for immediate distribution.</p>
        </div>
        <div className="process-grid">
          <div className="process-item">
            <div className="p-icon"><Shield /></div>
            <h4>Vetted NGOs</h4>
            <p>Donations routed only to on-ground NGOs with disaster clearance.</p>
          </div>
          <div className="process-item">
            <div className="p-icon"><Flame /></div>
            <h4>Priority Lane</h4>
            <p>Disaster donations are moved via high-priority micro-logistics.</p>
          </div>
          <div className="process-item">
            <div className="p-icon"><Zap /></div>
            <h4>Real-time Tracking</h4>
            <p>Track your food from pickup to the hands of those in need.</p>
          </div>
        </div>
      </section>

      <div className="cta-disaster">
        <h3>Institutional Donor?</h3>
        <p>Large-scale corporate or hotel donations are handled via our express hotline.</p>
        <Button variant="outline" onClick={() => showToast('Connecting to Institutional Hotline...')}>Contact Response Team <ArrowRight size={16} /></Button>
      </div>

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
