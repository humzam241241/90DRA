import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

const PRESET_HABITS = {
  good: [
    { name: "Morning Workout", emoji: "💪", category: "fitness" },
    { name: "Meditation", emoji: "🧘", category: "mindfulness" },
    { name: "Healthy Meal", emoji: "🥗", category: "nutrition" },
    { name: "Reading", emoji: "📚", category: "productivity" },
    { name: "Cold Shower", emoji: "🚿", category: "fitness" },
    { name: "Journaling", emoji: "✍️", category: "mindfulness" },
    { name: "Learn Something New", emoji: "🎓", category: "productivity" },
    { name: "Social Connection", emoji: "👥", category: "social" },
    { name: "Deep Work", emoji: "🎯", category: "productivity" },
    { name: "Nature Walk", emoji: "🌲", category: "fitness" },
  ],
  bad: [
    { name: "Social Media Scroll", emoji: "📱", category: "digital" },
    { name: "Junk Food", emoji: "🍔", category: "nutrition" },
    { name: "Procrastination", emoji: "😴", category: "productivity" },
    { name: "Excessive Gaming", emoji: "🎮", category: "digital" },
    { name: "Binge Watching", emoji: "📺", category: "digital" },
    { name: "Late Night Snacking", emoji: "🍕", category: "nutrition" },
    { name: "Doom Scrolling", emoji: "📰", category: "digital" },
    { name: "Skipping Workout", emoji: "🛋️", category: "fitness" },
  ]
};

export default function HabitPicker({ onClose, onSuccess }) {
  const [habitType, setHabitType] = useState("good");
  const [customMode, setCustomMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customHabit, setCustomHabit] = useState({
    name: "",
    emoji: "✨",
    category: "other"
  });

  const handleCreateHabit = async (preset) => {
    setCreating(true);
    try {
      await base44.entities.Habit.create({
        name: preset.name,
        type: habitType,
        category: preset.category,
        icon_emoji: preset.emoji,
        default_weight: 5,
        default_duration: 30,
        is_active: true
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating habit:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCustom = async () => {
    if (!customHabit.name.trim()) return;
    
    setCreating(true);
    try {
      await base44.entities.Habit.create({
        name: customHabit.name,
        type: habitType,
        category: customHabit.category,
        icon_emoji: customHabit.emoji,
        default_weight: 5,
        default_duration: 30,
        is_active: true
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating habit:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 rounded-t-2xl md:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add Habits</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Choose presets or create your own</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setHabitType("good")}
              variant={habitType === "good" ? "default" : "outline"}
              className={`flex-1 ${habitType === "good" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              size="sm"
            >
              Good Habits
            </Button>
            <Button
              onClick={() => setHabitType("bad")}
              variant={habitType === "bad" ? "default" : "outline"}
              className={`flex-1 ${habitType === "bad" ? "bg-rose-600 hover:bg-rose-700" : ""}`}
              size="sm"
            >
              Bad Habits
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {!customMode ? (
            <>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {PRESET_HABITS[habitType].map((preset, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleCreateHabit(preset)}
                    disabled={creating}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      habitType === "good"
                        ? "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                        : "border-rose-200 hover:border-rose-400 hover:bg-rose-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{preset.emoji}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{preset.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{preset.category}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <Button
                onClick={() => setCustomMode(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Habit
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Habit Name</Label>
                <Input
                  value={customHabit.name}
                  onChange={(e) => setCustomHabit({...customHabit, name: e.target.value})}
                  placeholder="e.g., Morning Run"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Emoji Icon</Label>
                <Input
                  value={customHabit.emoji}
                  onChange={(e) => setCustomHabit({...customHabit, emoji: e.target.value})}
                  placeholder="✨"
                  className="mt-1"
                  maxLength={2}
                />
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={customHabit.category}
                  onChange={(e) => setCustomHabit({...customHabit, category: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="social">Social</option>
                  <option value="digital">Digital</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="productivity">Productivity</option>
                  <option value="sleep">Sleep</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCustomMode(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateCustom}
                  disabled={!customHabit.name.trim() || creating}
                  className={`flex-1 ${
                    habitType === "good"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Create Habit
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}