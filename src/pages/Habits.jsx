import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Added Input import
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Calendar,
  Target,
  Flame,
  Award,
  ArrowRightLeft
} from "lucide-react";
import { format, startOfDay } from "date-fns";

import HabitLogForm from "../components/habits/HabitLogForm";
import DopamineScoreCard from "../components/habits/DopamineScoreCard";
import HabitSwapSuggestions from "../components/habits/HabitSwapSuggestions";
import HabitHistory from "../components/habits/HabitHistory";
import WeeklyDopamineTrend from "../components/habits/WeeklyDopamineTrend";
import QuickLogButton from "../components/habits/QuickLogButton";
import InteractiveDopamineGauge from "../components/habits/InteractiveDopamineGauge";
import BonusFireworks from "../components/habits/BonusFireworks";
import FloatingQuickLog from "../components/habits/FloatingQuickLog";
import SimpleHabitCard from "../components/habits/SimpleHabitCard";
import HabitPicker from "../components/habits/HabitPicker";
import { motion, AnimatePresence } from "framer-motion";

export default function Habits() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedHabitType, setSelectedHabitType] = useState(null);
  const [showHabitPicker, setShowHabitPicker] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.filter({ is_active: true }),
    initialData: [],
  });

  const { data: todayLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['habit-logs', selectedDate],
    queryFn: async () => {
      const startOfDayTime = startOfDay(new Date(selectedDate)).toISOString();
      const endOfDayTime = new Date(selectedDate + 'T23:59:59').toISOString();
      
      const logs = await base44.entities.HabitLog.list('-timestamp');
      return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(startOfDayTime) && logDate <= new Date(endOfDayTime) &&
               log.created_by === user?.email;
      });
    },
    enabled: !!user,
    initialData: [],
  });

  const handleQuickLog = async (habitId, logData) => {
    await base44.entities.HabitLog.create(logData);
    refetchLogs();
  };

  const { data: todayScore } = useQuery({
    queryKey: ['dopamine-daily', selectedDate],
    queryFn: async () => {
      const scores = await base44.entities.DopamineDaily.filter({
        date: selectedDate,
        created_by: user?.email
      });
      return scores[0] || null;
    },
    enabled: !!user,
  });

  const { data: swapMaps } = useQuery({
    queryKey: ['swap-maps'],
    queryFn: async () => {
      return await base44.entities.SwapMap.filter({ created_by: user?.email }, '-priority');
    },
    enabled: !!user,
    initialData: [],
  });

  const calculateDailyScore = () => {
    let goodTotal = 0;
    let badTotal = 0;

    todayLogs.forEach(log => {
      const habit = habits.find(h => h.id === log.habit_id);
      if (!habit) return;

      const weight = habit.default_weight || 5;
      const intensity = log.intensity || 2;
      const duration = log.duration || habit.default_duration || 30;
      
      const points = (weight * intensity * duration) / 10;

      if (habit.type === 'good') {
        goodTotal += points;
      } else {
        badTotal += points;
      }
    });

    const baseScore = goodTotal - badTotal;
    const bonuses = calculateBonuses();
    const finalScore = baseScore + bonuses.total;

    return {
      score: Math.round(finalScore),
      goodTotal: Math.round(goodTotal),
      badTotal: Math.round(badTotal),
      bonuses
    };
  };

  const calculateBonuses = () => {
    let bonuses = {
      first_win: 0,
      streak_bonus: 0,
      swap_bonus: 0,
      perfect_day: 0,
      total: 0
    };

    const goodLogsCount = todayLogs.filter(log => {
      const habit = habits.find(h => h.id === log.habit_id);
      return habit?.type === 'good';
    }).length;

    const badLogsCount = todayLogs.filter(log => {
      const habit = habits.find(h => h.id === log.habit_id);
      return habit?.type === 'bad';
    }).length;

    if (goodLogsCount > 0 && badLogsCount === 0) {
      bonuses.first_win = 10;
    }

    const swapLogs = todayLogs.filter(log => log.was_swap);
    if (swapLogs.length > 0) {
      bonuses.swap_bonus = swapLogs.length * 5;
    }

    if (todayScore?.streak_green_days > 0) {
      bonuses.streak_bonus = Math.min(todayScore.streak_green_days * 2, 20);
    }

    if (goodLogsCount >= 5 && badLogsCount === 0) {
      bonuses.perfect_day = 25;
    }

    bonuses.total = Object.values(bonuses).reduce((sum, val) => sum + val, 0) - bonuses.total;

    return bonuses;
  };

  const updateDailyScoreMutation = useMutation({
    mutationFn: async () => {
      const scoreData = calculateDailyScore();
      
      if (todayScore) {
        return await base44.entities.DopamineDaily.update(todayScore.id, {
          score: scoreData.score,
          good_total: scoreData.goodTotal,
          bad_total: scoreData.badTotal,
          bonuses: scoreData.bonuses,
          habits_logged: todayLogs.length,
          streak_green_days: scoreData.score > 0 ? (todayScore.streak_green_days || 0) + 1 : 0
        });
      } else {
        return await base44.entities.DopamineDaily.create({
          date: selectedDate,
          score: scoreData.score,
          good_total: scoreData.goodTotal,
          bad_total: scoreData.badTotal,
          bonuses: scoreData.bonuses,
          habits_logged: todayLogs.length,
          streak_green_days: scoreData.score > 0 ? 1 : 0
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopamine-daily'] });
    },
  });

  React.useEffect(() => {
    if (todayLogs.length > 0 && habits.length > 0) {
      updateDailyScoreMutation.mutate();
    }
  }, [todayLogs, habits]);

  const scoreData = calculateDailyScore();
  const goodHabits = habits.filter(h => h.type === 'good');
  const badHabits = habits.filter(h => h.type === 'bad');

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dopamine Habit Tracker</h1>
          <p className="text-gray-500 mt-1">Rewire your brain by tracking good vs bad dopamine</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button
            onClick={() => setShowHabitPicker(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Habits
          </Button>
        </div>
      </div>

      {/* Interactive Gauge & Bonuses */}
      <motion.div 
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <InteractiveDopamineGauge
            score={scoreData.score}
            goodTotal={scoreData.goodTotal}
            badTotal={scoreData.badTotal}
            streak={todayScore?.streak_green_days || 0}
          />
        </Card>

        <Card className="p-6">
          <CardTitle className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-yellow-600" />
            Active Bonuses
          </CardTitle>
          <BonusFireworks bonuses={scoreData.bonuses} />
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-900">First Win Bonus</span>
              <span className="font-bold text-green-600">+{scoreData.bonuses.first_win}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-900">Streak Bonus</span>
              <span className="font-bold text-blue-600">+{scoreData.bonuses.streak_bonus}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <span className="text-sm font-medium text-purple-900">Swap Bonus</span>
              <span className="font-bold text-purple-600">+{scoreData.bonuses.swap_bonus}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium text-yellow-900">Perfect Day</span>
              <span className="font-bold text-yellow-600">+{scoreData.bonuses.perfect_day}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="log">Log Habits</TabsTrigger>
          <TabsTrigger value="swaps">Smart Swaps</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          {/* Simplified Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Good Habits */}
            {goodHabits.map((habit) => {
              const loggedToday = todayLogs.filter(l => l.habit_id === habit.id).length;
              return (
                <SimpleHabitCard
                  key={habit.id}
                  habit={habit}
                  onLog={handleQuickLog}
                  loggedCount={loggedToday}
                  type="good"
                />
              );
            })}
            
            {/* Bad Habits */}
            {badHabits.map((habit) => {
              const loggedToday = todayLogs.filter(l => l.habit_id === habit.id).length;
              return (
                <SimpleHabitCard
                  key={habit.id}
                  habit={habit}
                  onLog={handleQuickLog}
                  loggedCount={loggedToday}
                  type="bad"
                />
              );
            })}
          </div>

          {(goodHabits.length === 0 && badHabits.length === 0) && (
            <Card className="p-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium mb-2">No habits yet</p>
                <p className="text-sm">Create some habits to start tracking your dopamine</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="swaps">
          <HabitSwapSuggestions 
            swapMaps={swapMaps}
            habits={habits}
            todayLogs={todayLogs}
          />
        </TabsContent>

        <TabsContent value="history">
          <HabitHistory 
            logs={todayLogs}
            habits={habits}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="trends">
          <WeeklyDopamineTrend user={user} />
        </TabsContent>
      </Tabs>

      {/* Habit Picker Modal */}
      {showHabitPicker && (
        <HabitPicker
          onClose={() => setShowHabitPicker(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setShowHabitPicker(false);
          }}
        />
      )}

      {/* Floating Quick Log Button */}
      <FloatingQuickLog habits={habits} onLog={handleQuickLog} />

      {/* Log Form Modal */}
      {showLogForm && (
        <HabitLogForm
          habitType={selectedHabitType}
          habits={habits}
          onClose={() => {
            setShowLogForm(false);
            setSelectedHabitType(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
            setShowLogForm(false);
            setSelectedHabitType(null);
          }}
          swapMaps={swapMaps}
        />
      )}
    </div>
  );
}