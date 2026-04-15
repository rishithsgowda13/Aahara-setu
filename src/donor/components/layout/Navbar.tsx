import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, LayoutDashboard, Star, Bell, Flame, Radio, Globe } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const location = useLocation();


  const donorLinks = [
    { name: t('nav_home'), path: '/', icon: <Home size={18} /> },
    { name: t('nav_dashboard'), path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: t('nav_traceability'), path: '/traceability', icon: <Radio size={18} /> },
    { name: t('nav_donate'), path: '/upload', icon: <Upload size={18} /> },
    { name: t('nav_disasters'), path: '/disasters', icon: <Flame size={18} /> },
    { name: t('nav_alerts'), path: '/notifications', icon: <Bell size={18} /> },
    { name: t('nav_profile'), path: '/profile', icon: <Star size={18} /> },
  ];

  const receiverLinks = [
    { name: t('nav_home'), path: '/', icon: <Home size={18} /> },
    { name: 'Dashboard', path: '/receiver', icon: <LayoutDashboard size={18} /> },
    { name: 'Explore Food', path: '/receiver/explore', icon: <Globe size={18} /> },
    { name: t('nav_traceability'), path: '/traceability', icon: <Radio size={18} /> },
    { name: t('nav_disasters'), path: '/disasters', icon: <Flame size={18} /> },
    { name: t('nav_alerts'), path: '/receiver/notifications', icon: <Bell size={18} /> },
    { name: 'Profile', path: '/profile', icon: <Star size={18} /> },
  ];

  const links = role === 'receiver' ? receiverLinks : donorLinks;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/donor/logo.png" alt="Aahara Setu" className="navbar-logo-img" />
          <span className="logo-text">Aahara Setu</span>
        </Link>
        
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''} ${link.path === '/upload' ? 'donate-pill' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          
        </div>
      </div>
    </nav>
  );
};
