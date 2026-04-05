import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfDay } from "date-fns";

export default function HabitsDashboardWidget({ user, dayNumber }) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayScore } = useQuery({
    queryKey: ['dopamine-score-widget', today],
    queryFn: async () => {
      const scores = await base44.entities.DopamineDaily.filter({
        date: today,
        created_by: user?.email
      });
      return scores[0] || null;
    },
    enabled: !!user,
  });

  const { data: todayLogs } = useQuery({
    queryKey: ['habit-logs-widget', today],
    queryFn: async () => {
      const startOfDayTime = startOfDay(new Date()).toISOString();
      const endOfDayTime = new Date().toISOString();
      
      const logs = await base44.entities.HabitLog.list('-timestamp');
      return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(startOfDayTime) && logDate <= new Date(endOfDayTime);
      });
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: habits } = useQuery({
    queryKey: ['habits-widget'],
    queryFn: () => base44.entities.Habit.filter({ is_active: true }),
    initialData: [],
  });

  const goodLogsCount = todayLogs.filter(log => {
    const habit = habits.find(h => h.id === log.habit_id);
    return habit?.type === 'good';
  }).length;

  const badLogsCount = todayLogs.filter(log => {
    const habit = habits.find(h => h.id === log.habit_id);
    return habit?.type === 'bad';
  }).length;

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-600';
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-blue-600';
    if (score >= -50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Dopamine Habit Tracker
          </CardTitle>
          <Link to={createPageUrl("Habits")}>
            <Button variant="outline" size="sm">
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Today's Dopamine Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(todayScore?.score)}`}>
                {todayScore?.score > 0 ? '+' : ''}{todayScore?.score || 0}
              </div>
            </div>
            <Zap className={`w-12 h-12 ${getScoreColor(todayScore?.score)}`} />
          </div>
          
          {todayScore?.streak_green_days > 0 && (
            <div className="mt-3 pt-3 border-t">
              <Badge className="bg-orange-600">
                🔥 {todayScore.streak_green_days} Day Streak
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Good Habits</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{goodLogsCount}</div>
            <div className="text-xs text-green-700">logged today</div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Bad Habits</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{badLogsCount}</div>
            <div className="text-xs text-red-700">logged today</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border">
          <div className="text-sm font-medium mb-2">Progress to Perfect Day Bonus</div>
          <Progress value={(goodLogsCount / 5) * 100} className="h-2 mb-1" />
          <div className="text-xs text-gray-600">
            {goodLogsCount < 5 
              ? `${5 - goodLogsCount} more good habits for +25 bonus points` 
              : '✨ Perfect day achieved! +25 points'}
          </div>
        </div>

        <Link to={createPageUrl("Habits")}>
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Target className="w-4 h-4 mr-2" />
            Log Habits Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}