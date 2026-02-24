import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldAlert, Terminal, Lock, User, Mail } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { API_BASE_URL } from '../constants';

export const AdminBootstrap = () => {
  const [formData, setFormData] = useState({
    secret: '',
    username: 'superadmin',
    email: 'admin@neurai.io',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Bootstrap failed');
      }
      
      alert('Admin bootstrap successful! You can now login.');
      navigate('/login');
    } catch (error: any) {
      alert(error.message || 'Bootstrap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neural-black p-4 hexagon-grid">
      <div className="absolute inset-0 bg-neural-black/60"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <ShieldAlert className="w-16 h-16 text-neural-neon mx-auto mb-4" />
          <h1 className="text-2xl font-orbitron text-white tracking-[0.2em]">SYSTEM BOOTSTRAP</h1>
          <p className="text-neural-text/40 font-mono text-[10px] uppercase mt-2">Protocol-7 Root Initialization</p>
        </div>

        <Card className="border-t-4 border-t-neural-neon">
          <div className="flex items-center gap-2 mb-6 text-neural-neon font-mono text-xs">
            <Terminal className="w-4 h-4" />
            <span>ROOT ACCESS REQUIRED</span>
          </div>

          <form onSubmit={handleBootstrap} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-neural-text/60 mb-2 uppercase">Admin Secret</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                <Input
                  type="password"
                  placeholder="Enter ADMIN_SECRET"
                  className="pl-10"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-neural-text/60 mb-2 uppercase">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                  <Input
                    placeholder="superadmin"
                    className="pl-10"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-neural-text/60 mb-2 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neural-text/60 mb-2 uppercase">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                <Input
                  type="email"
                  placeholder="admin@neurai.io"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-4 mt-4" disabled={loading}>
              {loading ? 'INITIALIZING ROOT...' : 'BOOTSTRAP SYSTEM'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
