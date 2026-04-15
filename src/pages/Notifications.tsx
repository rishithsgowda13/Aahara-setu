import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, BellOff, Zap, CheckCircle2, Clock, RefreshCw, MapPin, Wifi } from 'lucide-react';
import './Notifications.css';

interface Notification {
  id: string;
  type: 'urgent' | 'claim' | 'fallback' | 'low-network' | 'match';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1', type: 'urgent', title: '⚡ High Priority Food Alert',
    message: 'Paneer Tikka (20 portions) from Skyline Banquets is expiring in 45 mins — 0.4 km away!',
    time: '2 mins ago', read: false, icon: '⚡'
  },
  {
    id: '2', type: 'match', title: '🔗 New Match Found',
    message: 'Vegetable Biryani from Heritage Heights has been matched with Hope NGO. Pickup in progress.',
    time: '18 mins ago', read: false, icon: '🔗'
  },
  {
    id: '3', type: 'claim', title: '✅ Food Claimed Successfully',
    message: 'Your donation "Assorted Gourmet Pastries" was claimed by Green NGO. Great work!',
    time: '1 hour ago', read: true, icon: '✅'
  },
  {
    id: '4', type: 'fallback', title: '🔄 Auto-Redistribution Triggered',
    message: 'Mixed Fruit Platters were unclaimed. We have notified 3 backup NGOs and 2 shelters automatically.',
    time: '2 hours ago', read: true, icon: '🔄'
  },
  {
    id: '5', type: 'urgent', title: '⚡ Urgent: Food Expiring Soon',
    message: 'Fresh Salad Bowls from Green Leaf Cafe expire in 1 hour — only 2.5km away. Claim now!',
    time: '3 hours ago', read: false, icon: '⚡'
  },
  {
    id: '6', type: 'low-network', title: '📶 SMS Fallback Activated',
    message: 'Low connectivity detected in your area. SMS alerts enabled for critical food notifications.',
    time: '5 hours ago', read: true, icon: '📶'
  },
  {
    id: '7', type: 'match', title: '🏆 Kindness Score Updated',
    message: 'You earned +10 Kindness Points! You are now ranked as a "Contributor 🌟". Keep it up!',
    time: 'Yesterday', read: true, icon: '🏆'
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

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAll = () => setNotifications([]);

  return (
    <div className="notifications-page">
      <div className="notif-header">
        <div>
          <h1 className="page-title">Alerts & <span className="gradient-text">Notifications</span></h1>
          <p className="page-subtitle">Real-time updates on food availability, claims, and redistribution.</p>
        </div>
        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <div className="unread-badge">
              <Bell size={15} /> {unreadCount} unread
            </div>
          )}
          <Button variant="glass" size="sm" onClick={markAllRead}>
            <CheckCircle2 size={15} /> Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="notif-stats">
        {[
          { icon: <Zap size={18} />, label: 'Urgent Alerts', val: notifications.filter(n => n.type === 'urgent').length, color: '#ef4444' },
          { icon: <Bell size={18} />, label: 'Unread', val: unreadCount, color: '#4F633D' },
          { icon: <RefreshCw size={18} />, label: 'Auto-Fallbacks', val: notifications.filter(n => n.type === 'fallback').length, color: '#f59e0b' },
          { icon: <CheckCircle2 size={18} />, label: 'Claims Confirmed', val: notifications.filter(n => n.type === 'claim').length, color: '#22c55e' },
        ].map((s, i) => (
          <Card key={i} className="notif-stat-card">
            <div className="notif-stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="notif-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="notif-stat-lbl">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="notif-filter-row">
        <div className="notif-filter-chips">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-chip ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
        </div>
        {notifications.length > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>
            <BellOff size={14} /> Clear All
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="notif-list">
          {filtered.map(n => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.match;
            return (
              <Card
                key={n.id}
                className={`notif-card ${!n.read ? 'unread' : ''} notif-type-${n.type}`}
                onClick={() => markRead(n.id)}
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
                  {n.type === 'urgent' && (
                    <div className="notif-action-row">
                      <Button size="sm">
                        <MapPin size={14} /> Claim Now
                      </Button>
                    </div>
                  )}
                  {n.type === 'fallback' && (
                    <div className="notif-fallback-info">
                      <Wifi size={12} />
                      <span>SMS alerts sent to 3 backup NGOs</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="notif-empty">
          <Card className="notif-empty-card">
            <BellOff size={48} className="empty-icon" />
            <h3>You're all caught up!</h3>
            <p>No notifications at the moment. We'll alert you when new food becomes available nearby.</p>
          </Card>
        </div>
      )}
    </div>
  );
};
