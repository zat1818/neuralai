import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setVisible(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-neural-black flex flex-col items-center justify-center"
        >
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 border-4 border-neural-red/20 rounded-full"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-t-neural-neon rounded-full"
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-orbitron text-neural-neon text-xl">N</span>
            </div>
          </div>
          <div className="w-64 h-1 bg-neural-gray relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-neural-neon shadow-[0_0_10px_rgba(255,0,0,0.8)]"
            ></motion.div>
          </div>
          <div className="mt-4 font-mono text-neural-neon text-xs tracking-widest uppercase">
            Initializing Neural Core... {progress}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
