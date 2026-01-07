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
} from 'lucide-react';
import type { SportsActivity } from '@/types/database';
import { format } from 'date-fns';

const mockActivities: SportsActivity[] = [
  {
    id: '1',
    user_id: '1',
    sport: 'Basketball',
    duration_minutes: 90,
    location: 'City Sports Center',
    with_team: true,
    notes: 'Weekly game night',
    activity_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    sport: 'Tennis',
    duration_minutes: 60,
    location: 'Tennis Club',
    with_team: false,
    notes: null,
    activity_date: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const popularSports = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Volleyball', emoji: '🏐' },
];

const upcomingEvents = [
  { name: 'Weekly Basketball', date: 'Tomorrow 7PM', location: 'City Sports Center' },
  { name: 'Tennis Match', date: 'Saturday 10AM', location: 'Tennis Club' },
  { name: 'Beach Volleyball', date: 'Sunday 3PM', location: 'Ocean Beach' },
];

export function Sports() {
  const { theme } = useAppStore();
  const [activities, setActivities] = useState<SportsActivity[]>(mockActivities);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    sport: '',
    duration_minutes: 60,
    location: '',
    with_team: false,
    notes: '',
  });

  const stats = [
    { label: 'This Month', value: '8 activities' },
    { label: 'Favorite Sport', value: 'Basketball' },
    { label: 'Total Hours', value: '12h', trend: 'up' as const },
    { label: 'Team Games', value: '5' },
  ];

  const addActivity = () => {
    const activity: SportsActivity = {
      id: Date.now().toString(),
      user_id: '1',
      ...newActivity,
      activity_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setActivities([activity, ...activities]);
    setIsAddingActivity(false);
    setNewActivity({ sport: '', duration_minutes: 60, location: '', with_team: false, notes: '' });
  };

  return (
    <AspectLayout
      aspectId="sports"
      stats={stats}
      aiInsight="You've been playing more team sports lately! This is great for social health. There's a pickup basketball game near you tomorrow."
      onAddNew={() => setIsAddingActivity(true)}
      addNewLabel="Log Activity"
    >
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          {activities.length === 0 ? (
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
                <Card key={activity.id} className="hover:border-primary/50 transition-colors">
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
                          <span className={cn(
                            "text-sm flex items-center gap-1",
                            theme === 'light' ? "text-slate-500" : "text-white/60"
                          )}>
                            <Timer className="h-3 w-3" />
                            {activity.duration_minutes} min
                          </span>
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
                      <span className={cn(
                        "text-sm",
                        theme === 'light' ? "text-slate-500" : "text-white/60"
                      )}>
                        {format(new Date(activity.activity_date), 'MMM d')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
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
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn(
                          "text-sm",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          {event.date}
                        </span>
                        <span className={cn(
                          "text-sm flex items-center gap-1",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <div className="space-y-3">
                  {popularSports.slice(0, 4).map((sport, i) => (
                    <div key={sport.name} className="flex items-center gap-3">
                      <span className="text-xl">{sport.emoji}</span>
                      <span className={cn(
                        "flex-1",
                        theme === 'light' ? "text-slate-900" : "text-white"
                      )}>
                        {sport.name}
                      </span>
                      <Badge variant="secondary">{[5, 3, 2, 1][i]} sessions</Badge>
                    </div>
                  ))}
                </div>
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
                    { emoji: '🏆', label: '10 Games' },
                    { emoji: '⚡', label: 'Team Player' },
                    { emoji: '🎯', label: 'Consistent' },
                  ].map((achievement) => (
                    <div key={achievement.label} className="text-center">
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
              onClick={addActivity}
              disabled={!newActivity.sport.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}



