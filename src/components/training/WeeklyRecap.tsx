'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Timer,
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useWeeklyWorkoutSummary } from '@/hooks/useTraining';
import { format, addWeeks, subWeeks, isSameWeek, startOfWeek } from 'date-fns';
import { useState } from 'react';

interface WeeklyRecapProps {
  onDayClick?: (date: Date) => void;
  compact?: boolean;
}

export function WeeklyRecap({ onDayClick, compact = false }: WeeklyRecapProps) {
  const { theme } = useAppStore();
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const { weekDays, weeklyTotals, loading, weekStart, weekEnd } = useWeeklyWorkoutSummary(selectedWeek);
  
  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 1 });

  const goToPreviousWeek = () => setSelectedWeek(subWeeks(selectedWeek, 1));
  const goToNextWeek = () => setSelectedWeek(addWeeks(selectedWeek, 1));
  const goToCurrentWeek = () => setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  if (compact) {
    return (
      <Card className={cn(
        "overflow-hidden",
        theme === 'light' ? "bg-gradient-to-br from-violet-50 to-pink-50" : "bg-gradient-to-br from-violet-900/20 to-pink-900/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-500" />
              <span className={cn(
                "font-medium text-sm",
                theme === 'light' ? "text-slate-700" : "text-white/80"
              )}>
                This Week
              </span>
            </div>
            <Badge variant="secondary" className="bg-violet-500/20 text-violet-600">
              {weeklyTotals.workouts} workouts
            </Badge>
          </div>
          
          <div className="flex justify-between gap-1">
            {weekDays.map((day) => (
              <div
                key={day.dayNumber}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors",
                  day.isToday && (theme === 'light' ? "bg-violet-100" : "bg-violet-500/20"),
                  !day.isToday && "hover:bg-white/50 dark:hover:bg-white/5"
                )}
                onClick={() => onDayClick?.(day.date)}
              >
                <span className={cn(
                  "text-xs font-medium",
                  day.isToday ? "text-violet-600" : (theme === 'light' ? "text-slate-500" : "text-white/50")
                )}>
                  {day.dayName}
                </span>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  day.hasWorkout 
                    ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                    : (day.isPast 
                        ? (theme === 'light' ? "bg-slate-200" : "bg-white/10")
                        : (theme === 'light' ? "bg-slate-100" : "bg-white/5"))
                )}>
                  {day.hasWorkout ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Circle className={cn(
                      "h-4 w-4",
                      day.isPast ? "text-slate-400" : "text-slate-300"
                    )} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "flex items-center gap-2",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            <Calendar className="h-5 w-5 text-violet-500" />
            Weekly Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isCurrentWeek ? "secondary" : "ghost"}
              size="sm"
              onClick={goToCurrentWeek}
            >
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextWeek}
              disabled={isCurrentWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : (
          <>
            {/* Week Days Grid */}
            <div className="flex justify-between gap-2 mb-6">
              {weekDays.map((day) => (
                <div
                  key={day.dayNumber}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all",
                    day.isToday && "ring-2 ring-violet-500 ring-offset-2",
                    theme === 'light' 
                      ? (day.isToday ? "bg-violet-50" : "bg-slate-50 hover:bg-slate-100")
                      : (day.isToday ? "bg-violet-500/20" : "bg-white/5 hover:bg-white/10")
                  )}
                  onClick={() => onDayClick?.(day.date)}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    day.isToday ? "text-violet-600" : (theme === 'light' ? "text-slate-500" : "text-white/50")
                  )}>
                    {day.dayName}
                  </span>
                  <span className={cn(
                    "text-lg font-bold",
                    day.isToday ? "text-violet-600" : (theme === 'light' ? "text-slate-700" : "text-white/80")
                  )}>
                    {day.dayNumber}
                  </span>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    day.hasWorkout 
                      ? "bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30" 
                      : (day.isPast 
                          ? (theme === 'light' ? "bg-slate-200" : "bg-white/10")
                          : (theme === 'light' ? "bg-slate-100 border-2 border-dashed border-slate-300" : "bg-white/5 border-2 border-dashed border-white/20"))
                  )}>
                    {day.hasWorkout ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : day.isPast ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  {day.hasWorkout && day.duration > 0 && (
                    <span className={cn(
                      "text-xs",
                      theme === 'light' ? "text-slate-500" : "text-white/50"
                    )}>
                      {day.duration}m
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Weekly Stats */}
            <div className={cn(
              "grid grid-cols-3 gap-4 p-4 rounded-xl",
              theme === 'light' ? "bg-slate-50" : "bg-white/5"
            )}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  {weeklyTotals.workouts}
                </p>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/50"
                )}>
                  Workouts
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Timer className="h-4 w-4 text-blue-500" />
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  {weeklyTotals.duration > 60 
                    ? `${Math.floor(weeklyTotals.duration / 60)}h ${weeklyTotals.duration % 60}m`
                    : `${weeklyTotals.duration}m`
                  }
                </p>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/50"
                )}>
                  Total Time
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  {weeklyTotals.calories.toLocaleString()}
                </p>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/50"
                )}>
                  Calories
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

