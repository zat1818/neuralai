import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Hexagon, Bell, LogIn, UserPlus } from 'lucide-react';
import { Button } from './UI';

export const Navbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="sticky top-0 z-40 w-full bg-neural-black/80 backdrop-blur-md border-b border-neural-red/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Hexagon className="w-8 h-8 text-neural-neon group-hover:rotate-90 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">AI</span>
              </div>
            </div>
            <span className="font-orbitron text-xl font-bold tracking-tighter text-white">
              NEURAL<span className="text-neural-neon">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/">Beranda</NavLink>
            <NavLink to="/how-it-works">Cara Kerja</NavLink>
            <NavLink to="/providers">AI Provider</NavLink>
            <NavLink to="/forum">Forum</NavLink>
            <NavLink to="/news">Berita</NavLink>
          </div>

          <div className="flex items-center gap-4">
            {isDashboard ? (
              <button className="relative p-2 text-neural-text hover:text-neural-neon transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neural-neon rounded-full"></span>
              </button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="font-orbitron text-xs uppercase tracking-widest text-neural-text hover:text-neural-neon transition-colors relative group"
  >
    {children}
    <motion.span
      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neural-neon transition-all duration-300 group-hover:w-full"
    />
  </Link>
);
