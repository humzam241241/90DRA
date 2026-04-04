import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Clock, CheckCircle2, Lightbulb, ListChecks, 
  MessageCircle, Zap, Award, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const brainPartColors = {
  prefrontal_cortex: "from-blue-500 to-blue-600",
  amygdala: "from-red-500 to-rose-600",
  hippocampus: "from-emerald-500 to-teal-600",
  basal_ganglia: "from-amber-500 to-orange-600",
  nucleus_accumbens: "from-purple-500 to-violet-600",
  hypothalamus: "from-pink-500 to-rose-600",
  cerebellum: "from-indigo-500 to-blue-600"
};

export default function LessonViewer({ lesson, isCompleted, onBack, onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  
  const xpReward = 100 + (lesson.duration_minutes || 5) * 5;
  const gradientClass = brainPartColors[lesson.brain_part] || "from-slate-500 to-slate-600";

  const sections = [
    { id: 'content', title: 'Lesson', icon: Lightbulb },
    ...(lesson.key_takeaways?.length ? [{ id: 'takeaways', title: 'Key Points', icon: ListChecks }] : []),
    ...(lesson.action_steps?.length ? [{ id: 'actions', title: 'Actions', icon: CheckCircle2 }] : []),
    ...(lesson.reflection_prompts?.length ? [{ id: 'reflect', title: 'Reflect', icon: MessageCircle }] : []),
  ];

  const handleComplete = () => {
    setShowCompletion(true);
    setTimeout(() => {
      onComplete(lesson.id, xpReward);
    }, 2000);
  };

  const isLastSection = currentSection === sections.length - 1;

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 overflow-hidden"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
    >
      {/* Completion Overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <Award className="w-14 h-14 text-white" />
              </div>
            </motion.div>
            <motion.h2
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Lesson Complete!
            </motion.h2>
            <motion.div
              className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Zap className="w-6 h-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">+{xpReward} XP</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientClass} pt-safe`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                {lesson.duration_minutes || 5} min
              </Badge>
              {!isCompleted && (
                <Badge variant="secondary" className="bg-amber-400/90 text-amber-900 border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  +{xpReward} XP
                </Badge>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{lesson.title}</h1>
          <p className="text-white/80 text-sm">Day {lesson.day_number} • {lesson.brain_part?.replace(/_/g, ' ')}</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                currentSection === idx 
                  ? 'bg-white text-slate-800' 
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {sections[currentSection]?.id === 'content' && (
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>
              )}

              {sections[currentSection]?.id === 'takeaways' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Key Takeaways</h2>
                  {lesson.key_takeaways?.map((takeaway, idx) => (
                    <motion.div
                      key={idx}
                      className="flex gap-4 p-4 bg-blue-50 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{idx + 1}</span>
                      </div>
                      <p className="text-slate-700">{takeaway}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {sections[currentSection]?.id === 'actions' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Action Steps</h2>
                  {lesson.action_steps?.map((step, idx) => (
                    <motion.div
                      key={idx}
                      className="flex gap-4 p-4 bg-emerald-50 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-slate-700">{step}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {sections[currentSection]?.id === 'reflect' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Reflection Prompts</h2>
                  {lesson.reflection_prompts?.map((prompt, idx) => (
                    <motion.div
                      key={idx}
                      className="p-5 bg-purple-50 rounded-xl border-l-4 border-purple-400"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <p className="text-slate-700 italic">{prompt}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100">
        {isLastSection ? (
          <Button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`w-full h-14 text-lg font-semibold rounded-xl ${
              isCompleted 
                ? 'bg-emerald-600 hover:bg-emerald-600' 
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Already Completed
              </>
            ) : (
              <>
                Complete & Earn {xpReward} XP
                <Award className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-slate-800 hover:bg-slate-900"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}