import React, { useState, useEffect } from 'react';
import { Card, Button, Input, cn } from '../components/UI';
import { Users, Zap, MessageSquare, Bell, ShieldAlert, Search, Filter, MoreVertical, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'motion/react';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [broadcast, setBroadcast] = useState({ title: '', text: '', type: 'system' });
  const token = localStorage.getItem('neural_token');

  useEffect(() => {
    if (!token) return;
    const fetchAdminData = async () => {
      try {
        const [adminStats, allUsers] = await Promise.all([
          api.admin.getDashboard(token) as Promise<any>,
          api.admin.getUsers(token) as Promise<any>
        ]);
        setStats(adminStats);
        setUsers(Array.isArray(allUsers) ? allUsers : []);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      }
    };
    fetchAdminData();
  }, [token]);

  const handleBroadcast = async () => {
    if (!token) return;
    try {
      await api.admin.broadcast(token, broadcast);
      alert('Broadcast berhasil dikirim');
      setBroadcast({ title: '', text: '', type: 'system' });
    } catch (error: any) {
      alert(error.message || 'Gagal mengirim broadcast');
    }
  };

  const tabs = ['DASHBOARD', 'USERS', 'SIGNALS', 'FORUM', 'BROADCAST'];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl mb-2 flex items-center gap-3">
            <ShieldAlert className="text-neural-neon w-8 h-8" />
            PANEL KONTROL ADMIN
          </h1>
          <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Protocol-7 Master Command</p>
        </div>
        <div className="bg-neural-red/20 border border-neural-red/40 px-4 py-2">
          <span className="text-[10px] font-mono text-neural-neon uppercase tracking-widest animate-pulse">Root Access Granted</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-neural-red/10 pb-4">
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
              <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neural-neon" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard icon={<Users />} label="Total User" value={stats?.totalUsers || '...'} sub={`${stats?.newUsersToday || 0} Baru Hari Ini`} />
              <AdminStatCard icon={<Zap />} label="Total Sinyal" value={stats?.totalSignals || '...'} sub={`${stats?.signalsToday || 0} Hari Ini`} />
              <AdminStatCard icon={<MessageSquare />} label="Forum Posts" value={stats?.totalPosts || '...'} sub={`${stats?.postsToday || 0} Baru`} />
              <AdminStatCard icon={<Bell />} label="Notifikasi" value={stats?.totalNotifications || '...'} sub="Broadcast Aktif" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <h3 className="font-orbitron text-sm text-white mb-6 uppercase tracking-widest">Pertumbuhan User (7 Hari)</h3>
                <div className="h-48 flex items-end gap-2">
                  {[40, 65, 45, 90, 75, 100, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-neural-red/20 relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="absolute bottom-0 left-0 w-full bg-neural-red group-hover:bg-neural-neon transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 font-mono text-[10px] text-neural-text/40">
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
              </Card>

              <Card>
                <h3 className="font-orbitron text-sm text-white mb-6 uppercase tracking-widest">Sinyal Per Provider</h3>
                <div className="space-y-4">
                  <ProviderBar label="Gemini" percent={45} count="5,580" />
                  <ProviderBar label="Groq" percent={30} count="3,720" />
                  <ProviderBar label="OpenAI" percent={15} count="1,860" />
                  <ProviderBar label="Lainnya" percent={10} count="1,242" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red/40" />
                <Input className="pl-10" placeholder="Cari user (nama/email)..." />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </div>

            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neural-red/10 border-b border-neural-red/20 font-mono text-[10px] uppercase tracking-widest text-neural-neon">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neural-red/10 text-xs font-mono">
                  {users.map((u: any) => (
                    <UserRow 
                      key={u.id}
                      name={u.username} 
                      email={u.email} 
                      role={u.role} 
                      status={u.status} 
                      date={new Date(u.createdAt).toLocaleDateString()} 
                    />
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neural-text/40">Tidak ada user ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'BROADCAST' && (
          <div className="max-w-2xl mx-auto">
            <Card className="space-y-6">
              <h3 className="font-orbitron text-sm text-neural-neon uppercase tracking-widest">Kirim Broadcast Notifikasi</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Target Audience</label>
                  <select className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-xs text-neural-text focus:outline-none focus:border-neural-neon">
                    <option>Semua User</option>
                    <option>User Terverifikasi</option>
                    <option>User Tertentu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Judul Notifikasi</label>
                  <Input 
                    value={broadcast.title}
                    onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                    placeholder="System Maintenance Alert" 
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Pesan Notifikasi</label>
                  <textarea 
                    value={broadcast.text}
                    onChange={(e) => setBroadcast({ ...broadcast, text: e.target.value })}
                    className="w-full h-32 bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-xs text-neural-text focus:outline-none focus:border-neural-neon resize-none" 
                    placeholder="Masukkan pesan broadcast..."
                  ></textarea>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Tipe Notifikasi</label>
                  <div className="flex gap-4">
                    {['system', 'admin', 'warning'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="type" 
                          className="accent-neural-red" 
                          checked={broadcast.type === t}
                          onChange={() => setBroadcast({ ...broadcast, type: t })}
                        />
                        <span className="text-[10px] font-mono text-neural-text/60 group-hover:text-neural-neon uppercase">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleBroadcast} className="w-full py-4">KIRIM BROADCAST</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminStatCard = ({ icon, label, value, sub }: any) => (
  <Card className="relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 text-neural-red/10">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 40 }) : icon}
    </div>
    <p className="text-[10px] font-mono text-neural-text/40 uppercase mb-1">{label}</p>
    <p className="text-2xl font-orbitron text-white mb-1">{value}</p>
    <p className="text-[10px] font-mono text-neural-neon">{sub}</p>
  </Card>
);

const ProviderBar = ({ label, percent, count }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-mono">
      <span className="text-neural-text/60">{label}</span>
      <span className="text-neural-neon">{count} ({percent}%)</span>
    </div>
    <div className="w-full h-1.5 bg-neural-gray overflow-hidden">
      <div className="h-full bg-neural-red" style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const UserRow = ({ name, email, role, status, date }: any) => (
  <tr className="hover:bg-neural-red/5 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-neural-red/10 border border-neural-red/20 flex items-center justify-center text-neural-neon font-bold text-[10px]">
          {name[0]}
        </div>
        <div>
          <p className="text-white font-bold">{name}</p>
          <p className="text-[10px] text-neural-text/40">{email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold",
        role === 'Admin' ? "bg-neural-neon/20 text-neural-neon" : "bg-neural-gray text-neural-text/60"
      )}>
        {role}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className={cn(
        "flex items-center gap-1.5",
        status === 'Verified' ? "text-emerald-500" : "text-neural-red"
      )}>
        {status === 'Verified' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {status}
      </span>
    </td>
    <td className="px-6 py-4 text-neural-text/40">{date}</td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <button className="p-1 text-neural-text/40 hover:text-neural-neon"><MoreVertical className="w-4 h-4" /></button>
        <button className="p-1 text-neural-text/40 hover:text-neural-red"><Trash2 className="w-4 h-4" /></button>
      </div>
    </td>
  </tr>
);
