import { useEffect, useState } from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export const BlockedPage = () => {
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>('Pelanggaran kebijakan penggunaan');

  useEffect(() => {
    // Ambil alasan ban dari localStorage jika ada
    const storedReason = localStorage.getItem('neural_ban_reason');
    if (storedReason) setReason(storedReason);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('neural_token');
    localStorage.removeItem('neural_user');
    localStorage.removeItem('neural_ban_reason');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neural-black flex items-center justify-center p-4">
      <div className="scanline"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        {/* Glitch Icon */}
        <div className="relative inline-block mb-8">
          <ShieldAlert className="w-24 h-24 text-neural-neon mx-auto" />
          <motion.div
            animate={{ opacity: [1, 0, 1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0"
          >
            <ShieldAlert className="w-24 h-24 text-neural-red mx-auto" style={{ transform: 'translate(2px, -2px)' }} />
          </motion.div>
        </div>

        <div className="border border-neural-red/40 bg-neural-red/5 p-8 mb-6">
          <p className="font-mono text-[10px] text-neural-neon uppercase tracking-widest mb-4 animate-pulse">
            ⚠ AKSES DITOLAK — PROTOCOL-7 SECURITY
          </p>
          <h1 className="text-3xl font-orbitron text-white mb-4 uppercase tracking-widest">
            AKUN DIBANNED
          </h1>
          <p className="text-neural-text/60 font-mono text-sm mb-6">
            Akun Anda telah dinonaktifkan oleh administrator sistem.
          </p>
          
          <div className="bg-neural-black/60 border border-neural-red/20 p-4 mb-6">
            <p className="text-[10px] font-mono text-neural-text/40 uppercase mb-2">Alasan:</p>
            <p className="text-neural-neon font-mono text-sm">{reason}</p>
          </div>

          <div className="space-y-3 text-xs font-mono text-neural-text/50 text-left">
            <p>• Jika Anda merasa ini adalah kesalahan, hubungi administrator.</p>
            <p>• Akun yang dibanned tidak dapat mengakses layanan NeuralAI.</p>
            <p>• Semua data Anda tetap tersimpan selama masa ban.</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto px-6 py-3 border border-neural-red/40 text-neural-red hover:bg-neural-red/10 transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          KELUAR DARI SISTEM
        </button>

        <p className="mt-6 text-[10px] font-mono text-neural-text/20">
          NeuralAI Protocol-7 Security System v2.0
        </p>
      </motion.div>
    </div>
  );
};
