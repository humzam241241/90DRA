import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const questions = [
  {
    id: "goal",
    question: "What's your primary fitness goal?",
    options: [
      { value: "lose_fat", label: "Lose Fat", emoji: "🔥" },
      { value: "build_muscle", label: "Build Muscle", emoji: "💪" },
      { value: "get_toned", label: "Get Toned", emoji: "✨" },
      { value: "improve_endurance", label: "Improve Endurance", emoji: "🏃" },
      { value: "general_fitness", label: "General Fitness", emoji: "🎯" },
    ]
  },
  {
    id: "experience",
    question: "What's your fitness level?",
    options: [
      { value: "beginner", label: "Beginner", description: "New to exercise" },
      { value: "intermediate", label: "Intermediate", description: "Exercise regularly" },
      { value: "advanced", label: "Advanced", description: "Very experienced" },
    ]
  },
  {
    id: "equipment",
    question: "What equipment do you have access to?",
    multiple: true,
    options: [
      { value: "dumbbells", label: "Dumbbells", emoji: "🏋️" },
      { value: "barbell", label: "Barbell", emoji: "🏋️‍♀️" },
      { value: "resistance_bands", label: "Resistance Bands", emoji: "🎗️" },
      { value: "pull_up_bar", label: "Pull-up Bar", emoji: "🔧" },
      { value: "cardio_machine", label: "Cardio Machine", emoji: "🚴" },
      { value: "bodyweight_only", label: "Bodyweight Only", emoji: "🤸" },
    ]
  },
  {
    id: "frequency",
    question: "How many days per week can you work out?",
    options: [
      { value: "3", label: "3 days", description: "Perfect for beginners" },
      { value: "4", label: "4 days", description: "Balanced approach" },
      { value: "5", label: "5 days", description: "Committed schedule" },
      { value: "6", label: "6 days", description: "High intensity" },
    ]
  },
  {
    id: "duration",
    question: "How long can each workout be?",
    options: [
      { value: "20-30", label: "20-30 minutes", description: "Quick & efficient" },
      { value: "30-45", label: "30-45 minutes", description: "Standard length" },
      { value: "45-60", label: "45-60 minutes", description: "Full sessions" },
      { value: "60+", label: "60+ minutes", description: "Extended training" },
    ]
  },
  {
    id: "focus_areas",
    question: "Any specific areas you want to focus on?",
    multiple: true,
    options: [
      { value: "core", label: "Core/Abs", emoji: "💎" },
      { value: "upper_body", label: "Upper Body", emoji: "💪" },
      { value: "lower_body", label: "Lower Body", emoji: "🦵" },
      { value: "cardio", label: "Cardio", emoji: "❤️" },
      { value: "flexibility", label: "Flexibility", emoji: "🧘" },
      { value: "full_body", label: "Full Body", emoji: "🎯" },
    ]
  }
];

export default function WorkoutCustomizer({ onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    if (currentQuestion.multiple) {
      const current = answers[currentQuestion.id] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [currentQuestion.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const isAnswered = () => {
    if (currentQuestion.multiple) {
      return (answers[currentQuestion.id]?.length || 0) > 0;
    }
    return answers[currentQuestion.id] !== undefined;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const user = await base44.auth.me();
      
      // Save user preferences
      await base44.auth.updateMe({
        workout_preferences: answers
      });

      // Generate personalized workouts using AI
      const prompt = `Generate a personalized 90-day workout program with the following specifications:

User Profile:
- Goal: ${answers.goal}
- Experience Level: ${answers.experience}
- Equipment Available: ${answers.equipment?.join(', ')}
- Weekly Frequency: ${answers.frequency} days
- Session Duration: ${answers.duration} minutes
- Focus Areas: ${answers.focus_areas?.join(', ')}

Please create 15 diverse workouts (we'll cycle through them over 90 days) that:
1. Progress in difficulty over time
2. Mix different training styles (strength, cardio, HIIT, recovery)
3. Use the available equipment
4. Match the user's experience level
5. Align with their primary goal

For each workout, provide:
- Day number (1-15, we'll assign them to the 90-day program)
- Title (motivating and descriptive)
- Category (strength/cardio/hiit/recovery/mobility)
- Duration in minutes
- Difficulty level (beginner/intermediate/advanced)
- Description (2-3 sentences about the workout)
- 6-10 exercises with:
  - Exercise name
  - Sets
  - Reps (or duration for cardio)
  - Rest seconds between sets
  - Brief notes/form cues

Return as a JSON array of workout objects.`;

      let result;
      try {
        result = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              workouts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day_number: { type: "integer" },
                    title: { type: "string" },
                    category: { type: "string" },
                    duration_minutes: { type: "integer" },
                    difficulty: { type: "string" },
                    description: { type: "string" },
                    exercises: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          sets: { type: "integer" },
                          reps: { type: "string" },
                          rest_seconds: { type: "integer" },
                          notes: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
      } catch (llmError) {
        console.error("LLM Error:", llmError);
        throw new Error(`AI generation failed: ${llmError.message || 'Connection error'}`);
      }

      // Create workout records
      if (result.workouts && result.workouts.length > 0) {
        // Distribute the 15 workouts across 90 days (repeat pattern)
        const expandedWorkouts = [];
        for (let day = 1; day <= 90; day++) {
          const workoutIndex = (day - 1) % result.workouts.length;
          const baseWorkout = result.workouts[workoutIndex];
          expandedWorkouts.push({
            ...baseWorkout,
            day_number: day
          });
        }

        // Create workouts in batches of 10 for better performance
        const batchSize = 10;
        for (let i = 0; i < expandedWorkouts.length; i += batchSize) {
          const batch = expandedWorkouts.slice(i, i + batchSize);
          await Promise.all(
            batch.map(workout => base44.entities.Workout.create(workout))
          );
        }
      }

      onComplete();
    } catch (error) {
      console.error("Error generating workouts:", error);
      const errorMessage = error.message || "Unknown error";
      alert(`Error generating workouts: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Customize Your Workouts</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              disabled={isGenerating}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm opacity-90">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.multiple
                    ? answers[currentQuestion.id]?.includes(option.value)
                    : answers[currentQuestion.id] === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-transparent hover:border-blue-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {option.emoji && (
                          <span className="text-2xl">{option.emoji}</span>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">{option.label}</div>
                          {option.description && (
                            <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                              {option.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {currentQuestion.multiple && (
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Select all that apply
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isGenerating}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isAnswered() || isGenerating}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Your Program...
              </>
            ) : currentStep === questions.length - 1 ? (
              <>
                Generate Workouts
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}