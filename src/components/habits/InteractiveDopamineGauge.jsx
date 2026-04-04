import React from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Flame } from "lucide-react";

export default function InteractiveDopamineGauge({ score, goodTotal, badTotal, streak }) {
  const maxScore = 500;
  const normalizedScore = Math.max(-100, Math.min(100, (score / maxScore) * 100));
  const rotation = (normalizedScore / 100) * 135; // -135 to +135 degrees
  
  const getScoreColor = () => {
    if (normalizedScore > 50) return 'from-emerald-400 to-emerald-600';
    if (normalizedScore > 0) return 'from-green-400 to-green-600';
    if (normalizedScore > -50) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getGlowColor = () => {
    if (normalizedScore > 50) return 'rgba(16, 185, 129, 0.5)';
    if (normalizedScore > 0) return 'rgba(34, 197, 94, 0.5)';
    if (normalizedScore > -50) return 'rgba(251, 146, 60, 0.5)';
    return 'rgba(239, 68, 68, 0.5)';
  };

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto">
      {/* Gauge Background */}
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Gauge Arc Background */}
        <path
          d="M 25 100 A 75 75 0 0 1 175 100"
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Gauge Arc Gradient */}
        <path
          d="M 25 100 A 75 75 0 0 1 175 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Tick Marks */}
        {[-100, -50, 0, 50, 100].map((value, i) => {
          const angle = ((value / 100) * 135 - 90) * (Math.PI / 180);
          const x1 = 100 + 60 * Math.cos(angle);
          const y1 = 100 + 60 * Math.sin(angle);
          const x2 = 100 + 75 * Math.cos(angle);
          const y2 = 100 + 75 * Math.sin(angle);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Needle */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformOrigin: 'center bottom' }}
      >
        <motion.div
          className="relative"
          style={{ width: '100%', height: '60%' }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
               style={{ width: '4px', height: '45%', transformOrigin: 'bottom' }}>
            <div className={`w-full h-full bg-gradient-to-t ${getScoreColor()} rounded-full shadow-lg`}
                 style={{ filter: `drop-shadow(0 0 10px ${getGlowColor()})` }} />
          </div>
        </motion.div>
      </motion.div>

      {/* Center Circle */}
      <div className="absolute inset-0 flex items-end justify-center pb-4">
        <motion.div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-xl`}
          animate={{ 
            boxShadow: [`0 0 20px ${getGlowColor()}`, `0 0 30px ${getGlowColor()}`, `0 0 20px ${getGlowColor()}`]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {/* Score Display */}
      <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
        <motion.div
          className="text-4xl font-bold"
          key={score}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <span className={score > 0 ? 'text-emerald-600' : score < 0 ? 'text-red-600' : 'text-slate-600'}>
            {score > 0 ? '+' : ''}{score}
          </span>
        </motion.div>
        <div className="text-xs text-slate-500 font-medium">Dopamine Score</div>
      </div>

      {/* Stats Pills */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-3">
        <motion.div 
          className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
          whileHover={{ scale: 1.05 }}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">{goodTotal}</span>
        </motion.div>
        <motion.div 
          className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
          whileHover={{ scale: 1.05 }}
        >
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-semibold">{badTotal}</span>
        </motion.div>
        {streak > 0 && (
          <motion.div 
            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
            whileHover={{ scale: 1.05 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">{streak}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}