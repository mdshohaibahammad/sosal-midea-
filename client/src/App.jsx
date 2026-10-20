import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { LogOut, Home, Upload as UploadIcon, LayoutDashboard, Mail, Key } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        //轻量 auth check via server (optional); fallback to localStorage token
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return null;
  if (!token) return null;
  return children;
}

function Navbar() {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <NavLink to="/" className="text-xl font-bold flex items-center gap-2" end>
        <Home size={24} /> Social Poster
      </NavLink>
      <div className="flex gap-4 items-center">
        <NavLink to="/dashboard" className="hover:text-blue-200 transition">
          <LayoutDashboard size={22} /> Dashboard
        </NavLink>
        <NavLink to="/upload" className="hover:text-blue-200 transition">
          <UploadIcon size={22} /> Upload Video
        </NavLink>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition">Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}