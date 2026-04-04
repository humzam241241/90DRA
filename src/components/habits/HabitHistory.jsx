import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export default function HabitHistory({ logs, habits, selectedDate }) {
  const getHabitById = (id) => habits.find(h => h.id === id);

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const intensityColors = {
    1: 'bg-gray-200 text-gray-800',
    2: 'bg-blue-200 text-blue-800',
    3: 'bg-orange-200 text-orange-800'
  };

  const feelingEmojis = {
    energized: '😊',
    satisfied: '✅',
    proud: '🏆',
    neutral: '😐',
    guilty: '😔',
    regretful: '😞',
    anxious: '😰'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No habits logged yet for {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
            <p className="text-sm mt-2">Start logging to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map((log) => {
              const habit = getHabitById(log.habit_id);
              if (!habit) return null;

              return (
                <div 
                  key={log.id} 
                  className={`border-2 rounded-lg p-4 ${
                    habit.type === 'good' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{habit.icon_emoji}</span>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {habit.name}
                          {log.was_swap && (
                            <Badge className="bg-purple-600 text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              Swap
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                    <Badge className={habit.type === 'good' ? 'bg-green-600' : 'bg-red-600'}>
                      {habit.type === 'good' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {habit.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{log.duration} min</span>
                    </div>
                    <div>
                      <Badge variant="outline" className={intensityColors[log.intensity]}>
                        {log.intensity === 1 ? 'Low' : log.intensity === 2 ? 'Medium' : 'High'} Intensity
                      </Badge>
                    </div>
                    {log.trigger && (
                      <div className="text-sm">
                        <span className="text-gray-500">Trigger:</span> {log.trigger}
                      </div>
                    )}
                    {log.feeling_after && (
                      <div className="text-sm flex items-center gap-1">
                        <span>{feelingEmojis[log.feeling_after]}</span>
                        <span className="capitalize">{log.feeling_after}</span>
                      </div>
                    )}
                  </div>

                  {log.notes && (
                    <div className="text-sm text-gray-700 italic border-t pt-2">
                      "{log.notes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}