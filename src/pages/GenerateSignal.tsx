import { useState, useEffect } from 'react';
import { Card, Button, cn } from '../components/UI';
import { TRADING_PAIRS, ANALYSIS_MODES, AI_PROVIDERS } from '../constants';
import { Zap, Search, Target, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export const GenerateSignal = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pair, setPair] = useState(TRADING_PAIRS[0]);
  const [mode, setMode] = useState(ANALYSIS_MODES[0].id);
  const [provider, setProvider] = useState(AI_PROVIDERS[0].id);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [rr, setRr] = useState(2); // Risk:Reward ratio
  const [tpCount, setTpCount] = useState(2); // Number of Take Profit levels
  const token = localStorage.getItem('neural_token');

  useEffect(() => {
    if (!token) return;
    const fetchModels = async () => {
      try {
        const data: any = await api.models.getAll(token, provider);
        const modelsData = Array.isArray(data) ? data : [];
        setModels(modelsData);
        if (modelsData.length > 0) setSelectedModel(modelsData[0].id);
      } catch (error) {
        console.error('Failed to fetch models', error);
      }
    };
    fetchModels();
  }, [token, provider]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setResult(null);
    
    try {
      const data: any = await api.signal.generate(token, {
        pair,
        mode,
        provider,
        model: selectedModel,
        rr,
        tpCount
      });
      setResult(data);
    } catch (error: any) {
      alert(error.message || 'Failed to generate signal');
    } finally {
      setLoading(false);
    }
  };

  // Get all TP levels from result
  const getTpLevels = (signal: any) => {
    const tps = [];
    for (let i = 1; i <= 4; i++) {
      const tp = signal[`tp${i}`];
      if (tp) tps.push({ label: `Take Profit ${i}`, value: tp, index: i });
    }
    return tps;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl mb-2">GENERATOR SINYAL NEURAL</h1>
        <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Protocol-7 Analysis Engine — SMC/ICT Methodology</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Panel */}
        <Card className="md:col-span-1 h-fit">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] text-neural-neon uppercase mb-2">Trading Pair</label>
              <select 
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-neural-text focus:outline-none focus:border-neural-neon"
              >
                {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neural-neon uppercase mb-2">Analysis Mode</label>
              <select 
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-neural-text focus:outline-none focus:border-neural-neon"
              >
                {ANALYSIS_MODES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neural-neon uppercase mb-2">AI Provider</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-neural-text focus:outline-none focus:border-neural-neon"
              >
                {AI_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neural-neon uppercase mb-2">AI Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-neural-text focus:outline-none focus:border-neural-neon"
              >
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                {models.length === 0 && <option value="">Loading models...</option>}
              </select>
            </div>

            {/* Risk:Reward Setting */}
            <div className="pt-2 border-t border-neural-red/10">
              <label className="block font-mono text-[10px] text-neural-neon uppercase mb-3">
                Risk : Reward Ratio
              </label>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-neural-text/60">1 :</span>
                <div className="flex gap-2 flex-1">
                  {[1, 1.5, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRr(val)}
                      className={cn(
                        "flex-1 py-1.5 font-mono text-[10px] border transition-all",
                        rr === val 
                          ? "bg-neural-red text-white border-neural-neon" 
                          : "bg-neural-gray/50 text-neural-text/60 border-neural-red/20 hover:border-neural-neon/40"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] font-mono text-neural-text/30 mt-1">
                Minimum R:R = 1:{rr} untuk setiap TP
              </p>
            </div>

            {/* TP Count Setting */}
            <div>
              <label className="block font-mono text-[10px] text-neural-neon uppercase mb-3">
                Jumlah Take Profit
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTpCount(val)}
                    className={cn(
                      "flex-1 py-2 font-mono text-xs border transition-all",
                      tpCount === val 
                        ? "bg-neural-red text-white border-neural-neon" 
                        : "bg-neural-gray/50 text-neural-text/60 border-neural-red/20 hover:border-neural-neon/40"
                    )}
                  >
                    TP{val}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-mono text-neural-text/30 mt-1">
                AI akan generate {tpCount} level take profit
              </p>
            </div>

            <Button type="submit" className="w-full py-4 flex items-center justify-center gap-2" disabled={loading}>
              <Zap className={cn("w-4 h-4", loading && "animate-pulse")} />
              {loading ? 'ANALYZING...' : 'GENERATE SINYAL'}
            </Button>
          </form>
        </Card>

        {/* Result Panel */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 border border-neural-red/20 bg-neural-gray/20"
              >
                <div className="w-16 h-16 border-4 border-neural-red/20 border-t-neural-neon rounded-full animate-spin mb-6"></div>
                <p className="font-mono text-neural-neon animate-pulse">SCANNING MARKET LIQUIDITY...</p>
                <p className="text-[10px] font-mono text-neural-text/40 mt-2">ACCESSING NEURAL CORE VIA PROTOCOL-7</p>
                <p className="text-[10px] font-mono text-neural-text/30 mt-1">R:R Target 1:{rr} | {tpCount} TP Levels</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className={cn(
                  "border-l-4 p-0 overflow-hidden",
                  result.direction === 'BUY' ? "border-l-emerald-500" : "border-l-neural-neon"
                )}>
                  {/* Header */}
                  <div className={cn(
                    "px-6 py-4 border-b border-neural-red/20 flex justify-between items-center",
                    result.direction === 'BUY' ? "bg-emerald-500/10" : "bg-neural-red/10"
                  )}>
                    <div className="flex items-center gap-3">
                      <Target className={cn("w-5 h-5", result.direction === 'BUY' ? "text-emerald-500" : "text-neural-neon")} />
                      <h3 className="font-orbitron text-white">{result.pair} SIGNAL</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-neural-text/60 bg-neural-gray/50 px-2 py-1">
                        R:R {result.rr || `1:${rr}`}
                      </span>
                      <span className="font-mono text-[10px] text-neural-neon bg-neural-red/20 px-2 py-1">
                        CONFIDENCE: {result.confidence}
                      </span>
                    </div>
                  </div>
                  
                  {/* Direction Badge */}
                  <div className="px-6 pt-6 pb-2">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 font-orbitron text-lg font-bold",
                      result.direction === 'BUY' 
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                        : "bg-neural-red/20 text-neural-neon border border-neural-neon/30"
                    )}>
                      {result.direction === 'BUY' 
                        ? <TrendingUp className="w-5 h-5" /> 
                        : <TrendingDown className="w-5 h-5" />
                      }
                      {result.direction}
                    </div>
                  </div>

                  {/* Entry & SL */}
                  <div className="px-6 py-4 grid grid-cols-2 gap-4">
                    <SignalField label="Entry Zone" value={result.entry} />
                    <SignalField label="Stop Loss" value={result.sl} highlight="text-neural-neon" />
                  </div>

                  {/* Take Profit Levels */}
                  <div className="px-6 pb-4">
                    <p className="text-[10px] font-mono text-neural-text/40 uppercase tracking-widest mb-3">
                      Take Profit Levels ({getTpLevels(result).length} targets)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {getTpLevels(result).map((tp) => (
                        <div key={tp.index} className="p-3 bg-emerald-500/5 border border-emerald-500/20">
                          <p className="text-[10px] font-mono text-emerald-500/60 uppercase mb-1">
                            TP{tp.index} {tp.index === getTpLevels(result).length ? `(1:${rr}+)` : ''}
                          </p>
                          <p className="font-orbitron text-emerald-500 font-bold">{tp.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="px-6 pb-6">
                    <label className="block font-mono text-[10px] text-neural-neon uppercase mb-2">Neural Reasoning</label>
                    <div className="bg-neural-black/40 p-4 border border-neural-red/10 font-mono text-xs text-neural-text/80 leading-relaxed">
                      {result.reasoning}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-neural-gray px-6 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-neural-red" />
                    <p className="text-[10px] font-mono text-neural-text/40 italic">
                      DISCLAIMER: Trading involves risk. Use proper risk management. This is AI-generated analysis, not financial advice.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-neural-red/20 opacity-50">
                <Search className="w-12 h-12 text-neural-red mb-4" />
                <p className="font-orbitron text-sm">READY FOR ANALYSIS</p>
                <p className="text-xs text-neural-text/60 mt-2">Pilih parameter dan tekan tombol Generate</p>
                <div className="mt-4 flex gap-4 text-[10px] font-mono text-neural-text/30">
                  <span>R:R 1:{rr}</span>
                  <span>•</span>
                  <span>{tpCount} TP Levels</span>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SignalField = ({ label, value, highlight }: any) => (
  <div>
    <p className="text-[10px] font-mono text-neural-text/40 uppercase tracking-widest mb-1">{label}</p>
    <p className={cn("font-orbitron text-lg text-white", highlight)}>{value}</p>
  </div>
);
