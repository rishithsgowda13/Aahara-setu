import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { Button } from '../../donor/components/ui/Button/Button';
import { Heart, Mail, Lock, User } from 'lucide-react';
import './Auth.css';

export const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo identification logic
    let targetRole: UserRole = role;
    if (email === '1' && password === '1') targetRole = 'donor';
    if (email === '2' && password === '2') targetRole = 'receiver';
    if (email === '3' && password === '3') targetRole = 'admin';

    login(email, targetRole);
    
    if (targetRole === 'donor') navigate('/');
    else if (targetRole === 'receiver') navigate('/receiver');
    else if (targetRole === 'admin') navigate('/admin');
  };

  return (
    <div className="auth-fullscreen">
      <div className="auth-split-card glass">
        {/* Left Panel: Visual Branding */}
        <div className="auth-visual-panel">
          <div className="visual-content">
            <img src="/donor/logo.png" alt="Aahara Setu Logo" className="auth-visual-logo" />
            <span className="visual-eyebrow">BEYOND THE PLATE</span>
            <h1 className="visual-title">Aahara Setu <br /> <span className="title-serif">Platform</span></h1>
            <p className="visual-desc">
              Bridging the gap between surplus and survival. <br />
              Secure, AI-audited redistribution network.
            </p>
          </div>
          <div className="visual-footer">
             <Heart size={16} className="text-secondary" />
             <span>Join 500+ verified food redistribution partners.</span>
          </div>
        </div>

        {/* Right Panel: Form Logic */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2 className="welcome-text">
              {activeTab === 'login' ? 'Welcome Back' : 'Join Network'}
            </h2>
            <p className="access-line">
              {activeTab === 'login' ? 'ACCESS THE IMPACT CORE' : 'REGISTER YOUR ORGANIZATION'}
            </p>
          </div>

          {activeTab === 'signup' && (
            <div className="role-selector-premium">
              <button 
                className={`role-pill ${role === 'donor' ? 'active' : ''}`}
                onClick={() => setRole('donor')}
              >
                Donor
              </button>
              <button 
                className={`role-pill ${role === 'receiver' ? 'active' : ''}`}
                onClick={() => setRole('receiver')}
              >
                Receiver
              </button>
            </div>
          )}

          <form className="auth-form-premium" onSubmit={handleSubmit}>
            {activeTab === 'signup' && (
              <div className="input-field-wrap">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Organization Name" required />
              </div>
            )}
            
            <div className="input-field-wrap">
              <Mail size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="User ID or Email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-field-wrap">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button fullWidth size="lg" className="auth-main-btn">
               {activeTab === 'login' ? 'ENTER THE GATES' : 'VERIFY & JOIN'}
            </Button>
          </form>

          <div className="auth-extra-links">
             {activeTab === 'login' && (
               <div className="demo-creds">
                  <span>DEMO CREDENTIALS (ID - PASS):</span>
                  <div className="creds-tags">
                     <span className="tag blue">DONOR: 1 - 1</span>
                     <span className="tag green">NGO: 2 - 2</span>
                     <span className="tag yellow">ADMIN: 3 - 3</span>
                  </div>
               </div>
             )}
             <p className="toggle-auth-state" onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}>
                {activeTab === 'login' ? "Don't have an account? Join Network" : "Already a member? Sign In"}
             </p>
          </div>
        </div>
      </div>
      
      <div className="auth-bg-ambient">
        <div className="ambient-orb o1"></div>
        <div className="ambient-orb o2"></div>
      </div>
    </div>
  );
};
