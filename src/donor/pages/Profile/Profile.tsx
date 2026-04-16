import React, { useState } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Award, Info, LogOut, Activity,
  Clock, Zap, Globe
} from 'lucide-react';
import './Profile.css';

const FSSAI_STORAGE_KEY = 'aahara_setu_fssai_id';

export const Profile: React.FC = () => {
  const { lang, setLang, t } = useTranslation();
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [fssaiInput, setFssaiInput] = useState(localStorage.getItem(FSSAI_STORAGE_KEY) || '');
  const [isEditingFssai, setIsEditingFssai] = useState(false);
  const [isFetchingFssai, setIsFetchingFssai] = useState(false);
  const [fssaiStatus, setFssaiStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('✨ Settings mode enabled. You can now modify your organization details.');

  React.useEffect(() => {
    if (location.state?.highlightFssai) {
      setIsEditingFssai(true);
      setToastMessage('✨ Verification required. Please enter your ID.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      // Optional: scroll to the FSSAI section
      setTimeout(() => {
        const el = document.querySelector('.meta-grid');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [location.state]);

  const trustScore = 88;
  const isReceiver = role === 'receiver';



  const handleSaveFssai = () => {
    if (!fssaiInput) return;
    
    setIsFetchingFssai(true);
    setFssaiStatus('Fetching details from FSSAI Gateway...');
    
    setTimeout(() => {
      setFssaiStatus('Verifying authenticity via AI Audit...');
      setTimeout(() => {
        localStorage.setItem(FSSAI_STORAGE_KEY, fssaiInput);
        setIsEditingFssai(false);
        setIsFetchingFssai(false);
        setFssaiStatus(null);
        setToastMessage('✅ Verification Successful! You can now start donating.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        // Refresh page or update state to allow upload
      }, 1500);
    }, 1500);
  };

  return (
    <div className="profile-page-container">
      {showToast && (
        <div className="custom-toast">
          <span>{toastMessage}</span>
          <button 
            onClick={() => setShowToast(false)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer', 
              fontSize: '1.2rem', 
              padding: '0 4px',
              marginLeft: '8px',
              fontWeight: 'bold',
              opacity: 0.6
            }}
          >
            ×
          </button>
        </div>
      )}
      <div className="profile-layout">
        {/* Main Content Area */}
        <div className="profile-main-content">
          
          {/* Premium Profile Card */}
          <Card className="profile-premium-card glass">
            <div className="premium-header-top">
              <div className="premium-identity">
                <h1 className="main-org-name">{isReceiver ? 'Hope Foundation' : "McDonald's - VVCE"}</h1>
                <div className="premium-badges-row">
                  <span className="premium-role-badge">
                    {isReceiver ? t('ngo_partner') : t('platinum_donor')}
                  </span>
                  <span className="premium-id-badge">ID: {isReceiver ? 'NGO-2201' : 'AS-7742'}</span>
                </div>
              </div>
              <div className="premium-avatar-box">
                <div className={isReceiver ? "ngo-logo-placeholder" : "mcd-logo-placeholder"}>
                  {isReceiver ? 'H' : 'M'}
                </div>
              </div>
            </div>
            <div className="premium-header-bottom">
              <div className="premium-meta-info">
                <div className="meta-info-item">
                  <ShieldCheck size={16} /> {isReceiver ? t('audit_passed') : t('verified_partner')}
                </div>
                <div className="meta-info-item">
                  <Clock size={16} /> {isReceiver ? t('ngo_joined_date') : t('joined_date')}
                </div>
              </div>
            </div>
          </Card>

          {/* AI Trust Score Card */}
          <Card className="trust-score-card glass">
            <div className="trust-score-header">
              <div className="trust-title-group">
                <h3>{t('ai_trust_score')}</h3>
                <p>{isReceiver ? t('ngo_trust_desc') : t('ai_trust_desc')}</p>
              </div>
              <div className="trust-percentage">{isReceiver ? 94 : trustScore}%</div>
            </div>
            <div className="trust-progress-container">
              <div className="trust-progress-bar">
                <div className="trust-progress-fill" style={{ width: `${isReceiver ? 94 : trustScore}%` }}></div>
              </div>
              <div className="trust-progress-labels">
                <span>{t('rookie')}</span>
                <span>{t('trusted')}</span>
                <span>{isReceiver ? t('rescue_hero') : t('champion')}</span>
              </div>
            </div>
          </Card>

          {/* Recent Timeline - Moved Here for Balance */}
          <Card className="recent-timeline-card glass main-timeline-fix">
            <div className="timeline-header-row">
              <Clock size={18} />
              <h3>{t('recent_activity')}</h3>
            </div>
            <div className="timeline-items">
              {isReceiver ? (
                <>
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">Today: <span className="timeline-desc">Claimed 20 meal packs from Gaurav Sweets.</span></div>
                      <div className="timeline-status success">{t('impact_verified')}</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">Yesterday: <span className="timeline-desc">Rescued 5kg vegetables from Skyline Hotels.</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">15th Apr: <span className="timeline-desc">Rescued 5kg fresh vegetables for Hope NGO.</span></div>
                      <div className="timeline-status success">{t('impact_verified')}</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">12th Apr: <span className="timeline-desc">Distributed 20 hot meal packs in central hub.</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Quick Actions & Meta (Moved below AI Trust Score) */}
          <div className="profile-meta-section">
            <h4 className="meta-title">{t('org_details')}</h4>
            <div className="meta-grid">
              <div className="meta-item">
                <span className="meta-lbl">{t('org_type')}</span>
                <span className="meta-val">{isReceiver ? 'Registered NGO (80G)' : 'Platinum Partner (Donor)'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">{t('contact')}</span>
                <span className="meta-val">{isReceiver ? '+91 88776 65544' : '+91 98765 43210'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">{t('location')}</span>
                <span className="meta-val">{isReceiver ? 'Koramangala, Bengaluru' : 'Indiranagar, Bengaluru'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">{isReceiver ? t('ngo_reg_id') : t('fssai_license')}</span>
                {isFetchingFssai ? (
                   <div className="fssai-fetching-state">
                      <div className="pulse-dot"></div>
                      <span className="fetching-text">{fssaiStatus}</span>
                   </div>
                ) : isEditingFssai ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <input 
                      type="text" 
                      className="mini-input"
                      value={fssaiInput}
                      onChange={(e) => setFssaiInput(e.target.value)}
                      placeholder={isReceiver ? "NGO Reg Number" : "Enter FSSAI ID"}
                      style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveFssai}>Fetch & Verify</Button>
                  </div>
                ) : (
                  <span className="meta-val" onClick={() => setIsEditingFssai(true)} style={{ cursor: 'pointer', color: fssaiInput ? 'inherit' : 'var(--color-error)' }}>
                    {fssaiInput || `⚠️ Click to enter ${isReceiver ? 'Reg ID' : 'FSSAI ID'}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="profile-sidebar">
          
          {/* Impact Summary */}
          <Card className="impact-summary-card glass">
            <h3>{t('impact_summary')}</h3>
            <div className="impact-summary-list">
              <div className="summary-item">
                <div className="summary-icon meals"><Zap size={20} /></div>
                <div className="summary-details">
                  <span className="summary-val">{isReceiver ? '1.2k' : '124'}</span>
                  <span className="summary-lbl">{isReceiver ? t('meals_claimed') : t('meals_provided')}</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon co2"><Activity size={20} /></div>
                <div className="summary-details">
                  <span className="summary-val">{isReceiver ? '15.4t' : '4.2t'}</span>
                  <span className="summary-lbl">{isReceiver ? t('food_saved_label') : t('co2_reduced')}</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon kindness"><Award size={20} /></div>
                <div className="summary-details">
                  <span className="summary-val">{isReceiver ? '8.5k' : '12k'}</span>
                  <span className="summary-lbl">{isReceiver ? t('people_fed') : t('kindness_pts')}</span>
                </div>
              </div>
            </div>
          </Card>


          {/* Trust Info Box */}
          <div className="trust-info-box">
            <div style={{ display: 'flex', gap: '12px' }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p>{isReceiver ? t('ngo_trust_visible') : t('trust_visible_msg')}</p>
            </div>
          </div>

          <div className="profile-badges-section">
            <h4 className="meta-title">{t('achievements')}</h4>
            <div className="badges-flex">
              <div className="mini-badge" title={isReceiver ? "Rapid Response" : "Fast Responder"}>{isReceiver ? '🚁' : '⚡'}</div>
              <div className="mini-badge" title="Eco Warrior">🌱</div>
              <div className="mini-badge" title="Verified Safety">🛡️</div>
              <div className="mini-badge" title={isReceiver ? "Top NGO" : "Top 1% Donor"}>🏆</div>
            </div>
          </div>

          <Card className="profile-settings-card glass" style={{ marginTop: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} /> {t('settings_lang_title')}
            </h3>
            <div className="profile-lang-switcher">
              {(['EN', 'HI', 'KA'] as const).map(l => (
                <button 
                  key={l}
                  className={`profile-lang-btn ${lang === l ? 'active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  <span className="lang-code">{l}</span>
                  <span className="lang-name">{l === 'EN' ? 'English' : l === 'HI' ? 'Hindi' : 'Kannada'}</span>
                </button>
              ))}
            </div>
          </Card>

          <Button variant="primary" className="profile-signout-btn" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={16} /> {t('sign_out')}
          </Button>

        </div>
      </div>
    </div>
  );
};
