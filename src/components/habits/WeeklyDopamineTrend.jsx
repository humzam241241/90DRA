import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";

export default function WeeklyDopamineTrend({ user }) {
  const { data: weeklyScores, isLoading } = useQuery({
    queryKey: ['dopamine-weekly'],
    queryFn: async () => {
      const scores = await base44.entities.DopamineDaily.filter(
        { created_by: user?.email },
        '-date',
        30
      );
      return scores;
    },
    enabled: !!user,
    initialData: [],
  });

  const chartData = React.useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayScore = weeklyScores.find(s => s.date === date);
      
      data.push({
        date: format(subDays(new Date(), i), 'MMM d'),
        score: dayScore?.score || 0,
        good: dayScore?.good_total || 0,
        bad: dayScore?.bad_total || 0,
        habits: dayScore?.habits_logged || 0
      });
    }
    return data;
  }, [weeklyScores]);

  const averageScore = React.useMemo(() => {
    if (weeklyScores.length === 0) return 0;
    const sum = weeklyScores.reduce((acc, score) => acc + (score.score || 0), 0);
    return Math.round(sum / weeklyScores.length);
  }, [weeklyScores]);

  const currentStreak = React.useMemo(() => {
    let streak = 0;
    const sortedScores = [...weeklyScores].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    for (const score of sortedScores) {
      if (score.score > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [weeklyScores]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">14-Day Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${averageScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {averageScore > 0 ? '+' : ''}{averageScore}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {currentStreak} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {weeklyScores.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            14-Day Dopamine Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : chartData.every(d => d.score === 0) ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No data yet. Start logging habits to see trends!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  name="Daily Score"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Good vs Bad Dopamine Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.every(d => d.good === 0 && d.bad === 0) ? (
            <div className="text-center py-12 text-gray-500">
              <p>Start tracking to see your activity breakdown</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="good" fill="#10b981" name="Good Dopamine" />
                <Bar dataKey="bad" fill="#ef4444" name="Bad Dopamine" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📊 Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          {currentStreak >= 7 && (
            <p>🔥 Amazing! You've maintained a positive streak for {currentStreak} days!</p>
          )}
          {averageScore >= 50 && (
            <p>⭐ Excellent work! Your average score is in the "Excellent" range.</p>
          )}
          {averageScore < 0 && (
            <p>💪 Focus on reducing bad habits and increasing good ones to improve your score.</p>
          )}
          <p>📈 Track consistently for better brain rewiring results.</p>
        </CardContent>
      </Card>
    </div>
  );
}