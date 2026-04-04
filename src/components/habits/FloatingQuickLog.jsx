import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Zap } from "lucide-react";

export default function FloatingQuickLog({ habits, onLog }) {
  const [isOpen, setIsOpen] = useState(false);

  const goodHabits = habits.filter(h => h.type === 'good').slice(0, 4);
  const badHabits = habits.filter(h => h.type === 'bad').slice(0, 4);

  const handleQuickLog = async (habit) => {
    await onLog(habit.id, {
      habit_id: habit.id,
      duration: habit.default_duration || 30,
      intensity: 2,
      timestamp: new Date().toISOString(),
      was_swap: false
    });
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Quick Log Panel */}
            <motion.div
              className="fixed bottom-24 right-4 md:right-6 z-50 bg-white rounded-3xl shadow-2xl p-4 md:p-6 w-[90vw] max-w-sm max-h-[70vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-emerald-700 mb-2">Good Habits</h3>
                  <div className="space-y-2">
                    {goodHabits.map((habit) => (
                      <motion.button
                        key={habit.id}
                        onClick={() => handleQuickLog(habit)}
                        className="w-full flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-left"
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-2xl">{habit.icon_emoji || '✨'}</span>
                        <span className="font-medium text-sm text-slate-900">{habit.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-rose-700 mb-2">Bad Habits</h3>
                  <div className="space-y-2">
                    {badHabits.map((habit) => (
                      <motion.button
                        key={habit.id}
                        onClick={() => handleQuickLog(habit)}
                        className="w-full flex items-center gap-3 p-3 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors text-left"
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-2xl">{habit.icon_emoji || '⚠️'}</span>
                        <span className="font-medium text-sm text-slate-900">{habit.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full shadow-2xl flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
      </motion.button>
    </>
  );
}