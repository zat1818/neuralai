import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/UI';
import { AI_PROVIDERS } from '../constants';
import { Key, CheckCircle2, XCircle, Trash2, ExternalLink, ShieldCheck, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/UI';

interface SetupModalProps {
  provider: typeof AI_PROVIDERS[0];
  existingKey?: any;
  models: any[];
  onClose: () => void;
  onSave: (provider: string, key: string, model: string) => Promise<void>;
}

const SetupModal = ({ provider, existingKey, models, onClose, onSave }: SetupModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(existingKey?.model || (models[0]?.id || ''));
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim() && !existingKey) return;
    setSaving(true);
    try {
      await onSave(provider.id, apiKey.trim(), selectedModel);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan API Key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <Card className="p-0 overflow-hidden border-neural-neon/30">
          <div className="p-6 border-b border-neural-red/20 flex items-center justify-between bg-neural-red/5">
            <div className="flex items-center gap-3">
              <Key className="text-neural-neon w-5 h-5" />
              <h2 className="text-lg font-orbitron text-white uppercase tracking-widest">
                {existingKey ? 'UPDATE' : 'SETUP'} {provider.name}
              </h2>
            </div>
            <button onClick={onClose} className="text-neural-text/40 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-neural-red/5 border border-neural-red/20 flex items-start gap-3">
              <ShieldCheck className="text-neural-neon w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-neural-neon uppercase tracking-widest mb-1">BYOK — Bring Your Own Key</p>
                <p className="text-xs text-neural-text/60">API key Anda disimpan terenkripsi dan hanya digunakan untuk generate sinyal. Kami tidak pernah menyimpan atau membagikan key Anda.</p>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">
                API Key {provider.name}
                <a href={provider.link} target="_blank" rel="noreferrer" className="ml-2 text-neural-neon hover:underline">
                  Dapatkan Key →
                </a>
              </label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={existingKey ? '••••••••••••••••••••• (kosongkan jika tidak ingin mengubah)' : `Masukkan ${provider.name} API Key...`}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neural-text/40 hover:text-neural-neon"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Model AI</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-xs text-neural-text focus:outline-none focus:border-neural-neon"
              >
                {models.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
                {models.length === 0 && <option value="">Loading models...</option>}
              </select>
              <p className="text-[10px] font-mono text-neural-text/30 mt-1">Model ini akan digunakan saat generate sinyal dengan provider {provider.name}</p>
            </div>
          </div>

          <div className="p-6 border-t border-neural-red/10 flex gap-4 bg-neural-black/20">
            <Button variant="outline" onClick={onClose} className="flex-1 py-3">
              BATAL
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (!apiKey.trim() && !existingKey)}
              className="flex-1 py-3 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> MENYIMPAN...</> : 'SIMPAN API KEY'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export const APIKeys = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [setupProvider, setSetupProvider] = useState<typeof AI_PROVIDERS[0] | null>(null);
  const [providerModels, setProviderModels] = useState<any[]>([]);
  const token = localStorage.getItem('neural_token');

  useEffect(() => {
    if (!token) return;
    const fetchKeys = async () => {
      try {
        const data: any = await api.user.getApiKey(token);
        setKeys(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch keys', error);
      }
    };
    fetchKeys();
  }, [token]);

  const handleOpenSetup = async (provider: typeof AI_PROVIDERS[0]) => {
    setSetupProvider(provider);
    if (!token) return;
    try {
      const models: any = await api.models.getAll(token, provider.id);
      setProviderModels(Array.isArray(models) ? models : []);
    } catch {
      setProviderModels([]);
    }
  };

  const handleSaveKey = async (providerId: string, key: string, model: string) => {
    if (!token) return;
    const existingKey = keys.find(k => k.provider === providerId);
    // Jika key kosong dan sudah ada key sebelumnya, hanya update model
    const keyToSave = key || (existingKey?.key || '');
    await api.user.setupApiKey(token, { provider: providerId, key: keyToSave, model });
    // Refresh keys
    const data: any = await api.user.getApiKey(token);
    setKeys(Array.isArray(data) ? data : []);
  };

  const handleDelete = async (providerId: string) => {
    if (!token) return;
    if (!confirm(`Hapus API key untuk ${providerId}?`)) return;
    try {
      await api.user.deleteApiKey(token, providerId);
      setKeys(keys.filter(k => k.provider !== providerId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete key');
    }
  };

  const handleTest = async (providerId: string) => {
    if (!token) return;
    try {
      const res: any = await api.user.testApiKey(token, { provider: providerId });
      alert(`${providerId} key is ${res.valid ? '✅ VALID' : '❌ INVALID'}`);
    } catch (error: any) {
      alert(error.message || 'Test failed');
    }
  };

  const existingKeyForSetup = setupProvider
    ? keys.find(k => k.provider === setupProvider.id)
    : undefined;

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
                    <span className="text-neural-neon">{keyInfo.model || '-'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-neural-text/40">STATUS:</span>
                    <span className={cn("font-bold uppercase", keyInfo.status === 'active' ? "text-emerald-500" : "text-neural-red")}>
                      {keyInfo.status || 'active'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenSetup(provider)}
                  className="flex-1 py-2 text-xs"
                >
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

      {/* Setup Modal */}
      <AnimatePresence>
        {setupProvider && (
          <SetupModal
            provider={setupProvider}
            existingKey={existingKeyForSetup}
            models={providerModels}
            onClose={() => setSetupProvider(null)}
            onSave={handleSaveKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
