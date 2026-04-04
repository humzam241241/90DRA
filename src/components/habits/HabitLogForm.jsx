import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRightLeft, Zap } from "lucide-react";

export default function HabitLogForm({ habitType, habits, onClose, onSuccess, swapMaps }) {
  const [formData, setFormData] = useState({
    habit_id: typeof habitType === 'object' ? habitType.id : '',
    timestamp: new Date().toISOString(),
    duration: '',
    intensity: '2',
    trigger: '',
    feeling_after: 'neutral',
    was_swap: false,
    notes: ''
  });

  const [showSwapSuggestion, setShowSwapSuggestion] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HabitLog.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const selectedHabit = habits.find(h => h.id === formData.habit_id);

  React.useEffect(() => {
    if (selectedHabit?.type === 'bad') {
      const hasSwap = swapMaps.some(map => map.bad_habit_id === selectedHabit.id);
      setShowSwapSuggestion(hasSwap);
    } else {
      setShowSwapSuggestion(false);
    }
  }, [selectedHabit, swapMaps]);

  const handleSwapInstead = () => {
    const swap = swapMaps.find(map => map.bad_habit_id === selectedHabit.id);
    if (swap) {
      setFormData({
        ...formData,
        habit_id: swap.good_habit_id,
        was_swap: true
      });
      setShowSwapSuggestion(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      duration: parseInt(formData.duration) || selectedHabit?.default_duration || 30,
      intensity: parseInt(formData.intensity)
    });
  };

  const filteredHabits = typeof habitType === 'string' 
    ? habits.filter(h => h.type === habitType)
    : habits;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Log Habit</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showSwapSuggestion && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
              <div className="flex items-start gap-3">
                <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 mb-1">Smart Swap Available!</div>
                  <p className="text-sm text-blue-800 mb-3">
                    Before logging this bad habit, would you like to do a good habit instead?
                  </p>
                  <Button 
                    onClick={handleSwapInstead}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Swap Now & Earn Bonus Points
                  </Button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Select Habit</Label>
              <Select 
                value={formData.habit_id} 
                onValueChange={(value) => setFormData({...formData, habit_id: value})}
                disabled={typeof habitType === 'object'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a habit" />
                </SelectTrigger>
                <SelectContent>
                  {filteredHabits.map(habit => (
                    <SelectItem key={habit.id} value={habit.id}>
                      {habit.icon_emoji} {habit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedHabit && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{selectedHabit.icon_emoji}</span>
                  <div>
                    <div className="font-semibold">{selectedHabit.name}</div>
                    <Badge className={selectedHabit.type === 'good' ? 'bg-green-600' : 'bg-red-600'}>
                      {selectedHabit.type === 'good' ? 'Good Dopamine' : 'Bad Dopamine'}
                    </Badge>
                  </div>
                </div>
                {selectedHabit.description && (
                  <p className="text-sm text-gray-600">{selectedHabit.description}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder={selectedHabit?.default_duration?.toString() || '30'}
                />
              </div>

              <div>
                <Label>Intensity</Label>
                <Select 
                  value={formData.intensity} 
                  onValueChange={(value) => setFormData({...formData, intensity: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>What triggered this?</Label>
              <Input
                value={formData.trigger}
                onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                placeholder="e.g., boredom, stress, celebration"
              />
            </div>

            <div>
              <Label>How do you feel after?</Label>
              <Select 
                value={formData.feeling_after} 
                onValueChange={(value) => setFormData({...formData, feeling_after: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energized">😊 Energized</SelectItem>
                  <SelectItem value="satisfied">✅ Satisfied</SelectItem>
                  <SelectItem value="proud">🏆 Proud</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="guilty">😔 Guilty</SelectItem>
                  <SelectItem value="regretful">😞 Regretful</SelectItem>
                  <SelectItem value="anxious">😰 Anxious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional context..."
                rows={3}
              />
            </div>

            {formData.was_swap && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-800">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">Habit Swap Active! +5 Bonus Points</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.habit_id || createMutation.isPending}
                className={`flex-1 ${selectedHabit?.type === 'good' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {createMutation.isPending ? 'Logging...' : 'Log Habit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}