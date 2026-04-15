import React, { useState } from 'react';
import { Card } from '../../../donor/components/ui/Card/Card';
import { Button } from '../../../donor/components/ui/Button/Button';
import { 
  ShieldAlert, Radio, MapPin, Truck, 
  CheckCircle2, AlertOctagon, Share2, Search,
  History, Navigation
} from 'lucide-react';
import '../../../donor/pages/Traceability/Traceability.css';

export const Traceability: React.FC = () => {
  const [activeBatch, setActiveBatch] = useState<number | null>(1);
  const [isRecalling, setIsRecalling] = useState(false);
  const [recallProgress, setRecallProgress] = useState(0);

  const batches = [
    {
      id: 1,
      item: 'Assorted Pastries (Batch #7742)',
      donor: "Baskin & Scones",
      status: 'Delivered',
      time: '14:20 PM',
      chain: [
        { role: 'Donor', name: "McDonald's - VVCE", time: '12:05 PM', status: 'verified', location: '12.332, 76.612' },
        { role: 'Logistics', name: 'Volunteer #AS-09 (Rahul K.)', time: '12:45 PM', status: 'verified', location: '12.340, 76.620' },
        { role: 'Receiver', name: 'Hope Orphanage', time: '13:15 PM', status: 'verified', location: '12.355, 76.645' }
      ]
    },
    {
      id: 2,
      item: 'Paneer Tikka (Batch #9921)',
      donor: 'Hotel Empire',
      status: 'In Transit',
      time: '05 mins left',
      chain: [
        { role: 'Donor', name: 'Hotel Empire', time: '14:00 PM', status: 'verified', location: '12.298, 76.639' },
        { role: 'Logistics', name: 'Self Pickup', time: '14:15 PM', status: 'active', location: '12.305, 76.645' },
        { role: 'Receiver', name: 'City Shelter B', time: '--:--', status: 'pending', location: '12.312, 76.650' }
      ]
    }
  ];

  const handleTriggerRecall = () => {
    setIsRecalling(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setRecallProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsRecalling(false), 2000);
      }
    }, 100);
  };

  const selected = batches.find(b => b.id === activeBatch);

  return (
    <div className="traceability-page">
      {isRecalling && (
        <div className="recall-overlay">
          <div className="recall-anim-box">
            <Radio className="broadcast-icon" size={64} />
            <h2 className="recall-title">EMERGENCY RECALL BROADCAST</h2>
            <p className="recall-subtitle">Notifying all matched recipients via SMS & In-App Alerts...</p>
            <div className="recall-progress-bar">
              <div className="recall-fill" style={{ width: `${recallProgress}%` }} />
            </div>
            <div className="recall-stats">
              <span>{Math.floor(recallProgress / 10)} / 12 NGOs Notified</span>
              <span>Propagating in 0.8s</span>
            </div>
          </div>
        </div>
      )}

      <div className="trace-header">
        <div className="trace-title-group">
          <h1>Food <span className="relief-text">Traceability</span> & Safety</h1>
          <p>Real-time Chain of Custody for the "Black Box" of Food Redistribution.</p>
        </div>
        <Card className="trust-summary-mini glass">
          <div className="mini-stat">
            <ShieldAlert size={18} />
            <div>
              <div className="m-val">100%</div>
              <div className="m-lbl">Traceable</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="trace-layout">
        <div className="trace-sidebar">
          <div className="search-batches">
            <Search size={16} />
            <input type="text" placeholder="Search Batch ID / Item..." />
          </div>
          <div className="batch-list">
            {batches.map(b => (
              <div 
                key={b.id} 
                className={`batch-item ${activeBatch === b.id ? 'active' : ''}`}
                onClick={() => setActiveBatch(b.id)}
              >
                <div className="batch-info">
                  <h4>{b.item}</h4>
                  <span>{b.donor} • {b.time}</span>
                </div>
                <div className={`status-tag ${b.status.toLowerCase().replace(' ', '-')}`}>
                  {b.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trace-main">
          {selected ? (
            <div className="chain-custody-view">
              <div className="chain-header">
                <h3><History size={20} /> Chain of Custody (Trace ID: #{selected.id}99{selected.id})</h3>
                <div className="batch-meta-badges">
                  <span className="meta-badge"><Navigation size={14} /> GPS Tracked</span>
                  <span className="meta-badge"><Radio size={14} /> Live Sync</span>
                </div>
              </div>

              <div className="chain-timeline">
                {selected.chain.map((step, i) => (
                  <div key={i} className={`chain-step ${step.status}`}>
                    <div className="step-marker">
                      {step.role === 'Donor' ? <MapPin size={18} /> : 
                       step.role === 'Logistics' ? <Truck size={18} /> : 
                       <CheckCircle2 size={18} />}
                    </div>
                    <div className="step-content">
                      <div className="step-top">
                        <span className="step-role">{step.role}</span>
                        <span className="step-time">{step.time}</span>
                      </div>
                      <div className="step-name">{step.name}</div>
                      <div className="step-location">Coordinates: {step.location}</div>
                      <div className="verification-badge">
                        <ShieldAlert size={12} /> Encrypted Digital Sign-off
                      </div>
                    </div>
                    {i < selected.chain.length - 1 && <div className="step-line" />}
                  </div>
                ))}
              </div>

              <Card className="recall-action-card">
                <div className="recall-info">
                  <AlertOctagon size={32} />
                  <div>
                    <h4>Report "Bad Batch"?</h4>
                    <p>If you find any quality issues with this batch, report it immediately to trigger a safety recall.</p>
                  </div>
                </div>
                <Button 
                  className="trigger-recall-btn"
                   variant="outline"
                  onClick={handleTriggerRecall}
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                >
                  <Radio size={18} /> REPORT SAFETY ISSUE
                </Button>
              </Card>
            </div>
          ) : (
            <div className="empty-trace">
              <Share2 size={48} />
              <p>Select a food batch from the sidebar to view its complete geo-spatial history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
