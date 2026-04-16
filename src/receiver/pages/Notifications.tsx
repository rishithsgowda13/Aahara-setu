import React, { useState } from 'react';
import { Card } from '../../donor/components/ui/Card/Card';
import { Button } from '../../donor/components/ui/Button/Button';
import { Bell, BellOff, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Notifications.css';

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
    id: 'r1', type: 'urgent', title: '⚡ High Priority Food Alert',
    message: 'Paneer Butter Masala (20 portions) from Haldiram\'s is expiring in 45 mins — 0.4 km away! Claim now.',
    time: '2 mins ago', read: false, icon: '⚡', link: '/receiver/explore'
  },
  {
    id: 'r2', type: 'match', title: '🔗 Algorithmic Match Found',
    message: 'You have been automatically matched with Veg Dum Biryani from Taj Hotel based on your demand tag.',
    time: '18 mins ago', read: false, icon: '🔗', link: '/traceability'
  },
  {
    id: 'r3', type: 'claim', title: '🚚 Volunteer Dispatched',
    message: 'Logistics partner #AS-09 has picked up your claim of Assorted Pastries. Eta: 12 minutes.',
    time: '1 hour ago', read: true, icon: '🚚', link: '/receiver'
  },
  {
    id: 'r4', type: 'fallback', title: '🔄 Surplus Rerouted to You',
    message: 'McDonald\'s Happy Meals match failed for the primary NGO. As the closest backup, this is now available to you.',
    time: '2 hours ago', read: true, icon: '🔄', link: '/receiver/explore'
  },
  {
    id: 'r5', type: 'urgent', title: '🚨 DISASTER LOGISTICS: Flash Floods',
    message: 'Your NGO is within the 10km relief radius. Can you accept 300 non-perishable survival kits?',
    time: '3 hours ago', read: false, icon: '🚨', link: '/receiver/disasters'
  },
  {
    id: 'r6', type: 'low-network', title: '📶 SMS Fallback Activated',
    message: 'Low connectivity detected in your area. SMS alerts enabled for critical claim updates.',
    time: '5 hours ago', read: true, icon: '📶'
  },
  {
    id: 'r7', type: 'claim', title: '✅ Proof Verified',
    message: 'The administrative team has verified your utilization photos for Batch #9982. Thank you!',
    time: 'Yesterday', read: true, icon: '✅'
  },
];

const TYPE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  urgent: { label: 'Urgent', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  match: { label: 'Match', bg: 'rgba(79,99,61,0.1)', color: '#4F633D' },
  claim: { label: 'Logistics', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  fallback: { label: 'Rerouted', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  'low-network': { label: 'Network', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
};

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);
  
  const markRead = (id: string, link?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (link) {
      navigate(link);
    }
  };

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
                    {n.type === 'urgent' && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); showToast('Coordinates shared! Logistics volunteer dispatched.'); }}>
                        COORDINATE PICKUP
                      </Button>
                    )}
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
    {toastMessage && (
      <div style={{
        position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--color-primary)', color: 'white', padding: '16px 32px', borderRadius: '100px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10000, fontWeight: 700
      }}>
        ✨ {toastMessage}
      </div>
    )}
  </div>
  );
};
