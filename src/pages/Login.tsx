import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Building2, Users, Leaf, ArrowRight } from 'lucide-react';
import './Login.css';

type Role = 'donor' | 'receiver';
type Mode = 'login' | 'signup';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('donor');
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const donorFields = [
    { label: 'Restaurant / Hotel Name', placeholder: 'e.g., Heritage Heights Hotel', type: 'text' },
    { label: 'FSSAI License No. (Optional)', placeholder: 'e.g., 12345678901234', type: 'text' },
  ];
  const receiverFields = [
    { label: 'NGO / Organisation Name', placeholder: 'e.g., Hope Foundation', type: 'text' },
    { label: 'Registration No. (Optional)', placeholder: 'e.g., NGO/MH/2021/001', type: 'text' },
  ];
  const extraSignupFields = role === 'donor' ? donorFields : receiverFields;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Save role and notify app
    localStorage.setItem('userRole', role);
    window.dispatchEvent(new Event('authChange'));

    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1400);
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <img src="/logo.png" alt="Aahar Setu" className="login-brand-logo" />
          <span className="brand-name">Aahar Setu</span>
        </div>
        <div className="login-left-content">
          <h1>Food that would be wasted<br /><span className="gradient-text">feeds someone instead.</span></h1>
          <p>Join the Circular Food Redistribution Network — connecting surplus food with communities in need, in real time.</p>
          <div className="login-impact-stats">
            <div className="impact-stat">
              <span className="impact-val">12,450+</span>
              <span className="impact-lbl">Meals Saved</span>
            </div>
            <div className="impact-stat">
              <span className="impact-val">8,300+</span>
              <span className="impact-lbl">People Fed</span>
            </div>
            <div className="impact-stat">
              <span className="impact-val">450+</span>
              <span className="impact-lbl">Active Donors</span>
            </div>
          </div>
          <div className="login-flow-hint">
            {['Upload', 'Match', 'Claim', 'Pickup', 'Impact'].map((s, i, arr) => (
              <React.Fragment key={s}>
                <span className="flow-hint-step">{s}</span>
                {i < arr.length - 1 && <ArrowRight size={14} className="flow-hint-arrow" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="login-left-blob blob-a" />
        <div className="login-left-blob blob-b" />
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <Card className="login-card">
          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              className={`role-btn ${role === 'donor' ? 'active' : ''}`}
              onClick={() => setRole('donor')}
              type="button"
            >
              <Building2 size={18} />
              <span>Donor</span>
              <span className="role-sub">Restaurant / Hotel</span>
            </button>
            <button
              className={`role-btn ${role === 'receiver' ? 'active' : ''}`}
              onClick={() => setRole('receiver')}
              type="button"
            >
              <Users size={18} />
              <span>Receiver</span>
              <span className="role-sub">NGO / Individual</span>
            </button>
          </div>

          <div className="login-card-header">
            <div className={`role-avatar ${role}`}>
              {role === 'donor' ? <Building2 size={28} /> : <Users size={28} />}
            </div>
            <div>
              <h2>{mode === 'login' ? 'Welcome back!' : 'Create account'}</h2>
              <p className="login-role-desc">
                {role === 'donor'
                  ? 'Sign in as a Food Donor to list surplus food.'
                  : 'Sign in as a Food Receiver to claim available food.'}
              </p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <Input label="Full Name" placeholder="Your full name" required />
                {extraSignupFields.map((f) => (
                  <Input key={f.label} label={f.label} placeholder={f.placeholder} type={f.type} />
                ))}
              </>
            )}

            <Input label="Email Address" placeholder="you@example.com" type="email" required />

            <div className="password-field">
              <label className="input-label">Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input-field"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="password-field">
                <Input label="Confirm Password" type="password" placeholder="Re-enter your password" required />
              </div>
            )}

            {mode === 'login' && (
              <div className="login-options-row">
                <label className="remember-label">
                  <input type="checkbox" className="remember-checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="#" className="forgot-link">Forgot password?</Link>
              </div>
            )}

            {mode === 'signup' && (
              <label className="terms-label">
                <input type="checkbox" required />
                <span>I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link></span>
              </label>
            )}

            <Button type="submit" size="lg" fullWidth disabled={isLoading}>
              {isLoading
                ? 'Please wait...'
                : mode === 'login'
                  ? `Sign In as ${role === 'donor' ? 'Donor' : 'Receiver'}`
                  : `Create ${role === 'donor' ? 'Donor' : 'Receiver'} Account`}
            </Button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <div className="social-login-row">
            <button className="social-btn" type="button">
              <img src="https://www.google.com/favicon.ico" width={16} alt="Google" />
              Google
            </button>
            <button className="social-btn" type="button">
              📱 Phone / OTP
            </button>
          </div>

          <p className="login-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="switch-btn"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <div className="login-eco-note">
            <Leaf size={13} />
            <span>By joining, you're helping build a zero food-waste future.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
