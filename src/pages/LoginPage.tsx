import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Hexagon, Lock, Mail, Terminal } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { api } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response: any = await api.auth.login({ email, password });
      localStorage.setItem('neural_token', response.token);
      localStorage.setItem('neural_user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neural-black p-4 hexagon-grid">
      <div className="absolute inset-0 bg-neural-black/60"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Hexagon className="w-10 h-10 text-neural-neon" />
            <span className="font-orbitron text-2xl font-bold text-white">NEURALAI</span>
          </Link>
          <h1 className="text-xl font-orbitron text-neural-neon tracking-[0.2em]">SYSTEM ACCESS</h1>
        </div>

        <Card className="border-t-4 border-t-neural-red">
          <div className="flex items-center gap-2 mb-6 text-neural-neon font-mono text-xs">
            <Terminal className="w-4 h-4" />
            <span>PROTOCOL-7 AUTHENTICATION REQUIRED</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-mono text-xs text-neural-text/60 mb-2 uppercase tracking-widest">Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                <Input
                  type="email"
                  placeholder="name@neural.ai"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-neural-text/60 mb-2 uppercase tracking-widest">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'AKSES SISTEM'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-neural-red/10 text-center">
            <p className="text-sm text-neural-text/60">
              Belum punya akun?{' '}
              <Link to="/register" className="text-neural-neon hover:underline">
                Inisialisasi Akun
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-[10px] font-mono text-neural-text/30 uppercase tracking-[0.3em]">
            Unauthorized access is strictly prohibited.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
