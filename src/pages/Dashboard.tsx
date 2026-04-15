import React from 'react';
import { Card } from '../components/ui/Card';
import { BarChart3, TrendingDown, Package, CheckCircle2, Leaf, Zap, Trophy, MapPin, RefreshCw } from 'lucide-react';
import './Dashboard.css';

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
  { name: 'Koramangala', waste: 85, demand: 30, type: 'surplus' },
  { name: 'Indiranagar', waste: 70, demand: 45, type: 'surplus' },
  { name: 'BTM Layout', waste: 20, demand: 90, type: 'demand' },
  { name: 'Jayanagar', waste: 30, demand: 80, type: 'demand' },
  { name: 'Whitefield', waste: 65, demand: 55, type: 'balanced' },
  { name: 'Hebbal', waste: 10, demand: 95, type: 'demand' },
];

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Food Saved', value: '452 kg', icon: <Package size={22} />, color: '#4F633D', trend: '+12%' },
    { label: 'Meals Distributed', value: '1,280', icon: <BarChart3 size={22} />, color: '#8BA194', trend: '+8%' },
    { label: 'CO₂ Reduced', value: '3.2 T', icon: <Leaf size={22} />, color: '#22c55e', trend: '+15%' },
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title">Impact <span className="gradient-text">Dashboard</span></h1>
        <p className="page-subtitle">Real-time analytics for your contribution to the circular food economy.</p>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {stats.map((stat, i) => (
          <Card key={i} className="kpi-card">
            <div className="kpi-icon-row">
              <div className="kpi-icon" style={{ background: stat.color + '18', color: stat.color }}>
                {stat.icon}
              </div>
              <span className="kpi-trend" style={{ color: stat.color }}>↑ {stat.trend}</span>
            </div>
            <div className="kpi-value">{stat.value}</div>
            <div className="kpi-label">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Chart + Flow */}
      <div className="dashboard-main-row">
        <Card className="chart-card">
          <div className="chart-header">
            <h3>Weekly Redistribution</h3>
            <span className="tag-badge">Last 7 Days</span>
          </div>
          <div className="bar-chart">
            {WEEKLY_DATA.map((d, i) => (
              <div key={i} className="bar-col">
                <div className="bar-tooltip">{d.meals} meals</div>
                <div
                  className="chart-bar"
                  style={{ height: `${(d.meals / MAX_MEALS) * 100}%` }}
                />
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
                {i < flowSteps.length - 1 && (
                  <div className={`flow-track-line ${step.status === 'completed' ? 'filled' : ''}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flow-active-info glass">
            <Zap size={14} />
            <span><strong>Active:</strong> NGO claiming "Assorted Pastries" from Baskin &amp; Scones.</span>
          </div>
        </Card>
      </div>

      {/* Heatmap Section */}
      <Card className="heatmap-card">
        <div className="chart-header">
          <h3><MapPin size={18} /> Hunger vs Surplus Heatmap</h3>
          <span className="tag-badge">Live Zones</span>
        </div>
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-dot surplus" /> High Surplus
          </div>
          <div className="legend-item">
            <div className="legend-dot demand" /> High Demand
          </div>
          <div className="legend-item">
            <div className="legend-dot balanced" /> Balanced
          </div>
        </div>
        <div className="heatmap-zones">
          {HEATMAP_ZONES.map((zone, i) => (
            <div key={i} className={`heatmap-zone zone-${zone.type}`}>
              <div className="zone-name">{zone.name}</div>
              <div className="zone-bars">
                <div className="zone-bar-row">
                  <span className="zone-bar-lbl">Surplus</span>
                  <div className="zone-bar">
                    <div className="zone-bar-fill surplus-fill" style={{ width: `${zone.waste}%` }} />
                  </div>
                  <span className="zone-bar-val">{zone.waste}%</span>
                </div>
                <div className="zone-bar-row">
                  <span className="zone-bar-lbl">Demand</span>
                  <div className="zone-bar">
                    <div className="zone-bar-fill demand-fill" style={{ width: `${zone.demand}%` }} />
                  </div>
                  <span className="zone-bar-val">{zone.demand}%</span>
                </div>
              </div>
              <div className={`zone-action-badge ${zone.type}`}>
                {zone.type === 'demand' ? '🍽️ Needs Food' : zone.type === 'surplus' ? '📦 High Surplus' : '✅ Balanced'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Auto-Redistribution + Activity */}
      <div className="bottom-grid">
        <Card className="activity-card">
          <h3>Recent Activity</h3>
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

        <Card className="fallback-card">
          <div className="fallback-header">
            <RefreshCw size={18} />
            <h3>Auto Redistribution Stats</h3>
          </div>
          <p className="card-desc">Fallback system performance this week</p>
          <div className="fallback-stats">
            {[
              { label: 'Items Fallback-Triggered', val: '6' },
              { label: 'Shelters Notified', val: '12' },
              { label: 'Backup NGOs Alerted', val: '9' },
              { label: 'Recovery Rate', val: '91%' },
            ].map((s, i) => (
              <div key={i} className="fallback-stat">
                <div className="fallback-stat-val">{s.val}</div>
                <div className="fallback-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
