import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, MapPin, LayoutDashboard, Star, Bell, Target } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const userRole = localStorage.getItem('userType') || 'receiver'; // Default to receiver for testing
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
  ];

  if (userRole === 'receiver') {
    navLinks.push(
      { name: 'Explore', path: '/explore', icon: <MapPin size={18} /> },
      { name: 'Dashboard', path: '/receiver', icon: <Target size={18} /> },
      { name: 'Alerts', path: '/notifications', icon: <Bell size={18} /> },
      { name: 'Feedback', path: '/feedback', icon: <Star size={18} /> },
    );
  } else {
    // Donor links
    navLinks.push(
      { name: 'Donate', path: '/upload', icon: <Upload size={18} /> },
      { name: 'Impact', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Aahara Setu" className="navbar-logo-img" />
          <span className="logo-text">Aahara Setu</span>
        </Link>
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          {!isAuthenticated && (
            <Link to="/login" className="nav-login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
