import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Mock Credentials Check
        if (email === '1' && password === '1') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', 'receiver');
          navigate('/explore');
          setIsLoading(false);
          return;
        }
        if (email === '2' && password === '2') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', 'donor');
          navigate('/upload');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          // Fetch role from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
            
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', profile?.role || 'donor');
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          // Insert profile record
          const { error: profileError } = await supabase.from('profiles').insert([
            { id: data.user.id, full_name: fullName, role: role }
          ]);
          if (profileError) console.error("Profile creation error:", profileError);
        }
        
        alert('Signup successful! ' + (data.session ? 'Logging you in...' : 'Please look for a verification email.'));
        if (data.session) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', role);
          navigate('/dashboard');
        } else {
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
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
            <span>Verified Users</span>
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
            <p>{isLogin ? 'Sign in to your Aahara Setu account' : 'Create your verified donor/ngo profile'}</p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {!isLogin && (
              <>
                <Input 
                  label="Full Name / Organization" 
                  placeholder="e.g., Akshaya Patra Foundation" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
                
                <div className="role-toggle-container">
                  <label className="input-label">I am a...</label>
                  <div className="role-toggle-group">
                    <button 
                      type="button"
                      className={`role-toggle-btn ${role === 'donor' ? 'active' : ''}`}
                      onClick={() => setRole('donor')}
                    >
                      Food Donor
                    </button>
                    <button 
                      type="button"
                      className={`role-toggle-btn ${role === 'receiver' ? 'active' : ''}`}
                      onClick={() => setRole('receiver')}
                    >
                      Receiver / NGO
                    </button>
                  </div>
                </div>
              </>
            )}

            <Input 
              type="email"
              label="Email Address" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder={isLogin ? "Enter your password" : "Create a strong password (min 6 chars)"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
            
            {error && <div className="auth-error" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px' }}>{error}</div>}

            <Button type="submit" fullWidth size="lg" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>)}
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
