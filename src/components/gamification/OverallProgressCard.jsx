import React from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Star, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function OverallProgressCard({ user }) {
  const totalXP = (user?.mindset_xp || 0) + (user?.workout_xp || 0) + (user?.nutrition_xp || 0);
  const level = Math.floor(totalXP / 1000) + 1;
  const xpForNextLevel = level * 1000;
  const xpProgress = totalXP % 1000;
  const progressPercent = (xpProgress / 1000) * 100;

  const totalWorkouts = user?.completed_workouts?.length || 0;
  const totalLessons = user?.completed_mindset_lessons?.length || 0;
  const streaks = {
    mindset: user?.mindset_streak || 0,
    dopamine: user?.dopamine_streak || 0,
    workout: user?.workout_streak || 0,
  };
  const totalStreak = Math.max(...Object.values(streaks));

  return (
    <Card className="overflow-hidden border-2 border-blue-400 shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-90 font-medium">Overall Progress</div>
            <div className="text-4xl font-bold flex items-center gap-2 mt-1">
              <Trophy className="w-8 h-8" />
              Level {level}
            </div>
          </div>
          <motion.div
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-8 h-8 text-yellow-300" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">{xpProgress} / 1000 XP</span>
            <span className="opacity-90">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs opacity-80">
            {1000 - xpProgress} XP until Level {level + 1}
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            className="text-center p-3 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-violet-700">{totalXP}</div>
            <div className="text-xs text-violet-600 font-medium">Total XP</div>
          </motion.div>
          
          <motion.div
            className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-emerald-700">{totalWorkouts}</div>
            <div className="text-xs text-emerald-600 font-medium">Workouts</div>
          </motion.div>
          
          <motion.div
            className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-orange-700">{totalStreak}</div>
            <div className="text-xs text-orange-600 font-medium">Best Streak</div>
          </motion.div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Star className="w-3 h-3 text-violet-500" />
                Mindset
              </span>
              <span className="text-xs text-slate-500">{user?.mindset_xp || 0} XP</span>
            </div>
            <Progress value={((user?.mindset_xp || 0) / 5000) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Workouts
              </span>
              <span className="text-xs text-slate-500">{user?.workout_xp || 0} XP</span>
            </div>
            <Progress value={((user?.workout_xp || 0) / 5000) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Award className="w-3 h-3 text-orange-500" />
                Habits
              </span>
              <span className="text-xs text-slate-500">{user?.dopamine_xp || 0} XP</span>
            </div>
            <Progress value={((user?.dopamine_xp || 0) / 5000) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}