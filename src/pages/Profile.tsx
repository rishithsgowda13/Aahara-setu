import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  User, ShieldCheck, MapPin, Camera, 
  Award, TrendingUp, History, Star,
  Info, LogIn, UserPlus, LogOut
} from 'lucide-react';
import './Profile.css';
import './Login.css';

export const Profile: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [isLoginView, setIsLoginView] = useState(true);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [trustScore, setTrustScore] = useState(88);
  const [isVerifying, setIsVerifying] = useState(false);

  const userAaharaId = localStorage.getItem('aaharaId') || 'AS-7742';
  const userType = localStorage.getItem('userType');
  const userName = userType === 'donor' ? 'Haldiram\'s' : 'Akshaya Patra';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginView) {
      if ((id === '1' && password === '1') || (id === '2' && password === '2')) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', id === '1' ? 'donor' : 'receiver');
        localStorage.setItem('aaharaId', `AS-${id === '1' ? '7742' : '8891'}`);
        setIsAuthenticated(true);
        window.location.reload(); // Refresh to update navbar/context
      } else {
        setError('Invalid ID or Password. Try ID: 1, Pass: 1');
      }
    } else {
      alert('Signup successful! Please login with ID: 1, Pass: 1');
      setIsLoginView(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('aaharaId');
    setIsAuthenticated(false);
    window.location.reload();
  };

  const handleVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      alert('Proof submitted! AI analysis in progress...');
      setIsVerifying(false);
      setTrustScore(prev => Math.min(prev + 2, 100));
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container" style={{ paddingTop: '40px' }}>
        <div className="login-visual">
          <div className="login-logo">
            <img src="/logo.png" alt="Aahara Setu" width={80} />
            <h1>Aahara Setu</h1>
          </div>
          <p>Connecting surplus food to social impact through trust and transparency.</p>
          <div className="trust-stats">
            <div className="tstat">
              <ShieldCheck size={20} />
              <span>Verified IDs</span>
            </div>
            <div className="tstat">
              <LogIn size={20} />
              <span>Secure Access</span>
            </div>
          </div>
        </div>

        <div className="login-form-side">
          <Card className="auth-card glass">
            <div className="auth-header">
              <h2>{isLoginView ? 'Welcome Back' : 'Join the Network'}</h2>
              <p>{isLoginView ? 'Sign in to access your Profile' : 'Create your verified profile'}</p>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              <Input 
                label="AaharaSetu ID" 
                placeholder="Enter your ID (Try '1' for Demo)" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                required 
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="Enter password (Try '1' for Demo)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              
              {error && <div className="auth-error">{error}</div>}

              <Button type="submit" fullWidth size="lg">
                {isLoginView ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
              </Button>
            </form>

            <div className="auth-footer">
              {isLoginView ? (
                <p>Don't have an account? <button onClick={() => setIsLoginView(false)}>Sign Up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setIsLoginView(true)}>Log In</button></p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Left Column: User Overview */}
        <div className="profile-main">
          <Card className="user-hero-card">
            <div className="user-avatar-wrap">
              <div className="user-avatar"><User size={40} /></div>
              <div className="user-status-badge">Verified Partner</div>
            </div>
            <div className="user-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1>{userName}</h1>
                <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: 'var(--color-error)' }}>
                  <LogOut size={16} /> Logout
                </Button>
              </div>
              <div className="user-id-badge">
                <ShieldCheck size={16} />
                <span>ID: {userAaharaId}</span>
              </div>
              <p>Registered as a Platinum {userType === 'donor' ? 'Donor' : 'Receiver'} since April 2025</p>
            </div>
          </Card>

          <Card className="trust-score-card">
            <div className="trust-header">
              <div className="trust-title-wrap">
                <h3>AI Trust Score</h3>
                <p>Based on successful donations & verification history</p>
              </div>
              <div className="trust-percentage">{trustScore}%</div>
            </div>
            <div className="trust-progress-bg">
              <div className="trust-progress-fill" style={{ width: `${trustScore}%` }}></div>
            </div>
            <div className="trust-levels">
              <span>Rookie</span>
              <span>Trusted</span>
              <span>Champion</span>
            </div>
          </Card>

          <Card className="verification-card">
            <h3><Camera size={20} /> Verify New Contribution</h3>
            <p>Upload a photo of the food and current location to boost your trust score immediately.</p>
            <div className="verification-upload-zone">
              <div className="upload-btn-wrap">
                <Button variant="outline" className="vbtn">
                  <Camera size={18} /> Take Photo
                </Button>
                <Button variant="outline" className="vbtn">
                  <MapPin size={18} /> Live Location
                </Button>
              </div>
            </div>
            <Button fullWidth onClick={handleVerification} disabled={isVerifying}>
              {isVerifying ? 'Analyzing Proof...' : 'Submit Evidence for AI Audit'}
            </Button>
          </Card>
        </div>

        {/* Right Column: Stats & History */}
        <div className="profile-sidebar">
          <Card className="impact-summary-card">
            <h3>Impact Summary</h3>
            <div className="impact-grid">
              <div className="impact-item">
                <Award size={24} className="impact-icon blue" />
                <div className="impact-val">124</div>
                <div className="impact-label">{userType === 'donor' ? 'Meals Provided' : 'Meals Claimed'}</div>
              </div>
              <div className="impact-item">
                <TrendingUp size={24} className="impact-icon green" />
                <div className="impact-val">4.2t</div>
                <div className="impact-label">CO2 Saved</div>
              </div>
              <div className="impact-item">
                <Star size={24} className="impact-icon yellow" />
                <div className="impact-val">12k</div>
                <div className="impact-label">Kindness Pts</div>
              </div>
            </div>
          </Card>

          <Card className="history-card">
            <h3><History size={20} /> Recent Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot success"></div>
                <div className="timeline-content">
                  <p><strong>15th Apr:</strong> {userType === 'donor' ? 'Rescued 5kg rice.' : 'Claimed 5kg rice.'} <span className="verified-link">Proof Verified ✓</span></p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot success"></div>
                <div className="timeline-content">
                  <p><strong>12th Apr:</strong> {userType === 'donor' ? 'Fed 20 people in Bengaluru.' : 'Received 20 meals for shelter.'}</p>
                </div>
              </div>
              <div className="timeline-item active">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <p><strong>Pending:</strong> 10 Meals for Verification.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="trust-info-card">
            <Info size={20} className="info-icon" />
            <p>Your Trust Score is visible to all partners. Higher scores ensure your activity is processed 3x faster by our AI prioritization system.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
