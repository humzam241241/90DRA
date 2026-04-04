import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Salad, Droplet, Trash2, TrendingUp, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import AIMealLogger from "@/components/nutrition/AIMealLogger";

export default function Nutrition() {
  const [showForm, setShowForm] = useState(false);
  const [showAILogger, setShowAILogger] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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

  const { data: nutritionLogs, isLoading } = useQuery({
    queryKey: ['nutrition', selectedDate],
    queryFn: async () => {
      return await base44.entities.NutritionLog.filter({
        date: selectedDate,
        created_by: user?.email
      }, '-created_date');
    },
    enabled: !!user,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NutritionLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutritionLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });

  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    meal_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    water_intake: '0',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      date: selectedDate,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0,
      water_intake: parseFloat(formData.water_intake) || 0
    });
  };

  const calculateTotals = () => {
    return nutritionLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0),
      water: acc.water + (log.water_intake || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 });
  };

  const totals = calculateTotals();
  const targets = {
    calories: user?.daily_calories_target || 2000,
    protein: user?.daily_protein_target || 150,
    carbs: user?.daily_carbs_target || 200,
    fats: user?.daily_fats_target || 60,
    water: user?.water_intake_target || 3
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracking</h1>
          <p className="text-gray-500 mt-1">Track your daily macros and hydration</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto"
          />
          <Button 
            onClick={() => {
              setShowAILogger(!showAILogger);
              setShowForm(false);
            }} 
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Logger
          </Button>
          <Button onClick={() => {
            setShowForm(!showForm);
            setShowAILogger(false);
          }} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Manual
          </Button>
        </div>
      </div>

      {/* Daily Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{totals.calories} / {targets.calories}</div>
            <Progress value={(totals.calories / targets.calories) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Protein</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{totals.protein}g / {targets.protein}g</div>
            <Progress value={(totals.protein / targets.protein) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Carbs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{totals.carbs}g / {targets.carbs}g</div>
            <Progress value={(totals.carbs / targets.carbs) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-blue-900">{totals.water}L / {targets.water}L</div>
            <Progress value={(totals.water / targets.water) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* AI Meal Logger */}
      <AnimatePresence>
        {showAILogger && (
          <AIMealLogger
            mealType={formData.meal_type}
            selectedDate={selectedDate}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['nutrition'] });
              setShowAILogger(false);
            }}
            onCancel={() => setShowAILogger(false)}
          />
        )}
      </AnimatePresence>

      {/* Meal Entry Form */}
      {showForm && (
        <Card className="border-2 border-green-400">
          <CardHeader>
            <CardTitle>Log New Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Meal Type</Label>
                  <Select value={formData.meal_type} onValueChange={(value) => setFormData({...formData, meal_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Meal Name</Label>
                  <Input
                    value={formData.meal_name}
                    onChange={(e) => setFormData({...formData, meal_name: e.target.value})}
                    placeholder="e.g., Grilled Chicken Salad"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({...formData, protein: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Fats (g)</Label>
                  <Input
                    type="number"
                    value={formData.fats}
                    onChange={(e) => setFormData({...formData, fats: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Water Intake (L)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.water_intake}
                  onChange={(e) => setFormData({...formData, water_intake: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Save Meal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Meal Log List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Salad className="w-5 h-5" />
            Meals for {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : nutritionLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No meals logged for this day yet
            </div>
          ) : (
            <div className="space-y-3">
              {nutritionLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold capitalize">{log.meal_type}</span>
                        {log.meal_name && <span className="text-gray-600">- {log.meal_name}</span>}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{log.calories} cal</span>
                        <span>P: {log.protein}g</span>
                        <span>C: {log.carbs}g</span>
                        <span>F: {log.fats}g</span>
                        {log.water_intake > 0 && (
                          <span className="flex items-center gap-1">
                            <Droplet className="w-3 h-3" />
                            {log.water_intake}L
                          </span>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-500 mt-2">{log.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(log.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}