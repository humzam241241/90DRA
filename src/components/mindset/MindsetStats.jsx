import React from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Star, Target } from "lucide-react";

export default function MindsetStats({ stats }) {
  const { 
    totalXP = 0, 
    level = 1, 
    streak = 0, 
    lessonsCompleted = 0,
    totalLessons = 0
  } = stats;

  const xpForNextLevel = level * 500;
  const currentLevelXP = totalXP % 500;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const statItems = [
    {
      icon: Zap,
      label: "Total XP",
      value: totalXP.toLocaleString(),
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: Flame,
      label: "Day Streak",
      value: streak,
      color: "from-red-400 to-rose-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Target,
      label: "Completed",
      value: `${lessonsCompleted}/${totalLessons}`,
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <motion.div 
        className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform -translate-x-12 translate-y-12" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Current Level</p>
                <p className="text-2xl font-bold">Level {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Next Level</p>
              <p className="font-semibold">{currentLevelXP}/{xpForNextLevel} XP</p>
            </div>
          </div>
          
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className={`${item.bgColor} rounded-xl p-4 text-center`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-800">{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}