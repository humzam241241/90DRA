import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronDown } from "lucide-react";

import InteractiveBrain from "@/components/mindset/InteractiveBrain";
import MindsetStats from "@/components/mindset/MindsetStats";
import DailyChallenge from "@/components/mindset/DailyChallenge";
import LessonCard from "@/components/mindset/LessonCard";
import LessonViewer from "@/components/mindset/LessonViewer";
import AchievementBadge from "@/components/mindset/AchievementBadge";

export default function Mindset() {
  const [user, setUser] = useState(null);
  const [selectedBrainPart, setSelectedBrainPart] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
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

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['mindset-lessons'],
    queryFn: () => base44.entities.MindsetLesson.list('day_number'),
    initialData: [],
  });

  const completedLessons = user?.completed_mindset_lessons || [];
  const completedChallenges = user?.completed_mindset_challenges || [];
  const totalXP = user?.mindset_xp || 0;
  const streak = user?.mindset_streak || 0;

  // Calculate stats per brain part
  const lessonsByPart = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.brain_part]) acc[lesson.brain_part] = [];
    acc[lesson.brain_part].push(lesson);
    return acc;
  }, {});

  const completedByPart = completedLessons.reduce((acc, lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      acc[lesson.brain_part] = (acc[lesson.brain_part] || 0) + 1;
    }
    return acc;
  }, {});

  const totalByPart = Object.keys(lessonsByPart).reduce((acc, part) => {
    acc[part] = lessonsByPart[part]?.length || 0;
    return acc;
  }, {});

  const uniqueBrainPartsStudied = Object.keys(completedByPart).length;

  const filteredLessons = selectedBrainPart 
    ? lessons.filter(l => l.brain_part === selectedBrainPart)
    : lessons;

  const handleCompleteLesson = async (lessonId, xp) => {
    if (!user || completedLessons.includes(lessonId)) return;

    const newCompleted = [...completedLessons, lessonId];
    const newXP = totalXP + xp;
    const newLevel = Math.floor(newXP / 500) + 1;

    await base44.auth.updateMe({
      completed_mindset_lessons: newCompleted,
      mindset_xp: newXP,
      mindset_level: newLevel,
    });

    setUser({
      ...user,
      completed_mindset_lessons: newCompleted,
      mindset_xp: newXP,
      mindset_level: newLevel,
    });
    setSelectedLesson(null);
  };

  const handleCompleteChallenge = async (challengeId, xp) => {
    if (!user) return;

    const newCompleted = [...completedChallenges, challengeId];
    const newXP = totalXP + xp;
    const newStreak = streak + 1;

    await base44.auth.updateMe({
      completed_mindset_challenges: newCompleted,
      mindset_xp: newXP,
      mindset_streak: newStreak,
    });

    setUser({
      ...user,
      completed_mindset_challenges: newCompleted,
      mindset_xp: newXP,
      mindset_streak: newStreak,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-12 h-12 text-violet-500 mx-auto" />
          </motion.div>
          <p className="text-slate-500 mt-4">Loading your brain training...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/30 to-slate-50">
      {/* Lesson Viewer Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonViewer
            lesson={selectedLesson}
            isCompleted={completedLessons.includes(selectedLesson.id)}
            onBack={() => setSelectedLesson(null)}
            onComplete={handleCompleteLesson}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Brain Rewiring System
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Train Your Mind
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Tap different brain regions to unlock lessons and level up your mental fitness
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Brain & Stats */}
          <div className="space-y-6">
            {/* Interactive Brain */}
            <motion.div 
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <InteractiveBrain
                selectedPart={selectedBrainPart}
                onSelectPart={(part) => setSelectedBrainPart(part === selectedBrainPart ? null : part)}
                completedLessons={completedByPart}
                totalLessons={totalByPart}
              />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MindsetStats
                stats={{
                  totalXP,
                  level: user?.mindset_level || 1,
                  streak,
                  lessonsCompleted: completedLessons.length,
                  totalLessons: lessons.length,
                }}
              />
            </motion.div>

            {/* Daily Challenge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DailyChallenge
                selectedPart={selectedBrainPart}
                completedChallenges={completedChallenges}
                onComplete={handleCompleteChallenge}
              />
            </motion.div>

            {/* Achievements - Collapsible */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-slate-800">Achievements</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showAchievements ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showAchievements && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <AchievementBadge
                      lessonsCompleted={completedLessons.length}
                      streak={streak}
                      uniqueBrainParts={uniqueBrainPartsStudied}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column - Lessons */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedBrainPart 
                  ? `${selectedBrainPart.replace(/_/g, ' ')} Lessons`
                  : 'All Lessons'
                }
              </h2>
              {selectedBrainPart && (
                <button
                  onClick={() => setSelectedBrainPart(null)}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  View All
                </button>
              )}
            </div>

            {filteredLessons.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <Brain className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No lessons yet</h3>
                <p className="text-slate-500">
                  {selectedBrainPart 
                    ? 'No lessons available for this brain region yet.'
                    : 'Lessons will appear here soon.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {filteredLessons.map((lesson, index) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={completedLessons.includes(lesson.id)}
                    isLocked={false}
                    index={index}
                    onClick={setSelectedLesson}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}