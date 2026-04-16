import React from 'react';
import { Home, LayoutDashboard, Radio, Flame, Bell, Globe } from 'lucide-react';
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
          <img src="/logo_aahara.png" alt="Aahara Setu" />
        </div>

        <div className="dock-icons">
          <Link to="/" className={`dock-icon ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={22} />
          </Link>
          
          <Link to={isReceiver ? "/receiver" : "/dashboard"} className={`dock-icon ${['/receiver', '/dashboard'].includes(location.pathname) ? 'active' : ''}`}>
            <LayoutDashboard size={22} />
          </Link>

          <Link to="/explore" className={`dock-icon ${location.pathname === '/explore' ? 'active' : ''}`}>
            <Globe size={22} />
          </Link>
          
          <Link to="/traceability" className={`dock-icon ${location.pathname === '/traceability' ? 'active' : ''}`}>
             <Radio size={22} />
          </Link>

          <Link to={isReceiver ? "/receiver/disasters" : "/disasters"} className={`dock-icon emergency-trigger ${['/disasters', '/receiver/disasters'].includes(location.pathname) ? 'active' : ''}`}>
            <Flame size={24} />
          </Link>
          
          <Link to="/notifications" className={`dock-icon ${location.pathname === '/notifications' ? 'active' : ''}`}>
            <Bell size={22} />
          </Link>
        </div>
      </div>
    </footer>
  );
};
