import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Salad, Droplet, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NutritionOverview({ user, todayNutrition }) {
  const calculateTotals = () => {
    if (!todayNutrition || todayNutrition.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
    }
    
    return todayNutrition.reduce((acc, log) => ({
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Salad className="w-5 h-5 text-green-600" />
          Today's Nutrition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Calories</span>
              <span className="text-gray-600">{totals.calories} / {targets.calories}</span>
            </div>
            <Progress value={(totals.calories / targets.calories) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Protein</span>
              <span className="text-gray-600">{totals.protein}g / {targets.protein}g</span>
            </div>
            <Progress value={(totals.protein / targets.protein) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Carbs</span>
              <span className="text-gray-600">{totals.carbs}g / {targets.carbs}g</span>
            </div>
            <Progress value={(totals.carbs / targets.carbs) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Fats</span>
              <span className="text-gray-600">{totals.fats}g / {targets.fats}g</span>
            </div>
            <Progress value={(totals.fats / targets.fats) * 100} className="h-2" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Water Intake</div>
              <div className="text-xs text-gray-600">{totals.water}L / {targets.water}L</div>
            </div>
          </div>
          <Progress value={(totals.water / targets.water) * 100} className="h-2 w-20" />
        </div>

        <Link to={createPageUrl("Nutrition")}>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Log Meal
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}