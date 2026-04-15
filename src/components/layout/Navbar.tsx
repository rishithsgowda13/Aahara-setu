import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, MapPin, LayoutDashboard, Star, Bell, LogIn, LogOut } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(localStorage.getItem('userRole'));

  useEffect(() => {
    const handleAuthChange = () => setRole(localStorage.getItem('userRole'));
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setRole(null);
    window.dispatchEvent(new Event('authChange'));
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} />, show: true },
    { name: 'Explore', path: '/explore', icon: <MapPin size={18} />, show: role !== 'donor' },
    { name: 'Donate', path: '/upload', icon: <Upload size={18} />, show: role !== 'receiver' },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, show: true },
    { name: 'Alerts', path: '/notifications', icon: <Bell size={18} />, show: true },
    { name: 'Feedback', path: '/feedback', icon: <Star size={18} />, show: true },
  ].filter(link => link.show);

  const isLoginPage = location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Aahar Setu" className="navbar-logo-img" />
          <span className="navbar-brand-text">Aahar Setu</span>
        </Link>
        <div className="navbar-links">
          {!isLoginPage && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          {!isLoginPage && !role && (
            <Link to="/login" className="nav-link nav-login-btn">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
          {!isLoginPage && role && (
            <button onClick={handleLogout} className="nav-link nav-login-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
