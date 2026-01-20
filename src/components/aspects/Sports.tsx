'use client';

import { useState } from 'react';
import { AspectLayout, EmptyState } from './AspectLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Trophy,
  MapPin,
  Users,
  Calendar,
  Plus,
  Timer,
  Trash2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { WeightHeightTracker } from '@/components/WeightHeightTracker';
import { useSports } from '@/hooks/useSports';
import { useEvents } from '@/hooks/useEvents';

const popularSports = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Hockey', emoji: '🏒' },
  { name: 'Baseball', emoji: '⚾' },
];

export function Sports() {
  const { theme } = useAppStore();
  const { 
    activities, 
    loading, 
    logActivity, 
    deleteActivity,
    getMonthlyStats 
  } = useSports();
  const { getEventsByAspect } = useEvents();
  
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newActivity, setNewActivity] = useState({
    sport: '',
    duration_minutes: 60,
    location: '',
    with_team: false,
    notes: '',
  });

  // Get real stats from hook
  const monthlyStats = getMonthlyStats();
  const sportsEvents = getEventsByAspect('sports');
  
  const stats = [
    { label: 'This Month', value: `${monthlyStats.totalActivities} activities` },
    { label: 'Favorite Sport', value: monthlyStats.favoriteSport || 'N/A' },
    { label: 'Total Hours', value: `${Math.round(monthlyStats.totalMinutes / 60)}h`, trend: 'up' as const },
    { label: 'Unique Sports', value: Object.keys(monthlyStats.sportCounts).length.toString() },
  ];

  const handleAddActivity = async () => {
    if (!newActivity.sport.trim()) return;
    
    setIsSubmitting(true);
    await logActivity({
      sport: newActivity.sport,
      duration_minutes: newActivity.duration_minutes,
      location: newActivity.location || undefined,
      with_team: newActivity.with_team,
      notes: newActivity.notes || undefined,
    });
    setIsSubmitting(false);
    setIsAddingActivity(false);
    setNewActivity({ sport: '', duration_minutes: 60, location: '', with_team: false, notes: '' });
  };

  const handleDelete = async (id: string) => {
    await deleteActivity(id);
  };

  // Build sport breakdown from real data
  const sportBreakdown = Object.entries(monthlyStats.sportCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([sport, count]) => ({
      sport,
      emoji: popularSports.find(s => s.name === sport)?.emoji || '🏆',
      count,
    }));

  return (
    <AspectLayout
      aspectId="sports"
      stats={stats}
      aiInsight={activities.length > 0 
        ? `You've played ${monthlyStats.totalActivities} times this month! ${monthlyStats.favoriteSport ? `${monthlyStats.favoriteSport} is your top sport.` : 'Keep it up!'}`
        : 'Start logging your sports activities to track your active lifestyle!'
      }
      onAddNew={() => setIsAddingActivity(true)}
      addNewLabel="Log Activity"
    >
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="body">Body Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No sports activities yet"
              description="Log your sports and games to track your active lifestyle."
              actionLabel="Log Activity"
              onAction={() => setIsAddingActivity(true)}
            />
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl">
                        {popularSports.find((s) => s.name === activity.sport)?.emoji || '🏆'}
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium",
                          theme === 'light' ? "text-slate-900" : "text-white"
                        )}>
                          {activity.sport}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {activity.duration_minutes && (
                            <span className={cn(
                              "text-sm flex items-center gap-1",
                              theme === 'light' ? "text-slate-500" : "text-white/60"
                            )}>
                              <Timer className="h-3 w-3" />
                              {activity.duration_minutes} min
                            </span>
                          )}
                          {activity.location && (
                            <span className={cn(
                              "text-sm flex items-center gap-1",
                              theme === 'light' ? "text-slate-500" : "text-white/60"
                            )}>
                              <MapPin className="h-3 w-3" />
                              {activity.location}
                            </span>
                          )}
                          {activity.with_team && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              Team
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          {format(new Date(activity.activity_date), 'MMM d')}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          {sportsEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming sports events"
              description="Schedule games and sports events to stay organized."
              actionLabel="Schedule Event"
              onAction={() => {}}
            />
          ) : (
            <div className="space-y-4">
              {sportsEvents.map((event) => (
                <Card key={event.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium",
                          theme === 'light' ? "text-slate-900" : "text-white"
                        )}>
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn(
                            "text-sm",
                            theme === 'light' ? "text-slate-500" : "text-white/60"
                          )}>
                            {format(new Date(event.start_date), 'EEE, MMM d h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Sports Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sportBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Log some activities to see your breakdown
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sportBreakdown.map((sport) => (
                      <div key={sport.sport} className="flex items-center gap-3">
                        <span className="text-xl">{sport.emoji}</span>
                        <span className={cn(
                          "flex-1",
                          theme === 'light' ? "text-slate-900" : "text-white"
                        )}>
                          {sport.sport}
                        </span>
                        <Badge variant="secondary">{sport.count} sessions</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { emoji: '🏆', label: `${monthlyStats.totalActivities} Games`, unlocked: monthlyStats.totalActivities >= 1 },
                    { emoji: '⚡', label: 'Team Player', unlocked: activities.some(a => a.with_team) },
                    { emoji: '🎯', label: 'Consistent', unlocked: monthlyStats.totalActivities >= 4 },
                  ].map((achievement) => (
                    <div 
                      key={achievement.label} 
                      className={cn("text-center", !achievement.unlocked && "opacity-40")}
                    >
                      <div className="text-3xl mb-1">{achievement.emoji}</div>
                      <span className={cn(
                        "text-xs",
                        theme === 'light' ? "text-slate-500" : "text-white/60"
                      )}>
                        {achievement.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="body" className="mt-6">
          <WeightHeightTracker />
        </TabsContent>
      </Tabs>

      {/* Add Activity Dialog */}
      <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Sports Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sport</Label>
              <div className="flex flex-wrap gap-2">
                {popularSports.map((sport) => (
                  <Button
                    key={sport.name}
                    type="button"
                    variant={newActivity.sport === sport.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewActivity({ ...newActivity, sport: sport.name })}
                  >
                    {sport.emoji} {sport.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={newActivity.duration_minutes}
                  onChange={(e) => setNewActivity({ ...newActivity, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Where?"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="team"
                checked={newActivity.with_team}
                onChange={(e) => setNewActivity({ ...newActivity, with_team: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="team">Team/Group Activity</Label>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={handleAddActivity}
              disabled={!newActivity.sport.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Log Activity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}
