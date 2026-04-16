import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Toast.css';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  link?: string;
}

export const Toast: React.FC<{ messages: ToastMessage[], onRemove: (id: string) => void }> = ({ messages, onRemove }) => {
  const navigate = useNavigate();

  return (
    <div className="toast-container">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`toast-item glass toast-${msg.type} ${msg.link ? 'clickable' : ''}`}
          onClick={() => {
            if (msg.link) {
              navigate(msg.link);
              onRemove(msg.id);
            }
          }}
          style={msg.link ? { cursor: 'pointer' } : {}}
        >
          <div className="toast-icon">
            {msg.type === 'info' && <Bell size={18} />}
            {msg.type === 'success' && <CheckCircle size={18} />}
            {msg.type === 'warning' && <AlertTriangle size={18} />}
          </div>
          <div className="toast-content">
            <h4 className="toast-title">{msg.title}</h4>
            <p className="toast-body">{msg.message}</p>
          </div>
          <button className="toast-close" onClick={(e) => { e.stopPropagation(); onRemove(msg.id); }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
