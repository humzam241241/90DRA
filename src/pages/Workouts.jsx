import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Clock, Search, CheckCircle2, Filter, Sparkles, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import WorkoutCustomizer from "@/components/workouts/WorkoutCustomizer";

export default function Workouts() {
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [showCustomizer, setShowCustomizer] = React.useState(false);
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

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      // RLS restricts results to the current user automatically
      return await base44.entities.Workout.list('day_number');
    },
    initialData: [],
    enabled: !!user,
  });

  const handleCustomizerComplete = () => {
    setShowCustomizer(false);
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
  };

  const handleComplete = async (workoutId) => {
    if (!user) return;
    
    const completed = user.completed_workouts || [];
    const isCompleted = completed.includes(workoutId);
    const updated = isCompleted 
      ? completed.filter(id => id !== workoutId)
      : [...completed, workoutId];
    
    await base44.auth.updateMe({ completed_workouts: updated });
    setUser({ ...user, completed_workouts: updated });
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesCategory = selectedCategory === "all" || workout.category === selectedCategory;
    const matchesSearch = workout.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryColors = {
    strength: "bg-red-100 text-red-800",
    cardio: "bg-blue-100 text-blue-800",
    hiit: "bg-orange-100 text-orange-800",
    recovery: "bg-green-100 text-green-800",
    mobility: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <AnimatePresence>
        {showCustomizer && (
          <WorkoutCustomizer
            onClose={() => setShowCustomizer(false)}
            onComplete={handleCustomizerComplete}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-500 mt-1">90 days of transformation exercises</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowCustomizer(true)}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Customize</span>
          </Button>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="bg-white border">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
          <TabsTrigger value="hiit">HIIT</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
          <TabsTrigger value="mobility">Mobility</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading workouts...</p>
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workouts Yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your personalized 90-day workout program!</p>
            <Button
              onClick={() => setShowCustomizer(true)}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create My Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout) => {
            const isCompleted = user?.completed_workouts?.includes(workout.id);
            
            return (
              <Card key={workout.id} className={`hover:shadow-lg transition-shadow ${isCompleted ? 'border-2 border-green-400 bg-green-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Day {workout.day_number}</div>
                      <CardTitle className="text-xl mb-2">{workout.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={categoryColors[workout.category]}>
                          {workout.category?.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {workout.duration_minutes} min
                        </Badge>
                        {workout.difficulty && (
                          <Badge variant="outline">
                            {workout.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workout.description && (
                    <p className="text-gray-600 text-sm">{workout.description}</p>
                  )}

                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="font-semibold text-sm mb-2">Exercises ({workout.exercises.length}):</div>
                      <ul className="space-y-1">
                        {workout.exercises.slice(0, 3).map((exercise, idx) => (
                          <li key={idx} className="text-xs text-gray-700">
                            • {exercise.name}
                          </li>
                        ))}
                        {workout.exercises.length > 3 && (
                          <li className="text-xs text-gray-500">
                            + {workout.exercises.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleComplete(workout.id)}
                    className={`w-full ${isCompleted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}