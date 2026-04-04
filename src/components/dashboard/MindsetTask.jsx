import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function MindsetTask({ lesson, dayNumber, user }) {
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    if (user?.completed_mindset_lessons && lesson) {
      setIsCompleted(user.completed_mindset_lessons.includes(lesson.id));
    }
  }, [user, lesson]);

  const handleComplete = async () => {
    if (!lesson || !user) return;
    
    const completed = user.completed_mindset_lessons || [];
    const updated = isCompleted 
      ? completed.filter(id => id !== lesson.id)
      : [...completed, lesson.id];
    
    await base44.auth.updateMe({ completed_mindset_lessons: updated });
    setIsCompleted(!isCompleted);
  };

  const brainPartColors = {
    prefrontal_cortex: "bg-blue-100 text-blue-800",
    amygdala: "bg-red-100 text-red-800",
    hippocampus: "bg-green-100 text-green-800",
    basal_ganglia: "bg-yellow-100 text-yellow-800",
    nucleus_accumbens: "bg-purple-100 text-purple-800",
    hypothalamus: "bg-pink-100 text-pink-800",
    cerebellum: "bg-indigo-100 text-indigo-800"
  };

  if (!lesson) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Today's Mindset Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No mindset lesson scheduled for today</p>
            <Link to={createPageUrl("Mindset")}>
              <Button className="mt-4">View All Modules</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${isCompleted ? 'border-purple-400 bg-purple-50/50' : 'border-purple-400'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Today's Mindset Module
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-purple-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{lesson.title}</h3>
          <div className="flex gap-2 flex-wrap">
            <Badge className={brainPartColors[lesson.brain_part]}>
              {lesson.brain_part?.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.duration_minutes} min
            </Badge>
          </div>
        </div>

        {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Key Takeaways:</h4>
            <ul className="space-y-1">
              {lesson.key_takeaways.slice(0, 2).map((takeaway, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  • {takeaway}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Link to={createPageUrl("Mindset")} className="flex-1">
            <Button variant="outline" className="w-full">
              Start Module
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Button 
            onClick={handleComplete}
            className={isCompleted ? "bg-gray-600 hover:bg-gray-700" : "bg-purple-600 hover:bg-purple-700"}
          >
            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}