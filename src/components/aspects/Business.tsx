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
  Briefcase,
  Lightbulb,
  CheckCircle,
  Clock,
  Pause,
  Plus,
  ArrowRight,
  Target,
  Zap,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useBusiness, type ProjectStatus, type ProjectPriority } from '@/hooks/useBusiness';
import { format } from 'date-fns';

const statusConfig = {
  idea: { label: 'Idea', icon: Lightbulb, color: '#F59E0B' },
  planning: { label: 'Planning', icon: Target, color: '#3B82F6' },
  active: { label: 'Active', icon: Zap, color: '#22C55E' },
  paused: { label: 'Paused', icon: Pause, color: '#6B7280' },
  completed: { label: 'Completed', icon: CheckCircle, color: '#8B5CF6' },
};

const priorityColors = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

export function Business() {
  const { theme } = useAppStore();
  const { 
    projects, 
    loading, 
    createProject, 
    updateStatus, 
    deleteProject,
    getStats 
  } = useBusiness();
  
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    status: 'idea' as ProjectStatus,
    description: '',
    priority: 'medium' as ProjectPriority,
  });

  const projectStats = getStats();
  const stats = [
    { label: 'Active Projects', value: projectStats.statusCounts.active.toString() },
    { label: 'Ideas', value: projectStats.statusCounts.idea.toString() },
    { label: 'Completed', value: projectStats.statusCounts.completed.toString() },
    { label: 'Total', value: projectStats.total.toString() },
  ];

  const handleAddProject = async () => {
    if (!newProject.name.trim()) return;
    
    setIsSubmitting(true);
    await createProject({
      name: newProject.name,
      description: newProject.description || undefined,
      status: newProject.status,
      priority: newProject.priority,
    });
    setIsSubmitting(false);
    setIsAddingProject(false);
    setNewProject({ name: '', status: 'idea', description: '', priority: 'medium' });
  };

  const handleStartProject = async (projectId: string) => {
    await updateStatus(projectId, 'active');
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `Due in ${days} days` : days === 0 ? 'Due today' : `${Math.abs(days)} days overdue`;
  };

  return (
    <AspectLayout
      aspectId="business"
      stats={stats}
      aiInsight={projects.length > 0 
        ? `You have ${projectStats.statusCounts.active} active project${projectStats.statusCounts.active !== 1 ? 's' : ''}. ${projectStats.upcomingDeadlines.length > 0 ? `Next deadline: ${projectStats.upcomingDeadlines[0]?.name}` : 'Keep pushing forward!'}`
        : 'Create your first project to start tracking your business endeavors!'
      }
      onAddNew={() => setIsAddingProject(true)}
      addNewLabel="New Project"
    >
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="ideas">Ideas Board</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.filter((p) => p.status !== 'idea').length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No active projects"
              description="Turn your ideas into active projects to start tracking progress."
              actionLabel="New Project"
              onAction={() => setIsAddingProject(true)}
            />
          ) : (
            <div className="space-y-4">
              {projects
                .filter((p) => p.status !== 'idea')
                .map((project) => {
                  const config = statusConfig[project.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <Card key={project.id} className="hover:border-primary/50 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            <StatusIcon className="h-6 w-6" style={{ color: config.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-medium",
                                theme === 'light' ? "text-slate-900" : "text-white"
                              )}>
                                {project.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                style={{ backgroundColor: `${priorityColors[project.priority as keyof typeof priorityColors]}20`, color: priorityColors[project.priority as keyof typeof priorityColors] }}
                              >
                                {project.priority}
                              </Badge>
                            </div>
                            {project.description && (
                              <p className={cn(
                                "text-sm",
                                theme === 'light' ? "text-slate-500" : "text-white/60"
                              )}>
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge
                                variant="secondary"
                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                              {project.deadline && (
                                <span className={cn(
                                  "text-sm flex items-center gap-1",
                                  theme === 'light' ? "text-slate-500" : "text-white/60"
                                )}>
                                  <Clock className="h-3 w-3" />
                                  {getDaysUntilDeadline(project.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ideas" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects
                .filter((p) => p.status === 'idea')
                .map((project) => (
                  <Card key={project.id} className="hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          <h4 className={cn(
                            "font-medium",
                            theme === 'light' ? "text-slate-900" : "text-white"
                          )}>
                            {project.name}
                          </h4>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      {project.description && (
                        <p className={cn(
                          "text-sm mb-3",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          {project.description}
                        </p>
                      )}
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleStartProject(project.id)}
                      >
                        Start Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsAddingProject(true)}>
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[120px]">
                  <Plus className={cn(
                    "h-8 w-8 mb-2",
                    theme === 'light' ? "text-slate-400" : "text-white/40"
                  )} />
                  <p className={cn(
                    "text-sm",
                    theme === 'light' ? "text-slate-500" : "text-white/60"
                  )}>
                    Add New Idea
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="productivity" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Project Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = projectStats.statusCounts[status as ProjectStatus];
                    const Icon = config.icon;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: config.color }} />
                          <span className={cn(
                            theme === 'light' ? "text-slate-700" : "text-white/80"
                          )}>
                            {config.label}
                          </span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectStats.upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming deadlines
                  </p>
                ) : (
                  projectStats.upcomingDeadlines.map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm",
                        theme === 'light' ? "text-slate-700" : "text-white/80"
                      )}>
                        {project.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.deadline && format(new Date(project.deadline), 'MMM d')}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Project Dialog */}
      <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                placeholder="What's the project?"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={status}
                      type="button"
                      variant={newProject.status === status ? 'default' : 'outline'}
                      size="sm"
                      style={newProject.status === status ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewProject({ ...newProject, status: status as ProjectStatus })}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <Button
                    key={priority}
                    type="button"
                    variant={newProject.priority === priority ? 'default' : 'outline'}
                    className="flex-1"
                    style={newProject.priority === priority ? { backgroundColor: priorityColors[priority] } : undefined}
                    onClick={() => setNewProject({ ...newProject, priority })}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={handleAddProject}
              disabled={!newProject.name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}
