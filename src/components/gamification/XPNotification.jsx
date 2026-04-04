import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Star, Award } from "lucide-react";

let notificationQueue = [];
let showNotification = null;

export const triggerXPNotification = (xp, type = "general") => {
  notificationQueue.push({ xp, type, id: Date.now() });
  if (showNotification) {
    showNotification();
  }
};

export default function XPNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    showNotification = () => {
      if (notificationQueue.length > 0 && !notification) {
        const next = notificationQueue.shift();
        setNotification(next);
        setTimeout(() => {
          setNotification(null);
          if (notificationQueue.length > 0) {
            showNotification();
          }
        }, 2500);
      }
    };

    if (notificationQueue.length > 0) {
      showNotification();
    }
  }, [notification]);

  const getConfig = (type) => {
    const configs = {
      workout: { icon: Zap, color: 'from-emerald-500 to-teal-600', label: 'Workout XP' },
      mindset: { icon: Star, color: 'from-violet-500 to-purple-600', label: 'Mindset XP' },
      habit: { icon: Award, color: 'from-orange-500 to-red-600', label: 'Habit XP' },
      general: { icon: Zap, color: 'from-blue-500 to-indigo-600', label: 'XP Gained' },
    };
    return configs[type] || configs.general;
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed top-24 right-6 z-50"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
        >
          <motion.div
            className={`bg-gradient-to-r ${getConfig(notification.type).color} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3`}
            animate={{ 
              boxShadow: [
                '0 10px 40px rgba(0,0,0,0.3)',
                '0 15px 50px rgba(0,0,0,0.4)',
                '0 10px 40px rgba(0,0,0,0.3)'
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 0] }}
              transition={{ duration: 0.5 }}
            >
              {React.createElement(getConfig(notification.type).icon, { className: "w-6 h-6" })}
            </motion.div>
            <div>
              <div className="text-sm font-medium opacity-90">{getConfig(notification.type).label}</div>
              <div className="text-2xl font-bold">+{notification.xp} XP</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}