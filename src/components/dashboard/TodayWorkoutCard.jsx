import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function TodayWorkoutCard({ workout, dayNumber, user }) {
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    if (user?.completed_workouts && workout) {
      setIsCompleted(user.completed_workouts.includes(workout.id));
    }
  }, [user, workout]);

  const handleComplete = async () => {
    if (!workout || !user) return;
    
    const completed = user.completed_workouts || [];
    const updated = isCompleted 
      ? completed.filter(id => id !== workout.id)
      : [...completed, workout.id];
    
    await base44.auth.updateMe({ completed_workouts: updated });
    setIsCompleted(!isCompleted);
  };

  const categoryColors = {
    strength: "bg-red-100 text-red-800",
    cardio: "bg-blue-100 text-blue-800",
    hiit: "bg-orange-100 text-orange-800",
    recovery: "bg-green-100 text-green-800",
    mobility: "bg-purple-100 text-purple-800"
  };

  if (!workout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Today's Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No workout scheduled for today</p>
            <Link to={createPageUrl("Workouts")}>
              <Button className="mt-4">View All Workouts</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${isCompleted ? 'border-green-400 bg-green-50/50' : 'border-blue-400'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-600" />
            Today's Workout - Day {dayNumber}
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{workout.title}</h3>
          <div className="flex gap-2 flex-wrap">
            <Badge className={categoryColors[workout.category]}>
              {workout.category?.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {workout.duration_minutes} min
            </Badge>
          </div>
        </div>

        {workout.description && (
          <p className="text-gray-600">{workout.description}</p>
        )}

        {workout.exercises && workout.exercises.length > 0 && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Exercises:</h4>
            <ul className="space-y-1">
              {workout.exercises.slice(0, 3).map((exercise, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  • {exercise.name} - {exercise.sets}x{exercise.reps}
                </li>
              ))}
              {workout.exercises.length > 3 && (
                <li className="text-sm text-gray-500">
                  + {workout.exercises.length - 3} more exercises
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Link to={createPageUrl("Workouts")} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Button 
            onClick={handleComplete}
            className={isCompleted ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}