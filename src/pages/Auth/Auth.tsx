import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { Button } from '../../donor/components/ui/Button/Button';
import { Card } from '../../donor/components/ui/Card/Card';
import { Heart, ShieldCheck, Mail, Lock, User, Building } from 'lucide-react';
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
    // Simulate login logic
    login(email || 'demo@aaharasetu.org', role);
    
    // Redirect based on role
    if (role === 'donor') {
      navigate('/');
    } else {
      navigate('/receiver');
    }
  };

  return (
    <div className="auth-fullscreen">
      <div className="auth-brand">
        <div className="auth-logo-circle">A</div>
        <h1 className="auth-title">Aahara <span className="gradient-text">Setu</span></h1>
        <p className="auth-motto">Bridging the gap between surplus and survival.</p>
      </div>

      <Card className="auth-card glass">
        <div className="role-selector-main">
          <button 
            className={`role-tab ${role === 'donor' ? 'active' : ''}`}
            onClick={() => setRole('donor')}
          >
            <Heart size={18} /> Donor
          </button>
          <button 
            className={`role-tab ${role === 'receiver' ? 'active' : ''}`}
            onClick={() => setRole('receiver')}
          >
            <Building size={18} /> NGO/Receiver
          </button>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-inner-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button 
            className={`auth-inner-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Join Network
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {activeTab === 'signup' && (
            <div className="input-group-premium">
              <label><User size={14} /> Organization Name</label>
              <input type="text" placeholder="e.g. Skyline Hotels" required />
            </div>
          )}
          
          <div className="input-group-premium">
            <label><Mail size={14} /> Official Email</label>
            <input 
              type="email" 
              placeholder="name@organization.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group-premium">
            <label><Lock size={14} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button fullWidth size="lg" className="auth-submit-btn">
            {activeTab === 'login' ? 'Enter Dashboard' : 'Verify & Join'}
          </Button>
        </form>

        <div className="auth-footer-note">
          <ShieldCheck size={14} /> 
          Verified by Aahara Trust & Safety Protocol
        </div>
      </Card>

      <div className="auth-bg-blobs">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
      </div>
    </div>
  );
};
