import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Button } from '../../../components/ui/Button/Button';
import { 
  ShieldAlert, Radio, MapPin, Truck, 
  CheckCircle2, AlertOctagon, Share2, Search,
  History, Navigation
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import './Traceability.css';

interface ChainStep {
  role: string;
  name: string;
  time: string;
  status: string;
  location: string;
}

interface Batch {
  id: string;
  item: string;
  donor: string;
  status: string;
  time: string;
  chain: ChainStep[];
}

// Hardcoded mock batches matching the reference design
const MOCK_BATCHES: Batch[] = [
  {
    id: '1991',
    item: 'Assorted Pastries (Batch #7742)',
    donor: 'Baskin & Scones',
    status: 'Delivered',
    time: '14:20 PM',
    chain: [
      { role: 'Donor', name: "McDonald's - VVCE", time: '12:05 PM', status: 'verified', location: '12.332, 76.612' },
      { role: 'Logistics', name: 'Volunteer #AS-09 (Rahul K.)', time: '12:45 PM', status: 'verified', location: '12.340, 76.620' },
      { role: 'Receiver', name: 'Hope Orphanage', time: '13:15 PM', status: 'verified', location: '12.355, 76.645' },
    ],
  },
  {
    id: '9921',
    item: 'Paneer Tikka (Batch #9921)',
    donor: 'Hotel Empire',
    status: 'In Transit',
    time: '05 mins left',
    chain: [
      { role: 'Donor', name: 'Hotel Empire - Jayanagar', time: '11:30 AM', status: 'verified', location: '12.925, 77.583' },
      { role: 'Logistics', name: 'Volunteer #AS-14 (Meena S.)', time: '12:10 PM', status: 'active', location: '12.930, 77.590' },
      { role: 'Receiver', name: 'Akshaya Patra Foundation', time: '--:--', status: 'pending', location: '...' },
    ],
  },
  {
    id: '4421',
    item: 'Veg Biryani (Batch #4421)',
    donor: 'Royal Palace',
    status: 'Listed',
    time: 'Live Now',
    chain: [
      { role: 'Donor', name: 'Royal Palace Restaurant', time: '13:45 PM', status: 'verified', location: '12.971, 77.594' },
      { role: 'Logistics', name: 'Pending Match', time: '--:--', status: 'pending', location: '...' },
      { role: 'Receiver', name: 'Searching...', time: '--:--', status: 'pending', location: '...' },
    ],
  },
];



export const Traceability: React.FC = () => {
  const [activeBatch, setActiveBatch] = useState<string | null>('1991');
  const [isRecalling, setIsRecalling] = useState(false);
  const [recallProgress, setRecallProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [liveBatches, setLiveBatches] = useState<Batch[]>([]);

  React.useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await supabase
        .from('donations')
        .select('*, profiles(organization_name)')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted = data.map(d => ({
          id: d.id,
          item: `${d.food_name} (Batch #${d.id.slice(0, 4)})`,
          donor: d.profiles?.organization_name || 'Anonymous Donor',
          status: d.status === 'available' ? 'Listed' : d.status === 'claimed' ? 'In Transit' : 'Delivered',
          time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chain: [
            { role: 'Donor', name: d.profiles?.organization_name || 'Anonymous', time: '12:00 PM', status: 'verified', location: '12.332, 76.612' },
            { role: 'Logistics', name: d.status === 'available' ? 'Pending Match' : 'Volunteer #AS-09', time: '--:--', status: d.status === 'available' ? 'pending' : 'active', location: '...' },
            { role: 'Receiver', name: d.status === 'available' ? 'Searching...' : 'Hope NGO', time: '--:--', status: d.status === 'available' ? 'pending' : 'active', location: '...' }
          ]
        }));
        setLiveBatches(formatted);
      }
    };
    fetchBatches();
    const ch = supabase.channel('trace_live_rx').on('postgres_changes', { event: '*', table: 'donations', schema: 'public' }, fetchBatches).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Merge live Supabase data on top of mock data
  const batches = React.useMemo(() => [...liveBatches, ...MOCK_BATCHES], [liveBatches]);

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

  const filteredBatches = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return batches;
    
    return batches.filter(b => 
      b.item.toLowerCase().includes(term) || 
      b.id.toString().toLowerCase().includes(term) ||
      b.donor.toLowerCase().includes(term)
    );
  }, [searchTerm, batches]);


  const selected = React.useMemo(() => batches.find(b => b.id === activeBatch), [activeBatch, batches]);

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
            <input 
              type="text" 
              placeholder="Search Batch ID / Item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="batch-list">
            {filteredBatches.map(b => (
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
                <h3><History size={20} /> Chain of Custody (Trace ID: #{selected.id.slice(0, 8)})</h3>
                <div className="batch-meta-badges">
                  <span className="meta-badge"><Navigation size={14} /> GPS Tracked</span>
                  <span className="meta-badge"><Radio size={14} /> Live Sync</span>
                </div>
              </div>

              <div className="chain-timeline">
                {selected.chain.map((step: ChainStep, i: number) => (
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
                    <p>If safety issues are reported, trigger an immediate recall to notify all recipients in this chain.</p>
                  </div>
                </div>
                <Button 
                  className="trigger-recall-btn"
                  onClick={handleTriggerRecall}
                >
                  <Radio size={18} /> TRIGGER EMERGENCY RECALL
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
