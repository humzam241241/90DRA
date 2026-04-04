import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Plus, Camera } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

export default function Progress() {
  const [showForm, setShowForm] = useState(false);
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

  const { data: progressEntries, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      return await base44.entities.ProgressEntry.filter(
        { created_by: user?.email },
        'date'
      );
    },
    enabled: !!user,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgressEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      setShowForm(false);
    },
  });

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    body_fat_percentage: '',
    mood_score: '5',
    energy_score: '5',
    confidence_score: '5',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      weight: parseFloat(formData.weight) || null,
      body_fat_percentage: parseFloat(formData.body_fat_percentage) || null,
      mood_score: parseInt(formData.mood_score),
      energy_score: parseInt(formData.energy_score),
      confidence_score: parseInt(formData.confidence_score)
    });
  };

  const chartData = progressEntries.map(entry => ({
    date: format(new Date(entry.date), 'MMM d'),
    weight: entry.weight,
    bodyFat: entry.body_fat_percentage,
    mood: entry.mood_score,
    energy: entry.energy_score,
    confidence: entry.confidence_score
  }));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor your transformation journey</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Log Progress
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.current_weight || '--'} kg</div>
            {progressEntries.length >= 2 && (
              <div className="text-sm text-gray-500 mt-1">
                {(progressEntries[progressEntries.length - 1]?.weight - progressEntries[0]?.weight).toFixed(1)} kg change
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Body Fat %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.body_fat_percentage || '--'}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Target Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.target_weight || '--'} kg</div>
            {user?.current_weight && user?.target_weight && (
              <div className="text-sm text-gray-500 mt-1">
                {Math.abs(user.current_weight - user.target_weight).toFixed(1)} kg to go
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressEntries.length}</div>
            <div className="text-sm text-gray-500 mt-1">Check-ins logged</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Entry Form */}
      {showForm && (
        <Card className="border-2 border-blue-400">
          <CardHeader>
            <CardTitle>Log Progress Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <Label>Body Fat Percentage (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.body_fat_percentage}
                  onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                  placeholder="0.0"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Mood (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.mood_score}
                    onChange={(e) => setFormData({...formData, mood_score: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Energy (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.energy_score}
                    onChange={(e) => setFormData({...formData, energy_score: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Confidence (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.confidence_score}
                    onChange={(e) => setFormData({...formData, confidence_score: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="How are you feeling? Any observations?"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Entry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {progressEntries.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Weight & Body Fat Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} name="Weight (kg)" />
                  <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} name="Body Fat (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mental Wellness Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                  <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} name="Confidence" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No progress entries yet</p>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              Log Your First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}