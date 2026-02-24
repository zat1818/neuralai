import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Card, Button } from '../components/UI';
import { AI_PROVIDERS } from '../constants';
import { ExternalLink, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const Providers = () => {
  return (
    <div className="min-h-screen bg-neural-black">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl mb-6">NEURAL CORES</h1>
          <p className="text-neural-text/60 max-w-2xl mx-auto font-rajdhani text-lg">
            NeuralAI mendukung integrasi dengan provider AI tercanggih di dunia. 
            Gunakan API key Anda sendiri untuk keamanan dan kontrol maksimal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AI_PROVIDERS.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col group hover:border-neural-neon transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-neural-red/10 border border-neural-red/20 flex items-center justify-center group-hover:bg-neural-red/20 transition-colors">
                    <Cpu className="text-neural-neon w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-mono text-neural-neon bg-neural-red/10 px-2 py-1 border border-neural-neon/20">
                    PROTOCOL-7 READY
                  </span>
                </div>
                
                <h2 className="text-2xl font-orbitron text-white mb-4 group-hover:text-neural-neon transition-colors">{provider.name}</h2>
                <p className="text-neural-text/70 mb-8 flex-1">{provider.description}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neural-text/40">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    ENCRYPTED KEY STORAGE
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neural-text/40">
                    <Zap className="w-3 h-3 text-neural-neon" />
                    REAL-TIME INFERENCE
                  </div>
                  <a 
                    href={provider.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-3">
                      DAPATKAN API KEY <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 bg-neural-gray/30 p-12 border border-neural-red/10 text-center">
          <h3 className="text-2xl mb-4">MENGAPA BYOK (BRING YOUR OWN KEY)?</h3>
          <p className="text-neural-text/60 max-w-3xl mx-auto mb-8">
            Kami percaya bahwa kontrol atas AI harus berada di tangan pengguna. Dengan menggunakan API key Anda sendiri, 
            Anda tidak hanya mendapatkan transparansi biaya (langsung ke provider), tetapi juga memastikan data dan 
            preferensi analisis Anda tetap privat.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neural-neon rounded-full"></div>
              <span className="font-mono text-xs text-white">NO MONTHLY FEES</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neural-neon rounded-full"></div>
              <span className="font-mono text-xs text-white">TOTAL PRIVACY</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neural-neon rounded-full"></div>
              <span className="font-mono text-xs text-white">UNLIMITED MODELS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../components/UI';
