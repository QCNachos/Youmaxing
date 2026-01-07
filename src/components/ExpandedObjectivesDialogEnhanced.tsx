'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  CheckCircle2, 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  TrendingUp,
  Briefcase,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';
import { useTasksAndObjectives } from '@/hooks/useTasksAndObjectives';

interface ExpandedObjectivesDialogEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

type FormMode = 'add' | 'edit';
type FormType = 'task' | 'weekly' | 'monthly';

export function ExpandedObjectivesDialogEnhanced({ 
  open, 
  onOpenChange, 
  selectedDate 
}: ExpandedObjectivesDialogEnhancedProps) {
  const {
    tasks,
    weeklyObjectives,
    monthlyObjectives,
    loading,
    addTask,
    editTask,
    removeTask,
    toggleTask,
    addWeeklyObjective,
    editWeeklyObjective,
    removeWeeklyObjective,
    addMonthlyObjective,
    editMonthlyObjective,
    removeMonthlyObjective,
  } = useTasksAndObjectives(selectedDate);

  const [formMode, setFormMode] = useState<FormMode>('add');
  const [formType, setFormType] = useState<FormType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    aspect_id: 'training' as AspectType,
    type: 'personal' as 'personal' | 'job',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_duration_minutes: 30,
  });

  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    aspect_id: 'training' as AspectType,
    type: 'personal' as 'personal' | 'job',
    priority: 'medium' as 'low' | 'medium' | 'high',
    progress_percentage: 0,
  });

  const validAspects = aspects.filter(a => a.id !== 'settings');

  const getAspectColor = (aspectId: string) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#888';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'low': return 'text-green-500 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  // Open forms
  const openAddTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      aspect_id: 'training',
      type: 'personal',
      priority: 'medium',
      estimated_duration_minutes: 30,
    });
    setFormMode('add');
    setFormType('task');
    setEditingId(null);
  };

  const openEditTaskForm = (task: typeof tasks[0]) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      aspect_id: task.aspect_id as AspectType,
      type: task.type as 'personal' | 'job',
      priority: task.priority as 'low' | 'medium' | 'high',
      estimated_duration_minutes: task.estimated_duration_minutes || 30,
    });
    setFormMode('edit');
    setFormType('task');
    setEditingId(task.id);
  };

  const openAddWeeklyForm = () => {
    setObjectiveForm({
      title: '',
      description: '',
      aspect_id: 'training',
      type: 'personal',
      priority: 'medium',
      progress_percentage: 0,
    });
    setFormMode('add');
    setFormType('weekly');
    setEditingId(null);
  };

  const openEditWeeklyForm = (obj: typeof weeklyObjectives[0]) => {
    setObjectiveForm({
      title: obj.title,
      description: obj.description || '',
      aspect_id: obj.aspect_id as AspectType,
      type: obj.type as 'personal' | 'job',
      priority: obj.priority as 'low' | 'medium' | 'high',
      progress_percentage: obj.progress_percentage,
    });
    setFormMode('edit');
    setFormType('weekly');
    setEditingId(obj.id);
  };

  const openAddMonthlyForm = () => {
    setObjectiveForm({
      title: '',
      description: '',
      aspect_id: 'training',
      type: 'personal',
      priority: 'medium',
      progress_percentage: 0,
    });
    setFormMode('add');
    setFormType('monthly');
    setEditingId(null);
  };

  const openEditMonthlyForm = (obj: typeof monthlyObjectives[0]) => {
    setObjectiveForm({
      title: obj.title,
      description: obj.description || '',
      aspect_id: obj.aspect_id as AspectType,
      type: obj.type as 'personal' | 'job',
      priority: obj.priority as 'low' | 'medium' | 'high',
      progress_percentage: obj.progress_percentage,
    });
    setFormMode('edit');
    setFormType('monthly');
    setEditingId(obj.id);
  };

  const closeForm = () => {
    setFormType(null);
    setEditingId(null);
  };

  // Submit handlers
  const handleTaskSubmit = async () => {
    try {
      if (formMode === 'edit' && editingId) {
        await editTask(editingId, taskForm);
      } else {
        await addTask(taskForm);
      }
      closeForm();
    } catch (err: any) {
      console.error('Error saving task:', err);
      alert(`Error: ${err?.message || 'Failed to save task'}`);
    }
  };

  const handleWeeklySubmit = async () => {
    try {
      if (formMode === 'edit' && editingId) {
        await editWeeklyObjective(editingId, objectiveForm);
      } else {
        await addWeeklyObjective(objectiveForm);
      }
      closeForm();
    } catch (err: any) {
      console.error('Error saving weekly objective:', err);
      alert(`Error: ${err?.message || 'Failed to save weekly objective'}`);
    }
  };

  const handleMonthlySubmit = async () => {
    try {
      if (formMode === 'edit' && editingId) {
        await editMonthlyObjective(editingId, objectiveForm);
      } else {
        await addMonthlyObjective(objectiveForm);
      }
      closeForm();
    } catch (err: any) {
      console.error('Error saving monthly objective:', err);
      alert(`Error: ${err?.message || 'Failed to save monthly objective'}`);
    }
  };

  // Delete handlers
  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      await removeTask(id);
    }
  };

  const handleDeleteWeekly = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this objective?')) {
      await removeWeeklyObjective(id);
    }
  };

  const handleDeleteMonthly = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this goal?')) {
      await removeMonthlyObjective(id);
    }
  };

  // Stats calculations
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const avgWeeklyProgress = weeklyObjectives.length > 0 
    ? Math.round(weeklyObjectives.reduce((sum, obj) => sum + obj.progress_percentage, 0) / weeklyObjectives.length)
    : 0;
  const avgMonthlyProgress = monthlyObjectives.length > 0
    ? Math.round(monthlyObjectives.reduce((sum, obj) => sum + obj.progress_percentage, 0) / monthlyObjectives.length)
    : 0;

  return (
    <>
      <Dialog open={open && !formType} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6" />
                  Tasks & Objectives
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{completedTasks}/{tasks.length} Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{avgWeeklyProgress}% Weekly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{avgMonthlyProgress}% Monthly</span>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="daily" className="flex-1">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Daily Tasks
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Weekly Objectives
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Monthly Goals
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Daily Tasks Tab */}
              <TabsContent value="daily" className="mt-0 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Daily Tasks</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedTasks} of {tasks.length} completed ({taskProgress}%)
                    </p>
                  </div>
                  <Button onClick={openAddTaskForm} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                
                <Progress value={taskProgress} className="h-2 mb-4" />

                <ScrollArea className="h-[400px] pr-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No tasks for this day</p>
                      <p className="text-sm mt-1">Click "Add Task" to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group border border-transparent hover:border-border"
                        >
                          <CheckCircle2
                            className={cn(
                              "h-5 w-5 flex-shrink-0 cursor-pointer transition-colors mt-0.5",
                              task.status === 'completed' 
                                ? 'text-green-500 fill-green-500' 
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                            onClick={() => toggleTask(task.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "font-medium",
                                task.status === 'completed' && 'line-through text-muted-foreground'
                              )}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditTaskForm(task)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                  onClick={(e) => handleDeleteTask(task.id, e)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {task.type === 'job' ? (
                                <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  Job
                                </Badge>
                              ) : (
                                <>
                                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
                                    <User className="h-3 w-3 mr-1" />
                                    Personal
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
                                </>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs border ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                              {task.estimated_duration_minutes && (
                                <span className="text-xs text-muted-foreground">
                                  {task.estimated_duration_minutes}min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              {/* Weekly Objectives Tab */}
              <TabsContent value="weekly" className="mt-0 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Weekly Objectives</h3>
                    <p className="text-sm text-muted-foreground">
                      {weeklyObjectives.length} objective{weeklyObjectives.length !== 1 ? 's' : ''} • {avgWeeklyProgress}% avg progress
                    </p>
                  </div>
                  <Button onClick={openAddWeeklyForm} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Objective
                  </Button>
                </div>

                <ScrollArea className="h-[450px] pr-4">
                  {weeklyObjectives.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No weekly objectives</p>
                      <p className="text-sm mt-1">Set goals for this week</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weeklyObjectives.map(obj => (
                        <div key={obj.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group border border-transparent hover:border-border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{obj.title}</h4>
                              {obj.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {obj.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditWeeklyForm(obj)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={(e) => handleDeleteWeekly(obj.id, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <Progress value={obj.progress_percentage} className="h-2 flex-1" />
                            <span className="text-sm font-semibold text-muted-foreground min-w-[45px] text-right">
                              {obj.progress_percentage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {obj.type === 'job' ? (
                              <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                                <Briefcase className="h-3 w-3 mr-1" />
                                Job
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
                                  <User className="h-3 w-3 mr-1" />
                                  Personal
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
                              </>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs border ${getPriorityColor(obj.priority)}`}
                            >
                              {obj.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              {/* Monthly Goals Tab */}
              <TabsContent value="monthly" className="mt-0 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Monthly Goals</h3>
                    <p className="text-sm text-muted-foreground">
                      {monthlyObjectives.length} goal{monthlyObjectives.length !== 1 ? 's' : ''} • {avgMonthlyProgress}% avg progress
                    </p>
                  </div>
                  <Button onClick={openAddMonthlyForm} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>

                <ScrollArea className="h-[450px] pr-4">
                  {monthlyObjectives.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No monthly goals</p>
                      <p className="text-sm mt-1">Set ambitious goals for this month</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monthlyObjectives.map(obj => (
                        <div key={obj.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group border border-transparent hover:border-border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{obj.title}</h4>
                              {obj.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {obj.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditMonthlyForm(obj)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={(e) => handleDeleteMonthly(obj.id, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <Progress value={obj.progress_percentage} className="h-2 flex-1" />
                            <span className="text-sm font-semibold text-muted-foreground min-w-[45px] text-right">
                              {obj.progress_percentage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {obj.type === 'job' ? (
                              <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                                <Briefcase className="h-3 w-3 mr-1" />
                                Job
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
                                  <User className="h-3 w-3 mr-1" />
                                  Personal
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
                              </>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs border ${getPriorityColor(obj.priority)}`}
                            >
                              {obj.priority}
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

      {/* Form Dialog for Adding/Editing */}
      <Dialog open={!!formType} onOpenChange={() => closeForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'edit' ? 'Edit' : 'Add'} {formType === 'task' ? 'Task' : formType === 'weekly' ? 'Weekly Objective' : 'Monthly Goal'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'edit' ? 'Update the details' : 'Create a new'} {formType === 'task' ? 'task' : formType === 'weekly' ? 'objective for this week' : 'goal for this month'}
            </DialogDescription>
          </DialogHeader>

          {formType === 'task' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Add details..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={taskForm.type} 
                  onValueChange={(value: 'personal' | 'job') => setTaskForm({ ...taskForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="job">Job/Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {taskForm.type === 'personal' && (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={taskForm.aspect_id} 
                    onValueChange={(value: AspectType) => setTaskForm({ ...taskForm, aspect_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {validAspects.map(aspect => (
                        <SelectItem key={aspect.id} value={aspect.id}>
                          {aspect.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={taskForm.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => setTaskForm({ ...taskForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={taskForm.estimated_duration_minutes}
                    onChange={(e) => setTaskForm({ ...taskForm, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder={formType === 'weekly' ? 'Weekly objective title' : 'Monthly goal title'}
                  value={objectiveForm.title}
                  onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Add details..."
                  value={objectiveForm.description}
                  onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={objectiveForm.type} 
                  onValueChange={(value: 'personal' | 'job') => setObjectiveForm({ ...objectiveForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="job">Job/Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {objectiveForm.type === 'personal' && (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={objectiveForm.aspect_id} 
                    onValueChange={(value: AspectType) => setObjectiveForm({ ...objectiveForm, aspect_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {validAspects.map(aspect => (
                        <SelectItem key={aspect.id} value={aspect.id}>
                          {aspect.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={objectiveForm.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => setObjectiveForm({ ...objectiveForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progress (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={objectiveForm.progress_percentage}
                    onChange={(e) => setObjectiveForm({ ...objectiveForm, progress_percentage: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button 
              onClick={formType === 'task' ? handleTaskSubmit : formType === 'weekly' ? handleWeeklySubmit : handleMonthlySubmit}
              disabled={formType === 'task' ? !taskForm.title.trim() : !objectiveForm.title.trim()}
              className="bg-gradient-to-r from-violet-600 to-pink-600"
            >
              {formMode === 'edit' ? 'Save Changes' : formType === 'task' ? 'Add Task' : formType === 'weekly' ? 'Add Objective' : 'Add Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

