import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Clock, ChevronRight, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const challenges = {
  prefrontal_cortex: [
    { title: "5-Minute Focus", description: "Focus on a single task without distraction", xp: 50 },
    { title: "Decision Reset", description: "Make 3 important decisions today without procrastinating", xp: 75 },
  ],
  amygdala: [
    { title: "Fear Facing", description: "Do one thing that makes you slightly uncomfortable", xp: 100 },
    { title: "Calm Response", description: "Practice pausing before reacting to stress", xp: 50 },
  ],
  hippocampus: [
    { title: "Memory Palace", description: "Visualize and recall 10 items in order", xp: 75 },
    { title: "Learn Something New", description: "Spend 10 minutes learning a new skill", xp: 50 },
  ],
  basal_ganglia: [
    { title: "Habit Stack", description: "Attach a new habit to an existing one", xp: 75 },
    { title: "Routine Check", description: "Complete your morning routine without breaking the chain", xp: 50 },
  ],
  nucleus_accumbens: [
    { title: "Delayed Gratification", description: "Wait 10 minutes before giving into a craving", xp: 100 },
    { title: "Healthy Reward", description: "Replace one unhealthy reward with a healthy one", xp: 75 },
  ],
  hypothalamus: [
    { title: "Hydration Check", description: "Drink water before every meal today", xp: 50 },
    { title: "Sleep Signal", description: "Dim lights 1 hour before bed", xp: 75 },
  ],
  cerebellum: [
    { title: "Balance Practice", description: "Stand on one foot for 30 seconds each side", xp: 50 },
    { title: "New Movement", description: "Try a new physical movement or stretch", xp: 75 },
  ],
};

export default function DailyChallenge({ selectedPart, onComplete, completedChallenges = [] }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const currentChallenges = selectedPart ? challenges[selectedPart] : [];
  const todayIndex = new Date().getDate() % currentChallenges.length;
  const todayChallenge = currentChallenges[todayIndex];

  const isCompleted = completedChallenges.includes(`${selectedPart}-${todayIndex}`);

  const handleComplete = () => {
    if (isCompleted || !todayChallenge) return;
    
    setEarnedXP(todayChallenge.xp);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onComplete(`${selectedPart}-${todayIndex}`, todayChallenge.xp);
    }, 1500);
  };

  if (!selectedPart || !todayChallenge) {
    return (
      <motion.div 
        className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Brain className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Select a brain region to see today's challenge</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex flex-col items-center justify-center z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2 }}
            >
              <Check className="w-16 h-16 text-white mb-4" />
            </motion.div>
            <motion.p
              className="text-white font-bold text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              +{earnedXP} XP Earned!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 ${isCompleted ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Daily Challenge</span>
              <span className="bg-amber-400/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium">
                +{todayChallenge.xp} XP
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{todayChallenge.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{todayChallenge.description}</p>
            
            <Button
              onClick={handleComplete}
              disabled={isCompleted}
              className={`w-full ${isCompleted 
                ? 'bg-emerald-600 hover:bg-emerald-600' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              } text-white font-semibold`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  Complete Challenge
                  <Zap className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}