import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  User, ShieldCheck, MapPin, Camera, 
  Award, TrendingUp, History, Star,
  Info, LogIn, UserPlus, LogOut,
  Building2, Phone, Mail, Globe,
  Activity, Heart, Users
} from 'lucide-react';
import './Profile.css';

export const Profile: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [isLoginView, setIsLoginView] = useState(true);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [trustScore, setTrustScore] = useState(88);
  const [isVerifying, setIsVerifying] = useState(false);

  const userAaharaId = localStorage.getItem('aaharaId') || 'AS-7742';
  const userType = localStorage.getItem('userType') || 'donor';
  const userName = userType === 'donor' ? 'Haldiram\'s Sweets' : 'Akshaya Patra Foundation';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginView) {
      if ((id === '1' && password === '1') || (id === '2' && password === '2')) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', id === '1' ? 'donor' : 'receiver');
        localStorage.setItem('aaharaId', `AS-${id === '1' ? '7742' : '8891'}`);
        setIsAuthenticated(true);
        window.location.reload(); 
      } else {
        setError('Verification failed. Please check your credentials.');
      }
    } else {
      alert('Account requested! We will verify your business details.');
      setIsLoginView(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    window.location.reload();
  };

  const handleVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      alert('Evidence received! Our AI engine is validating the consistency...');
      setIsVerifying(false);
      setTrustScore(prev => Math.min(prev + 3, 100));
    }, 2500);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-heritage-container">
        <div className="login-heritage-card glass">
          <div className="heritage-visual-side" style={{ backgroundImage: `url('/Users/bharathkumara/.gemini/antigravity/brain/5821f22d-14a0-420f-bb58-41d2313237ec/food_rescue_premium_bg_1776251883071.png')` }}>
            <div className="heritage-overlay">
              <div className="heritage-content">
                <span className="heritage-tagline">BEYOND THE KITCHEN</span>
                <h2 className="heritage-title">Zero Waste<br />Explorer</h2>
                <p className="heritage-desc">Redirecting surplus, nourishing communities, and creating a sustainable heritage for the future.</p>
              </div>
            </div>
          </div>

          <div className="heritage-form-side">
            <div className="heritage-form-header">
              <h1>Aahara <span>Setu</span></h1>
              <h2>Welcome Back</h2>
              <p>ACCESS THE IMPACT CORE</p>
            </div>

            <form onSubmit={handleAuth} className="heritage-auth-form">
              <div className="heritage-input-wrap">
                <div className="h-input-icon"><Mail size={18} /></div>
                <input 
                  placeholder="AaharaSetu ID" 
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required 
                />
              </div>
              
              <div className="heritage-input-wrap">
                <div className="h-input-icon"><ShieldCheck size={18} /></div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              {error && <div className="auth-error-heritage">{error}</div>}

              <Button type="submit" fullWidth className="heritage-login-btn">
                ENTER THE NETWORK
              </Button>
            </form>

            <div className="heritage-demo-footer">
              <p className="demo-label">DEMO CREDENTIALS (ID - PASS)</p>
              <div className="demo-grid">
                <div className="demo-item"><span>DONOR</span> 1 - 1</div>
                <div className="demo-item"><span>NGO</span> 2 - 2</div>
              </div>
              <button className="signup-text-link" onClick={() => setIsLoginView(!isLoginView)}>
                Don't have an account? <span>Apply Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-header-strip glass">
        <div className="header-left">
          <div className="user-avatar-large">
            <User size={32} />
            <div className="status-indicator online"></div>
          </div>
          <div className="user-title-wrap">
            <h1>{userName} <span className="verified-check">✓</span></h1>
            <div className="badges-row">
              <span className="badge gold">Platinum {userType === 'donor' ? 'Donor' : 'Partner'}</span>
              <span className="badge id">ID: {userAaharaId}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <Button variant="outline" className="signout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-column-left">
          
          <Card className="trust-vision-card">
            <div className="vision-header">
              <div className="text-side">
                <h3>Trust Ecosystem</h3>
                <p>Real-time AI Trust Score & Reliability Metric</p>
              </div>
              <div className="score-side">
                <div className="score-circle">
                  <div className="score-inner">{trustScore}%</div>
                </div>
              </div>
            </div>
            <div className="trust-meter">
              <div className="meter-bar"><div className="fill" style={{ width: `${trustScore}%` }}></div></div>
              <div className="meter-labels">
                <span>Novice</span>
                <span>Verified</span>
                <span>Elite Community Member</span>
              </div>
            </div>
          </Card>

          <Card className="business-details-card">
            <div className="section-title-wrap">
              <Building2 size={20} />
              <h4>Partner Profile</h4>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <MapPin size={16} />
                <div className="dt-val">12/A, Brigade Road, Bengaluru</div>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <div className="dt-val">+91 94432 00112</div>
              </div>
              <div className="detail-item">
                <Mail size={16} />
                <div className="dt-val">contact@haldirams.in</div>
              </div>
              <div className="detail-item">
                <Globe size={16} />
                <div className="dt-val">www.haldirams.in</div>
              </div>
            </div>
            <div className="bio-area">
              <p>We are committed to a zero-waste policy. Since 2025, we have redirected over 5 tons of edible surplus to local shelters and community kitchens.</p>
            </div>
          </Card>

          <Card className="impact-matrix-card">
            <div className="section-title-wrap">
              <Activity size={20} />
              <h4>Sustainability Impact</h4>
            </div>
            <div className="matrix-grid">
              <div className="matrix-cell">
                <TrendingUp size={20} className="icon green" />
                <div className="v">4,280</div>
                <div className="l">CO2 Offset (kg)</div>
              </div>
              <div className="matrix-cell">
                <Heart size={20} className="icon red" />
                <div className="v">124</div>
                <div className="l">Shelters Supported</div>
              </div>
              <div className="matrix-cell">
                <Award size={20} className="icon yellow" />
                <div className="v">12k</div>
                <div className="l">Kindness Reward Pts</div>
              </div>
              <div className="matrix-cell">
                <Users size={20} className="icon blue" />
                <div className="v">15,400</div>
                <div className="l">Mouths Fed</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="profile-column-right">
          
          <Card className="action-hub-card">
            <h4>Quick Verification</h4>
            <p>Have surplus? Record and verify before dispatch.</p>
            <div className="action-btns">
              <Button variant="outline" onClick={handleVerification} disabled={isVerifying}>
                <Camera size={18} /> {isVerifying ? 'Scanning...' : 'Upload Proof'}
              </Button>
            </div>
          </Card>

          <Card className="timeline-v2-card">
            <div className="timeline-header">
              <History size={18} />
              <h4>Activity Journal</h4>
            </div>
            <div className="journal-items">
              <div className="journal-entry">
                <div className="entry-dot verified"></div>
                <div className="entry-text">
                  <strong>10:30 AM Today</strong>
                  <p>Donated 15 boxes of Snacks to Hope NGO</p>
                </div>
              </div>
              <div className="journal-entry">
                <div className="entry-dot verified"></div>
                <div className="entry-text">
                  <strong>Yesterday</strong>
                  <p>Trust Score boosted by 2% for on-time delivery</p>
                </div>
              </div>
              <div className="journal-entry">
                <div className="entry-dot"></div>
                <div className="entry-text">
                  <strong>12 April</strong>
                  <p>Joined Aahara Setu Network</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="network-card">
            <h4>Linked Partners</h4>
            <div className="partners-list">
              <div className="partner-tiny">
                <img src="/logo.png" alt="NGO" />
                <span>Robin Hood Army</span>
              </div>
              <div className="partner-tiny">
                <img src="/logo.png" alt="Hospital" />
                <span>Grace Hospital</span>
              </div>
            </div>
          </Card>

          <div className="trust-disclaimer glass">
            <Info size={16} />
            <p>Your platinum status enables 0-charge pickups within 10km radius.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
