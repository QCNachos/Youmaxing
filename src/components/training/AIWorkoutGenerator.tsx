'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Dumbbell,
  Heart,
  Zap,
  Flame,
  Target,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { TrainingType, TrainingIntensity, BodyPart, WorkoutTemplate } from '@/types/database';

const TRAINING_TYPES: { value: TrainingType; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'cardio', label: 'Cardio', icon: Heart },
  { value: 'strength', label: 'Strength', icon: Dumbbell },
  { value: 'flexibility', label: 'Flexibility', icon: Zap },
  { value: 'hiit', label: 'HIIT', icon: Flame },
  { value: 'sports', label: 'Sports', icon: Target },
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

const INTENSITIES: { value: TrainingIntensity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface AIWorkoutGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkoutGenerated: (template: WorkoutTemplate) => void;
}

export function AIWorkoutGenerator({
  open,
  onOpenChange,
  onWorkoutGenerated,
}: AIWorkoutGeneratorProps) {
  const { theme } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    goal: '',
    duration_minutes: 30,
    training_type: 'strength' as TrainingType,
    body_parts: [] as BodyPart[],
    intensity: 'medium' as TrainingIntensity,
    fitness_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    equipment: '',
  });

  const toggleBodyPart = (part: BodyPart) => {
    if (part === 'full_body') {
      setFormData(prev => ({
        ...prev,
        body_parts: prev.body_parts.includes('full_body') ? [] : ['full_body'],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        body_parts: prev.body_parts.includes(part)
          ? prev.body_parts.filter(p => p !== part && p !== 'full_body')
          : [...prev.body_parts.filter(p => p !== 'full_body'), part],
      }));
    }
  };

  const handleGenerate = async () => {
    if (!formData.goal.trim()) {
      setError('Please enter your fitness goal');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedWorkout(null);

    try {
      const response = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: formData.goal,
          duration_minutes: formData.duration_minutes,
          training_type: formData.training_type,
          body_parts: formData.body_parts.length > 0 ? formData.body_parts : ['full_body'],
          intensity: formData.intensity,
          fitness_level: formData.fitness_level,
          equipment: formData.equipment ? formData.equipment.split(',').map(e => e.trim()) : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout');
      }

      setGeneratedWorkout(data.template);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workout');
    } finally {
      setGenerating(false);
    }
  };

  const handleUseWorkout = () => {
    if (generatedWorkout) {
      onWorkoutGenerated(generatedWorkout);
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      goal: '',
      duration_minutes: 30,
      training_type: 'strength',
      body_parts: [],
      intensity: 'medium',
      fitness_level: 'intermediate',
      equipment: '',
    });
    setGeneratedWorkout(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            AI Workout Generator
          </DialogTitle>
        </DialogHeader>

        {!generatedWorkout ? (
          <div className="space-y-6 py-4">
            {/* Goal */}
            <div className="space-y-2">
              <Label>What's your goal?</Label>
              <Input
                placeholder="e.g., Build muscle, Lose weight, Improve endurance"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              />
            </div>

            {/* Training Type */}
            <div className="space-y-2">
              <Label>Workout Type</Label>
              <div className="flex flex-wrap gap-2">
                {TRAINING_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      variant={formData.training_type === type.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, training_type: type.value })}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Duration and Fitness Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                  min={10}
                  max={120}
                />
              </div>
              <div className="space-y-2">
                <Label>Fitness Level</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.fitness_level}
                  onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value as any })}
                >
                  {FITNESS_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Body Parts */}
            <div className="space-y-2">
              <Label>Target Areas</Label>
              <div className="flex flex-wrap gap-2">
                {BODY_PARTS.map((part) => (
                  <Button
                    key={part.value}
                    type="button"
                    variant={formData.body_parts.includes(part.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleBodyPart(part.value)}
                  >
                    {part.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-2">
              <Label>Intensity</Label>
              <div className="flex gap-2">
                {INTENSITIES.map((intensity) => (
                  <Button
                    key={intensity.value}
                    type="button"
                    variant={formData.intensity === intensity.value ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, intensity: intensity.value })}
                  >
                    {intensity.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <Label>Available Equipment (optional)</Label>
              <Input
                placeholder="e.g., Dumbbells, Barbell, Resistance bands"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for bodyweight-only exercises
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={handleGenerate}
              disabled={generating || !formData.goal.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Workout
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Generated Workout Preview */}
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Workout Generated!</span>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className={cn(
                  "font-semibold text-lg",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  {generatedWorkout.title}
                </h3>
                {generatedWorkout.description && (
                  <p className={cn(
                    "text-sm mt-1",
                    theme === 'light' ? "text-slate-600" : "text-white/70"
                  )}>
                    {generatedWorkout.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{generatedWorkout.duration_minutes} min</Badge>
                  <Badge variant="secondary">{generatedWorkout.intensity}</Badge>
                  <Badge variant="secondary">{generatedWorkout.training_type}</Badge>
                </div>

                {generatedWorkout.exercises && generatedWorkout.exercises.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs text-muted-foreground">Exercises</Label>
                    <div className="space-y-2">
                      {generatedWorkout.exercises.map((exercise: any, index: number) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg",
                            theme === 'light' ? "bg-slate-50" : "bg-white/5"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "font-medium",
                              theme === 'light' ? "text-slate-900" : "text-white"
                            )}>
                              {exercise.name}
                            </span>
                            <div className="flex gap-2">
                              {exercise.sets && exercise.reps && (
                                <Badge variant="outline">
                                  {exercise.sets} x {exercise.reps}
                                </Badge>
                              )}
                              {exercise.duration_seconds && (
                                <Badge variant="outline">
                                  {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {exercise.notes && (
                            <p className={cn(
                              "text-xs mt-1",
                              theme === 'light' ? "text-slate-500" : "text-white/60"
                            )}>
                              {exercise.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setGeneratedWorkout(null)}
              >
                Generate Another
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
                onClick={handleUseWorkout}
              >
                Use This Workout
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

