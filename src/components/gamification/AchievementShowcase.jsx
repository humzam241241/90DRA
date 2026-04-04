import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Flame, Zap, Award, Target, Crown, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const achievements = [
  { id: 'first_workout', name: 'First Step', icon: Star, color: 'from-yellow-400 to-orange-500', requirement: (u) => (u?.completed_workouts?.length || 0) >= 1 },
  { id: 'week_streak', name: 'Week Warrior', icon: Flame, color: 'from-orange-400 to-red-500', requirement: (u) => Math.max(u?.mindset_streak || 0, u?.workout_streak || 0, u?.dopamine_streak || 0) >= 7 },
  { id: 'level_5', name: 'Rising Star', icon: Zap, color: 'from-blue-400 to-indigo-500', requirement: (u) => Math.floor(((u?.mindset_xp || 0) + (u?.workout_xp || 0) + (u?.nutrition_xp || 0)) / 1000) + 1 >= 5 },
  { id: 'brain_master', name: 'Brain Master', icon: Target, color: 'from-violet-400 to-purple-500', requirement: (u) => (u?.completed_mindset_lessons?.length || 0) >= 10 },
  { id: 'consistency', name: 'Consistent', icon: Medal, color: 'from-emerald-400 to-teal-500', requirement: (u) => (u?.completed_workouts?.length || 0) >= 30 },
  { id: 'champion', name: 'Champion', icon: Crown, color: 'from-pink-400 to-rose-500', requirement: (u) => Math.floor(((u?.mindset_xp || 0) + (u?.workout_xp || 0) + (u?.nutrition_xp || 0)) / 1000) + 1 >= 10 },
];

export default function AchievementShowcase({ user }) {
  const unlockedAchievements = achievements.filter(a => a.requirement(user));
  const lockedAchievements = achievements.filter(a => !a.requirement(user));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => {
            const isUnlocked = achievement.requirement(user);
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
                <p className={`text-xs font-semibold ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                  {achievement.name}
                </p>
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
      </CardContent>
    </Card>
  );
}