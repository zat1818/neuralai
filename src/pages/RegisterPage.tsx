import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, User, Mail, Lock, Terminal, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { api } from '../services/api';

export const RegisterPage = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await api.auth.register(formData);
      setStep('otp');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.auth.resendOtp({ email: formData.email });
      alert('Kode OTP baru telah dikirim ke email Anda.');
    } catch (error: any) {
      alert(error.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      alert('Silakan masukkan 6 digit kode OTP.');
      return;
    }
    
    setLoading(true);
    try {
      const response: any = await api.auth.verifyOtp({ email: formData.email, otp: otpCode });
      localStorage.setItem('neural_token', response.token);
      localStorage.setItem('neural_user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Verifikasi gagal. Silakan periksa kode OTP Anda.');
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
          <h1 className="text-xl font-orbitron text-neural-neon tracking-[0.2em]">ACCOUNT INITIALIZATION</h1>
        </div>

        <Card className="border-t-4 border-t-neural-red">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-2 mb-6 text-neural-neon font-mono text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>NEW OPERATOR ENROLLMENT</span>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs text-neural-text/60 mb-2 uppercase">Codename</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                      <Input
                        placeholder="OPERATOR_X"
                        className="pl-10"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-neural-text/60 mb-2 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red" />
                      <Input
                        type="email"
                        placeholder="name@provider.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-neural-text/60 mb-2 uppercase">Access Key</label>
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

                  <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                    {loading ? 'INITIALIZING...' : 'INISIALISASI AKUN'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="flex flex-col items-center mb-6">
                  <CheckCircle className="w-12 h-12 text-neural-neon mb-4" />
                  <h2 className="font-orbitron text-white text-lg">VERIFIKASI IDENTITAS</h2>
                  <p className="text-sm text-neural-text/60 mt-2">
                    Kode verifikasi telah dikirim ke <span className="text-neural-neon">{formData.email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2 mb-8">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 bg-neural-gray border border-neural-red/30 text-center font-mono text-xl text-neural-neon focus:outline-none focus:border-neural-neon"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                    />
                  ))}
                </div>

                <Button onClick={handleVerify} className="w-full py-3" disabled={loading}>
                  {loading ? 'VERIFYING...' : 'VERIFIKASI'}
                </Button>

                <div className="mt-6 flex flex-col gap-4">
                  <button 
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs font-mono text-neural-text/40 hover:text-neural-neon uppercase tracking-widest disabled:opacity-50"
                  >
                    Kirim Ulang Kode
                  </button>
                  
                  <button 
                    onClick={() => setStep('form')}
                    disabled={loading}
                    className="text-xs font-mono text-neural-red hover:text-neural-neon uppercase tracking-widest disabled:opacity-50"
                  >
                    Kembali ke Pendaftaran
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-neural-red/10 text-center">
            <p className="text-sm text-neural-text/60">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-neural-neon hover:underline">
                Akses Sistem
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
