import React, { useState } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Bell, BellOff, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Notifications.css';

interface Notification {
  id: string;
  type: 'urgent' | 'claim' | 'fallback' | 'low-network' | 'match';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'd1', type: 'urgent', title: '🚨 DISASTER ALERT: Flash Floods',
    message: 'Koramangala requires 500 meals immediately. Tap here to coordinate relief supplies.',
    time: '2 mins ago', read: false, icon: '🚨', link: '/disasters'
  },
  {
    id: 'd2', type: 'match', title: '🔗 New Match Found',
    message: 'Your Veg Dum Biryani has been matched with Hope NGO. Pickup vehicle #AS-09 dispatched.',
    time: '18 mins ago', read: false, icon: '🔗', link: '/traceability'
  },
  {
    id: 'd3', type: 'claim', title: '✅ Food Claimed Successfully',
    message: 'Your donation "KFC Fried Chicken Bucket" was claimed by Green Earth Shelter. Great work!',
    time: '1 hour ago', read: true, icon: '✅', link: '/traceability'
  },
  {
    id: 'd4', type: 'fallback', title: '🔄 Auto-Redistribution Triggered',
    message: 'Your Happy Meals batch matched a backup NGO. Delivery partner redirected automatically.',
    time: '2 hours ago', read: true, icon: '🔄', link: '/dashboard'
  },
  {
    id: 'd5', type: 'urgent', title: '🚨 EMERGENCY: Landslide Evacuation',
    message: 'Temporary relief camp established in Whitefield. Non-perishable food supplies requested.',
    time: '5 hours ago', read: true, icon: '🚨', link: '/disasters'
  },
  {
    id: 'd6', type: 'match', title: '🏆 Kindness Score Updated',
    message: 'You earned +10 Kindness Points! You are now ranked as a "Contributor 🌟". Keep it up!',
    time: 'Yesterday', read: true, icon: '🏆', link: '/profile'
  },
];

const TYPE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  urgent: { label: 'Urgent', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  match: { label: 'Match', bg: 'rgba(79,99,61,0.1)', color: '#4F633D' },
  claim: { label: 'Claimed', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  fallback: { label: 'Fallback', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  'low-network': { label: 'Network', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
};

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const { role } = useAuth();
  const isReceiver = role === 'receiver';

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string, link?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (link) {
       // Append receiver prefix if needed, though for traceability it's global
       if (link === '/explore') navigate(isReceiver ? '/receiver/explore' : '/dashboard');
       else navigate(link);
    }
  };
  const clearAll = () => setNotifications([]);

  return (
    <div className="notifications-page">
      <div className="notif-header">
        <div>
          <h1 className="page-title">Relay <span className="gradient-text">Center</span></h1>
          <p className="page-subtitle">Real-time circular redistribution intelligence.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="glass" size="sm" onClick={markAllRead}>
            <CheckCircle2 size={16} /> Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            <BellOff size={16} /> Clear All
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="notif-stats">
        {[
          { label: 'Urgent', val: notifications.filter(n => n.type === 'urgent').length, color: '#ef4444' },
          { label: 'Unread', val: unreadCount, color: 'var(--color-primary)' },
          { label: 'Auto-Rescues', val: notifications.filter(n => n.type === 'fallback').length, color: '#f59e0b' },
          { label: 'Verified Matches', val: notifications.filter(n => n.type === 'match').length, color: '#3b82f6' },
        ].map((s, i) => (
          <Card key={i} className="notif-stat-card hover-lift">
            <div className="notif-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="notif-stat-lbl">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="notif-filter-row">
        <div className="notif-filter-chips">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ALL REPORTS</button>
          <button className={`filter-chip ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>PENDING {unreadCount > 0 && `(${unreadCount})`}</button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="notif-list">
          {filtered.map(n => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.match;
            return (
              <Card
                key={n.id}
                className={`notif-card hover-lift ${!n.read ? 'unread' : ''}`}
                style={n.link ? { cursor: 'pointer' } : {}}
                onClick={() => markRead(n.id, n.link)}
              >
                <div className="notif-icon-col">
                  <div className="notif-icon" style={{ background: style.bg, color: style.color }}>
                    {n.icon}
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
                <div className="notif-body">
                  <div className="notif-top-row">
                    <span className="notif-type-badge" style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                    <span className="notif-time"><Clock size={12} /> {n.time}</span>
                  </div>
                  <h4 className="notif-title">{n.title}</h4>
                  <p className="notif-message">{n.message}</p>
                  
                  <div className="notif-action-row">
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="notif-empty">
          <Card className="notif-empty-card">
            <Bell size={48} className="empty-icon" />
            <h3 className="gradient-text">Spectrum Clear</h3>
            <p>Your redistribution feed is fully optimized. No pending alerts at this moment.</p>
            <Button variant="glass" onClick={() => setNotifications(MOCK_NOTIFICATIONS)}>RESET FEED</Button>
          </Card>
        </div>
      )}

  </div>
  );
};
