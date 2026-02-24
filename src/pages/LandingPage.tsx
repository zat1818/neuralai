import React from 'react';
import { motion } from 'motion/react';
import { Button, Card, cn } from '../components/UI';
import { AI_PROVIDERS } from '../constants';
import { Shield, Zap, Eye, ChevronRight, Activity, Globe, Cpu, Users, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="relative">
      {/* Live News Ticker */}
      <div className="bg-neural-red/10 border-b border-neural-red/20 py-2 overflow-hidden whitespace-nowrap relative z-20">
        <div className="flex items-center gap-8 animate-marquee">
          <TickerItem category="GOLD" text="XAUUSD mitigates H1 Order Block at $2025. Neural Core predicts 87% bullish continuation." />
          <TickerItem category="CRYPTO" text="BTC Liquidity sweep at $52,000 confirmed. AI sentiment shifts to neutral-bullish." />
          <TickerItem category="FOREX" text="EURUSD Bearish divergence on H4. Target liquidity at 1.0750." />
          <TickerItem category="STOCKS" text="NVDA: Neural analysis shows institutional accumulation before earnings report." />
          {/* Duplicate for seamless loop */}
          <TickerItem category="GOLD" text="XAUUSD mitigates H1 Order Block at $2025. Neural Core predicts 87% bullish continuation." />
          <TickerItem category="CRYPTO" text="BTC Liquidity sweep at $52,000 confirmed. AI sentiment shifts to neutral-bullish." />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hexagon-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neural-black/50 to-neural-black"></div>
        
        {/* Particles placeholder - in real app use a canvas library */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-neural-neon rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            data-text="NEURAL INTELLIGENCE. MARKET DOMINATION."
            className="glitch text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tighter"
          >
            NEURAL INTELLIGENCE.<br />MARKET DOMINATION.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-neural-text/80 max-w-2xl mx-auto mb-10 font-rajdhani"
          >
            Gunakan AI provider milikmu sendiri. Bebas pilih model. Gratis selamanya.
            Sistem intelijen sinyal trading tercanggih di Protocol-7.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button className="w-full sm:w-auto px-10 py-4 text-lg">DAFTAR SEKARANG</Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" className="w-full sm:w-auto px-10 py-4 text-lg">LIHAT CARA KERJA</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-neural-red/20 pt-8"
          >
            <StatItem label="AI Providers" value="9" />
            <StatItem label="Trading Pairs" value="47+" />
            <StatItem label="Control" value="FULL" />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-neural-black relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">OPERATIONAL PROTOCOL</h2>
            <div className="w-24 h-1 bg-neural-red mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-neural-red/10 -translate-y-1/2 z-0"></div>
            
            <StepCard number="01" title="DAFTAR AKUN" desc="Gratis, tanpa kartu kredit. Akses instan ke Neural Core." />
            <StepCard number="02" title="PILIH MODEL AI" desc="9 provider utama. Gunakan model favoritmu." />
            <StepCard number="03" title="INPUT API KEY" desc="Enkripsi AES-256. Key kamu tetap milikmu." />
            <StepCard number="04" title="DAPATKAN SINYAL" desc="Analisis SMC/ICT real-time dari Neural Intelligence." />
          </div>
        </div>
      </section>

      {/* AI Providers */}
      <section className="py-24 bg-neural-gray/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">SUPPORTED AI NEURAL CORES</h2>
            <p className="text-neural-neon font-mono text-sm tracking-[0.3em]">SYSTEM COMPATIBILITY LIST</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {AI_PROVIDERS.map((provider) => (
              <Card key={provider.id} className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <span className="text-[10px] font-mono bg-neural-red/20 text-neural-neon px-2 py-1 border border-neural-neon/30">
                    API KEY REQUIRED
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-neural-red/10 border border-neural-red/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${provider.id}/40/40`} 
                      alt={provider.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-xl text-white group-hover:text-neural-neon transition-colors">{provider.name}</h3>
                </div>
                <p className="text-sm text-neural-text/70 mb-4">{provider.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <a href={provider.link} target="_blank" rel="noreferrer" className="text-xs font-mono text-neural-neon hover:underline">Get Key</a>
                  <ChevronRight className="w-4 h-4 text-neural-red group-hover:translate-x-1 transition-transform" />
                </div>
                {/* Scan effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-neural-neon/0 via-neural-neon/5 to-neural-neon/0 h-1/2 -translate-y-full group-hover:animate-scan pointer-events-none"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 bg-neural-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <SecurityCard icon={<Shield className="w-8 h-8" />} title="AES-256 Encryption" desc="Semua API key dienkripsi dengan standar militer sebelum disimpan." />
            <SecurityCard icon={<Eye className="w-8 h-8" />} title="Zero Key Exposure" desc="Sistem kami tidak pernah menampilkan API key dalam bentuk teks mentah." />
            <SecurityCard icon={<Zap className="w-8 h-8" />} title="JWT Auth 7 Hari" desc="Sesi aman dengan token yang diperbarui secara otomatis." />
          </div>
          <p className="text-center mt-12 text-neural-text/50 font-mono italic">
            "API key kamu adalah milikmu. Kami hanya perantara." — NeuralAI Systems Command
          </p>
        </div>
      </section>

      {/* Market Broadcast */}
      <section className="py-24 bg-neural-gray/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl">NEURAL INTEL — MARKET BROADCAST</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neural-neon rounded-full animate-pulse"></span>
              <span className="font-mono text-neural-neon text-sm">LIVE</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-full p-0 overflow-hidden group">
                <div className="aspect-video relative">
                  <img src="https://picsum.photos/seed/trading1/800/450" alt="Market" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neural-black to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <span className="bg-neural-red text-white text-[10px] px-2 py-1 font-mono mb-4 inline-block">GOLD | AI ANALYZED</span>
                    <h3 className="text-2xl md:text-3xl mb-2">XAUUSD BREAKOUT: NEURAL MODELS PREDICT BULLISH MOMENTUM</h3>
                    <p className="text-neural-text/70 line-clamp-2">Analisis SMC menunjukkan akumulasi besar di zona $2020. AI memprediksi target $2050 dalam 24 jam ke depan.</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <NewsSmallItem category="CRYPTO" title="BTC Halving Sentiment Analysis" time="2h ago" />
              <NewsSmallItem category="FOREX" title="EURUSD Liquidity Grab Detected" time="4h ago" />
              <NewsSmallItem category="STOCKS" title="NVDA Earnings: AI Impact Report" time="6h ago" />
              <NewsSmallItem category="GOLD" title="DXY Correlation Shift Alert" time="8h ago" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neural-red/20 bg-neural-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Hexagon className="w-8 h-8 text-neural-neon" />
                <span className="font-orbitron text-xl font-bold text-white">NEURALAI</span>
              </div>
              <p className="text-neural-text/60 max-w-sm mb-6">
                Advanced AI Trading Signal Intelligence System. Protocol-7 Classified. 
                Market domination through neural core integration.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={<Globe />} />
                <SocialIcon icon={<Activity />} />
                <SocialIcon icon={<Cpu />} />
                <SocialIcon icon={<Users />} />
              </div>
            </div>
            <div>
              <h4 className="font-orbitron text-sm mb-6 text-white">NAVIGATION</h4>
              <ul className="space-y-3 text-sm text-neural-text/60">
                <li><Link to="/" className="hover:text-neural-neon">Beranda</Link></li>
                <li><Link to="/how-it-works" className="hover:text-neural-neon">Cara Kerja</Link></li>
                <li><Link to="/providers" className="hover:text-neural-neon">AI Provider</Link></li>
                <li><Link to="/forum" className="hover:text-neural-neon">Forum</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-orbitron text-sm mb-6 text-white">LEGAL</h4>
              <ul className="space-y-3 text-sm text-neural-text/60">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Risk Disclosure</li>
                <li>Protocol-7 Access</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neural-red/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-mono text-neural-text/40">
              © 2025 NeuralAI Systems. Classified under Protocol-7.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neural-red">
              <span className="w-1.5 h-1.5 bg-neural-red rounded-full"></span>
              SYSTEM STATUS: OPTIMAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-orbitron text-white mb-1">{value}</div>
    <div className="text-[10px] font-mono uppercase tracking-widest text-neural-neon">{label}</div>
  </div>
);

const StepCard = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="relative z-10 text-center group">
    <div className="w-16 h-16 bg-neural-black border-2 border-neural-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-neural-red transition-colors duration-300">
      <span className="font-orbitron text-xl text-white">{number}</span>
    </div>
    <h3 className="font-orbitron text-sm mb-3 text-white">{title}</h3>
    <p className="text-xs text-neural-text/60 leading-relaxed">{desc}</p>
  </div>
);

const SecurityCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <Card className="text-center flex flex-col items-center">
    <div className="text-neural-neon mb-6">{icon}</div>
    <h3 className="font-orbitron text-lg mb-3 text-white">{title}</h3>
    <p className="text-sm text-neural-text/60">{desc}</p>
  </Card>
);

const NewsSmallItem = ({ category, title, time }: { category: string; title: string; time: string }) => (
  <Card className="p-4 hover:bg-neural-red/5 transition-colors cursor-pointer">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-mono text-neural-neon border border-neural-neon/30 px-2 py-0.5">{category}</span>
      <span className="text-[10px] font-mono text-neural-text/40">{time}</span>
    </div>
    <h4 className="text-sm font-medium text-white line-clamp-2">{title}</h4>
  </Card>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <button className="w-10 h-10 rounded-full border border-neural-red/20 flex items-center justify-center text-neural-text hover:text-neural-neon hover:border-neural-neon transition-all">
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' }) : icon}
  </button>
);

const TickerItem = ({ category, text }: { category: string; text: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-mono bg-neural-red text-white px-2 py-0.5 rounded-sm">{category}</span>
    <span className="text-xs font-mono text-neural-text/80 uppercase tracking-wider">{text}</span>
    <span className="text-neural-neon mx-4">///</span>
  </div>
);
