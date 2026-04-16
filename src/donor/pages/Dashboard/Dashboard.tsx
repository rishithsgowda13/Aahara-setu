import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { 
  BarChart3, TrendingDown, Package, CheckCircle2, 
  Leaf, Zap, Trophy, Award, MapPin, Medal, Star, Heart, ExternalLink, Download, Share2
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './Dashboard.css';
import '../KindnessHub/KindnessHub.css';
import { supabase } from '../../../lib/supabase';

const WEEKLY_DATA = [
  { day: 'Mon', meals: 45, kg: 22 },
  { day: 'Tue', meals: 72, kg: 36 },
  { day: 'Wed', meals: 38, kg: 19 },
  { day: 'Thu', meals: 95, kg: 48 },
  { day: 'Fri', meals: 81, kg: 40 },
  { day: 'Sat', meals: 110, kg: 55 },
  { day: 'Sun', meals: 67, kg: 33 },
];

const MAX_MEALS = Math.max(...WEEKLY_DATA.map(d => d.meals));

const HEATMAP_ZONES = [
  { name: 'Koramangala', waste: 88, demand: 25, type: 'surplus' },
  { name: 'Indiranagar', waste: 74, demand: 38, type: 'surplus' },
  { name: 'BTM Layout', waste: 12, demand: 94, type: 'demand' },
  { name: 'Jayanagar', waste: 28, demand: 82, type: 'demand' },
  { name: 'Whitefield', waste: 62, demand: 58, type: 'balanced' },
  { name: 'Hebbal', waste: 8, demand: 96, type: 'demand' },
];

interface Leader {
  rank: number;
  name: string;
  impact: string;
  pts: number;
  avatar: string;
  color: string;
  badge?: string;
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'analytics' | 'leaderboard' | 'certificates'>('analytics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);

  const stats = [
    { label: t('food_saved'), value: '452 kg', icon: <Package size={22} />, color: '#4F633D', trend: '+12%' },
    { label: t('meals_dist'), value: '1,280', icon: <BarChart3 size={22} />, color: '#8BA194', trend: '+8%' },
    { label: t('co2_reduced'), value: '3,200 kg', icon: <Leaf size={22} />, color: '#22c55e', trend: '+15%' },
    { label: 'Match Rate', value: '94%', icon: <CheckCircle2 size={22} />, color: '#f59e0b', trend: '+2%' },
    { label: 'Waste Reduced', value: '32%', icon: <TrendingDown size={22} />, color: '#3b82f6', trend: '+5%' },
    { label: 'Kindness Score', value: '210 pts', icon: <Trophy size={22} />, color: '#a855f7', trend: '+10' },
  ];

  const flowSteps = [
    { name: 'Upload', status: 'completed', count: 28 },
    { name: 'Match', status: 'completed', count: 26 },
    { name: 'Claim', status: 'active', count: 24 },
    { name: 'Pickup', status: 'pending', count: 22 },
    { name: 'Feedback', status: 'pending', count: 0 },
  ];

  const recentActivity = [
    { icon: '✅', text: 'Assorted Pastries claimed by Hope NGO', time: '5 mins ago', type: 'success' },
    { icon: '⚡', text: 'High priority: Paneer Tikka expiring in 45 mins', time: '10 mins ago', type: 'urgent' },
    { icon: '🔄', text: 'Auto-redistribution: Fruit Platters re-routed to Shelter B', time: '1 hr ago', type: 'fallback' },
    { icon: '🚚', text: 'Volunteer pickup confirmed for Biryani', time: '2 hrs ago', type: 'success' },
  ];

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('organization_name, kindness_score')
        .order('kindness_score', { ascending: false })
        .limit(5);

      const MOCK_LEADERS: Leader[] = [
        { rank: 1, name: "McDonald's - VVCE", impact: "12,450 meals", pts: 8500, avatar: "M", color: "#FFD700", badge: 'Golden Plate' },
        { rank: 2, name: "Taj Hotel - City Center", impact: "8,300 meals", pts: 6200, avatar: "T", color: "#C0C0C0", badge: 'Elite Circle' },
        { rank: 3, name: "KFC - Mall Road", impact: "5,120 meals", pts: 4100, avatar: "K", color: "#CD7F32", badge: 'Rising Star' },
        { rank: 4, name: "Akshaya Patra", impact: "4,200 meals", pts: 3800, avatar: "A", color: "#E2E8F0" },
        { rank: 5, name: "Doner King", impact: "3,100 meals", pts: 2900, avatar: "D", color: "#E2E8F0" },
      ];

      if (data && data.length > 0) {
        const colors = ["#FFD700", "#C0C0C0", "#CD7F32", "#E2E8F0", "#E2E8F0"];
        const badges = ["Golden Plate", "Elite Circle", "Rising Star"];
        const formatted = data.map((p, i) => ({
          rank: i + 1,
          name: p.organization_name || 'Anonymous Partner',
          impact: `${Math.floor(p.kindness_score * 1.5)} meals`,
          pts: p.kindness_score,
          avatar: (p.organization_name || 'A')[0],
          color: colors[i] || "#E2E8F0",
          badge: badges[i]
        }));
        setLeaders(formatted);
      } else {
        setLeaders(MOCK_LEADERS);
      }
    };

    fetchLeaders();
  }, [t]);

  const certificatesList = [
    { id: 'AS-2025-01', type: 'Platinum Sustainability', date: 'April 2025', desc: 'Offsets 3,200kg of CO₂' },
    { id: 'AS-2025-02', type: 'Community Hero', date: 'March 2025', desc: 'Fed 1,200 children' },
  ];

  const handleDownloadCert = async (certName: string) => {
    setIsGenerating(true);
    try {
      // Simulate rendering time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/certificates/base.png');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certName.replace(/\s+/g, '_')}_Aahara_Setu_Certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Fallback msg if translation key is missing
      const msg = t('cert_downloaded_msg');
      alert(msg !== 'cert_downloaded_msg' ? msg : 'Impact Certificate successfully downloaded!');
    } catch (e) {
      console.error(e);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title">{t('impact_dash')} <span className="gradient-text">Studio</span></h1>
        <p className="page-subtitle">{t('impact_dash_subtitle')}</p>
        
        <div className="dashboard-tabs-pills">
          <button 
            className={`tab-pill ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            {t('nav_dashboard')}
          </button>
          <button 
            className={`tab-pill ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            {t('global_leaderboard')}
          </button>
          <button 
            className={`tab-pill ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            {t('impact_certs')}
          </button>
        </div>
      </div>
      {activeTab === 'analytics' && (
        <div className="analytics-view animate-fade-in">
          <div className="kpi-grid">
            {stats.map((stat, i) => (
              <Card key={i} className="kpi-card">
                <div className="kpi-top-row">
                  <div className="kpi-icon-badge" style={{ background: stat.color + '15', borderColor: stat.color + '30', color: stat.color }}>
                    {stat.icon}
                  </div>
                  <span className="kpi-trend-pill" style={{ color: stat.color, background: stat.color + '10' }}>↑ {stat.trend}</span>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value-text">{stat.value}</div>
                  <div className="kpi-label-text">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="dashboard-main-row">
            <Card className="chart-card">
              <div className="chart-header">
                <h3>Weekly Redistribution</h3>
                <span className="tag-badge">Last 7 Days</span>
              </div>
              <div className="bar-chart">
                {WEEKLY_DATA.map((d, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar-tooltip">{d.meals} {t('meals_provided')}</div>
                    <div className="chart-bar" style={{ height: `${(d.meals / MAX_MEALS) * 100}%` }} />
                    <span className="bar-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flow-tracker-card">
              <h3>System Flow Tracker</h3>
              <p className="card-desc">Active redistribution status</p>
              <div className="flow-tracker">
                {flowSteps.map((step, i) => (
                  <div key={step.name} className="flow-track-step">
                    <div className={`flow-track-circle ${step.status}`}>
                      {step.status === 'completed' ? <CheckCircle2 size={16} /> :
                       step.status === 'active' ? <Zap size={16} /> : i + 1}
                    </div>
                    <div className="flow-track-info">
                      <span className="flow-track-name">{step.name}</span>
                      {step.count > 0 && <span className="flow-track-count">{step.count} items</span>}
                    </div>
                    {i < flowSteps.length - 1 && <div className={`flow-track-line ${step.status === 'completed' ? 'filled' : ''}`} />}
                  </div>
                ))}
              </div>
            </Card>
          </div>


          <Card className="activity-card" style={{ marginTop: '24px' }}>
            <div className="chart-header">
              <h3>Recent Activity</h3>
              <span className="tag-badge">Live Updates</span>
            </div>
            <div className="activity-list">
              {recentActivity.map((act, i) => (
                <div key={i} className={`activity-item activity-${act.type}`}>
                  <div className="activity-icon">{act.icon}</div>
                  <div className="activity-body">
                    <p className="activity-text">{act.text}</p>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="leaderboard-view kindness-hub" style={{ animation: 'fadeIn 0.5s ease' }}>
          <div className="top-three">
            {leaders.slice(0, 3).map((l) => (
              <Card key={l.rank} className={`top-card rank-${l.rank}`}>
                <div className="rank-badge">{l.rank === 1 ? <Trophy size={24} /> : <Medal size={20} />}</div>
                <div className="top-avatar" style={{ background: l.color }}>{l.avatar}</div>
                <h3>{l.name}</h3>
                <div className="badge-pill"><Star size={12} fill="currentColor" /> {l.badge}</div>
                <div className="top-stat"><Heart size={14} /> {l.pts} kindness pts</div>
                <p>{l.impact} shared</p>
                <div className="top-progress" />
              </Card>
            ))}
          </div>

          <Card className="leaderboard-table-card">
            <div className="table-header">
              <span># RANK</span><span>ORGANIZATION</span><span>KINDNESS SCORE</span><span>IMPACT (MEALS)</span><span>ACTION</span>
            </div>
            <div className="table-rows">
              {leaders.map((l) => (
                <div key={l.rank} className="table-row">
                  <span className="row-rank">{l.rank}</span>
                  <div className="row-name">
                    <div className="mini-avatar" style={{ background: l.color }}>{l.avatar}</div>
                    <div className="name-vitals"><strong>{l.name}</strong>{l.badge && <span className="mini-badge-txt">{l.badge}</span>}</div>
                  </div>
                  <span className="row-pts">{l.pts.toLocaleString()}</span>
                  <span className="row-impact">{l.impact}</span>
                  <div className="row-actions"><Button size="sm" variant="outline"><ExternalLink size={14} /></Button></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="certificates-view kindness-hub" style={{ animation: 'fadeIn 0.5s ease' }}>
          <div className="cert-header-row">
            <h2>Your Impact Journey</h2>
            <Button className="generate-report-btn" onClick={() => handleDownloadCert('2024_Impact_Report')} disabled={isGenerating}>
              <Download size={18} /> {isGenerating ? 'Generating...' : 'Generate 2024 Impact Report'}
            </Button>
          </div>
          <div className="cert-grid">
            {certificatesList.map(cert => (
              <Card key={cert.id} className="cert-card">
                <div className="cert-visual">
                  <div className="cert-logo">Aahara Setu</div>
                  <Award className="cert-icon" size={48} />
                  <div className="cert-id">{cert.id}</div>
                </div>
                <div className="cert-body">
                  <h4>{cert.type}</h4>
                  <p>{cert.desc}</p>
                  <div className="cert-meta">
                    <span>{cert.date}</span>
                    <div className="cert-btns">
                      <Button size="sm" variant="outline" onClick={() => alert('LinkedIn integration ready!')}><Share2 size={14} /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadCert(cert.type)}><Download size={14} /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
