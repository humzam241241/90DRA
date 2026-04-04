import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, TrendingDown, Flame } from "lucide-react";

export default function DopamineScoreCard({ score, goodTotal, badTotal, streak }) {
  const getScoreColor = () => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-blue-600';
    if (score >= -50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (score >= 50) return 'from-green-500 to-green-600';
    if (score >= 0) return 'from-blue-500 to-blue-600';
    if (score >= -50) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = () => {
    if (score >= 50) return 'Excellent';
    if (score >= 0) return 'Good';
    if (score >= -50) return 'Needs Work';
    return 'Critical';
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${getScoreBgColor()} opacity-10`} />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Dopamine Score
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor()}`}>
            {score > 0 ? '+' : ''}{score}
          </div>
          <Badge className={`mt-2 ${score >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
            {getScoreLabel()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1 text-green-700">
                <TrendingUp className="w-4 h-4" />
                Good Dopamine
              </span>
              <span className="font-semibold text-green-700">+{goodTotal}</span>
            </div>
            <Progress value={Math.min((goodTotal / 100) * 100, 100)} className="h-2 bg-gray-200" />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1 text-red-700">
                <TrendingDown className="w-4 h-4" />
                Bad Dopamine
              </span>
              <span className="font-semibold text-red-700">-{badTotal}</span>
            </div>
            <Progress value={Math.min((badTotal / 100) * 100, 100)} className="h-2 bg-gray-200" />
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Flame className="w-5 h-5 text-orange-600" />
            <div className="text-center">
              <div className="font-bold text-orange-900">{streak} Day Streak</div>
              <div className="text-xs text-orange-700">Keep it going!</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}