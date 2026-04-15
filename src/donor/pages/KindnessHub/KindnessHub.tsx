import React, { useState } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { 
  Trophy, Medal, Star, Heart, Award, Share2, 
  Download, ExternalLink, Globe
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './KindnessHub.css';

export const KindnessHub: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'certificates'>('leaderboard');
  const [isGenerating, setIsGenerating] = useState(false);

  const leaders = [
    { rank: 1, name: "McDonald's - VVCE", impact: "12,450 meals", pts: 8500, avatar: "M", color: "#FFD700", badge: 'Golden Plate' },
    { rank: 2, name: "Taj Hotel - City Center", impact: "8,300 meals", pts: 6200, avatar: "T", color: "#C0C0C0", badge: 'Elite Circle' },
    { rank: 3, name: "KFC - Mall Road", impact: "5,120 meals", pts: 4100, avatar: "K", color: "#CD7F32", badge: 'Rising Star' },
    { rank: 4, name: "Akshaya Patra", impact: "4,200 meals", pts: 3800, avatar: "A", color: "#E2E8F0" },
    { rank: 5, name: "Doner King", impact: "3,100 meals", pts: 2900, avatar: "D", color: "#E2E8F0" },
  ];

  const certificatesList = [
    { id: 'AS-2025-01', type: 'Platinum Sustainability', date: 'April 2025', desc: 'Offsets 3,200kg of CO₂' },
    { id: 'AS-2025-02', type: 'Community Hero', date: 'March 2025', desc: 'Fed 1,200 children' },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Generating High-Resolution Impact Certificate... Your 2024 Summary is ready for LinkedIn!');
    }, 2000);
  };

  return (
    <div className="kindness-hub">
      <div className="hub-hero">
        <div className="hero-text">
          <h1>{t('kindness_hub_title')}</h1>
          <p>Celebrating the heroes making zero-hunger a reality, one meal at a time.</p>
        </div>
        <div className="hub-tabs">
          <button 
            className={`hub-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={18} /> {t('global_leaderboard')}
          </button>
          <button 
            className={`hub-tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={18} /> {t('impact_certs')}
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <div className="leaderboard-view">
          <div className="top-three">
            {leaders.slice(0, 3).map((l) => (
              <Card key={l.rank} className={`top-card rank-${l.rank}`}>
                <div className="rank-badge">
                  {l.rank === 1 ? <Trophy size={24} /> : <Medal size={20} />}
                </div>
                <div className="top-avatar" style={{ background: l.color }}>{l.avatar}</div>
                <h3>{l.name}</h3>
                <div className="badge-pill">
                  <Star size={12} fill="currentColor" /> {l.badge}
                </div>
                <div className="top-stat">
                  <Heart size={14} /> {l.pts} kindness pts
                </div>
                <p>{l.impact} shared</p>
                <div className="top-progress" />
              </Card>
            ))}
          </div>

          <Card className="leaderboard-table-card">
            <div className="table-header">
              <span># RANK</span>
              <span>ORGANIZATION</span>
              <span>KINDNESS SCORE</span>
              <span>IMPACT (MEALS)</span>
              <span>ACTION</span>
            </div>
            <div className="table-rows">
              {leaders.map((l) => (
                <div key={l.rank} className="table-row">
                  <span className="row-rank">{l.rank}</span>
                  <div className="row-name">
                    <div className="mini-avatar" style={{ background: l.color }}>{l.avatar}</div>
                    <div className="name-vitals">
                      <strong>{l.name}</strong>
                      {l.badge && <span className="mini-badge-txt">{l.badge}</span>}
                    </div>
                  </div>
                  <span className="row-pts">{l.pts.toLocaleString()}</span>
                  <span className="row-impact">{l.impact}</span>
                  <div className="row-actions">
                    <Button size="sm" variant="outline"><ExternalLink size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="certificates-view">
          <div className="cert-header-row">
            <h2>Your Impact Journey</h2>
            <Button 
              className="generate-report-btn" 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              <Download size={18} /> {isGenerating ? 'Generating...' : 'Generate 2024 Impact Report'}
            </Button>
          </div>
          <div className="cert-grid">
            {/* ... certificates mapping already in file ... */}

            {certificatesList.map(cert => (
              <Card key={cert.id} className="cert-card">
                <div className="cert-visual">
                  <div className="cert-logo">Aahara Setu</div>
                  <Award size={48} className="cert-icon" />
                  <div className="cert-id">{cert.id}</div>
                </div>
                <div className="cert-body">
                  <h4>{cert.type}</h4>
                  <p>{cert.desc}</p>
                  <div className="cert-meta">
                    <span>Issued: {cert.date}</span>
                    <div className="cert-btns">
                      <Button size="sm" variant="outline" onClick={() => alert('Certificate downloaded as PNG.')}><Download size={14} /></Button>
                      <Button size="sm" variant="outline"><Share2 size={14} /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="cert-placeholder">
              <Star size={32} />
              <p>Donate 500 more meals to unlock the <strong>"Zero Hunger Champion"</strong> certificate.</p>
              <div className="placeholder-progress">
                <div className="p-fill" style={{ width: '65%' }} />
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="hub-footer glass">
        <Globe size={18} />
        <span>Join <strong>450+ organizations</strong> competing to reduce food waste in Southern India.</span>
        <Button variant="primary" size="sm" style={{ marginLeft: 'auto' }}>View Region: Bangalore</Button>
      </div>
    </div>
  );
};
