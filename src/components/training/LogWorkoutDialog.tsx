'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Plus,
  X,
  Dumbbell,
  Heart,
  Zap,
  Target,
  Flame,
  Timer,
  Route,
  Activity,
  Trash2,
} from 'lucide-react';
import type { TrainingLog, TrainingType, TrainingIntensity, BodyPart, WorkoutExercise } from '@/types/database';
import { format } from 'date-fns';

const TRAINING_TYPES: { value: TrainingType; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: 'cardio', label: 'Cardio', icon: Heart, color: '#EF4444' },
  { value: 'strength', label: 'Strength', icon: Dumbbell, color: '#8B5CF6' },
  { value: 'flexibility', label: 'Flexibility', icon: Zap, color: '#10B981' },
  { value: 'hiit', label: 'HIIT', icon: Flame, color: '#F59E0B' },
  { value: 'sports', label: 'Sports', icon: Target, color: '#3B82F6' },
];

const BODY_PARTS: { value: BodyPart; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'legs', label: 'Legs' },
  { value: 'full_body', label: 'Full Body' },
];

const INTENSITIES: { value: TrainingIntensity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#22C55E' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
];

interface ExerciseInput {
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
}

interface LogWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    type: TrainingType;
    duration_seconds: number;
    intensity: TrainingIntensity;
    notes: string;
    body_parts: BodyPart[];
    distance_km: number | null;
    calories_burned: number | null;
    heart_rate_avg: number | null;
    heart_rate_max: number | null;
    workout_date: string;
    exercises: ExerciseInput[];
  }) => Promise<void>;
  editingLog?: TrainingLog | null;
  distanceUnit?: 'km' | 'miles';
}

export function LogWorkoutDialog({
  open,
  onOpenChange,
  onSave,
  editingLog,
  distanceUnit = 'km',
}: LogWorkoutDialogProps) {
  const { theme } = useAppStore();
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TrainingType>('strength');
  const [durationMin, setDurationMin] = useState(30);
  const [durationSec, setDurationSec] = useState(0);
  const [intensity, setIntensity] = useState<TrainingIntensity>('medium');
  const [notes, setNotes] = useState('');
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  
  // Cardio specific
  const [distance, setDistance] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [heartRateAvg, setHeartRateAvg] = useState<number | null>(null);
  const [heartRateMax, setHeartRateMax] = useState<number | null>(null);
  
  // Strength specific
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [newExercise, setNewExercise] = useState<ExerciseInput>({
    exercise_name: '',
    sets: null,
    reps: null,
    weight_kg: null,
  });

  // Reset form when dialog opens/closes or editing changes
  useEffect(() => {
    if (open) {
      if (editingLog) {
        setTitle(editingLog.title);
        setType(editingLog.type);
        // Handle both duration_seconds and legacy duration_minutes
        const totalSeconds = editingLog.duration_seconds || (editingLog.duration_minutes || 0) * 60;
        setDurationMin(Math.floor(totalSeconds / 60));
        setDurationSec(totalSeconds % 60);
        setIntensity(editingLog.intensity);
        setNotes(editingLog.notes || '');
        setBodyParts(editingLog.body_parts || []);
        setWorkoutDate(new Date(editingLog.workout_date));
        setDistance(editingLog.distance_km);
        setCalories(editingLog.calories_burned);
        setHeartRateAvg(editingLog.heart_rate_avg);
        setHeartRateMax(editingLog.heart_rate_max);
        setExercises(editingLog.exercises?.map(ex => ({
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
        })) || []);
      } else {
        resetForm();
      }
    }
  }, [open, editingLog]);

  const resetForm = () => {
    setTitle('');
    setType('strength');
    setDurationMin(30);
    setDurationSec(0);
    setIntensity('medium');
    setNotes('');
    setBodyParts([]);
    setWorkoutDate(new Date());
    setDistance(null);
    setCalories(null);
    setHeartRateAvg(null);
    setHeartRateMax(null);
    setExercises([]);
    setNewExercise({ exercise_name: '', sets: null, reps: null, weight_kg: null });
  };

  const toggleBodyPart = (part: BodyPart) => {
    if (part === 'full_body') {
      setBodyParts(bodyParts.includes('full_body') ? [] : ['full_body']);
    } else {
      setBodyParts(prev => {
        const filtered = prev.filter(p => p !== 'full_body');
        if (filtered.includes(part)) {
          return filtered.filter(p => p !== part);
        }
        return [...filtered, part];
      });
    }
  };

  const addExercise = () => {
    if (newExercise.exercise_name.trim()) {
      setExercises([...exercises, { ...newExercise }]);
      setNewExercise({ exercise_name: '', sets: null, reps: null, weight_kg: null });
    }
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      // Convert distance to km if needed
      let distanceKm = distance;
      if (distance && distanceUnit === 'miles') {
        distanceKm = distance * 1.60934;
      }

      // Calculate total seconds
      const totalSeconds = (durationMin * 60) + durationSec;

      await onSave({
        title: title.trim(),
        type,
        duration_seconds: totalSeconds,
        intensity,
        notes: notes.trim(),
        body_parts: bodyParts,
        distance_km: distanceKm,
        calories_burned: calories,
        heart_rate_avg: heartRateAvg,
        heart_rate_max: heartRateMax,
        workout_date: format(workoutDate, 'yyyy-MM-dd'),
        exercises,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedTypeConfig = TRAINING_TYPES.find(t => t.value === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingLog ? 'Edit Workout' : 'Log Workout'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-3">
            {/* Row 1: Name & Type */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Workout Name</Label>
                <Input
                  placeholder="Morning Run, Leg Day..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Type</Label>
                <div className="flex gap-1">
                  {TRAINING_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.value;
                    return (
                      <Button
                        key={t.value}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 px-1.5 flex-1 flex-col gap-0.5"
                        style={isSelected ? { backgroundColor: t.color } : undefined}
                        onClick={() => setType(t.value)}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="text-[9px] leading-none">{t.label.slice(0, 4)}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: Date, Duration (min:sec), Intensity */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={format(workoutDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const date = new Date(e.target.value + 'T12:00:00');
                    if (!isNaN(date.getTime())) {
                      setWorkoutDate(date);
                    }
                  }}
                  className="h-9 text-sm"
                />
              </div>
              <div className="col-span-4 space-y-1">
                <Label className="text-xs">Duration</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    className="h-9 text-center px-1"
                    placeholder="min"
                  />
                  <span className="text-muted-foreground font-medium">:</span>
                  <Input
                    type="number"
                    value={durationSec.toString().padStart(2, '0')}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setDurationSec(Math.min(59, Math.max(0, val)));
                    }}
                    min={0}
                    max={59}
                    className="h-9 text-center px-1"
                    placeholder="sec"
                  />
                </div>
              </div>
              <div className="col-span-4 space-y-1">
                <Label className="text-xs">Intensity</Label>
                <div className="flex gap-1">
                  {INTENSITIES.map((i) => (
                    <Button
                      key={i.value}
                      type="button"
                      variant={intensity === i.value ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-9 px-1 text-xs"
                      style={intensity === i.value ? { backgroundColor: i.color } : undefined}
                      onClick={() => setIntensity(i.value)}
                    >
                      {i.label.charAt(0)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Body Parts (compact) */}
            <div className="space-y-1">
              <Label className="text-xs">Body Parts</Label>
              <div className="flex flex-wrap gap-1">
                {BODY_PARTS.map((part) => {
                  const isSelected = bodyParts.includes(part.value);
                  return (
                    <Button
                      key={part.value}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => toggleBodyPart(part.value)}
                      style={isSelected ? { backgroundColor: selectedTypeConfig?.color } : undefined}
                    >
                      {part.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Cardio-specific fields */}
            {type === 'cardio' && (
              <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Route className="h-3.5 w-3.5" />
                    Cardio Details
                  </Label>
                  {distance && (durationMin > 0 || durationSec > 0) && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className={cn(theme === 'light' ? "text-slate-600" : "text-white/70")}>
                        {formatPaceFromSeconds(distance, (durationMin * 60) + durationSec, distanceUnit)} /{distanceUnit}
                      </span>
                      <span className={cn(theme === 'light' ? "text-slate-600" : "text-white/70")}>
                        {formatSpeedFromSeconds(distance, (durationMin * 60) + durationSec, distanceUnit)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Dist ({distanceUnit})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      value={distance || ''}
                      onChange={(e) => setDistance(parseFloat(e.target.value) || null)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Calories</Label>
                    <Input
                      type="number"
                      placeholder="300"
                      value={calories || ''}
                      onChange={(e) => setCalories(parseInt(e.target.value) || null)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Avg HR</Label>
                    <Input
                      type="number"
                      placeholder="145"
                      value={heartRateAvg || ''}
                      onChange={(e) => setHeartRateAvg(parseInt(e.target.value) || null)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Max HR</Label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={heartRateMax || ''}
                      onChange={(e) => setHeartRateMax(parseInt(e.target.value) || null)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Strength-specific fields */}
            {type === 'strength' && (
              <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Dumbbell className="h-3.5 w-3.5" />
                  Exercises
                </Label>
                
                {exercises.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {exercises.map((ex, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-1.5 p-1.5 rounded text-sm",
                          theme === 'light' ? "bg-white" : "bg-white/5"
                        )}
                      >
                        <span className="flex-1 font-medium truncate">{ex.exercise_name}</span>
                        <Badge variant="secondary" className="text-xs h-5">
                          {ex.sets || '-'}x{ex.reps || '-'}
                        </Badge>
                        {ex.weight_kg && (
                          <Badge variant="outline" className="text-xs h-5">{ex.weight_kg}kg</Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeExercise(index)}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-5 gap-1.5">
                  <Input
                    placeholder="Exercise name"
                    className="col-span-2 h-8 text-sm"
                    value={newExercise.exercise_name}
                    onChange={(e) => setNewExercise({ ...newExercise, exercise_name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addExercise();
                      }
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Sets"
                    className="h-8 text-sm"
                    value={newExercise.sets || ''}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || null })}
                  />
                  <Input
                    type="number"
                    placeholder="Reps"
                    className="h-8 text-sm"
                    value={newExercise.reps || ''}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || null })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={addExercise}
                    disabled={!newExercise.exercise_name.trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Notes - compact */}
            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                placeholder="How did it go?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </ScrollArea>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? 'Saving...' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {editingLog ? 'Update Workout' : 'Log Workout'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for pace/speed calculation using seconds
function formatPaceFromSeconds(distance: number, durationSeconds: number, unit: 'km' | 'miles'): string {
  if (!distance || distance <= 0 || !durationSeconds || durationSeconds <= 0) return '--:--';
  
  // Pace in seconds per unit distance
  const paceSeconds = durationSeconds / distance;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatSpeedFromSeconds(distance: number, durationSeconds: number, unit: 'km' | 'miles'): string {
  if (!distance || durationSeconds <= 0) return '--';
  
  // Speed in units per hour
  const speed = (distance / durationSeconds) * 3600;
  return `${speed.toFixed(1)} ${unit}/h`;
}

