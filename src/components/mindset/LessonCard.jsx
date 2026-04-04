import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Lock, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const brainPartColors = {
  prefrontal_cortex: { bg: "bg-blue-500", light: "bg-blue-100 text-blue-700" },
  amygdala: { bg: "bg-red-500", light: "bg-red-100 text-red-700" },
  hippocampus: { bg: "bg-emerald-500", light: "bg-emerald-100 text-emerald-700" },
  basal_ganglia: { bg: "bg-amber-500", light: "bg-amber-100 text-amber-700" },
  nucleus_accumbens: { bg: "bg-purple-500", light: "bg-purple-100 text-purple-700" },
  hypothalamus: { bg: "bg-pink-500", light: "bg-pink-100 text-pink-700" },
  cerebellum: { bg: "bg-indigo-500", light: "bg-indigo-100 text-indigo-700" }
};

export default function LessonCard({ lesson, isCompleted, isLocked, index, onClick }) {
  const colors = brainPartColors[lesson.brain_part] || { bg: "bg-slate-500", light: "bg-slate-100 text-slate-700" };
  const xpReward = 100 + (lesson.duration_minutes || 5) * 5;

  return (
    <motion.button
      className={`w-full text-left rounded-2xl overflow-hidden transition-all duration-300 ${
        isLocked 
          ? 'bg-slate-100 cursor-not-allowed' 
          : isCompleted 
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200' 
            : 'bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100'
      }`}
      onClick={() => !isLocked && onClick(lesson)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      disabled={isLocked}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Day Number / Status */}
          <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLocked 
              ? 'bg-slate-200' 
              : isCompleted 
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                : colors.bg
          }`}>
            {isLocked ? (
              <Lock className="w-6 h-6 text-slate-400" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : (
              <span className="text-white font-bold text-lg">{lesson.day_number}</span>
            )}
            
            {/* XP Badge */}
            {!isLocked && !isCompleted && (
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                {xpReward}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${colors.light} text-xs`}>
                {lesson.brain_part?.replace(/_/g, ' ')}
              </Badge>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration_minutes || 5} min
              </span>
            </div>
            <h3 className={`font-semibold text-base mb-1 truncate ${
              isLocked ? 'text-slate-400' : isCompleted ? 'text-emerald-700' : 'text-slate-800'
            }`}>
              {isLocked ? 'Locked' : lesson.title}
            </h3>
            {lesson.key_takeaways && lesson.key_takeaways.length > 0 && !isLocked && (
              <p className="text-slate-500 text-sm truncate">
                {lesson.key_takeaways.length} key takeaways
              </p>
            )}
          </div>

          {/* Arrow */}
          {!isLocked && (
            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
              isCompleted ? 'text-emerald-400' : 'text-slate-300'
            }`} />
          )}
        </div>
      </div>
    </motion.button>
  );
}