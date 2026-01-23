'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Moon,
  Plus,
  Star,
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useSleepLogs } from '@/hooks/useTraining';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SleepTrackerProps {
  compact?: boolean;
}

export function SleepTracker({ compact = false }: SleepTrackerProps) {
  const { theme } = useAppStore();
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({
    sleep_date: new Date(),
    hours_slept: 7.5,
    quality_rating: 3,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const { logs, summary, loading, createLog, deleteLog, refetch } = useSleepLogs({
    startDate: subDays(new Date(), 30),
    limit: 30,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await createLog({
        sleep_date: format(newLog.sleep_date, 'yyyy-MM-dd'),
        hours_slept: newLog.hours_slept,
        quality_rating: newLog.quality_rating,
        notes: newLog.notes || undefined,
      });
      setIsAddingLog(false);
      setNewLog({
        sleep_date: new Date(),
        hours_slept: 7.5,
        quality_rating: 3,
        notes: '',
      });
    } catch (error) {
      console.error('Error saving sleep log:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLog(id);
    } catch (error) {
      console.error('Error deleting sleep log:', error);
    }
  };

  const renderStars = (rating: number | null, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5",
                (rating !== null && star <= rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-300"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  const getHoursColor = (hours: number) => {
    if (hours >= 7 && hours <= 9) return 'text-green-500';
    if (hours >= 6 && hours < 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Sleep
            </CardTitle>
            <Button size="sm" onClick={() => setIsAddingLog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Log
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Avg Sleep</Label>
                <p className={cn("text-2xl font-bold mt-1", getHoursColor(summary.avg_hours))}>
                  {summary.avg_hours}h
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Avg Quality</Label>
                <div className="mt-1">
                  {renderStars(summary.avg_quality)}
                </div>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">Recent</Label>
              <div className="space-y-2">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className={cn(
                      theme === 'light' ? "text-slate-600" : "text-white/70"
                    )}>
                      {format(new Date(log.sleep_date), 'MMM d')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={cn("font-medium", getHoursColor(log.hours_slept))}>
                        {log.hours_slept}h
                      </span>
                      {renderStars(log.quality_rating)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <AddSleepDialog
          open={isAddingLog}
          onOpenChange={setIsAddingLog}
          newLog={newLog}
          setNewLog={setNewLog}
          onSave={handleSave}
          saving={saving}
          renderStars={renderStars}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Sleep
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-3xl font-bold", summary ? getHoursColor(summary.avg_hours) : "text-slate-400")}>
              {summary ? `${summary.avg_hours}h` : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Average Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {renderStars(summary?.avg_quality || null)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.avg_quality ? `${summary.avg_quality.toFixed(1)} out of 5` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Days Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-3xl font-bold", theme === 'light' ? "text-slate-900" : "text-white")}>
              {summary?.days_logged || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Log History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                Sleep History
              </CardTitle>
              <CardDescription>Track your sleep patterns</CardDescription>
            </div>
            <Button onClick={() => setIsAddingLog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Sleep
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Moon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sleep logs yet</p>
              <p className="text-sm mt-1">Start tracking your sleep for better insights</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            theme === 'light' ? "bg-indigo-100" : "bg-indigo-500/20"
                          )}>
                            <Moon className="h-6 w-6 text-indigo-500" />
                          </div>
                          <div>
                            <p className={cn(
                              "font-medium",
                              theme === 'light' ? "text-slate-900" : "text-white"
                            )}>
                              {format(new Date(log.sleep_date), 'EEEE, MMM d')}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={cn("text-sm font-medium", getHoursColor(log.hours_slept))}>
                                {log.hours_slept} hours
                              </span>
                              {renderStars(log.quality_rating)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {log.notes && (
                        <p className={cn(
                          "text-sm mt-3 pl-16",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          {log.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AddSleepDialog
        open={isAddingLog}
        onOpenChange={setIsAddingLog}
        newLog={newLog}
        setNewLog={setNewLog}
        onSave={handleSave}
        saving={saving}
        renderStars={renderStars}
      />
    </div>
  );
}

// Separate dialog component
function AddSleepDialog({
  open,
  onOpenChange,
  newLog,
  setNewLog,
  onSave,
  saving,
  renderStars,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLog: { sleep_date: Date; hours_slept: number; quality_rating: number; notes: string };
  setNewLog: (log: typeof newLog) => void;
  onSave: () => void;
  saving: boolean;
  renderStars: (rating: number | null, interactive?: boolean, onChange?: (rating: number) => void) => React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            Log Sleep
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(newLog.sleep_date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newLog.sleep_date}
                  onSelect={(date) => date && setNewLog({ ...newLog, sleep_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Hours Slept</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={newLog.hours_slept}
                onChange={(e) => setNewLog({ ...newLog, hours_slept: parseFloat(e.target.value) || 0 })}
                className="w-24"
              />
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={newLog.hours_slept}
                onChange={(e) => setNewLog({ ...newLog, hours_slept: parseFloat(e.target.value) })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sleep Quality</Label>
            <div className="py-2">
              {renderStars(newLog.quality_rating, true, (rating) => setNewLog({ ...newLog, quality_rating: rating }))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="How did you sleep?"
              value={newLog.notes}
              onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Log Sleep
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

