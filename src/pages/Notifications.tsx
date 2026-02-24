import { useState, useEffect } from 'react';
import { Card, Button, cn } from '../components/UI';
import { Bell, MessageSquare, Zap, ShieldAlert, Info, Check, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

export const Notifications = () => {
  const [activeTab, setActiveTab] = useState('Semua');
  const [notifications, setNotifications] = useState<any[]>([]);
  const token = localStorage.getItem('neural_token');
  const tabs = ['Semua', 'Tag & Mention', 'Signal', 'System', 'Admin'];

  useEffect(() => {
    if (!token) return;
    const fetchNotifs = async () => {
      try {
        const data: any = await api.notifications.getAll(token);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifs();
  }, [token]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await api.notifications.markRead(token, id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkReadAll = async () => {
    if (!token) return;
    try {
      await api.notifications.markReadAll(token);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!token) return;
    if (!confirm('Hapus semua notifikasi?')) return;
    try {
      await api.notifications.deleteAll(token);
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tag': return <MessageSquare className="w-4 h-4 text-neural-neon" />;
      case 'signal': return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'system': return <Info className="w-4 h-4 text-blue-500" />;
      case 'admin': return <ShieldAlert className="w-4 h-4 text-neural-red" />;
      default: return <Bell className="w-4 h-4 text-neural-text" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl mb-2">NOTIFIKASI SISTEM</h1>
          <p className="text-neural-text/50 font-mono text-xs uppercase tracking-widest">Protocol-7 Communication Hub</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkReadAll} className="text-[10px] py-2 flex items-center gap-2">
            <Check className="w-3 h-3" /> TANDAI SEMUA DIBACA
          </Button>
          <Button variant="outline" onClick={handleDeleteAll} className="text-[10px] py-2 border-neural-red/30 text-neural-red flex items-center gap-2">
            <Trash2 className="w-3 h-3" /> HAPUS SEMUA
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-neural-red/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 font-orbitron text-[10px] uppercase tracking-widest transition-all relative",
              activeTab === tab ? "text-neural-neon" : "text-neural-text/40 hover:text-neural-text"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neural-neon" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} onClick={() => handleMarkRead(notif.id)}>
            <Card 
              className={cn(
                "p-4 flex gap-4 items-start transition-all hover:border-neural-neon/30 cursor-pointer",
                !notif.read ? "bg-neural-red/5 border-neural-red/30" : "bg-neural-black/40 border-neural-red/10"
              )}
            >
              <div className={cn(
                "p-2 rounded shrink-0",
                !notif.read ? "bg-neural-red/20" : "bg-neural-gray"
              )}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className={cn("text-sm", !notif.read ? "text-white font-medium" : "text-neural-text/70")}>
                  {notif.text}
                </p>
                <p className="text-[10px] font-mono text-neural-text/40 mt-2 uppercase tracking-widest">{notif.createdAt}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-neural-neon rounded-full mt-2"></div>
              )}
            </Card>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-center text-neural-text/40 py-12">Tidak ada notifikasi</p>}
      </div>
    </div>
  );
};
