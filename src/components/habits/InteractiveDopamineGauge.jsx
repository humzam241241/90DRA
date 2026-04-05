import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";

export default function InteractiveDopamineGauge({ score, goodTotal, badTotal, streak }) {
  const maxScore = 500;
  const normalized = Math.max(-100, Math.min(100, (score / maxScore) * 100));
  // Needle angle: -100 → -90deg, 0 → 0deg, +100 → +90deg
  const needleAngle = (normalized / 100) * 90;

  const getScoreColor = () => {
    if (score > 50) return "text-emerald-600";
    if (score > 0) return "text-green-600";
    if (score > -50) return "text-orange-600";
    if (score < 0) return "text-red-600";
    return "text-slate-600";
  };

  const getLabel = () => {
    if (score > 100) return "Excellent";
    if (score > 50) return "Great";
    if (score > 0) return "Good";
    if (score === 0) return "Neutral";
    if (score > -50) return "Needs Work";
    return "Critical";
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Gauge SVG */}
      <div className="relative w-full max-w-[320px]">
        <svg viewBox="0 0 200 120" className="w-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="33%" stopColor="#F59E0B" />
              <stop offset="66%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {[-100, -50, 0, 50, 100].map((value) => {
            const angle = ((value / 100) * 90 - 90) * (Math.PI / 180);
            const x1 = 100 + 65 * Math.cos(angle);
            const y1 = 100 + 65 * Math.sin(angle);
            const x2 = 100 + 80 * Math.cos(angle);
            const y2 = 100 + 80 * Math.sin(angle);
            return (
              <line
                key={value}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transformOrigin: "100px 100px" }}
            animate={{ rotate: needleAngle }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />

          {/* Needle pivot */}
          <circle cx="100" cy="100" r="6" fill="#0F172A" />
          <circle cx="100" cy="100" r="3" fill="white" />
        </svg>
      </div>

      {/* Score label below gauge */}
      <div className="text-center mt-4">
        <motion.div
          className={`text-5xl font-bold ${getScoreColor()}`}
          key={score}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {score > 0 ? "+" : ""}{score}
        </motion.div>
        <div className="text-sm text-slate-500 font-medium mt-1">
          Dopamine Score · <span className="font-semibold">{getLabel()}</span>
        </div>
      </div>

      {/* Stats pills */}
      <div className="flex gap-3 mt-4 flex-wrap justify-center">
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full flex items-center gap-2 border border-emerald-200">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">+{goodTotal} good</span>
        </div>
        <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-full flex items-center gap-2 border border-rose-200">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-semibold">-{badTotal} bad</span>
        </div>
        {streak > 0 && (
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full flex items-center gap-2 border border-orange-200">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">{streak} day streak</span>
          </div>
        )}
      </div>
    </div>
  );
}
