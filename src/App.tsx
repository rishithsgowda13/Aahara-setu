import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './pages/Landing';
import { Explore } from './receiver/Explore';
import { Upload } from './pages/Upload';
import { Dashboard } from './pages/Dashboard';
import { Feedback } from './pages/Feedback';
import { Notifications } from './receiver/Notifications';
import { Receiver } from './receiver/Receiver';
import { ClaimView } from './receiver/ClaimView';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Toast } from './components/ui/Toast';
import { Loader } from './components/ui/Loader';
import type { ToastMessage } from './components/ui/Toast';
import './App.css';

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authState, setAuthState] = useState({
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    userRole: localStorage.getItem('userType')
  });
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Listen for storage changes (helpful for multi-tab or manual overrides)
    const handleStorageChange = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      const role = localStorage.getItem('userType');
      
      setAuthState(prev => {
        if (prev.isAuthenticated === isAuth && prev.userRole === role) {
          return prev; // No change, don't trigger re-render
        }
        return { isAuthenticated: isAuth, userRole: role };
      });
    };
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(handleStorageChange, 1000); 

    const t1 = setTimeout(() => {
      addToast('⚡ High Priority Alert', 'Paneer Tikka expiring in 45 mins — 0.4 km away!', 'warning');
    }, 3000);
    const t2 = setTimeout(() => {
      addToast('✅ Match Found', 'Assorted Pastries matched with Hope NGO nearby.', 'success');
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); window.removeEventListener('storage', handleStorageChange); };
  }, []);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const { isAuthenticated, userRole } = authState;

  return (
    <>
      {showLoader && !window.location.pathname.startsWith('/claim') && <Loader onComplete={() => setShowLoader(false)} />}
      <Router>
        {isAuthenticated && <Navbar />}
        <main style={{ padding: isAuthenticated ? '84px 24px 0' : '0', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
      {isAuthenticated && <Toast messages={toasts} onRemove={removeToast} />}
    </Router>
    </>
  );
}

export default App;
