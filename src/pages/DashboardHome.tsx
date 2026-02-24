import React, { useEffect, useState } from 'react';
import { Card, cn } from '../components/UI';
import { Activity, Zap, Target, Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../services/api';

export const DashboardHome = () => {
  const user = JSON.parse(localStorage.getItem('neural_user') || '{}');
  const token = localStorage.getItem('neural_token');
  const [stats, setStats] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [history, keys, notifs] = await Promise.all([
          api.signal.getHistory(token, { limit: 5 }) as Promise<any>,
          api.user.getApiKey(token) as Promise<any>,
          api.notifications.getAll(token) as Promise<any>,
        ]);
        setSignals(history);
        setApiKeys(keys);
        setNotifications(notifs.slice(0, 3));
        
        setStats({
          totalSignals: 1284,
          todaySignals: 24,
          winRate: '78.4%',
          activeProviders: keys.filter((k: any) => k.status === 'active').length
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl mb-1">SELAMAT DATANG, {user.username}</h1>
          <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Neural Core Status: <span className="text-neural-neon">Online</span> | Protocol-7 Active</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-neural-text/40 uppercase">System Time</p>
            <p className="font-mono text-sm text-neural-neon">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Activity />} label="Total Sinyal" value={stats?.totalSignals || '...'} trend="+12%" />
        <StatCard icon={<Zap />} label="Sinyal Hari Ini" value={stats?.todaySignals || '...'} trend="+5%" />
        <StatCard icon={<Target />} label="Win Rate" value={stats?.winRate || '...'} trend="+2.1%" />
        <StatCard icon={<Cpu />} label="Provider Aktif" value={stats?.activeProviders || '0'} subValue={apiKeys.map(k => k.provider).join(', ') || 'None'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Signals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">RIWAYAT SINYAL TERAKHIR</h2>
            <button className="text-xs font-mono text-neural-neon hover:underline uppercase">Lihat Semua</button>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neural-red/10 border-b border-neural-red/20 font-mono text-[10px] uppercase tracking-widest text-neural-neon">
                  <th className="px-6 py-3">Pair</th>
                  <th className="px-6 py-3">Mode</th>
                  <th className="px-6 py-3">Direction</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neural-red/10 text-xs font-mono">
                {signals.map((sig: any) => (
                  <SignalRow 
                    key={sig.id}
                    pair={sig.pair} 
                    mode={sig.mode} 
                    direction={sig.direction} 
                    result={sig.result || 'PENDING'} 
                    time={new Date(sig.createdAt).toLocaleTimeString()} 
                    pnl={sig.pnl || '--'} 
                  />
                ))}
                {signals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neural-text/40">Belum ada sinyal</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg mb-4">ACTIVE PROVIDERS</h2>
            <div className="space-y-3">
              {apiKeys.map((key: any) => (
                <ProviderStatus key={key.provider} name={key.provider} model={key.model} status={key.status} />
              ))}
              {apiKeys.length === 0 && (
                <p className="text-xs text-neural-text/40">Belum ada provider aktif</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg mb-4">NOTIFIKASI TERBARU</h2>
            <div className="space-y-4">
              {notifications.map((notif: any) => (
                <NotificationItem key={notif.id} type={notif.type} text={notif.text} time={notif.createdAt} />
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-neural-text/40">Tidak ada notifikasi</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, subValue }: any) => (
  <Card className="relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 text-neural-red/20 group-hover:text-neural-neon/20 transition-colors">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 48 }) : icon}
    </div>
    <p className="text-[10px] font-mono text-neural-text/50 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-end gap-3">
      <p className="text-2xl font-orbitron text-white">{value}</p>
      {trend && (
        <span className="text-[10px] font-mono text-neural-neon mb-1">{trend}</span>
      )}
    </div>
    {subValue && (
      <p className="text-[10px] font-mono text-neural-text/40 mt-2 truncate">{subValue}</p>
    )}
  </Card>
);

const SignalRow = ({ pair, mode, direction, result, time, pnl }: any) => (
  <tr className="hover:bg-neural-red/5 transition-colors">
    <td className="px-6 py-4 font-bold text-white">{pair}</td>
    <td className="px-6 py-4 text-neural-text/60">{mode}</td>
    <td className="px-6 py-4">
      <span className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold",
        direction === 'BUY' ? "bg-emerald-500/20 text-emerald-500" : "bg-neural-red/20 text-neural-neon"
      )}>
        {direction}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className={cn(
        "font-bold",
        result === 'WIN' ? "text-emerald-500" : result === 'LOSS' ? "text-neural-neon" : "text-neural-text/40"
      )}>
        {result} {pnl !== '--' && <span className="text-[10px] font-normal opacity-60">({pnl})</span>}
      </span>
    </td>
    <td className="px-6 py-4 text-neural-text/40">{time}</td>
  </tr>
);

const ProviderStatus = ({ name, model, status }: any) => (
  <div className="flex items-center justify-between p-3 bg-neural-gray/50 border border-neural-red/10">
    <div>
      <p className="text-xs font-bold text-white">{name}</p>
      <p className="text-[10px] font-mono text-neural-text/40">{model}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-emerald-500 uppercase">{status}</span>
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const NotificationItem = ({ type, text, time }: any) => (
  <div className="flex gap-3">
    <div className="mt-1">
      <div className="w-2 h-2 bg-neural-red rounded-full"></div>
    </div>
    <div>
      <p className="text-xs text-neural-text/80">{text}</p>
      <p className="text-[10px] font-mono text-neural-text/30 mt-1">{time}</p>
    </div>
  </div>
);
