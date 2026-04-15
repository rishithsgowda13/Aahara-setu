import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import {
  Heart, Search, Users, Utensils, Leaf, Zap, ShieldCheck,
  ArrowRight, MapPin, Star, Truck, Wifi, RefreshCw
} from 'lucide-react';
import './Landing.css';

const COUNTER_TARGETS = { meals: 12450, people: 8300, donors: 450, co2: 3200 };

function useCounter(target: number, duration: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export const Landing: React.FC = () => {
  const meals = useCounter(COUNTER_TARGETS.meals, 1800);
  const people = useCounter(COUNTER_TARGETS.people, 1800);
  const donors = useCounter(COUNTER_TARGETS.donors, 1800);
  const co2 = useCounter(COUNTER_TARGETS.co2, 1800);

  const systemFlow = [
    { icon: '📤', label: 'Upload', desc: 'Donor lists surplus food' },
    { icon: '🏷️', label: 'Tag & Score', desc: 'Urgency computed' },
    { icon: '🔗', label: 'Match', desc: 'Nearest NGO matched' },
    { icon: '✅', label: 'Claim', desc: 'NGO claims instantly' },
    { icon: '🚚', label: 'Pickup', desc: 'Logistics triggered' },
    { icon: '⭐', label: 'Feedback', desc: 'System learns & improves' },
  ];

  const features = [
    { icon: <Zap size={22} />, title: 'Urgency Score System', desc: 'Real-time priority based on expiry, quantity, distance & demand.' },
    { icon: <MapPin size={22} />, title: 'Hunger vs Surplus Heatmap', desc: 'Visualize high-waste zones vs high-demand areas on live maps.' },
    { icon: <RefreshCw size={22} />, title: 'Auto Redistribution', desc: 'Unclaimed food auto-alerts backup NGOs and nearest shelters.' },
    { icon: <ShieldCheck size={22} />, title: 'Trust & Safety', desc: 'Food safety checklists, expiry validation & verified donors.' },
    { icon: <Star size={22} />, title: 'Kindness Score', desc: 'Track community impact — "You helped feed 120 people ❤️"' },
    { icon: <Wifi size={22} />, title: 'Low-Network Mode', desc: 'Lightweight offline mode & SMS fallback alerts for all zones.' },
    { icon: <Truck size={22} />, title: 'Micro-Logistics', desc: 'Volunteer & delivery partner coordination built-in.' },
    { icon: <Leaf size={22} />, title: 'CO₂ Tracker', desc: 'Measure environmental impact per donation in real time.' },
  ];

  return (
    <div className="landing-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow">🌱 Circular Food Redistribution Network</div>
          <h1 className="hero-title">
            Reduce Waste.<br />
            <span className="gradient-text">Feed Lives.</span>
          </h1>
          <p className="hero-subtitle">
            A real-time, location-based platform connecting restaurants &amp; hotels with NGOs and
            individuals in need — powered by smart urgency matching and community kindness.
          </p>
          <div className="hero-actions">
            <Link to="/upload" style={{ textDecoration: 'none' }}>
              <Button size="lg" className="hero-btn">
                <Heart size={20} /> Donate Food
              </Button>
            </Link>
            <Link to="/explore" style={{ textDecoration: 'none' }}>
              <Button variant="glass" size="lg" className="hero-btn">
                <Search size={20} /> Find Food Nearby
              </Button>
            </Link>
          </div>
          <div className="hero-trust">
            <span className="trust-badge"><ShieldCheck size={14} /> Verified Donors</span>
            <span className="trust-badge"><Zap size={14} /> Real-Time Matching</span>
            <span className="trust-badge"><Leaf size={14} /> Eco Tracked</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-blob blob-3"></div>
          <div className="floating-card fcard-1">
            <div className="fcard-icon">🍔</div>
            <div>
              <div className="fcard-title">McDonald's Meals</div>
              <div className="fcard-sub urgency-high">⚡ High Priority</div>
            </div>
          </div>
          <div className="floating-card fcard-2">
            <div className="fcard-icon">🍗</div>
            <div>
              <div className="fcard-title">KFC Chicken</div>
              <div className="fcard-sub urgency-medium">⏰ 2 hrs left</div>
            </div>
          </div>
          <div className="floating-card fcard-3">
            <span>+120 people fed today 🥰</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="section-header">
          <h2 className="section-title">Our <span className="gradient-text">Impact</span> So Far</h2>
          <p>Every meal counts. Every donor matters.</p>
        </div>
        <div className="stats-grid">
          {[
            { icon: <Utensils size={28} />, value: meals.toLocaleString(), label: 'Meals Saved', suffix: '+' },
            { icon: <Users size={28} />, value: people.toLocaleString(), label: 'People Fed', suffix: '+' },
            { icon: <Heart size={28} />, value: donors, label: 'Active Donors', suffix: '' },
            { icon: <Leaf size={28} />, value: co2.toLocaleString(), label: 'kg CO₂ Reduced', suffix: '+' },
          ].map((s, i) => (
            <Card key={i} className="stat-card">
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-value">{s.value}{s.suffix}</div>
              <div className="stat-label">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* System Flow */}
      <section className="flow-section">
        <div className="section-header">
          <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
          <p>From surplus to satisfied — in under 30 minutes.</p>
        </div>
        <div className="flow-steps">
          {systemFlow.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flow-step-card">
                <div className="flow-step-icon">{step.icon}</div>
                <div className="flow-step-label">{step.label}</div>
                <div className="flow-step-desc">{step.desc}</div>
              </div>
              {i < systemFlow.length - 1 && (
                <div className="flow-arrow"><ArrowRight size={18} /></div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flow-tagline">
          <Zap size={16} />
          Dynamic urgency-based matching with fallback redistribution ensures near-zero food waste in real-time.
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Advanced <span className="gradient-text">Features</span></h2>
          <p>Smart technology for a human problem.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <Card key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Start Making a Difference <span style={{ color: '#FFF7E2' }}>Today</span></h2>
          <p>Join 450+ donors and 120+ NGOs transforming food waste into community impact.</p>
          <div className="cta-actions">
            <Link to="/upload"><Button size="lg"><Heart size={18} /> Donate Food</Button></Link>
            <Link to="/explore"><Button variant="glass" size="lg"><Search size={18} /> Find Food</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
};