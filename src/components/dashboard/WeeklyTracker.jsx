import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";

export default function WeeklyTracker({ completedDates = [] }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
      isCompleted: completedDates.includes(format(date, 'yyyy-MM-dd')),
      isPast: date < today && format(date, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')
    };
  });

  const completedCount = weekDays.filter(d => d.isCompleted).length;

  return (
    <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg md:text-xl font-bold">
            Weekly Progress
          </CardTitle>
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs md:text-sm font-bold">
            {completedCount}/7 Days
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`
                flex flex-col items-center gap-2 p-2 md:p-3 rounded-xl transition-all duration-300
                ${day.isToday 
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 scale-105' 
                  : day.isCompleted
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                  : day.isPast
                  ? 'bg-slate-700/50 border border-slate-600/50'
                  : 'bg-slate-800/50 border border-slate-600/50'
                }
              `}
            >
              <span className={`
                text-[10px] md:text-xs font-semibold uppercase tracking-wider
                ${day.isToday || day.isCompleted ? 'text-white' : 'text-slate-400'}
              `}>
                {day.dayName}
              </span>
              
              <div className={`
                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base
                ${day.isToday 
                  ? 'bg-white/20 text-white border-2 border-white' 
                  : day.isCompleted
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400'
                }
              `}>
                {day.dayNumber}
              </div>

              <div className="mt-1">
                {day.isCompleted ? (
                  <CheckCircle2 className={`
                    w-4 h-4 md:w-5 md:h-5
                    ${day.isToday ? 'text-white' : 'text-white'}
                  `} />
                ) : (
                  <Circle className={`
                    w-4 h-4 md:w-5 md:h-5
                    ${day.isToday ? 'text-white/60' : 'text-slate-600'}
                  `} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-slate-400 font-medium">Week Completion</span>
            <span className="text-white font-bold">{Math.round((completedCount / 7) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full shadow-lg"
              style={{ width: `${(completedCount / 7) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}