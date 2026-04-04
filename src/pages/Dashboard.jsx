import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dumbbell, 
  Salad, 
  Brain, 
  TrendingUp, 
  Droplet,
  ChevronRight,
  Target,
  Calendar,
  Zap,
  Award,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

import TodayWorkoutCard from "../components/dashboard/TodayWorkoutCard";
import NutritionOverview from "../components/dashboard/NutritionOverview";
import MindsetTask from "../components/dashboard/MindsetTask";
import QuickStats from "../components/dashboard/QuickStats";
import MotivationalQuote from "../components/dashboard/MotivationalQuote";
import HabitsDashboardWidget from "../components/dashboard/HabitsDashboardWidget";
import OverallProgressCard from "../components/gamification/OverallProgressCard";
import AchievementShowcase from "../components/gamification/AchievementShowcase";
import XPNotification from "../components/gamification/XPNotification";
import WeeklyTracker from "../components/dashboard/WeeklyTracker";
import BrainModules from "../components/dashboard/BrainModules";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dayNumber, setDayNumber] = useState(1);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData.program_start_date) {
        const start = new Date(userData.program_start_date);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDayNumber(Math.min(diffDays, 90));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: todayWorkout } = useQuery({
    queryKey: ['workout', dayNumber],
    queryFn: async () => {
      const workouts = await base44.entities.Workout.filter({ day_number: dayNumber });
      return workouts[0] || null;
    },
    enabled: !!dayNumber,
  });

  const { data: todayMindset } = useQuery({
    queryKey: ['mindset', dayNumber],
    queryFn: async () => {
      const lessons = await base44.entities.MindsetLesson.filter({ day_number: dayNumber });
      return lessons[0] || null;
    },
    enabled: !!dayNumber,
  });

  const { data: todayNutrition } = useQuery({
    queryKey: ['nutrition', format(new Date(), 'yyyy-MM-dd')],
    queryFn: async () => {
      return await base44.entities.NutritionLog.filter({ 
        date: format(new Date(), 'yyyy-MM-dd'),
        created_by: user?.email 
      });
    },
    enabled: !!user,
  });

  const { data: recentProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const entries = await base44.entities.ProgressEntry.filter(
        { created_by: user?.email },
        '-date',
        7
      );
      return entries;
    },
    enabled: !!user,
  });

  const { data: weeklyActivity } = useQuery({
    queryKey: ['weeklyActivity', user?.email],
    queryFn: async () => {
      const logs = await base44.entities.HabitLog.filter(
        { created_by: user?.email },
        '-timestamp',
        100
      );
      const dates = [...new Set(logs.map(log => format(new Date(log.timestamp), 'yyyy-MM-dd')))];
      return dates;
    },
    enabled: !!user,
  });

  const { data: mindsetLessons = [] } = useQuery({
    queryKey: ['mindset-lessons'],
    queryFn: () => base44.entities.MindsetLesson.list('day_number'),
  });

  const completedMindsetLessons = user?.completed_mindset_lessons || [];
  
  const lessonsByPart = mindsetLessons.reduce((acc, lesson) => {
    if (!acc[lesson.brain_part]) acc[lesson.brain_part] = [];
    acc[lesson.brain_part].push(lesson);
    return acc;
  }, {});

  const completedByPart = completedMindsetLessons.reduce((acc, lessonId) => {
    const lesson = mindsetLessons.find(l => l.id === lessonId);
    if (lesson) {
      acc[lesson.brain_part] = (acc[lesson.brain_part] || 0) + 1;
    }
    return acc;
  }, {});

  const totalByPart = Object.keys(lessonsByPart).reduce((acc, part) => {
    acc[part] = lessonsByPart[part]?.length || 0;
    return acc;
  }, {});

  const getMilestone = () => {
    if (dayNumber <= 7) return { title: "Week 1: Foundation", icon: Target, color: "from-blue-500 to-cyan-500" };
    if (dayNumber <= 28) return { title: "Week 4: Recalibration", icon: Zap, color: "from-amber-500 to-orange-500" };
    if (dayNumber <= 56) return { title: "Week 8: Breakthrough", icon: TrendingUp, color: "from-purple-500 to-pink-500" };
    if (dayNumber <= 90) return { title: "Week 12: Evolution", icon: Award, color: "from-emerald-500 to-teal-500" };
    return { title: "Completed!", icon: Award, color: "from-yellow-500 to-amber-500" };
  };

  const milestone = getMilestone();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 space-y-8">
      {/* Welcome Header - Premium Glass Morphism */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl backdrop-blur-xl bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 border border-white/10">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 p-6 md:p-8 lg:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${milestone.color} animate-pulse shadow-lg`} />
                <span className="text-xs md:text-sm font-semibold tracking-widest text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text uppercase">
                  Day {dayNumber} of 90
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight">
                Welcome back,<br/>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {user?.full_name?.split(' ')[0] || 'Champion'}
                </span>
              </h1>
              <p className="text-slate-400 text-sm md:text-lg font-light tracking-wide">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="relative group w-full md:w-auto">
              <div className={`absolute inset-0 bg-gradient-to-r ${milestone.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-2xl`} />
              <div className="relative px-6 md:px-8 py-4 md:py-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Phase</div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${milestone.color} shadow-lg`}>
                    <milestone.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-lg md:text-2xl font-bold text-white">{milestone.title}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Transformation Progress</span>
              <span className="text-white font-bold">{Math.round((dayNumber / 90) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
              <div 
                className={`h-full bg-gradient-to-r ${milestone.color} shadow-lg transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${(dayNumber / 90) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <XPNotification />

      {/* Gamification Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <OverallProgressCard user={user} />
        <AchievementShowcase user={user} />
      </div>

      <MotivationalQuote />

      {/* Weekly Tracker */}
      <WeeklyTracker completedDates={weeklyActivity || []} />

      {/* Brain Training Modules */}
      <BrainModules completedLessons={completedByPart} totalLessons={totalByPart} />

      {/* Habits Widget */}
      <HabitsDashboardWidget user={user} dayNumber={dayNumber} />

      {/* Main Grid - Premium Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <TodayWorkoutCard workout={todayWorkout} dayNumber={dayNumber} user={user} />
          <MindsetTask lesson={todayMindset} dayNumber={dayNumber} user={user} />
        </div>

        {/* Right Column - Stats & Nutrition */}
        <div className="space-y-6">
          <QuickStats user={user} recentProgress={recentProgress} />
          <NutritionOverview user={user} todayNutrition={todayNutrition} />
        </div>
      </div>

      {/* Quick Actions - Premium Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link to={createPageUrl("Workouts")} className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
            <CardContent className="relative p-4 md:p-8 text-center">
              <div className="mb-2 md:mb-4 inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Dumbbell className="w-5 h-5 md:w-7 md:h-7 text-blue-400" />
              </div>
              <p className="font-bold text-white text-sm md:text-lg">Workouts</p>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden md:block">View all sessions</p>
            </CardContent>
          </div>
        </Link>
        
        <Link to={createPageUrl("Nutrition")} className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
            <CardContent className="relative p-4 md:p-8 text-center">
              <div className="mb-2 md:mb-4 inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all duration-300">
                <Salad className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
              </div>
              <p className="font-bold text-white text-sm md:text-lg">Nutrition</p>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden md:block">Track your meals</p>
            </CardContent>
          </div>
        </Link>
        
        <Link to={createPageUrl("Progress")} className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
            <CardContent className="relative p-4 md:p-8 text-center">
              <div className="mb-2 md:mb-4 inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-purple-400" />
              </div>
              <p className="font-bold text-white text-sm md:text-lg">Progress</p>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden md:block">Monitor growth</p>
            </CardContent>
          </div>
        </Link>
        
        <Link to={createPageUrl("Community")} className="group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-300" />
            <CardContent className="relative p-4 md:p-8 text-center">
              <div className="mb-2 md:mb-4 inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                <Zap className="w-5 h-5 md:w-7 md:h-7 text-amber-400" />
              </div>
              <p className="font-bold text-white text-sm md:text-lg">Community</p>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden md:block">Connect & share</p>
            </CardContent>
          </div>
        </Link>
      </div>
    </div>
  );
}