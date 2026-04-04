import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function SimpleHabitCard({ habit, onLog, loggedCount, type }) {
  const isGood = type === 'good';

  return (
    <motion.button
      onClick={() => onLog(habit.id, {
        habit_id: habit.id,
        duration: habit.default_duration || 30,
        intensity: 2,
        timestamp: new Date().toISOString(),
        was_swap: false
      })}
      className={`w-full p-4 rounded-2xl transition-all relative overflow-hidden ${
        isGood 
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200' 
          : 'bg-gradient-to-br from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 border-2 border-rose-200'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{habit.icon_emoji || (isGood ? '✨' : '⚠️')}</span>
          <div className="text-left">
            <div className="font-bold text-slate-900">{habit.name}</div>
            <div className="text-xs text-slate-600">{habit.category}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loggedCount > 0 && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              isGood ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {loggedCount}x
            </div>
          )}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isGood ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
            <Plus className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}