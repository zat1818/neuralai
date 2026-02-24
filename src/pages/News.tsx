import { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { Newspaper, Search, Filter, Calendar, Clock, ArrowRight } from 'lucide-react';

export const News = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Forex', 'Crypto', 'Gold', 'Stocks'];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl mb-2">NEURAL INTEL — MARKET BROADCAST</h1>
          <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Real-time market intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-neural-neon rounded-full animate-pulse"></span>
          <span className="font-mono text-neural-neon text-sm uppercase tracking-widest">Live Feed Active</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 font-orbitron text-[10px] uppercase tracking-widest border transition-all",
              activeCategory === cat 
                ? "bg-neural-red text-white border-neural-neon shadow-[0_0_10px_rgba(255,0,0,0.3)]" 
                : "bg-neural-gray/50 text-neural-text/60 border-neural-red/20 hover:border-neural-neon/40"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main News */}
          <Card className="p-0 overflow-hidden group cursor-pointer">
            <div className="aspect-video relative">
              <img src="https://picsum.photos/seed/market1/1200/600" alt="News" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-neural-black via-neural-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-neural-red text-white text-[10px] px-2 py-1 font-mono uppercase">GOLD</span>
                  <span className="text-neural-neon text-[10px] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2 HOURS AGO
                  </span>
                </div>
                <h2 className="text-3xl font-orbitron text-white mb-4 group-hover:text-neural-neon transition-colors">FED INTEREST RATE DECISION: NEURAL MODELS PREDICT HAWKISH STANCE</h2>
                <p className="text-neural-text/70 line-clamp-2 max-w-2xl mb-6">Analisis sentimen dari 47 provider berita menunjukkan probabilitas 82% bahwa Fed akan mempertahankan suku bunga. NeuralAI memprediksi volatilitas tinggi pada DXY.</p>
                <Button className="flex items-center gap-2">BACA SELENGKAPNYA <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <NewsCard category="CRYPTO" title="Ethereum ETF Approval Odds Shift" time="4h ago" />
            <NewsCard category="FOREX" title="Yen Intervention: BOJ Statement Analysis" time="6h ago" />
            <NewsCard category="STOCKS" title="Tech Sector Liquidity Grab Detected" time="8h ago" />
            <NewsCard category="GOLD" title="Central Bank Gold Reserves Increase" time="12h ago" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="bg-neural-red/5 border-neural-red/30">
            <h3 className="font-orbitron text-sm text-neural-neon mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI INSIGHTS
            </h3>
            <div className="space-y-4">
              <InsightItem text="XAUUSD: Bullish sentiment increasing among institutional models." />
              <InsightItem text="BTCUSD: High probability of liquidity sweep at $52,000." />
              <InsightItem text="EURUSD: Bearish divergence confirmed on H4 timeframe." />
            </div>
          </Card>

          <section>
            <h3 className="font-orbitron text-sm text-white mb-4 uppercase tracking-widest">Trending Topics</h3>
            <div className="space-y-2">
              <TrendingTag label="#FedPivot" count="1.2k" />
              <TrendingTag label="#BitcoinHalving" count="850" />
              <TrendingTag label="#GoldBreakout" count="640" />
              <TrendingTag label="#AITrading" count="520" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const NewsCard = ({ category, title, time }: any) => (
  <Card className="p-0 overflow-hidden group cursor-pointer hover:border-neural-neon/40 transition-all">
    <div className="h-40 relative">
      <img src={`https://picsum.photos/seed/${title}/400/200`} alt="News" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-neural-black to-transparent"></div>
      <span className="absolute top-3 left-3 bg-neural-red/80 text-white text-[8px] px-2 py-0.5 font-mono uppercase">{category}</span>
    </div>
    <div className="p-4">
      <h4 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-neural-neon transition-colors">{title}</h4>
      <p className="text-[10px] font-mono text-neural-text/40">{time}</p>
    </div>
  </Card>
);

const InsightItem = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <div className="mt-1.5 w-1.5 h-1.5 bg-neural-neon rounded-full shrink-0"></div>
    <p className="text-xs text-neural-text/80 font-mono leading-relaxed">{text}</p>
  </div>
);

const TrendingTag = ({ label, count }: any) => (
  <div className="flex items-center justify-between p-3 bg-neural-gray/30 border border-neural-red/10 hover:border-neural-neon/30 transition-colors cursor-pointer">
    <span className="text-xs font-mono text-neural-text/80">{label}</span>
    <span className="text-[10px] font-mono text-neural-neon">{count}</span>
  </div>
);

import { cn } from '../components/UI';
import { Zap } from 'lucide-react';
