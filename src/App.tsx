import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Navbar } from './donor/components/layout/Navbar';
import { Footer } from './donor/components/layout/Footer';
import { Landing } from './donor/pages/Landing/Landing';
import { Upload } from './donor/pages/Upload/Upload';
import { Dashboard } from './donor/pages/Dashboard/Dashboard';
import { Notifications } from './donor/pages/Notifications/Notifications';
import { Profile } from './donor/pages/Profile/Profile';
import { Disasters } from './donor/pages/Disasters/Disasters';
import { Traceability } from './donor/pages/Traceability/Traceability';
import { KindnessHub } from './donor/pages/KindnessHub/KindnessHub';
import { Toast } from './donor/components/ui/Toast/Toast';
import { LanguageProvider } from './donor/context/LanguageContext';
import type { ToastMessage } from './donor/components/ui/Toast/Toast';
import './donor/styles/App.css';

function AppContent() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const location = useLocation();

  useEffect(() => {
    const t1 = setTimeout(() => {
      addToast('⚡ High Priority Alert', 'Paneer Tikka expiring in 45 mins — 0.4 km away!', 'warning');
    }, 3000);
    const t2 = setTimeout(() => {
      addToast('✅ Match Found', 'Assorted Pastries matched with Hope NGO nearby.', 'success');
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showFooter = location.pathname === '/' || location.pathname === '/profile';

  return (
    <>
      <Navbar />
      <main style={{ padding: '120px 24px 0', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/disasters" element={<Disasters />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/kindness-hub" element={<KindnessHub />} />
          <Route path="/notifications" element={<Notifications />} />
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
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
