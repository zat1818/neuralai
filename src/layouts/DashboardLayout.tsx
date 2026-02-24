import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Zap, 
  History, 
  Key, 
  MessageSquare, 
  Newspaper, 
  Bell, 
  Settings, 
  ShieldAlert,
  LogOut,
  Hexagon,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../components/UI';
import { safeJsonParse } from '../utils/storage';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = safeJsonParse(localStorage.getItem('neural_user'), {});

  const handleLogout = () => {
    localStorage.removeItem('neural_token');
    localStorage.removeItem('neural_user');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Zap, label: 'Analisis', path: '/dashboard/generate' },
    { icon: History, label: 'Riwayat', path: '/dashboard/history' },
    { icon: Key, label: 'API Keys', path: '/dashboard/keys' },
    { icon: MessageSquare, label: 'Forum', path: '/dashboard/forum' },
    { icon: Newspaper, label: 'Berita', path: '/dashboard/news' },
    { icon: Bell, label: 'Notifikasi', path: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  if (user.role === 'admin') {
    menuItems.push({ icon: ShieldAlert, label: 'Admin Panel', path: '/dashboard/admin' });
  }

  return (
    <div className="min-h-screen bg-neural-black flex">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 w-full h-16 bg-neural-gray/80 backdrop-blur-md border-b border-neural-red/20 z-40 flex lg:hidden items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Hexagon className="w-6 h-6 text-neural-neon" />
          <span className="font-orbitron text-lg font-bold text-white tracking-tighter">NEURALAI</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neural-neon hover:bg-neural-red/10 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-neural-black border-r border-neural-red/20 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-neural-red/10 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <Hexagon className="w-8 h-8 text-neural-neon" />
                  <span className="font-orbitron text-xl font-bold text-white">NEURALAI</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-neural-text/40">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 font-orbitron text-xs uppercase tracking-widest transition-all group",
                      location.pathname === item.path 
                        ? "bg-neural-red/20 text-neural-neon border-r-2 border-neural-neon" 
                        : "text-neural-text/60 hover:text-neural-neon hover:bg-neural-red/5"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", location.pathname === item.path ? "text-neural-neon" : "text-neural-red/60 group-hover:text-neural-neon")} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-neural-red/10">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono text-neural-red hover:bg-neural-red/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> LOGOUT SYSTEM
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-neural-gray/50 border-r border-neural-red/20 z-30 hidden lg:flex flex-col">
        <div className="p-6 border-b border-neural-red/10">
          <Link to="/" className="flex items-center gap-2">
            <Hexagon className="w-8 h-8 text-neural-neon" />
            <span className="font-orbitron text-xl font-bold text-white">NEURALAI</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-orbitron text-xs uppercase tracking-widest transition-all group",
                location.pathname === item.path 
                  ? "bg-neural-red/20 text-neural-neon border-r-2 border-neural-neon" 
                  : "text-neural-text/60 hover:text-neural-neon hover:bg-neural-red/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", location.pathname === item.path ? "text-neural-neon" : "text-neural-red/60 group-hover:text-neural-neon")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neural-red/10">
          <div className="flex items-center gap-3 p-3 bg-neural-black/40 border border-neural-red/10 mb-4">
            <div className="w-8 h-8 rounded-full bg-neural-red/20 flex items-center justify-center text-neural-neon font-bold">
              {user.username?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.username}</p>
              <p className="text-[10px] font-mono text-neural-neon uppercase">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-mono text-neural-red hover:bg-neural-red/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> LOGOUT SYSTEM
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative min-h-screen pt-16 lg:pt-0">
        <div className="p-4 sm:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
