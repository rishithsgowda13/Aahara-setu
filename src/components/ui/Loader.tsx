import React, { useEffect, useState } from 'react';
import './Loader.css';

export const Loader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start the exit fade-out animation after 2.4 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2400);

    // Physically unmount component after the CSS transition finishes
    const removeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`immersive-loader-overlay ${isFading ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <div className="logo-container">
          {/* Pulsing energetic rings behind the logo */}
          <div className="glow-ring ring-1"></div>
          <div className="glow-ring ring-2"></div>
          <img src="/logo.png" alt="Aahara Setu" className="loader-logo" />
        </div>
        
        <div className="text-container">
          <h1 className="loader-title">Aahara Setu</h1>
          <div className="loader-subtitle">
            <span>Connecting Surplus</span>
            <span className="dot">•</span>
            <span>Feeding Lives</span>
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};
