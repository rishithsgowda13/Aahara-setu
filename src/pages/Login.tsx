import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Demo credentials: 1/1 for donor, 2/2 for receiver
      if ((id === '1' && password === '1') || (id === '2' && password === '2')) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', id === '1' ? 'donor' : 'receiver');
        localStorage.setItem('aaharaId', `AS-${id === '1' ? '7742' : '8891'}`);
        navigate('/dashboard');
      } else {
        setError('Invalid ID or Password. Try ID: 1, Pass: 1');
      }
    } else {
      // Signup simulation
      alert('Signup successful! Please login with ID: 1, Pass: 1');
      setIsLogin(true);
    }
  };

  return (
    <div className="login-container">
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
            <h2>{isLogin ? 'Welcome Back' : 'Join the Network'}</h2>
            <p>{isLogin ? 'Sign in to your Aahara Setu account' : 'Create your verified donor/receiver profile'}</p>
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
              {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
            </Button>
          </form>

          <div className="auth-footer">
            {isLogin ? (
              <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Log In</button></p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
