import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/UI';
import { AI_PROVIDERS } from '../constants';
import { Key, CheckCircle2, XCircle, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const APIKeys = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const token = localStorage.getItem('neural_token');

  useEffect(() => {
    if (!token) return;
    const fetchKeys = async () => {
      try {
        const data: any = await api.user.getApiKey(token);
        setKeys(data);
      } catch (error) {
        console.error('Failed to fetch keys', error);
      }
    };
    fetchKeys();
  }, [token]);

  const handleDelete = async (provider: string) => {
    if (!token) return;
    if (!confirm(`Hapus API key untuk ${provider}?`)) return;
    try {
      await api.user.deleteApiKey(token, provider);
      setKeys(keys.filter(k => k.provider !== provider));
    } catch (error: any) {
      alert(error.message || 'Failed to delete key');
    }
  };

  const handleTest = async (provider: string) => {
    if (!token) return;
    try {
      const res: any = await api.user.testApiKey(token);
      alert(`${provider} key is ${res.valid ? 'VALID' : 'INVALID'}`);
    } catch (error: any) {
      alert(error.message || 'Test failed');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl mb-2">AI NEURAL CORES</h1>
          <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Manage your API integrations</p>
        </div>
        <div className="bg-neural-red/10 border border-neural-red/20 px-4 py-2 flex items-center gap-3">
          <ShieldCheck className="text-neural-neon w-4 h-4" />
          <span className="text-[10px] font-mono text-neural-neon uppercase tracking-widest">AES-256 Encryption Active</span>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_PROVIDERS.map((provider) => {
          const keyInfo = keys.find((k: any) => k.provider === provider.id);
          return (
            <Card key={provider.id} className="relative group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-neural-red/10 border border-neural-red/20 flex items-center justify-center">
                  <Key className="text-neural-neon w-6 h-6" />
                </div>
                {keyInfo ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> TERPASANG
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-neural-text/40 bg-neural-gray px-2 py-1 border border-neural-red/10">
                    <XCircle className="w-3 h-3" /> BELUM
                  </span>
                )}
              </div>

              <h3 className="text-xl font-orbitron text-white mb-2">{provider.name}</h3>
              <p className="text-xs text-neural-text/60 mb-6 line-clamp-2">{provider.description}</p>

              {keyInfo && (
                <div className="mb-6 p-3 bg-neural-black/40 border border-neural-red/10 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-neural-text/40">MODEL:</span>
                    <span className="text-neural-neon">{keyInfo.model}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-neural-text/40">ADDED:</span>
                    <span className="text-neural-text/60">{keyInfo.date}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 py-2 text-xs">
                  {keyInfo ? 'UPDATE' : 'SETUP'}
                </Button>
                {keyInfo && (
                  <>
                    <Button variant="outline" onClick={() => handleTest(provider.id)} className="px-3 border-neural-red/30 text-emerald-500 hover:bg-emerald-500/10">
                      TEST
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(provider.id)} className="px-3 border-neural-red/30 text-neural-red hover:bg-neural-red hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              <a 
                href={provider.link} 
                target="_blank" 
                rel="noreferrer"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-neural-text/40 hover:text-neural-neon"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
