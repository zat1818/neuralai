import { useState, useEffect } from 'react';
import { Card, Button, Input, cn } from '../components/UI';
import { TRADING_PAIRS, ANALYSIS_MODES, AI_PROVIDERS } from '../constants';
import { Zap, Search, Target, AlertCircle } from 'lucide-react';
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
        model: selectedModel
      });
      setResult(data);
    } catch (error: any) {
      alert(error.message || 'Failed to generate signal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl mb-2">GENERATOR SINYAL NEURAL</h1>
        <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Protocol-7 Analysis Engine</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
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

            <Button type="submit" className="w-full py-4 flex items-center justify-center gap-2" disabled={loading}>
              <Zap className={cn("w-4 h-4", loading && "animate-pulse")} />
              {loading ? 'ANALYZING...' : 'GENERATE SINYAL'}
            </Button>
          </form>
        </Card>

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
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-l-4 border-l-neural-neon p-0 overflow-hidden">
                  <div className="bg-neural-red/10 px-6 py-4 border-b border-neural-red/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Target className="text-neural-neon w-5 h-5" />
                      <h3 className="font-orbitron text-white">{result.pair} SIGNAL</h3>
                    </div>
                    <span className="font-mono text-[10px] text-neural-neon bg-neural-red/20 px-2 py-1">CONFIDENCE: {result.confidence}</span>
                  </div>
                  
                  <div className="p-8 grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <SignalField label="Direction" value={result.direction} highlight={result.direction === 'BUY' ? 'text-emerald-500' : 'text-neural-neon'} />
                      <SignalField label="Entry Zone" value={result.entry} />
                      <SignalField label="Stop Loss" value={result.sl} />
                    </div>
                    <div className="space-y-4">
                      <SignalField label="Take Profit 1" value={result.tp1} />
                      <SignalField label="Take Profit 2" value={result.tp2} />
                      <SignalField label="Provider" value={result.provider} />
                    </div>
                  </div>

                  <div className="px-8 pb-8">
                    <label className="block font-mono text-[10px] text-neural-neon uppercase mb-2">Neural Reasoning</label>
                    <div className="bg-neural-black/40 p-4 border border-neural-red/10 font-mono text-xs text-neural-text/80 leading-relaxed">
                      {result.reasoning}
                    </div>
                  </div>

                  <div className="bg-neural-gray px-8 py-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-neural-red" />
                    <p className="text-[10px] font-mono text-neural-text/40 italic">DISCLAIMER: Trading involves risk. Use proper risk management.</p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-neural-red/20 opacity-50">
                <Search className="w-12 h-12 text-neural-red mb-4" />
                <p className="font-orbitron text-sm">READY FOR ANALYSIS</p>
                <p className="text-xs text-neural-text/60 mt-2">Pilih parameter dan tekan tombol Generate</p>
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
