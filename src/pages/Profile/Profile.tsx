import React, { useState } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { 
  User, ShieldCheck, MapPin, Camera, 
  Award, TrendingUp, History, 
  Info, LogOut, Activity, Heart, Users,
  CheckCircle2, Clock, Zap
} from 'lucide-react';
import './Profile.css';

export const Profile: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const trustScore = 88;

  return (
    <div className="profile-page-container">
      <div className="profile-layout">
        {/* Main Content Area */}
        <div className="profile-main-content">
          
          {/* Top Profile Card */}
          <Card className="profile-header-card glass">
            <div className="profile-header-main">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-placeholder">
                  <User size={60} strokeWidth={1} />
                </div>
                <div className="verified-status-tag">
                  <ShieldCheck size={14} /> VERIFIED PARTNER
                </div>
              </div>
              <div className="profile-identity">
                <div className="profile-name-row">
                  <h1>Akshaya Patra</h1>
                  <div className="profile-id-group">
                    <span className="profile-id-badge">
                      <ShieldCheck size={14} /> ID: AS-7742
                    </span>
                    <Button variant="outline" size="sm" className="edit-btn-header">Edit Profile</Button>
                  </div>
                </div>
                <p className="profile-joined-text">Registered as a Platinum Donor since April 2025</p>
              </div>
            </div>
          </Card>

          {/* AI Trust Score Card */}
          <Card className="trust-score-card glass">
            <div className="trust-score-header">
              <div className="trust-title-group">
                <h3>AI Trust Score</h3>
                <p>Based on successful donations & verification history</p>
              </div>
              <div className="trust-percentage">{trustScore}%</div>
            </div>
            <div className="trust-progress-container">
              <div className="trust-progress-bar">
                <div className="trust-progress-fill" style={{ width: `${trustScore}%` }}></div>
              </div>
              <div className="trust-progress-labels">
                <span>Rookie</span>
                <span>Trusted</span>
                <span>Champion</span>
              </div>
            </div>
          </Card>

          {/* Recent Timeline - Moved Here for Balance */}
          <Card className="recent-timeline-card glass main-timeline-fix">
            <div className="timeline-header-row">
              <Clock size={18} />
              <h3>Recent Contribution Activity</h3>
            </div>
            <div className="timeline-items">
              <div className="timeline-item">
                <div className="timeline-dot active"></div>
                <div className="timeline-content">
                  <div className="timeline-date">15th Apr: <span className="timeline-desc">Rescued 5kg fresh vegetables for Hope NGO.</span></div>
                  <div className="timeline-status success">Proof Verified by AI Audit ✓</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot active"></div>
                <div className="timeline-content">
                  <div className="timeline-date">12th Apr: <span className="timeline-desc">Distributed 20 hot meal packs in central hub.</span></div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot pending"></div>
                <div className="timeline-content">
                  <div className="timeline-date">Pending: <span className="timeline-desc">10 Meals of North Indian Thali for Verification.</span></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions & Meta (Moved below AI Trust Score) */}
          <div className="profile-meta-section">
            <h4 className="meta-title">Organization Details</h4>
            <div className="meta-grid">
              <div className="meta-item">
                <span className="meta-lbl">Type</span>
                <span className="meta-val">Platinum Partner (NGO)</span>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">Contact</span>
                <span className="meta-val">+91 98765 43210</span>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">HQ Location</span>
                <span className="meta-val">Indiranagar, Bengaluru</span>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">FSSAI License</span>
                <span className="meta-val">#22224050000123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="profile-sidebar">
          
          {/* Impact Summary */}
          <Card className="impact-summary-card glass">
            <h3>Impact Summary</h3>
            <div className="impact-summary-list">
              <div className="summary-item">
                <div className="summary-icon meals"><Zap size={20} /></div>
                <div className="summary-details">
                  <span className="summary-val">124</span>
                  <span className="summary-lbl">Meals Provided</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon co2"><Activity size={20} /></div>
                <div className="summary-details">
                  <span className="summary-val">4.2t</span>
                  <span className="summary-lbl">CO2 Saved</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon kindness"><Award size={20} /></div>
                <div className="summary-details">
                  <span className="summary-val">12k</span>
                  <span className="summary-lbl">Kindness Pts</span>
                </div>
              </div>
            </div>
          </Card>


          {/* Trust Info Box */}
          <div className="trust-info-box">
            <Info size={18} />
            <p>Your Trust Score is visible to all NGOs. Higher scores ensure your donations are claimed 3x faster by primary partners.</p>
          </div>

          {/* Organization Details was moved to main-content */}

          <div className="profile-badges-section">
            <h4 className="meta-title">Achievements</h4>
            <div className="badges-flex">
              <div className="mini-badge" title="Fast Responder">⚡</div>
              <div className="mini-badge" title="Eco Warrior">🌱</div>
              <div className="mini-badge" title="Verified Safety">🛡️</div>
              <div className="mini-badge" title="Top 1% Donor">🏆</div>
            </div>
          </div>

          <Button variant="primary" className="profile-signout-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
            <LogOut size={16} /> SIGN OUT
          </Button>

        </div>
      </div>
    </div>
  );
};
