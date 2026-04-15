import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, LayoutDashboard, Star, Bell, Flame } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Donate', path: '/upload', icon: <Upload size={18} /> },
    { name: 'Disasters', path: '/disasters', icon: <Flame size={18} /> },
    { name: 'Alerts', path: '/notifications', icon: <Bell size={18} /> },
    { name: 'Profile', path: '/profile', icon: <Star size={18} /> },
  ];

  // Role-based logic can be implemented here

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/donor/logo.png" alt="Aahara Setu" className="navbar-logo-img" />
          <span className="logo-text">Aahara Setu</span>
        </Link>
        
        <div className="navbar-links">
          {navLinks
            .filter(l => l.name !== 'Profile')
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
        </div>

        <div className="navbar-actions">
          <Link to="/profile" className={`nav-link profile-btn ${location.pathname === '/profile' ? 'active' : ''}`}>
            <Star size={18} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
