import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Award, Zap } from "lucide-react";

export default function BonusFireworks({ bonuses }) {
  const activeBonuses = Object.entries(bonuses)
    .filter(([key, value]) => key !== 'total' && value > 0)
    .map(([key, value]) => ({ key, value }));

  if (activeBonuses.length === 0) return null;

  const getBonusConfig = (key) => {
    const configs = {
      first_win: { icon: Star, color: 'from-green-400 to-emerald-500', label: 'First Win!' },
      streak_bonus: { icon: Zap, color: 'from-blue-400 to-indigo-500', label: 'Streak!' },
      swap_bonus: { icon: Sparkles, color: 'from-purple-400 to-violet-500', label: 'Swap!' },
      perfect_day: { icon: Award, color: 'from-yellow-400 to-orange-500', label: 'Perfect!' },
    };
    return configs[key] || { icon: Star, color: 'from-gray-400 to-gray-500', label: 'Bonus' };
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {activeBonuses.map(({ key, value }, index) => {
        const config = getBonusConfig(key);
        const IconComponent = config.icon;

        return (
          <motion.div
            key={key}
            className={`bg-gradient-to-r ${config.color} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: 0,
              opacity: 1
            }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
            >
              <IconComponent className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-bold">{config.label}</span>
            <span className="text-sm font-bold">+{value}</span>
          </motion.div>
        );
      })}
    </div>
  );
}