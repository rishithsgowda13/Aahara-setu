import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Camera, Share2, Code } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-logo">Aahara <span className="gradient-text">Setu</span></h3>
            <p className="footer-tagline">
              Connecting surplus with social need. Building a zero-waste future for India's food ecosystem through real-time urgency matching and verified trust.
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon"><Share2 size={20} /></a>
              <a href="#" className="social-icon"><Camera size={20} /></a>
              <a href="#" className="social-icon"><Code size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/explore">Claim Food</Link>
            <Link to="/upload">Donate Surplus</Link>
            <Link to="/dashboard">Impact Matrix</Link>
            <Link to="/profile">Profile Hub</Link>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <Link to="#">Food Safety Guide</Link>
            <Link to="#">NGO Partner Kit</Link>
            <Link to="#">Volunteer Program</Link>
            <Link to="#">API Documentation</Link>
          </div>

          <div className="footer-newsletter">
            <h4>Join the Revolution</h4>
            <p>Get weekly updates on regional food rescue impact.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="footer-input" />
              <button className="footer-submit-btn">JOIN</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © 2026 Aahara Setu. Built with <Heart size={14} fill="currentColor" /> in Bengaluru.
          </div>
          <div className="footer-legal">
            <a href="#"><Shield size={14} /> Safety Standards</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
