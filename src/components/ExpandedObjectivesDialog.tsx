'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  CheckCircle2, 
  Plus,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';
import { useTasksAndObjectives } from '@/hooks/useTasksAndObjectives';

interface ExpandedObjectivesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export function ExpandedObjectivesDialog({ 
  open, 
  onOpenChange, 
  selectedDate 
}: ExpandedObjectivesDialogProps) {
  const {
    tasks,
    weeklyObjectives,
    monthlyObjectives,
    loading,
    toggleTask,
    removeTask,
    removeWeeklyObjective,
    removeMonthlyObjective,
  } = useTasksAndObjectives(selectedDate);

  const getAspectColor = (aspectId: string) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#888';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      await removeTask(id);
    }
  };

  const handleDeleteWeekly = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this objective?')) {
      await removeWeeklyObjective(id);
    }
  };

  const handleDeleteMonthly = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this objective?')) {
      await removeMonthlyObjective(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            All Objectives & Tasks
          </DialogTitle>
          <DialogDescription>
            View and manage your daily tasks, weekly objectives, and monthly goals.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Objectives</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Goals</TabsTrigger>
            </TabsList>
            
            {/* Daily Tasks Tab */}
            <TabsContent value="daily" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tasks for this day</p>
                    <p className="text-sm mt-1">Add tasks in the calendar sidebar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5 flex-shrink-0 cursor-pointer transition-colors",
                            task.status === 'completed' 
                              ? 'text-green-500 fill-green-500' 
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => toggleTask(task.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "block font-medium",
                            task.status === 'completed' && 'line-through text-muted-foreground'
                          )}>
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge
                              variant="outline"
                              className={`text-xs border ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getAspectColor(task.aspect_id)}20`,
                                color: getAspectColor(task.aspect_id)
                              }}
                            >
                              {aspects.find(a => a.id === task.aspect_id)?.name}
                            </Badge>
                            {task.estimated_duration_minutes && (
                              <span className="text-xs text-muted-foreground">
                                {task.estimated_duration_minutes}min
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => handleDeleteTask(task.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            {/* Weekly Objectives Tab */}
            <TabsContent value="weekly" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {weeklyObjectives.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No weekly objectives</p>
                    <p className="text-sm mt-1">Add objectives in the calendar sidebar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weeklyObjectives.map(obj => (
                      <div key={obj.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{obj.title}</h4>
                            {obj.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {obj.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => handleDeleteWeekly(obj.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={obj.progress_percentage} className="h-2 flex-1" />
                          <span className="text-sm font-medium text-muted-foreground min-w-[45px] text-right">
                            {obj.progress_percentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getPriorityColor(obj.priority)}`}
                          >
                            {obj.priority}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${getAspectColor(obj.aspect_id)}20`,
                              color: getAspectColor(obj.aspect_id)
                            }}
                          >
                            {aspects.find(a => a.id === obj.aspect_id)?.name}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            {/* Monthly Goals Tab */}
            <TabsContent value="monthly" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {monthlyObjectives.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No monthly goals</p>
                    <p className="text-sm mt-1">Add goals in the calendar sidebar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {monthlyObjectives.map(obj => (
                      <div key={obj.id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{obj.title}</h4>
                            {obj.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {obj.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => handleDeleteMonthly(obj.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={obj.progress_percentage} className="h-2 flex-1" />
                          <span className="text-sm font-medium text-muted-foreground min-w-[45px] text-right">
                            {obj.progress_percentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getPriorityColor(obj.priority)}`}
                          >
                            {obj.priority}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${getAspectColor(obj.aspect_id)}20`,
                              color: getAspectColor(obj.aspect_id)
                            }}
                          >
                            {aspects.find(a => a.id === obj.aspect_id)?.name}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

