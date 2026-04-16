import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar } from './donor/components/layout/Navbar';
import { Footer } from './donor/components/layout/Footer';
import { Landing } from './donor/pages/Landing/Landing';
import { Upload } from './donor/pages/Upload/Upload';
import { Dashboard } from './donor/pages/Dashboard/Dashboard';
import { Notifications } from './donor/pages/Notifications/Notifications';
import { Profile } from './donor/pages/Profile/Profile';
import { Disasters } from './donor/pages/Disasters/Disasters';
import { Traceability } from './donor/pages/Traceability/Traceability';
import { Disasters as ReceiverDisasters } from './receiver/pages/Disasters/Disasters';
import { Traceability as ReceiverTraceability } from './receiver/pages/Traceability/Traceability';
import { Receiver } from './receiver/pages/Receiver/Receiver';
import { Explore as ReceiverExplore } from './receiver/pages/Explore';
import { Notifications as ReceiverNotifications } from './receiver/pages/Notifications';
import { ClaimView } from './receiver/pages/ClaimView';
import { Admin } from './pages/Admin';
import { Toast } from './donor/components/ui/Toast/Toast';
import { LanguageProvider } from './donor/context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './pages/Auth/Auth';
import type { ToastMessage } from './donor/components/ui/Toast/Toast';
import './donor/styles/App.css';

function AppContent() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Auth Redirects
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }

    if (isAuthenticated) {
      const isReceiverAllowed = location.pathname.startsWith('/receiver') || 
                                ['/profile', '/traceability', '/disasters', '/'].includes(location.pathname);
      
      if (role === 'receiver' && !isReceiverAllowed) {
        navigate('/');
      }
      if (role === 'donor' && location.pathname.startsWith('/receiver')) {
        navigate('/');
      }
      if (role === 'admin' && location.pathname !== '/admin') {
        navigate('/admin');
      }
    }

    // Disable demo notifications on the Landing/Login page
    if (location.pathname === '/' || location.pathname === '/login') {
      if (toasts.length > 0) setToasts([]);
      return;
    }

    // Demo notifications: Only show once per session/browser
    const seen = JSON.parse(localStorage.getItem('seen_demo_notifications') || '[]');
    let t1: any;
    let t2: any;

    if (!seen.includes('alert_demo')) {
      t1 = setTimeout(() => {
        addToast('⚡ High Priority Alert', 'Paneer Tikka expiring in 45 mins — 0.4 km away!', 'warning');
        seen.push('alert_demo');
        localStorage.setItem('seen_demo_notifications', JSON.stringify(seen));
      }, 3000);
    }

    if (!seen.includes('match_demo')) {
      t2 = setTimeout(() => {
        addToast('✅ Match Found', 'Assorted Pastries matched with Hope NGO nearby.', 'success');
        seen.push('match_demo');
        localStorage.setItem('seen_demo_notifications', JSON.stringify(seen));
      }, 8000);
    }

    return () => { if (t1) clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [location.pathname]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isAuthPage = location.pathname === '/login';
  const showFooter = !isAuthPage;

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main style={{ 
        padding: isAuthPage ? '0' : '82px 24px 0', 
        maxWidth: isAuthPage ? 'none' : '1200px', 
        margin: '0 auto', 
        minHeight: '80vh' 
      }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/disasters" element={role === 'receiver' ? <ReceiverDisasters /> : <Disasters />} />
          <Route path="/traceability" element={role === 'receiver' ? <ReceiverTraceability /> : <Traceability />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Receiver Routes */}
          <Route path="/receiver" element={<Receiver />} />
          <Route path="/receiver/explore" element={<ReceiverExplore />} />
          <Route path="/receiver/notifications" element={<ReceiverNotifications />} />
          <Route path="/receiver/claim/:id" element={<ClaimView />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Auth />} />
          <Route path="*" element={<div style={{ padding: '40px', textAlign: 'center' }}><h2>404: Page Not Found</h2><Link to="/">Go Home</Link></div>} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <Toast messages={toasts} onRemove={removeToast} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
