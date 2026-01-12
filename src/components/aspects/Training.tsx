'use client';

import { useState } from 'react';
import { AspectLayout, EmptyState, ItemCard } from './AspectLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Dumbbell, 
  Flame, 
  Timer, 
  TrendingUp, 
  Calendar,
  Plus,
  Zap,
  Heart,
  Target,
  Moon,
  Youtube,
  Sparkles,
  Edit,
  Trash2,
  Route,
  Activity,
} from 'lucide-react';
import type { TrainingLog, TrainingType, BodyPart, WorkoutTemplate } from '@/types/database';
import { format } from 'date-fns';
import { WeightHeightTracker } from '@/components/WeightHeightTracker';
import { 
  LogWorkoutDialog, 
  WeeklyRecap, 
  SleepTracker, 
  SportsFeedBox, 
  ResourceLibrary,
  AIWorkoutGenerator,
} from '@/components/training';
import { useTrainingLogs, useWeeklyWorkoutSummary } from '@/hooks/useTraining';
import { useRouter } from 'next/navigation';

const intensityColors = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

const typeIcons: Record<TrainingType, React.ComponentType<any>> = {
  strength: Dumbbell,
  cardio: Heart,
  flexibility: Zap,
  hiit: Flame,
  sports: Target,
  other: Flame,
};

const typeColors: Record<TrainingType, string> = {
  strength: '#8B5CF6',
  cardio: '#EF4444',
  flexibility: '#10B981',
  hiit: '#F59E0B',
  sports: '#3B82F6',
  other: '#6B7280',
};

// Mock templates - will be fetched from DB later
const workoutTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    user_id: null,
    title: 'Quick HIIT',
    description: '20-minute high-intensity interval training',
    training_type: 'hiit',
    body_parts: ['full_body'],
    duration_minutes: 20,
    intensity: 'high',
    exercises: [
      { name: 'Jumping Jacks', duration_seconds: 30 },
      { name: 'Burpees', reps: 10 },
      { name: 'Mountain Climbers', duration_seconds: 30 },
      { name: 'Squat Jumps', reps: 15 },
    ],
    is_ai_generated: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: null,
    title: 'Full Body Strength',
    description: 'Complete strength workout targeting all muscle groups',
    training_type: 'strength',
    body_parts: ['chest', 'back', 'legs', 'arms'],
    duration_minutes: 45,
    intensity: 'medium',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 10 },
      { name: 'Squats', sets: 4, reps: 12 },
      { name: 'Bent Over Rows', sets: 3, reps: 10 },
      { name: 'Shoulder Press', sets: 3, reps: 10 },
      { name: 'Bicep Curls', sets: 3, reps: 12 },
    ],
    is_ai_generated: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: null,
    title: 'Morning Yoga',
    description: 'Gentle stretching and flexibility routine',
    training_type: 'flexibility',
    body_parts: ['full_body'],
    duration_minutes: 30,
    intensity: 'low',
    exercises: [
      { name: 'Sun Salutation', duration_seconds: 300 },
      { name: "Warrior I & II", duration_seconds: 120 },
      { name: 'Downward Dog', duration_seconds: 60 },
      { name: 'Child\'s Pose', duration_seconds: 120 },
    ],
    is_ai_generated: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: null,
    title: '5K Run',
    description: 'Outdoor or treadmill run',
    training_type: 'cardio',
    body_parts: ['legs'],
    duration_minutes: 30,
    intensity: 'medium',
    exercises: [
      { name: 'Warm-up Walk', duration_seconds: 300 },
      { name: '5K Run', duration_seconds: 1500 },
      { name: 'Cool-down Walk', duration_seconds: 300 },
    ],
    is_ai_generated: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function Training() {
  const { theme, setCurrentAspect } = useAppStore();
  const router = useRouter();
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<TrainingLog | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  // Fetch training logs from the database
  const { 
    logs: workouts, 
    loading, 
    createLog, 
    updateLog, 
    deleteLog,
    refetch 
  } = useTrainingLogs();

  const { weeklyTotals } = useWeeklyWorkoutSummary();

  // Stats for header
  const stats = [
    { label: 'This Week', value: `${weeklyTotals.workouts} workouts`, trend: 'up' as const },
    { label: 'Total Time', value: formatDuration(weeklyTotals.duration), trend: 'up' as const },
    { label: 'Streak', value: '7 days', trend: 'up' as const }, // TODO: Calculate actual streak
    { label: 'Calories', value: weeklyTotals.calories.toLocaleString(), trend: 'up' as const },
  ];

  const handleSaveWorkout = async (data: any) => {
    if (editingWorkout) {
      await updateLog(editingWorkout.id, data);
    } else {
      await createLog(data);
    }
    setEditingWorkout(null);
    refetch();
  };

  const handleEditWorkout = (workout: TrainingLog) => {
    setEditingWorkout(workout);
    setIsAddingWorkout(true);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      await deleteLog(id);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddingWorkout(true);
  };

  const handleUseTemplate = (template: WorkoutTemplate) => {
    // Pre-fill the workout dialog with template data
    setEditingWorkout({
      id: '',
      user_id: '',
      title: template.title,
      type: template.training_type,
      duration_minutes: template.duration_minutes,
      intensity: template.intensity,
      notes: template.description,
      body_parts: template.body_parts as BodyPart[],
      distance_km: null,
      calories_burned: null,
      heart_rate_avg: null,
      heart_rate_max: null,
      workout_date: new Date().toISOString().split('T')[0],
      completed_at: null,
      created_at: '',
      exercises: template.exercises.map((ex, i) => ({
        id: '',
        training_log_id: '',
        user_id: '',
        exercise_name: ex.name,
        sets: ex.sets || null,
        reps: ex.reps || null,
        weight_kg: null,
        notes: null,
        order_index: i,
        created_at: '',
      })),
    } as any);
    setIsAddingWorkout(true);
  };

  const navigateToSports = () => {
    setCurrentAspect('sports');
    router.push('/sports');
  };

  return (
    <AspectLayout
      aspectId="training"
      stats={stats}
      onAddNew={() => {
        setEditingWorkout(null);
        setIsAddingWorkout(true);
      }}
      addNewLabel="Log Workout"
    >
      {/* Weekly Recap - Always visible at top */}
      <div className="mb-6">
        <WeeklyRecap onDayClick={handleDayClick} />
      </div>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="log" className="text-xs sm:text-sm">
            <Dumbbell className="h-4 w-4 mr-1 hidden sm:inline" />
            Log
          </TabsTrigger>
          <TabsTrigger value="sleep" className="text-xs sm:text-sm">
            <Moon className="h-4 w-4 mr-1 hidden sm:inline" />
            Sleep
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm">
            <Youtube className="h-4 w-4 mr-1 hidden sm:inline" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="body" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-1 hidden sm:inline" />
            Body
          </TabsTrigger>
        </TabsList>

        {/* Workout Log Tab */}
        <TabsContent value="log" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main workout list */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
                </div>
              ) : workouts.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              description="Start tracking your fitness journey by logging your first workout."
              actionLabel="Log Workout"
              onAction={() => setIsAddingWorkout(true)}
            />
          ) : (
                <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {workouts.map((workout) => {
                const TypeIcon = typeIcons[workout.type] || Dumbbell;
                return (
                        <Card key={workout.id} className="hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                        <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${typeColors[workout.type]}20` }}
                        >
                          <TypeIcon
                            className="h-6 w-6"
                                  style={{ color: typeColors[workout.type] }}
                          />
                        </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "font-medium",
                            theme === 'light' ? "text-slate-900" : "text-white"
                          )}>
                            {workout.title}
                          </h4>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditWorkout(workout)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteWorkout(workout.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={cn(
                              "text-sm flex items-center gap-1",
                              theme === 'light' ? "text-slate-500" : "text-white/60"
                            )}>
                              <Timer className="h-3 w-3" />
                              {formatDurationDisplay(workout.duration_seconds, workout.duration_minutes)}
                            </span>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: `${intensityColors[workout.intensity]}20`,
                                color: intensityColors[workout.intensity],
                              }}
                            >
                              {workout.intensity}
                            </Badge>
                                  <Badge 
                                    variant="secondary"
                                    style={{
                                      backgroundColor: `${typeColors[workout.type]}20`,
                                      color: typeColors[workout.type],
                                    }}
                                  >
                                    {workout.type}
                                  </Badge>
                                </div>

                                {/* Body parts */}
                                {workout.body_parts && workout.body_parts.length > 0 && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {workout.body_parts.map((part: BodyPart) => (
                                      <Badge key={part} variant="outline" className="text-xs">
                                        {part.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Cardio specific data */}
                                {workout.type === 'cardio' && workout.distance_km && (
                                  <div className={cn(
                                    "flex items-center gap-4 mt-2 text-sm",
                                    theme === 'light' ? "text-slate-600" : "text-white/70"
                                  )}>
                                    <span className="flex items-center gap-1">
                                      <Route className="h-3 w-3" />
                                      {workout.distance_km.toFixed(1)} km
                                    </span>
                                    <span>
                                      Pace: {calculatePaceFromSeconds(workout.distance_km, workout.duration_seconds || (workout.duration_minutes || 0) * 60)}
                                    </span>
                                    <span>
                                      {calculateSpeedFromSeconds(workout.distance_km, workout.duration_seconds || (workout.duration_minutes || 0) * 60)}
                                    </span>
                                    {workout.calories_burned && (
                                      <span className="flex items-center gap-1">
                                        <Flame className="h-3 w-3" />
                                        {workout.calories_burned} cal
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Exercises for strength */}
                                {workout.exercises && workout.exercises.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {workout.exercises.slice(0, 3).map((ex: any, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {ex.exercise_name}
                                          {ex.sets && ex.reps && ` ${ex.sets}x${ex.reps}`}
                                        </Badge>
                                      ))}
                                      {workout.exercises.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{workout.exercises.length - 3} more
                                        </Badge>
                                      )}
                          </div>
                        </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                          <span className={cn(
                            "text-sm",
                            theme === 'light' ? "text-slate-500" : "text-white/60"
                          )}>
                                  {format(new Date(workout.workout_date), 'MMM d')}
                          </span>
                        </div>
                      </div>
                      {workout.notes && (
                        <p className={cn(
                          "text-sm mt-3 pl-16",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          {workout.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
                </ScrollArea>
              )}
          </div>

            {/* Sidebar with Sports Feed */}
            <div className="space-y-6">
              <SportsFeedBox 
                onNavigateToSports={navigateToSports}
                compact
              />
              
              {/* Quick Stats Card */}
            <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  Personal Bests
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                      theme === 'light' ? "text-slate-600" : "text-white/70"
                  )}>
                    Longest Run
                  </span>
                  <Badge variant="secondary">10 km</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                      theme === 'light' ? "text-slate-600" : "text-white/70"
                  )}>
                    Longest Streak
                  </span>
                  <Badge variant="secondary">14 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                      theme === 'light' ? "text-slate-600" : "text-white/70"
                  )}>
                    Most Active Week
                  </span>
                  <Badge variant="secondary">6 workouts</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="mt-6">
          <SleepTracker />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            {/* AI Generate Section */}
            <Card className={cn(
              "border-dashed",
              theme === 'light' ? "bg-gradient-to-br from-violet-50 to-pink-50" : "bg-gradient-to-br from-violet-900/20 to-pink-900/20"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-semibold",
                      theme === 'light' ? "text-slate-900" : "text-white"
                    )}>
                      AI Workout Generator
                    </h3>
                    <p className={cn(
                      "text-sm",
                      theme === 'light' ? "text-slate-600" : "text-white/70"
                    )}>
                      Generate personalized workout plans based on your goals
                    </p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-violet-600 to-pink-600"
                    onClick={() => setIsGeneratorOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workoutTemplates.map((template) => {
                const TypeIcon = typeIcons[template.training_type] || Dumbbell;
                return (
                  <Card key={template.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${typeColors[template.training_type]}20` }}
                        >
                          <TypeIcon
                            className="h-6 w-6"
                            style={{ color: typeColors[template.training_type] }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium",
                            theme === 'light' ? "text-slate-900" : "text-white"
                          )}>
                            {template.title}
                          </h4>
                          <p className={cn(
                            "text-sm mt-1",
                            theme === 'light' ? "text-slate-500" : "text-white/60"
                          )}>
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              {template.duration_minutes} min
                            </Badge>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: `${intensityColors[template.intensity]}20`,
                                color: intensityColors[template.intensity],
                              }}
                            >
                              {template.intensity}
                            </Badge>
                          </div>
                          {template.exercises.length > 0 && (
                            <p className={cn(
                              "text-xs mt-2",
                              theme === 'light' ? "text-slate-400" : "text-white/40"
                            )}>
                              {template.exercises.length} exercises
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          <ResourceLibrary />
        </TabsContent>

        {/* Body Metrics Tab */}
        <TabsContent value="body" className="mt-6">
          <WeightHeightTracker />
        </TabsContent>
      </Tabs>

      {/* Log Workout Dialog */}
      <LogWorkoutDialog
        open={isAddingWorkout}
        onOpenChange={(open) => {
          setIsAddingWorkout(open);
          if (!open) {
            setEditingWorkout(null);
            setSelectedDate(null);
          }
        }}
        onSave={handleSaveWorkout}
        editingLog={editingWorkout}
        distanceUnit="km" // TODO: Get from user preferences
      />

      {/* AI Workout Generator Dialog */}
      <AIWorkoutGenerator
        open={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        onWorkoutGenerated={(template) => {
          // Use the generated template to pre-fill a new workout
          handleUseTemplate(template);
        }}
      />
    </AspectLayout>
  );
}

// Helper function to format duration from seconds for stats
function formatDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Helper function to format duration display (shows seconds if non-zero)
function formatDurationDisplay(durationSeconds: number | null, durationMinutesLegacy: number | null): string {
  // Use duration_seconds if available, fallback to duration_minutes
  if (durationSeconds != null) {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    if (secs > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins} min`;
  }
  return `${durationMinutesLegacy || 0} min`;
}

// Calculate pace from seconds
function calculatePaceFromSeconds(distanceKm: number, durationSeconds: number): string {
  if (!distanceKm || distanceKm <= 0 || !durationSeconds || durationSeconds <= 0) return '--:--';
  
  const paceSeconds = durationSeconds / distanceKm;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}

// Calculate speed from seconds
function calculateSpeedFromSeconds(distanceKm: number, durationSeconds: number): string {
  if (!distanceKm || durationSeconds <= 0) return '--';
  
  const speedKmH = (distanceKm / durationSeconds) * 3600;
  return `${speedKmH.toFixed(1)} km/h`;
}
