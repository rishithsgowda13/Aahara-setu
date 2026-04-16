import React from 'react';
import { Home, Upload, LayoutDashboard, Radio, Flame, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Footer.css';

export const Footer: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  const isReceiver = role === 'receiver';

  return (
    <footer className="floating-footer-wrapper">
      <div className="floating-footer-dock">
        <div className="dock-logo">
          <img src="/donor/logo.png" alt="Aahara Setu Logo" />
        </div>
        
        <div className="dock-icons">
          <Link to="/" className={`dock-icon ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={24} />
          </Link>
          
          <Link to={isReceiver ? "/receiver" : "/dashboard"} className={`dock-icon ${['/receiver', '/dashboard'].includes(location.pathname) ? 'active' : ''}`}>
            <LayoutDashboard size={24} />
          </Link>
          
          <Link to={isReceiver ? "/receiver/disasters" : "/disasters"} className={`dock-icon ${['/disasters', '/receiver/disasters'].includes(location.pathname) ? 'active' : ''}`}>
            <Flame size={24} />
          </Link>
          
          <Link to="/traceability" className={`dock-icon ${location.pathname === '/traceability' ? 'active' : ''}`}>
            <Radio size={24} />
          </Link>
          
          <Link to={isReceiver ? "/receiver/explore" : "/upload"} className={`dock-icon ${['/upload', '/receiver/explore'].includes(location.pathname) ? 'active' : ''}`}>
             <Upload size={24} />
          </Link>

          <Link to="/notifications" className={`dock-icon ${location.pathname === '/notifications' ? 'active' : ''}`}>
            <Bell size={24} />
          </Link>

          <Link to="/profile" className={`dock-icon ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={24} />
          </Link>
        </div>
      </div>
    </footer>
  );
};
