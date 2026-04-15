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
      setAuthState({
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        userRole: localStorage.getItem('userType')
      });
    };
    window.addEventListener('storage', handleStorageChange);
    
    // We also need a way to trigger this locally since 'storage' event doesn't fire in the same tab
    const interval = setInterval(handleStorageChange, 500); 

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
      {showLoader && <Loader onComplete={() => setShowLoader(false)} />}
      <Router>
        {isAuthenticated && <Navbar />}
        <main style={{ padding: isAuthenticated ? '84px 24px 0' : '0', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : (userRole === 'donor' ? <Navigate to="/upload" /> : <Navigate to="/explore" />)} />

          {/* Root Gatekeeper */}
          <Route path="/" element={!isAuthenticated ? <Navigate to="/login" /> : (userRole === 'donor' ? <Navigate to="/upload" /> : <Navigate to="/explore" />)} />

          {/* Protected Routes */}
          <Route path="/explore" element={isAuthenticated ? <Explore /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/upload" element={isAuthenticated ? <Upload /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? (userRole === 'donor' ? <Dashboard /> : <Navigate to="/receiver" />) : <Navigate to="/login" />} />
          <Route path="/receiver" element={isAuthenticated ? <Receiver /> : <Navigate to="/login" />} />
          <Route path="/feedback" element={isAuthenticated ? <Feedback /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {isAuthenticated && <Toast messages={toasts} onRemove={removeToast} />}
    </Router>
    </>
  );
}

export default App;
