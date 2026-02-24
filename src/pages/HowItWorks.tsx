import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Card, Button } from '../components/UI';
import { Shield, Zap, Key, Cpu, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-neural-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl mb-6"
          >
            OPERATIONAL PROTOCOL
          </motion.h1>
          <p className="text-neural-text/60 max-w-2xl mx-auto font-rajdhani text-lg">
            Bagaimana NeuralAI mendominasi pasar menggunakan integrasi Neural Core Protocol-7.
          </p>
        </div>

        <div className="space-y-24">
          <ProtocolStep 
            number="01" 
            title="ENROLLMENT & AUTHENTICATION" 
            desc="Setiap operator harus mendaftarkan identitas mereka dalam sistem NeuralAI. Proses ini gratis dan memberikan akses ke infrastruktur dasar Protocol-7."
            icon={<Shield className="w-12 h-12" />}
            image="https://picsum.photos/seed/auth/600/400"
          />
          <ProtocolStep 
            number="02" 
            title="NEURAL CORE INTEGRATION" 
            desc="Pilih dari 9 provider AI terkemuka. Anda memegang kendali penuh atas model yang digunakan. Hubungkan API key Anda untuk mengaktifkan pemrosesan sinyal."
            icon={<Cpu className="w-12 h-12" />}
            image="https://picsum.photos/seed/core/600/400"
            reverse
          />
          <ProtocolStep 
            number="03" 
            title="SIGNAL GENERATION" 
            desc="NeuralAI memproses data pasar real-time melalui model AI pilihan Anda. Menggunakan algoritma SMC (Smart Money Concepts) dan ICT untuk akurasi maksimal."
            icon={<Zap className="w-12 h-12" />}
            image="https://picsum.photos/seed/signal/600/400"
          />
          <ProtocolStep 
            number="04" 
            title="MARKET DOMINATION" 
            desc="Eksekusi sinyal dengan presisi tinggi. Pantau performa Anda melalui dashboard intelijen dan berdiskusi dengan operator lain di forum."
            icon={<Target className="w-12 h-12" />}
            image="https://picsum.photos/seed/domination/600/400"
            reverse
          />
        </div>

        <div className="mt-24 text-center">
          <Card className="max-w-3xl mx-auto py-12 bg-neural-red/5 border-neural-red/30">
            <h2 className="text-2xl mb-6">SIAP UNTUK MEMULAI?</h2>
            <Link to="/register">
              <Button className="px-12 py-4 text-lg">INISIALISASI SEKARANG</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProtocolStep = ({ number, title, desc, icon, image, reverse }: any) => (
  <div className={cn("flex flex-col md:flex-row items-center gap-12", reverse && "md:flex-row-reverse")}>
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <span className="font-orbitron text-5xl text-neural-red/20">{number}</span>
        <div className="h-0.5 flex-1 bg-neural-red/20"></div>
      </div>
      <div className="text-neural-neon mb-4">{icon}</div>
      <h2 className="text-2xl md:text-3xl font-orbitron text-white">{title}</h2>
      <p className="text-neural-text/70 leading-relaxed text-lg">{desc}</p>
    </div>
    <div className="flex-1">
      <Card className="p-0 overflow-hidden border-neural-red/40 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
      </Card>
    </div>
  </div>
);

import { cn } from '../components/UI';
