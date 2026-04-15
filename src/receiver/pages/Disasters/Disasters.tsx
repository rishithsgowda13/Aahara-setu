import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../donor/components/ui/Button/Button';
import { Card } from '../../../donor/components/ui/Card/Card';
import { Flame, AlertTriangle, MapPin, Users, Heart, ArrowRight, Zap, Shield } from 'lucide-react';
import '../../../donor/pages/Disasters/Disasters.css';

export const Disasters: React.FC = () => {
  const activeDisasters = [
    {
      id: 1,
      type: 'Flood Relief',
      location: 'Assam High-Waste Zone B',
      urgency: 'CRITICAL',
      peopleInNeed: 1200,
      suppliesNeeded: 'Ready-to-eat meals, Water, Biscuits',
      impact: 'Severely affected by monsoon',
      timeRemaining: 'ASAP'
    },
    {
      id: 2,
      type: 'Earthquake Support',
      location: 'North-East Sector 4',
      urgency: 'HIGH',
      peopleInNeed: 850,
      suppliesNeeded: 'Protein bars, Canned food, Milk powder',
      impact: 'Structural damage in residential areas',
      timeRemaining: 'Within 4 hours'
    }
  ];
  
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
            NGO Response Hub: Coordinate high-priority food distributions directly to affected zones. 
            Real-time rescue matching for emergency situations.
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
                <Link to="/receiver/explore" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" className="emergency-btn">
                    Claim Relief <Heart size={16} fill="white" />
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
          <h2>Receiver Response Protocol</h2>
          <p>Bypassing standard logistics for immediate distribution.</p>
        </div>
        <div className="process-grid">
          <div className="process-item">
            <div className="p-icon"><Shield /></div>
            <h4>Pre-Verified NGOs</h4>
            <p>Relief food is prioritized for NGOs with disaster clearance status.</p>
          </div>
          <div className="process-item">
            <div className="p-icon"><Flame /></div>
            <h4>Critical Lane</h4>
            <p>Claims for disaster food are processed via express volunteer channels.</p>
          </div>
          <div className="process-item">
            <div className="p-icon"><Zap /></div>
            <h4>SOS Matching</h4>
            <p>Our Aahara AI gives 5x higher visibility to disaster relief requests.</p>
          </div>
        </div>
      </section>

      <div className="cta-disaster">
         <h3>Need Specific Supplies?</h3>
         <p>Contact our emergency desk for bulk requirements and targeted distributions.</p>
         <Button variant="outline" onClick={() => showToast('Connecting to Relief Coordinator...')}>Notify Emergency Desk <ArrowRight size={16} /></Button>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-primary)', color: 'white', padding: '16px 32px', borderRadius: '100px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10000, fontWeight: 700
        }}>
          🚨 {toast}
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
