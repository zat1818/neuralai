import React, { useState, useEffect } from 'react';
import { Card, Button, Input, cn } from '../components/UI';
import { Users, Zap, MessageSquare, Bell, ShieldAlert, Search, Filter, MoreVertical, CheckCircle, XCircle, Trash2, Ban, UserCheck, Bug, Database, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [broadcast, setBroadcast] = useState({ title: '', text: '', type: 'system' });
  const [backupUri, setBackupUri] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [searchUser, setSearchUser] = useState('');
  const [banModal, setBanModal] = useState<{ userId: string; username: string } | null>(null);
  const [banReason, setBanReason] = useState('');
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
        console.er
        ror('Failed to fetch admin data', error);
      }
    };
    fetchAdminData();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'MODERATION' && token) {
      api.admin.getBugReports(token).then((data: any) => {
        setBugReports(Array.isArray(data) ? data : []);
      }).catch(console.error);
    }
  }, [activeTab, token]);

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

  const handleBanUser = async () => {
    if (!token || !banModal) return;
    try {
      await api.admin.banUser(token, banModal.userId, { reason: banReason || 'Pelanggaran kebijakan' });
      setUsers(users.map(u => u.id === banModal.userId ? { ...u, banned: true, bannedreason: banReason } : u));
      setBanModal(null);
      setBanReason('');
      alert(`User ${banModal.username} berhasil dibanned`);
    } catch (error: any) {
      alert(error.message || 'Gagal ban user');
    }
  };

  const handleUnbanUser = async (userId: string, username: string) => {
    if (!token) return;
    if (!confirm(`Unban user ${username}?`)) return;
    try {
      await api.admin.unbanUser(token, userId);
      setUsers(users.map(u => u.id === userId ? { ...u, banned: false, bannedreason: null } : u));
      alert(`User ${username} berhasil di-unban`);
    } catch (error: any) {
      alert(error.message || 'Gagal unban user');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    if (!token) return;
    try {
      await api.admin.verifyUser(token, userId);
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'verified' } : u));
    } catch (error: any) {
      alert(error.message || 'Gagal verifikasi user');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!token) return;
    if (!confirm(`Hapus user ${username}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.admin.deleteUser(token, userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      alert(error.message || 'Gagal hapus user');
    }
  };

  const handleUpdateBugReport = async (id: string, status: string, adminNote: string) => {
    if (!token) return;
    try {
      await api.admin.updateBugReport(token, id, { status, adminNote });
      setBugReports(bugReports.map(b => b.id === id ? { ...b, status, adminnote: adminNote } : b));
    } catch (error: any) {
      alert(error.message || 'Gagal update bug report');
    }
  };

  const handleDeleteBugReport = async (id: string) => {
    if (!token) return;
    if (!confirm('Hapus bug report ini?')) return;
    try {
      await api.admin.deleteBugReport(token, id);
      setBugReports(bugReports.filter(b => b.id !== id));
    } catch (error: any) {
      alert(error.message || 'Gagal hapus bug report');
    }
  };

  const handleBackup = async () => {
    if (!token || !backupUri.trim()) return;
    setBackupLoading(true);
    setBackupResult(null);
    try {
      const result: any = await api.admin.backupDB(token, { targetUri: backupUri });
      setBackupResult({ success: true, ...result });
    } catch (error: any) {
      setBackupResult({ success: false, message: error.message });
    } finally {
      setBackupLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    !searchUser || 
    u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const tabs = ['DASHBOARD', 'USERS', 'MODERATION', 'BROADCAST', 'BACKUP'];

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
            {tab === 'MODERATION' && bugReports.filter(b => b.status === 'open').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-neural-red text-white text-[8px] rounded-full flex items-center justify-center">
                {bugReports.filter(b => b.status === 'open').length}
              </span>
            )}
            {activeTab === tab && (
              <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neural-neon" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {/* DASHBOARD TAB */}
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

        {/* USERS TAB */}
        {activeTab === 'USERS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red/40" />
                <Input 
                  className="pl-10" 
                  placeholder="Cari user (nama/email)..." 
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
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
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className={cn("hover:bg-neural-red/5 transition-colors", u.banned && "bg-neural-red/5")}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 border flex items-center justify-center text-neural-neon font-bold text-[10px]",
                            u.banned ? "bg-neural-red/20 border-neural-red/40" : "bg-neural-red/10 border-neural-red/20"
                          )}>
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold flex items-center gap-2">
                              {u.username}
                              {u.banned && <span className="text-[8px] bg-neural-red/20 text-neural-neon px-1 py-0.5 border border-neural-red/30">BANNED</span>}
                            </p>
                            <p className="text-[10px] text-neural-text/40">{u.email}</p>
                            {u.banned && u.bannedreason && (
                              <p className="text-[9px] text-neural-red/60 mt-0.5">Alasan: {u.bannedreason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold",
                          u.role === 'admin' ? "bg-neural-neon/20 text-neural-neon" : "bg-neural-gray text-neural-text/60"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "flex items-center gap-1.5",
                          u.status === 'verified' ? "text-emerald-500" : "text-neural-red"
                        )}>
                          {u.status === 'verified' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neural-text/40">
                        {u.createdat ? new Date(u.createdat).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {u.status !== 'verified' && (
                            <button 
                              onClick={() => handleVerifyUser(u.id)}
                              title="Verifikasi"
                              className="p-1 text-neural-text/40 hover:text-emerald-500"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          {!u.banned ? (
                            <button 
                              onClick={() => setBanModal({ userId: u.id, username: u.username })}
                              title="Ban User"
                              className="p-1 text-neural-text/40 hover:text-neural-neon"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUnbanUser(u.id, u.username)}
                              title="Unban User"
                              className="p-1 text-neural-text/40 hover:text-emerald-500"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            title="Hapus User"
                            className="p-1 text-neural-text/40 hover:text-neural-red"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neural-text/40">Tidak ada user ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* MODERATION TAB */}
        {activeTab === 'MODERATION' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-orbitron text-sm text-neural-neon mb-6 uppercase tracking-widest flex items-center gap-2">
                <Bug className="w-4 h-4" /> Laporan Bug dari User
              </h3>
              
              {bugReports.length === 0 ? (
                <Card className="text-center py-12">
                  <Bug className="w-12 h-12 text-neural-text/20 mx-auto mb-4" />
                  <p className="text-neural-text/40 font-mono text-sm">Tidak ada laporan bug</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bugReports.map((bug: any) => (
                    <BugReportCard 
                      key={bug.id} 
                      bug={bug} 
                      onUpdate={handleUpdateBugReport}
                      onDelete={handleDeleteBugReport}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BROADCAST TAB */}
        {activeTab === 'BROADCAST' && (
          <div className="max-w-2xl mx-auto">
            <Card className="space-y-6">
              <h3 className="font-orbitron text-sm text-neural-neon uppercase tracking-widest">Kirim Broadcast Notifikasi</h3>
              
              <div className="space-y-4">
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

        {/* BACKUP TAB */}
        {activeTab === 'BACKUP' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="space-y-6">
              <div className="flex items-center gap-3">
                <Database className="text-neural-neon w-5 h-5" />
                <h3 className="font-orbitron text-sm text-neural-neon uppercase tracking-widest">Backup Database</h3>
              </div>

              <div className="p-4 bg-neural-red/5 border border-neural-red/20">
                <p className="text-[10px] font-mono text-neural-text/60">
                  Fitur ini akan menyalin semua data dari database aktif ke database target yang Anda tentukan. 
                  Pastikan database target sudah memiliki schema yang sama.
                </p>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">
                  Target Database URI
                </label>
                <Input
                  value={backupUri}
                  onChange={(e) => setBackupUri(e.target.value)}
                  placeholder="postgresql://user:password@host:5432/dbname"
                  type="password"
                />
                <p className="text-[10px] font-mono text-neural-text/30 mt-1">
                  Format: postgresql://username:password@host:port/database
                </p>
              </div>

              <Button 
                onClick={handleBackup} 
                disabled={backupLoading || !backupUri.trim()}
                className="w-full py-4 flex items-center justify-center gap-2"
              >
                {backupLoading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> MEMBACKUP...</>
                ) : (
                  <><Database className="w-4 h-4" /> MULAI BACKUP</>
                )}
              </Button>

              {backupResult && (
                <div className={cn(
                  "p-4 border",
                  backupResult.success ? "bg-emerald-500/10 border-emerald-500/30" : "bg-neural-red/10 border-neural-red/30"
                )}>
                  <p className={cn(
                    "font-mono text-sm font-bold mb-2",
                    backupResult.success ? "text-emerald-500" : "text-neural-neon"
                  )}>
                    {backupResult.success ? '✅ Backup Berhasil' : '❌ Backup Gagal'}
                  </p>
                  {backupResult.success && backupResult.stats && (
                    <div className="space-y-1">
                      {Object.entries(backupResult.stats).map(([table, count]) => (
                        <div key={table} className="flex justify-between text-[10px] font-mono text-neural-text/60">
                          <span>{table}</span>
                          <span className="text-neural-neon">{String(count)} rows</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!backupResult.success && (
                    <p className="text-[10px] font-mono text-neural-text/60">{backupResult.message}</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <AnimatePresence>
        {banModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="p-0 overflow-hidden border-neural-red/50">
                <div className="p-6 border-b border-neural-red/20 bg-neural-red/10 flex items-center gap-3">
                  <Ban className="text-neural-neon w-5 h-5" />
                  <h2 className="font-orbitron text-white uppercase">Ban User: {banModal.username}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Alasan Ban</label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full h-24 bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-xs text-neural-text focus:outline-none focus:border-neural-neon resize-none"
                      placeholder="Masukkan alasan ban..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setBanModal(null)} className="flex-1">BATAL</Button>
                    <Button onClick={handleBanUser} className="flex-1 bg-neural-red hover:bg-neural-red/80">BAN USER</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
