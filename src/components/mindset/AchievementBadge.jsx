import React from "react";
import { motion } from "framer-motion";
import { Brain, Flame, Trophy, Star, Target, Zap, Award, Crown } from "lucide-react";

const achievements = [
  { id: 'first_lesson', name: 'First Step', description: 'Complete your first lesson', icon: Star, color: 'from-amber-400 to-yellow-500', requirement: 1 },
  { id: 'brain_explorer', name: 'Brain Explorer', description: 'Study all 7 brain regions', icon: Brain, color: 'from-purple-400 to-violet-500', requirement: 7 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day streak', icon: Flame, color: 'from-orange-400 to-red-500', requirement: 7 },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Complete 10 lessons', icon: Target, color: 'from-emerald-400 to-teal-500', requirement: 10 },
  { id: 'mind_master', name: 'Mind Master', description: 'Complete 30 lessons', icon: Crown, color: 'from-blue-400 to-indigo-500', requirement: 30 },
  { id: 'transformation', name: 'Transformation', description: 'Complete all 90 days', icon: Trophy, color: 'from-rose-400 to-pink-500', requirement: 90 },
];

export default function AchievementBadge({ lessonsCompleted = 0, streak = 0, uniqueBrainParts = 0 }) {
  const checkUnlocked = (achievement) => {
    switch (achievement.id) {
      case 'first_lesson':
        return lessonsCompleted >= 1;
      case 'brain_explorer':
        return uniqueBrainParts >= 7;
      case 'week_warrior':
        return streak >= 7;
      case 'knowledge_seeker':
        return lessonsCompleted >= 10;
      case 'mind_master':
        return lessonsCompleted >= 30;
      case 'transformation':
        return lessonsCompleted >= 90;
      default:
        return false;
    }
  };

  const getProgress = (achievement) => {
    switch (achievement.id) {
      case 'first_lesson':
        return Math.min(lessonsCompleted, 1);
      case 'brain_explorer':
        return Math.min(uniqueBrainParts, 7);
      case 'week_warrior':
        return Math.min(streak, 7);
      case 'knowledge_seeker':
        return Math.min(lessonsCompleted, 10);
      case 'mind_master':
        return Math.min(lessonsCompleted, 30);
      case 'transformation':
        return Math.min(lessonsCompleted, 90);
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-slate-800">Achievements</h3>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement, index) => {
          const isUnlocked = checkUnlocked(achievement);
          const progress = getProgress(achievement);
          const progressPercent = (progress / achievement.requirement) * 100;
          const IconComponent = achievement.icon;

          return (
            <motion.div
              key={achievement.id}
              className={`relative rounded-xl p-4 text-center ${
                isUnlocked ? 'bg-white shadow-lg' : 'bg-slate-100'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                isUnlocked 
                  ? `bg-gradient-to-br ${achievement.color}` 
                  : 'bg-slate-200'
              }`}>
                <IconComponent className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className={`text-xs font-semibold truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                {achievement.name}
              </p>
              {!isUnlocked && (
                <div className="mt-2">
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${achievement.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{progress}/{achievement.requirement}</p>
                </div>
              )}
              {isUnlocked && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                >
                  <Zap className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}