import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, Calendar, Target, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    program_start_date: "",
    current_weight: "",
    target_weight: "",
    height: "",
    age: "",
    gender: "",
    fitness_level: "",
    transformation_goal: "",
    daily_calories_target: "",
    daily_protein_target: "",
    daily_carbs_target: "",
    daily_fats_target: "",
    water_intake_target: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      setForm({
        full_name: u.full_name || "",
        program_start_date: u.program_start_date || "",
        current_weight: u.current_weight || "",
        target_weight: u.target_weight || "",
        height: u.height || "",
        age: u.age || "",
        gender: u.gender || "",
        fitness_level: u.fitness_level || "",
        transformation_goal: u.transformation_goal || "",
        daily_calories_target: u.daily_calories_target || 2000,
        daily_protein_target: u.daily_protein_target || 150,
        daily_carbs_target: u.daily_carbs_target || 200,
        daily_fats_target: u.daily_fats_target || 60,
        water_intake_target: u.water_intake_target || 3,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const calculateDayNumber = () => {
    if (!form.program_start_date) return 1;
    const start = new Date(form.program_start_date);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 90);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const updates = {
        ...form,
        current_weight: parseFloat(form.current_weight) || null,
        target_weight: parseFloat(form.target_weight) || null,
        height: parseFloat(form.height) || null,
        age: parseInt(form.age) || null,
        daily_calories_target: parseFloat(form.daily_calories_target) || 2000,
        daily_protein_target: parseFloat(form.daily_protein_target) || 150,
        daily_carbs_target: parseFloat(form.daily_carbs_target) || 200,
        daily_fats_target: parseFloat(form.daily_fats_target) || 60,
        water_intake_target: parseFloat(form.water_intake_target) || 3,
      };
      await base44.auth.updateMe(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your transformation journey settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-gray-50" />
            </div>
          </CardContent>
        </Card>

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Program Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Program Start Date</Label>
              <Input
                type="date"
                value={form.program_start_date}
                onChange={(e) => setForm({ ...form, program_start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Current Day</Label>
              <Input value={`Day ${calculateDayNumber()} of 90`} disabled className="bg-gray-50" />
            </div>
          </CardContent>
        </Card>

        {/* Body Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Body Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Current Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.current_weight}
                onChange={(e) => setForm({ ...form, current_weight: e.target.value })}
              />
            </div>
            <div>
              <Label>Target Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.target_weight}
                onChange={(e) => setForm({ ...form, target_weight: e.target.value })}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fitness Level</Label>
              <Select value={form.fitness_level} onValueChange={(v) => setForm({ ...form, fitness_level: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Nutrition Targets</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-4">
            <div>
              <Label>Calories</Label>
              <Input
                type="number"
                value={form.daily_calories_target}
                onChange={(e) => setForm({ ...form, daily_calories_target: e.target.value })}
              />
            </div>
            <div>
              <Label>Protein (g)</Label>
              <Input
                type="number"
                value={form.daily_protein_target}
                onChange={(e) => setForm({ ...form, daily_protein_target: e.target.value })}
              />
            </div>
            <div>
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                value={form.daily_carbs_target}
                onChange={(e) => setForm({ ...form, daily_carbs_target: e.target.value })}
              />
            </div>
            <div>
              <Label>Fats (g)</Label>
              <Input
                type="number"
                value={form.daily_fats_target}
                onChange={(e) => setForm({ ...form, daily_fats_target: e.target.value })}
              />
            </div>
            <div>
              <Label>Water (L)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.water_intake_target}
                onChange={(e) => setForm({ ...form, water_intake_target: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transformation Goal */}
        <Card>
          <CardHeader>
            <CardTitle>Transformation Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={form.transformation_goal}
              onChange={(e) => setForm({ ...form, transformation_goal: e.target.value })}
              placeholder="What do you want to achieve?"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
          {saved && (
            <span className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
