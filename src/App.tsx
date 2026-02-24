import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { GenerateSignal } from './pages/GenerateSignal';
import { APIKeys } from './pages/APIKeys';
import { Forum } from './pages/Forum';
import { News } from './pages/News';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { AdminPanel } from './pages/AdminPanel';
import { AdminBootstrap } from './pages/AdminBootstrap';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { useTheme } from './hooks/useTheme';
import { useNotifications, ToastContainer } from './hooks/useNotifications';
import { SocketProvider, useSocket } from './hooks/useSocket';
import { safeJsonParse } from './utils/storage';

import { HowItWorks } from './pages/HowItWorks';
import { Providers } from './pages/Providers';

const SocketHandler = () => {
  const { socket } = useSocket();
  const { addToast } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', (data) => {
      addToast(data.type || 'system', data.text);
    });

    socket.on('notification:broadcast', (data) => {
      addToast('admin', data.text);
    });

    socket.on('signal:new', (data) => {
      addToast('signal', `Sinyal baru: ${data.pair} (${data.direction})`);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:broadcast');
      socket.off('signal:new');
    };
  }, [socket, addToast]);

  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('neural_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = safeJsonParse(localStorage.getItem('neural_user'), {});
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  useTheme(); // Initialize theme
  const { toasts, removeToast } = useNotifications();

  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen relative">
          <div className="scanline"></div>
          <LoadingScreen />
          <SocketHandler />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><LandingPage /></>} />
            <Route path="/how-it-works" element={<><Navbar /><HowItWorks /></>} />
            <Route path="/providers" element={<><Navbar /><Providers /></>} />
            <Route path="/login" element={<><Navbar /><LoginPage /></>} />
            <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
            <Route path="/admin/bootstrap" element={<AdminBootstrap />} />

            {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardHome /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/generate" element={
            <ProtectedRoute>
              <DashboardLayout><GenerateSignal /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/keys" element={
            <ProtectedRoute>
              <DashboardLayout><APIKeys /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/forum" element={
            <ProtectedRoute>
              <DashboardLayout><Forum /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/news" element={
            <ProtectedRoute>
              <DashboardLayout><News /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/notifications" element={
            <ProtectedRoute>
              <DashboardLayout><Notifications /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <DashboardLayout><Settings /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <DashboardLayout><AdminPanel /></DashboardLayout>
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  </SocketProvider>
);
}
