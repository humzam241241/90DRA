import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function QuickStats({ user, recentProgress }) {
  const calculateWeightChange = () => {
    if (!recentProgress || recentProgress.length < 2) return null;
    
    const latest = recentProgress[0]?.weight;
    const previous = recentProgress[1]?.weight;
    
    if (!latest || !previous) return null;
    
    const change = latest - previous;
    return change;
  };

  const weightChange = calculateWeightChange();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Current Weight</div>
            <div className="text-2xl font-bold">{user?.current_weight || '--'} kg</div>
          </div>
          {weightChange !== null && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              weightChange > 0 ? 'text-red-600' : weightChange < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {weightChange > 0 ? <TrendingUp className="w-4 h-4" /> : 
               weightChange < 0 ? <TrendingDown className="w-4 h-4" /> : 
               <Minus className="w-4 h-4" />}
              {Math.abs(weightChange).toFixed(1)} kg
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Target Weight</div>
            <div className="text-2xl font-bold">{user?.target_weight || '--'} kg</div>
          </div>
        </div>

        {user?.body_fat_percentage && (
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Body Fat</div>
              <div className="text-2xl font-bold">{user.body_fat_percentage}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}