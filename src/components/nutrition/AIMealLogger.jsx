import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

export default function AIMealLogger({ mealType, onSuccess, onCancel, selectedDate }) {
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const analyzeFood = async () => {
    if (!description.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following meal/food description and provide detailed nutritional information. Be as accurate as possible based on typical serving sizes. If multiple items are mentioned, sum up the totals.

Food description: "${description}"

Provide the nutritional breakdown including:
- Total calories
- Protein in grams
- Carbohydrates in grams
- Fats in grams
- A cleaned up meal name (keep it concise, under 50 characters)

Be realistic and accurate. Use standard portion sizes unless specific amounts are mentioned.`,
        response_json_schema: {
          type: "object",
          properties: {
            meal_name: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fats: { type: "number" }
          }
        }
      });

      setNutritionData(result);
    } catch (error) {
      console.error("Error analyzing food:", error);
      alert("Failed to analyze food. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!nutritionData) return;

    await base44.entities.NutritionLog.create({
      date: selectedDate,
      meal_type: mealType,
      meal_name: nutritionData.meal_name,
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      carbs: nutritionData.carbs,
      fats: nutritionData.fats,
      water_intake: 0,
      notes: `Original: ${description}`
    });

    onSuccess();
  };

  return (
    <Card className="p-4 md:p-6 border-2 border-violet-400 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg">AI Food Logger</h3>
            <p className="text-xs md:text-sm text-slate-500">Describe your meal, we'll analyze the nutrition</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!nutritionData ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <Label>What did you eat?</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Grilled chicken breast with rice and broccoli, 2 scrambled eggs with toast, protein shake with banana..."
                  rows={4}
                  className="mt-1"
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Be as specific as possible for accurate results
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isAnalyzing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={analyzeFood}
                  disabled={!description.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Nutrition
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border-2 border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">Nutrition Analysis Complete</span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3 mt-4">
                    <div>
                      <Label className="text-xs">Meal Name</Label>
                      <Input
                        value={nutritionData.meal_name}
                        onChange={(e) => setNutritionData({...nutritionData, meal_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Calories</Label>
                        <Input
                          type="number"
                          value={nutritionData.calories}
                          onChange={(e) => setNutritionData({...nutritionData, calories: parseFloat(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Protein (g)</Label>
                        <Input
                          type="number"
                          value={nutritionData.protein}
                          onChange={(e) => setNutritionData({...nutritionData, protein: parseFloat(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Carbs (g)</Label>
                        <Input
                          type="number"
                          value={nutritionData.carbs}
                          onChange={(e) => setNutritionData({...nutritionData, carbs: parseFloat(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fats (g)</Label>
                        <Input
                          type="number"
                          value={nutritionData.fats}
                          onChange={(e) => setNutritionData({...nutritionData, fats: parseFloat(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="w-full"
                    >
                      Done Editing
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-slate-900 text-lg mb-3">{nutritionData.meal_name}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="text-xs text-slate-500">Calories</div>
                        <div className="text-2xl font-bold text-slate-900">{Math.round(nutritionData.calories)}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="text-xs text-slate-500">Protein</div>
                        <div className="text-2xl font-bold text-slate-900">{Math.round(nutritionData.protein)}g</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="text-xs text-slate-500">Carbs</div>
                        <div className="text-2xl font-bold text-slate-900">{Math.round(nutritionData.carbs)}g</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="text-xs text-slate-500">Fats</div>
                        <div className="text-2xl font-bold text-slate-900">{Math.round(nutritionData.fats)}g</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="w-full mt-2"
                    >
                      <Edit2 className="w-3 h-3 mr-2" />
                      Edit Values
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNutritionData(null);
                    setDescription("");
                  }}
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Meal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}