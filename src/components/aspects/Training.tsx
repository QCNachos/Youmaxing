'use client';

import { useState } from 'react';
import { AspectLayout, EmptyState, ItemCard } from './AspectLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import type { TrainingLog } from '@/types/database';
import { format } from 'date-fns';

// Mock data
const mockWorkouts: TrainingLog[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Morning Run',
    type: 'cardio',
    duration_minutes: 30,
    intensity: 'medium',
    notes: 'Felt great!',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    title: 'Upper Body Strength',
    type: 'strength',
    duration_minutes: 45,
    intensity: 'high',
    notes: null,
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    title: 'Yoga Session',
    type: 'flexibility',
    duration_minutes: 60,
    intensity: 'low',
    notes: 'Morning stretches',
    completed_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const workoutTemplates = [
  { name: 'Quick HIIT', duration: 20, type: 'cardio', intensity: 'high' },
  { name: 'Full Body Strength', duration: 45, type: 'strength', intensity: 'medium' },
  { name: 'Morning Yoga', duration: 30, type: 'flexibility', intensity: 'low' },
  { name: '5K Run', duration: 30, type: 'cardio', intensity: 'medium' },
];

const intensityColors = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

const typeIcons = {
  strength: Dumbbell,
  cardio: Heart,
  flexibility: Zap,
  sports: Target,
  other: Flame,
};

export function Training() {
  const [workouts, setWorkouts] = useState<TrainingLog[]>(mockWorkouts);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    type: 'strength' as TrainingLog['type'],
    duration_minutes: 30,
    intensity: 'medium' as TrainingLog['intensity'],
    notes: '',
  });

  const stats = [
    { label: 'This Week', value: '3 workouts', trend: 'up' as const },
    { label: 'Total Time', value: '2h 15m', trend: 'up' as const },
    { label: 'Streak', value: '7 days', trend: 'up' as const },
    { label: 'Calories', value: '1,240', trend: 'up' as const },
  ];

  const addWorkout = () => {
    const workout: TrainingLog = {
      id: Date.now().toString(),
      user_id: '1',
      ...newWorkout,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setWorkouts([workout, ...workouts]);
    setIsAddingWorkout(false);
    setNewWorkout({
      title: '',
      type: 'strength',
      duration_minutes: 30,
      intensity: 'medium',
      notes: '',
    });
  };

  const useTemplate = (template: typeof workoutTemplates[0]) => {
    setNewWorkout({
      title: template.name,
      type: template.type as TrainingLog['type'],
      duration_minutes: template.duration,
      intensity: template.intensity as TrainingLog['intensity'],
      notes: '',
    });
  };

  return (
    <AspectLayout
      aspectId="training"
      stats={stats}
      aiInsight="You've been consistent with cardio this week! Consider adding a strength session tomorrow for balance."
      onAddNew={() => setIsAddingWorkout(true)}
      addNewLabel="Log Workout"
    >
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Workout Log</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Workout Log Tab */}
        <TabsContent value="log" className="mt-6">
          {workouts.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              description="Start tracking your fitness journey by logging your first workout."
              actionLabel="Log Workout"
              onAction={() => setIsAddingWorkout(true)}
            />
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => {
                const TypeIcon = typeIcons[workout.type] || Dumbbell;
                return (
                  <Card key={workout.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${intensityColors[workout.intensity]}20` }}
                        >
                          <TypeIcon
                            className="h-6 w-6"
                            style={{ color: intensityColors[workout.intensity] }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{workout.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {workout.duration_minutes} min
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
                            <Badge variant="secondary">{workout.type}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(workout.completed_at), 'MMM d')}
                          </span>
                        </div>
                      </div>
                      {workout.notes && (
                        <p className="text-sm text-muted-foreground mt-3 pl-16">
                          {workout.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutTemplates.map((template, index) => {
              const TypeIcon = typeIcons[template.type as keyof typeof typeIcons] || Dumbbell;
              return (
                <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${intensityColors[template.intensity as keyof typeof intensityColors]}20` }}
                      >
                        <TypeIcon
                          className="h-6 w-6"
                          style={{ color: intensityColors[template.intensity as keyof typeof intensityColors] }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.duration} min · {template.intensity} intensity
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          useTemplate(template);
                          setIsAddingWorkout(true);
                        }}
                      >
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-500" />
                  Weekly Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end h-32">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const height = [60, 80, 40, 0, 100, 0, 0][i];
                    return (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 rounded-t-md bg-gradient-to-t from-violet-600 to-pink-600 transition-all"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '0' }}
                        />
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Personal Bests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Longest Run</span>
                  <Badge variant="secondary">10 km</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Longest Streak</span>
                  <Badge variant="secondary">14 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Most Active Week</span>
                  <Badge variant="secondary">6 workouts</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Workout Dialog */}
      <Dialog open={isAddingWorkout} onOpenChange={setIsAddingWorkout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Workout Name</Label>
              <Input
                placeholder="e.g., Morning Run"
                value={newWorkout.title}
                onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value as TrainingLog['type'] })}
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={newWorkout.duration_minutes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Intensity</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((intensity) => (
                  <Button
                    key={intensity}
                    type="button"
                    variant={newWorkout.intensity === intensity ? 'default' : 'outline'}
                    className="flex-1"
                    style={
                      newWorkout.intensity === intensity
                        ? { backgroundColor: intensityColors[intensity] }
                        : undefined
                    }
                    onClick={() => setNewWorkout({ ...newWorkout, intensity })}
                  >
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="How did it go?"
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
              onClick={addWorkout}
              disabled={!newWorkout.title.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

