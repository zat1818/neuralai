import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Zap, MessageSquare, ShieldAlert, Info, X } from 'lucide-react';
import { cn } from '../components/UI';

export interface Toast {
  id: string;
  type: 'tag' | 'signal' | 'system' | 'admin';
  text: string;
}

export function useNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'tag': return <MessageSquare className="w-4 h-4" />;
      case 'signal': return <Zap className="w-4 h-4" />;
      case 'system': return <Info className="w-4 h-4" />;
      case 'admin': return <ShieldAlert className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'tag': return "border-neural-neon bg-neural-black/90 text-neural-neon shadow-[0_0_15px_rgba(255,0,0,0.3)]";
      case 'signal': return "border-emerald-500 bg-neural-black/90 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
      case 'system': return "border-blue-500 bg-neural-black/90 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
      case 'admin': return "border-neural-red bg-neural-red/10 text-white shadow-[0_0_20px_rgba(255,0,0,0.5)]";
      default: return "border-neural-red/20 bg-neural-black/90 text-neural-text";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "p-4 border flex gap-3 items-start relative overflow-hidden group",
              getColors(toast.type)
            )}
          >
            <div className="mt-0.5 shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-1">
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">{toast.type}</p>
              <p className="text-xs font-rajdhani font-medium leading-tight">{toast.text}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Progress bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
