import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Plus, Target } from "lucide-react";

export default function HabitSwapSuggestions({ swapMaps, habits, todayLogs }) {
  const getHabitById = (id) => habits.find(h => h.id === id);

  const getSwapStats = (swapId) => {
    const swap = swapMaps.find(s => s.id === swapId);
    if (!swap) return { timesUsed: 0, lastUsed: null };

    const swapLogs = todayLogs.filter(log => 
      log.habit_id === swap.good_habit_id && log.was_swap
    );

    return {
      timesUsed: swapLogs.length,
      lastUsed: swapLogs[0]?.timestamp || null
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              Habit Swap Recommendations
            </CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Create Swap
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {swapMaps.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">No habit swaps configured yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create smart swaps to replace bad habits with good ones in specific contexts
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Create Your First Swap
                </Button>
              </div>
            ) : (
              swapMaps.map((swap) => {
                const badHabit = getHabitById(swap.bad_habit_id);
                const goodHabit = getHabitById(swap.good_habit_id);
                const stats = getSwapStats(swap.id);

                if (!badHabit || !goodHabit) return null;

                return (
                  <div key={swap.id} className="border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-red-50 via-purple-50 to-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="font-semibold">
                        Priority: {swap.priority}/5
                      </Badge>
                      {stats.timesUsed > 0 && (
                        <Badge className="bg-purple-600">
                          Used {stats.timesUsed}x today
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-3 bg-red-100 rounded-lg border border-red-300">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{badHabit.icon_emoji || '⚠️'}</span>
                          <div>
                            <div className="font-semibold text-red-900">{badHabit.name}</div>
                            <div className="text-xs text-red-700">{badHabit.category}</div>
                          </div>
                        </div>
                      </div>

                      <ArrowRightLeft className="w-6 h-6 text-purple-600 flex-shrink-0" />

                      <div className="flex-1 p-3 bg-green-100 rounded-lg border border-green-300">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{goodHabit.icon_emoji || '✨'}</span>
                          <div>
                            <div className="font-semibold text-green-900">{goodHabit.name}</div>
                            <div className="text-xs text-green-700">{goodHabit.category}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {swap.context_tags && swap.context_tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-600">When feeling:</span>
                        {swap.context_tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {swap.notes && (
                      <p className="mt-3 text-sm text-gray-600 italic">"{swap.notes}"</p>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Success Rate: {swap.success_count || 0} swaps completed
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Habit swaps work best when the replacement provides similar satisfaction</p>
          <p>• Set up swaps for your most common triggers (boredom, stress, fatigue)</p>
          <p>• Each successful swap earns you +5 bonus points</p>
          <p>• The more you use a swap, the stronger the neural pathway becomes</p>
        </CardContent>
      </Card>
    </div>
  );
}