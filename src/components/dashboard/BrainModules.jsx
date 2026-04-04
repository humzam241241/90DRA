import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Heart, Target, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const brainModules = [
  {
    id: "prefrontal_cortex",
    name: "Decision Making",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    description: "Willpower & self-control",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: "amygdala",
    name: "Emotional Control",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    description: "Fear & stress response",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  {
    id: "hippocampus",
    name: "Memory & Learning",
    icon: Brain,
    color: "from-green-500 to-emerald-500",
    description: "Form new habits",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: "basal_ganglia",
    name: "Habit Formation",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    description: "Automatic routines",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  {
    id: "nucleus_accumbens",
    name: "Reward System",
    icon: Trophy,
    color: "from-purple-500 to-violet-500",
    description: "Motivation & pleasure",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: "hypothalamus",
    name: "Sleep & Appetite",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    description: "Regulate energy",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20"
  }
];

export default function BrainModules({ completedLessons = {}, totalLessons = {} }) {
  const getProgress = (moduleId) => {
    const completed = completedLessons[moduleId] || 0;
    const total = totalLessons[moduleId] || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
            Brain Training Modules
          </CardTitle>
          <Link to={createPageUrl("Mindset")}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs md:text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All →
            </motion.button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {brainModules.map((module, index) => {
            const progress = getProgress(module.id);
            const Icon = module.icon;
            
            return (
              <Link key={module.id} to={createPageUrl("Mindset")}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative overflow-hidden rounded-xl border p-3 md:p-4 cursor-pointer
                    ${module.bgColor} ${module.borderColor}
                    transition-all duration-300
                  `}
                >
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 hover:opacity-10 transition-opacity`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${module.color} shadow-lg`}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      {progress > 0 && (
                        <div className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-full">
                          {progress}%
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-white font-bold text-xs md:text-sm mb-1">
                      {module.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] md:text-xs leading-tight">
                      {module.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {progress > 0 && (
                      <div className="mt-2 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${module.color} rounded-full`}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 md:p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <p className="text-slate-300 text-xs md:text-sm text-center">
            <span className="font-semibold text-violet-400">Tap any module</span> to start training that brain region
          </p>
        </div>
      </CardContent>
    </Card>
  );
}