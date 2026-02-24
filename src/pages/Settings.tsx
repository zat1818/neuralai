import { useState, useEffect } from 'react';
import { Card, Button, Input, cn } from '../components/UI';
import { User, Palette, Shield, Terminal, Check, RotateCcw } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';
import { motion } from 'motion/react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('PROFIL');
  const { theme, setTheme, resetTheme } = useTheme();
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('neural_user') || '{}'));
  const token = localStorage.getItem('neural_token');
  const [usage, setUsage] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    bio: user.bio || '',
    avatar: user.avatar || '',
    defaultPair: user.preferences?.defaultPair || 'XAUUSD',
    defaultMode: user.preferences?.defaultMode || 'Scalping',
    defaultProvider: user.preferences?.defaultProvider || 'Gemini'
  });

  useEffect(() => {
    if (!token) return;
    const fetchUsage = async () => {
      try {
        const data: any = await api.user.getUsage(token);
        setUsage(data);
      } catch (error) {
        console.error('Failed to fetch usage', error);
      }
    };
    fetchUsage();
  }, [token]);

  const handleSaveProfile = async () => {
    if (!token) return;
    try {
      const updatedUser: any = await api.user.updateProfile(token, profileForm);
      localStorage.setItem('neural_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Profil berhasil diperbarui');
    } catch (error: any) {
      alert(error.message || 'Gagal memperbarui profil');
    }
  };

  const handleSaveSettings = async () => {
    if (!token) return;
    try {
      await api.user.updateSettings(token, { theme });
      alert('Pengaturan tema berhasil disimpan');
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan tema');
    }
  };

  const tabs = ['PROFIL', 'TEMA', 'KEAMANAN'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl mb-2">KONFIGURASI SISTEM</h1>
        <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Personalize your Neural Interface</p>
      </header>

      <div className="flex gap-2 border-b border-neural-red/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 font-orbitron text-xs uppercase tracking-widest transition-all relative",
              activeTab === tab ? "text-neural-neon" : "text-neural-text/40 hover:text-neural-text"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="settings-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neural-neon" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'PROFIL' && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-neural-red/20 border border-neural-red/30 flex items-center justify-center text-neural-neon text-3xl font-bold">
                  {user.username?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-orbitron text-white">{user.username}</h3>
                  <p className="text-xs font-mono text-neural-neon uppercase">{user.role} | Protocol-7 Verified</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Bio / Status</label>
                  <Input 
                    value={profileForm.bio} 
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Neural Intelligence Operator..." 
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Avatar URL</label>
                  <Input 
                    value={profileForm.avatar} 
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://..." 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-neural-red/10">
                <h4 className="font-orbitron text-xs text-neural-neon mb-4 uppercase tracking-widest">Default Preferences</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <SelectField 
                    label="Default Pair" 
                    value={profileForm.defaultPair}
                    onChange={(v: string) => setProfileForm({ ...profileForm, defaultPair: v })}
                    options={['XAUUSD', 'BTCUSD', 'EURUSD']} 
                  />
                  <SelectField 
                    label="Default Mode" 
                    value={profileForm.defaultMode}
                    onChange={(v: string) => setProfileForm({ ...profileForm, defaultMode: v })}
                    options={['Scalping', 'Intraday', 'Swing']} 
                  />
                  <SelectField 
                    label="Default Provider" 
                    value={profileForm.defaultProvider}
                    onChange={(v: string) => setProfileForm({ ...profileForm, defaultProvider: v })}
                    options={['Gemini', 'Groq', 'OpenAI']} 
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full py-3">SIMPAN PERUBAHAN PROFIL</Button>
            </Card>
          </div>
        )}

        {activeTab === 'TEMA' && (
          <div className="space-y-8">
            <section>
              <h3 className="font-orbitron text-sm text-white mb-6 uppercase tracking-widest">PRESET SISTEM VISUAL</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ThemePresetCard 
                  name="UMBRELLA" 
                  desc="Dark & Red" 
                  bg="#050505" 
                  accent="#8b0000" 
                  active={theme.preset === 'UMBRELLA'} 
                  onClick={() => setTheme({ ...theme, preset: 'UMBRELLA', bg: '#050505', accent: '#8b0000' })}
                />
                <ThemePresetCard 
                  name="MATRIX" 
                  desc="Hacker Terminal" 
                  bg="#000000" 
                  accent="#00ff00" 
                  active={theme.preset === 'MATRIX'}
                  onClick={() => setTheme({ ...theme, preset: 'MATRIX', bg: '#000000', accent: '#00ff00' })}
                />
                <ThemePresetCard 
                  name="ARCTIC" 
                  desc="Cold Minimalist" 
                  bg="#ffffff" 
                  accent="#00aaff" 
                  active={theme.preset === 'ARCTIC'}
                  onClick={() => setTheme({ ...theme, preset: 'ARCTIC', bg: '#ffffff', accent: '#00aaff' })}
                />
                <ThemePresetCard 
                  name="TOXIC" 
                  desc="Cyberpunk Purple" 
                  bg="#050505" 
                  accent="#bf00ff" 
                  active={theme.preset === 'TOXIC'}
                  onClick={() => setTheme({ ...theme, preset: 'TOXIC', bg: '#050505', accent: '#bf00ff' })}
                />
              </div>
            </section>

            <Card className="space-y-8">
              <h3 className="font-orbitron text-sm text-neural-neon uppercase tracking-widest">PENGATURAN CUSTOM</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <ToggleField label="Scanline Effect" active={theme.scanlines} onChange={(v) => setTheme({ ...theme, scanlines: v })} />
                  <ToggleField label="Particle System" active={theme.particles} onChange={(v) => setTheme({ ...theme, particles: v })} />
                  <ToggleField label="Glitch Animation" active={theme.glitch} onChange={(v) => setTheme({ ...theme, glitch: v })} />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-4">Glow Intensity</label>
                    <input 
                      type="range" 
                      className="w-full accent-neural-red" 
                      value={theme.glowIntensity} 
                      onChange={(e) => setTheme({ ...theme, glowIntensity: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-neural-text/40 mt-2">
                      <span>LOW</span>
                      <span>{theme.glowIntensity}%</span>
                      <span>HIGH</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-neural-red/10 flex gap-4">
                <Button onClick={handleSaveSettings} className="flex-1 py-3 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> TERAPKAN TEMA
                </Button>
                <Button variant="outline" onClick={resetTheme} className="py-3 flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> RESET
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'KEAMANAN' && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-neural-red/5 border border-neural-red/20">
                <Shield className="text-neural-neon w-6 h-6" />
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">Status Keamanan: OPTIMAL</p>
                  <p className="text-[10px] font-mono text-neural-text/60">Terakhir login: {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-orbitron text-xs text-white uppercase tracking-widest">Informasi Akun</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-neural-gray/30 border border-neural-red/10">
                    <p className="text-neural-text/40 mb-1">BERGABUNG</p>
                    <p className="text-white">23 FEB 2025</p>
                  </div>
                  <div className="p-3 bg-neural-gray/30 border border-neural-red/10">
                    <p className="text-neural-text/40 mb-1">EMAIL VERIFIED</p>
                    <p className="text-emerald-500 font-bold">YES</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-orbitron text-xs text-white uppercase tracking-widest">Usage Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-neural-text/40 uppercase">Daily Signal Usage</span>
                    <span className="text-neural-neon">{usage?.dailySignals || 0} / {usage?.dailyLimit || 100}</span>
                  </div>
                  <div className="w-full h-2 bg-neural-gray overflow-hidden">
                    <div className="h-full bg-neural-red" style={{ width: `${(usage?.dailySignals / usage?.dailyLimit) * 100 || 0}%` }}></div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full py-3 border-neural-red/30 text-neural-red">UBAH PASSWORD</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const SelectField = ({ label, options, value, onChange }: any) => (
  <div>
    <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-xs text-neural-text focus:outline-none focus:border-neural-neon"
    >
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const ThemePresetCard = ({ name, desc, bg, accent, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 border text-left transition-all relative overflow-hidden group",
      active ? "border-neural-neon bg-neural-red/10 ring-1 ring-neural-neon" : "border-neural-red/20 bg-neural-gray/30 hover:border-neural-neon/40"
    )}
  >
    <div className="flex gap-2 mb-3">
      <div className="w-4 h-4 border border-white/20" style={{ backgroundColor: bg }}></div>
      <div className="w-4 h-4 border border-white/20" style={{ backgroundColor: accent }}></div>
    </div>
    <h4 className="font-orbitron text-[10px] text-white uppercase tracking-widest">{name}</h4>
    <p className="text-[10px] font-mono text-neural-text/40">{desc}</p>
    {active && (
      <div className="absolute top-2 right-2">
        <Check className="w-3 h-3 text-neural-neon" />
      </div>
    )}
  </button>
);

const ToggleField = ({ label, active, onChange }: any) => (
  <div className="flex items-center justify-between">
    <span className="font-mono text-xs text-neural-text/80 uppercase tracking-widest">{label}</span>
    <button 
      onClick={() => onChange(!active)}
      className={cn(
        "w-12 h-6 transition-colors relative",
        active ? "bg-neural-red" : "bg-neural-gray"
      )}
    >
      <motion.div 
        animate={{ x: active ? 24 : 4 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white"
      />
    </button>
  </div>
);
