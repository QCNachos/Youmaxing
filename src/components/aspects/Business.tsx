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
} from 'lucide-react';
import type { BusinessProject } from '@/types/database';

const mockProjects: BusinessProject[] = [
  {
    id: '1',
    user_id: '1',
    name: 'YOUMAXING App',
    status: 'active',
    description: 'AI-powered life management platform',
    priority: 'high',
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    name: 'Newsletter Launch',
    status: 'planning',
    description: 'Weekly productivity newsletter',
    priority: 'medium',
    deadline: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    name: 'Podcast Idea',
    status: 'idea',
    description: 'Interview successful entrepreneurs',
    priority: 'low',
    deadline: null,
    created_at: new Date().toISOString(),
  },
];

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
  const [projects, setProjects] = useState<BusinessProject[]>(mockProjects);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    status: 'idea' as BusinessProject['status'],
    description: '',
    priority: 'medium' as BusinessProject['priority'],
  });

  const stats = [
    { label: 'Active Projects', value: projects.filter((p) => p.status === 'active').length },
    { label: 'Ideas', value: projects.filter((p) => p.status === 'idea').length },
    { label: 'Completed', value: projects.filter((p) => p.status === 'completed').length },
    { label: 'This Month', value: '12 tasks' },
  ];

  const addProject = () => {
    const project: BusinessProject = {
      id: Date.now().toString(),
      user_id: '1',
      ...newProject,
      deadline: null,
      created_at: new Date().toISOString(),
    };
    setProjects([project, ...projects]);
    setIsAddingProject(false);
    setNewProject({ name: '', status: 'idea', description: '', priority: 'medium' });
  };

  return (
    <AspectLayout
      aspectId="business"
      stats={stats}
      aiInsight="Your YOUMAXING project is making great progress! Consider blocking 2 hours tomorrow for focused work on the AI chat feature."
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
          {projects.filter((p) => p.status !== 'idea').length === 0 ? (
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
                    <Card key={project.id} className="hover:border-primary/50 transition-colors">
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
                                  Due in 30 days
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ideas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter((p) => p.status === 'idea')
              .map((project) => (
                <Card key={project.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h4 className={cn(
                        "font-medium",
                        theme === 'light' ? "text-slate-900" : "text-white"
                      )}>
                        {project.name}
                      </h4>
                    </div>
                    {project.description && (
                      <p className={cn(
                        "text-sm mb-3",
                        theme === 'light' ? "text-slate-500" : "text-white/60"
                      )}>
                        {project.description}
                      </p>
                    )}
                    <Button size="sm" className="w-full">
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
        </TabsContent>

        <TabsContent value="productivity" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Focus Time This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className={cn(
                    "text-4xl font-bold",
                    theme === 'light' ? "text-slate-900" : "text-white"
                  )}>
                    18h 30m
                  </p>
                  <p className="text-sm text-green-500 mt-1">+3h from last week</p>
                </div>
                <div className="flex justify-between items-end h-24 mt-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const height = [80, 60, 100, 40, 90, 20, 0][i];
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <div
                          className="w-8 rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                        />
                        <span className={cn(
                          "text-xs",
                          theme === 'light' ? "text-slate-500" : "text-white/60"
                        )}>
                          {day}
                        </span>
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
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'Start a focus session', emoji: '🎯' },
                  { action: 'Review weekly goals', emoji: '📋' },
                  { action: 'Schedule a task', emoji: '📅' },
                  { action: 'Add a note', emoji: '📝' },
                ].map((item, i) => (
                  <Button key={i} variant="outline" className="w-full justify-start">
                    <span className="mr-2">{item.emoji}</span>
                    {item.action}
                  </Button>
                ))}
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
                      onClick={() => setNewProject({ ...newProject, status: status as BusinessProject['status'] })}
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
              onClick={addProject}
              disabled={!newProject.name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}



