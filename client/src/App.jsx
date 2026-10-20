import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Channels from './pages/Channels';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Sidebar from './components/Sidebar';
import EnterpriseHeader from './components/EnterpriseHeader';
import { Toaster } from 'react-hot-toast';

function AppLayout({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        console.error('Failed to load user', err);
      }
    };

    fetchMe();
  }, [token, navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <EnterpriseHeader user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children({ user, setUser })}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#0f172a',
            },
          },
        }}
      />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <AppLayout>
              {({ user }) => <Dashboard user={user} />}
            </AppLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              {({ user }) => <Dashboard user={user} />}
            </AppLayout>
          }
        />
        <Route
          path="/upload"
          element={
            <AppLayout>
              {() => <Upload />}
            </AppLayout>
          }
        />
        <Route
          path="/channels"
          element={
            <AppLayout>
              {() => <Channels />}
            </AppLayout>
          }
        />
        <Route
          path="/schedule"
          element={
            <AppLayout>
              {() => <Schedule />}
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              {({ user, setUser }) => (
                <Settings
                  user={user}
                  onProfileUpdate={(updated) => setUser(updated)}
                />
              )}
            </AppLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}