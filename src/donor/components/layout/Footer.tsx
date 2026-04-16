import React from 'react';
import { Home, LayoutDashboard, Radio, Flame, Bell, Globe, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Footer.css';

export const Footer: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  const isReceiver = role === 'receiver';

  const navItems = [
    { 
      to: "/", 
      icon: <Home size={20} />, 
      label: "Home", 
      active: location.pathname === '/' 
    },
    { 
      to: isReceiver ? "/receiver" : "/dashboard", 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard", 
      active: ['/receiver', '/dashboard'].includes(location.pathname) 
    },
    { 
      to: isReceiver ? "/receiver/explore" : "/explore", 
      icon: <Globe size={20} />, 
      label: "Explore Food", 
      active: location.pathname.includes('/explore') 
    },
    { 
      to: "/traceability", 
      icon: <Radio size={20} />, 
      label: "Traceability", 
      active: location.pathname === '/traceability' 
    },
    { 
      to: isReceiver ? "/receiver/disasters" : "/disasters", 
      icon: <Flame size={20} />, 
      label: "Disasters", 
      active: ['/disasters', '/receiver/disasters'].includes(location.pathname) 
    },
    { 
      to: isReceiver ? "/receiver/notifications" : "/notifications", 
      icon: <Bell size={20} />, 
      label: "Alerts", 
      active: ['/notifications', '/receiver/notifications'].includes(location.pathname) 
    },
    { 
      to: "/profile", 
      icon: <User size={20} />, 
      label: "Profile", 
      active: location.pathname === '/profile' 
    }
  ];

  return (
    <footer className="floating-footer-wrapper">
      <div className="floating-footer-dock">
        <div className="dock-icons">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.to} 
              className={`dock-item ${item.active ? 'active' : ''}`}
            >
              <span className="dock-item-icon">{item.icon}</span>
              <span className="dock-item-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
