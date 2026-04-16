import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import {
  Heart, Users, Utensils, Leaf, Zap, ShieldCheck,
  MapPin, Star, Truck, Wifi, RefreshCw, Upload, Tag, Link as LinkIcon, CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './Landing.css';

import { useAuth } from '../../../context/AuthContext';

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
  const { t } = useTranslation();
  const { role } = useAuth();
  const meals = useCounter(COUNTER_TARGETS.meals, 1800);
  const people = useCounter(COUNTER_TARGETS.people, 1800);
  const donors = useCounter(COUNTER_TARGETS.donors, 1800);
  const co2 = useCounter(COUNTER_TARGETS.co2, 1800);

  const isReceiver = role === 'receiver';
  const ctaLink = isReceiver ? '/receiver/explore' : '/upload';
  const ctaText = isReceiver ? 'Request Food' : t('donate_btn');
  const ctaIcon = isReceiver ? <Utensils size={20} /> : <Heart size={20} />;

  const features = [
    { icon: <Zap size={20} />, title: 'Urgency Score System', desc: 'Real-time priority based on expiry, quantity, distance & demand.' },
    { icon: <MapPin size={20} />, title: 'Hunger vs Surplus Heatmap', desc: 'Visualize high-waste zones vs high-demand areas on live maps.' },
    { icon: <RefreshCw size={20} />, title: 'Auto Redistribution', desc: 'Unclaimed food auto-alerts backup NGOs and nearest shelters.' },
    { icon: <ShieldCheck size={20} />, title: 'Trust & Safety', desc: 'Food safety checklists, expiry validation & verified donors.' },
    { icon: <Star size={20} />, title: 'Kindness Score', desc: 'Track community impact — "You helped feed 120 people ❤️"' },
    { icon: <Wifi size={20} />, title: 'Low-Network Mode', desc: 'Lightweight offline mode & SMS fallback alerts for all zones.' },
    { icon: <Truck size={20} />, title: 'Micro-Logistics', desc: 'Volunteer & delivery partner coordination built-in.' },
    { icon: <Leaf size={20} />, title: 'CO₂ Tracker', desc: 'Measure environmental impact per donation in real time.' },
  ];

  return (
    <div className="landing-container">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow">🌱 Circular Food Redistribution Network</div>
          <h1 className="hero-title">
            {t('hero_title').split('.')[0]}<br />
            <span className="gradient-text">{t('hero_title').split('.')[1]}</span>
          </h1>
          <p className="hero-subtitle">
            {t('hero_subtitle')}
          </p>
          <div className="hero-actions">
            <Link to={ctaLink} style={{ textDecoration: 'none' }}>
              <Button size="lg" className="hero-btn">
                {ctaIcon} {ctaText}
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
          <h2 className="section-title">Our <span className="title-accent">Impact</span> So Far</h2>
          <p className="section-subtitle">Every meal counts. Every donor matters.</p>
        </div>
        <div className="stats-grid">
          {[
            { icon: <Utensils size={24} />, value: meals.toLocaleString(), label: t('meals_dist'), suffix: '+' },
            { icon: <Users size={24} />, value: people.toLocaleString(), label: 'People Fed', suffix: '+' },
            { icon: <Heart size={24} />, value: donors, label: 'Active Donors', suffix: '' },
            { icon: <Leaf size={24} />, value: co2.toLocaleString(), label: t('co2_reduced'), suffix: '+' },
          ].map((s, i) => (
            <div key={i} className="stat-card-replica">
              <div className="stat-icon-circle">{s.icon}</div>
              <div className="stat-value-large">{s.value}{s.suffix}</div>
              <div className="stat-label-text">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It <span className="title-accent">Works</span></h2>
          <p className="section-subtitle">From surplus to satisfied — in under 30 minutes.</p>
        </div>
        
        <div className="steps-container">
          <div className="steps-row">
            <div className="work-step">
              <div className="step-card">
                 <div className="step-icon-box blue"><Upload size={20} /></div>
                 <h4 className="step-title">Upload</h4>
                 <p className="step-desc">Donor lists surplus food</p>
              </div>
              <div className="step-arrow">→</div>
            </div>

            <div className="work-step">
              <div className="step-card">
                 <div className="step-icon-box yellow"><Tag size={20} /></div>
                 <h4 className="step-title">Tag & Score</h4>
                 <p className="step-desc">Urgency computed</p>
              </div>
              <div className="step-arrow">→</div>
            </div>

            <div className="work-step">
              <div className="step-card">
                 <div className="step-icon-box purple"><LinkIcon size={20} /></div>
                 <h4 className="step-title">Match</h4>
                 <p className="step-desc">Nearest NGO matched</p>
              </div>
              <div className="step-arrow">→</div>
            </div>

            <div className="work-step">
              <div className="step-card">
                 <div className="step-icon-box green"><CheckCircle2 size={20} /></div>
                 <h4 className="step-title">Claim</h4>
                 <p className="step-desc">NGO claims instantly</p>
              </div>
              <div className="step-arrow">→</div>
            </div>

            <div className="work-step">
              <div className="step-card">
                 <div className="step-icon-box orange"><Truck size={20} /></div>
                 <h4 className="step-title">Pickup</h4>
                 <p className="step-desc">Logistics triggered</p>
              </div>
              <div className="step-arrow">→</div>
            </div>

            <div className="work-step last">
              <div className="step-card">
                 <div className="step-icon-box gold"><Star size={20} /></div>
                 <h4 className="step-title">Feedback</h4>
                 <p className="step-desc">System learns & improves</p>
              </div>
            </div>
          </div>
        </div>

        <div className="banner-how">
           <div className="banner-content">
              <Zap size={16} className="zap-icon" />
              <span>Dynamic urgency-based matching with fallback redistribution ensures near-zero food waste in real-time.</span>
           </div>
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
            <Link to={ctaLink}><Button size="lg">{ctaIcon} {ctaText}</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
};