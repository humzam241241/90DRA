import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Zap } from "lucide-react";

export default function QuickLogButton({ habit, onLog, loggedCount, type }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [points, setPoints] = useState(0);

  const handleQuickLog = () => {
    const calculatedPoints = Math.round((habit.default_weight || 5) * 2 * (habit.default_duration || 30) / 10);
    setPoints(calculatedPoints);
    setShowSuccess(true);
    
    onLog(habit.id, {
      habit_id: habit.id,
      duration: habit.default_duration || 30,
      intensity: 2,
      timestamp: new Date().toISOString(),
      was_swap: false
    });

    setTimeout(() => setShowSuccess(false), 2000);
  };

  const isGood = type === 'good';

  return (
    <motion.button
      onClick={handleQuickLog}
      className={`relative flex items-center justify-between p-4 border-2 rounded-xl transition-all overflow-hidden ${
        isGood 
          ? 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50' 
          : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className={`absolute inset-0 flex items-center justify-center ${
              isGood ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-white font-bold flex items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Check className="w-6 h-6" />
              <span>{isGood ? '+' : '-'}{points} pts</span>
              <Zap className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex items-center gap-3 flex-1">
        <motion.span 
          className="text-3xl"
          animate={{ rotate: showSuccess ? [0, -10, 10, -10, 0] : 0 }}
          transition={{ duration: 0.5 }}
        >
          {habit.icon_emoji || (isGood ? '✨' : '⚠️')}
        </motion.span>
        <div className="text-left flex-1">
          <div className="font-semibold text-slate-900">{habit.name}</div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>{habit.category}</span>
            {loggedCount > 0 && (
              <motion.span 
                className={`px-2 py-0.5 rounded-full text-white text-[10px] font-medium ${
                  isGood ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={loggedCount}
              >
                {loggedCount}x
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <motion.div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isGood 
            ? 'bg-emerald-100 text-emerald-600' 
            : 'bg-rose-100 text-rose-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
}