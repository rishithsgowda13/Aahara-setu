import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import {
  Heart, Users, Utensils, Leaf, Zap, ShieldCheck,
  MapPin, Star, Truck, Wifi, RefreshCw, Upload, Tag, Link as LinkIcon, CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import './Landing.css';

const COUNTER_TARGETS = { meals: 12450, people: 8300, donors: 450, co2: 3200 };

// Custom hook to replace missing react-intersection-observer
function useInView({ threshold = 0.1, triggerOnce = true } = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (triggerOnce) observer.unobserve(entry.target);
      }
    }, { threshold });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, inView };
}

const CountUp: React.FC<{ target: number; duration: number; suffix?: string }> = ({ target, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const step = Math.ceil(target / (duration / 16));
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const isReceiver = role === 'receiver';
  const ctaLink = isReceiver ? '/receiver/explore' : '/upload';
  const ctaText = isReceiver ? 'Request Food' : t('donate_btn');
  const ctaIcon = isReceiver ? <Utensils size={20} /> : <Heart size={20} />;

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
          <div className="hero-eyebrow"><Leaf size={14} /> Circular Food Redistribution Network</div>
          <h1 className="hero-title">
            Reduce Waste<br />
            <span className="gradient-text">Feed Lives</span>
          </h1>
          <p className="hero-subtitle">
            A real-time, location-based platform connecting restaurants & hotels with NGOs — powered by smart urgency matching.
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
          <div className="center-glow"></div>
          <div className="floating-card fcard-3">
             <div className="fcard-impact-pill">+120 people fed today 🥰</div>
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
            { icon: <Utensils size={24} />, target: COUNTER_TARGETS.meals, label: t('meals_dist'), suffix: '+' },
            { icon: <Users size={24} />, target: COUNTER_TARGETS.people, label: 'People Fed', suffix: '+' },
            { icon: <Heart size={24} />, target: COUNTER_TARGETS.donors, label: 'Active Donors', suffix: '' },
            { icon: <Leaf size={24} />, target: COUNTER_TARGETS.co2, label: t('co2_reduced'), suffix: '+' },
          ].map((s, i) => (
            <div key={i} className="stat-card-replica">
              <div className="stat-icon-circle">{s.icon}</div>
              <div className="stat-value-large">
                <CountUp target={s.target} duration={2000} suffix={s.suffix} />
              </div>
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
              <div className="feature-icon-circle">
                {f.icon}
              </div>
              <div className="feature-content-box">
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
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