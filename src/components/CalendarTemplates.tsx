'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Plus,
  Calendar,
  Clock,
  Target,
  Briefcase,
  Heart,
  Plane,
  Star,
  Users,
  Coffee,
  Book,
  Dumbbell,
  Utensils,
  DollarSign,
  Home,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Play,
  CheckCircle2,
  X,
  Settings,
} from 'lucide-react';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';

type TemplateCategory = 'productivity' | 'work' | 'personal' | 'social' | 'health' | 'custom';

type CalendarTemplate = {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  rating: number;
  tags: string[];
  events: TemplateEvent[];
  objectives?: TemplateObjective[];
};

type TemplateEvent = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  duration_minutes?: number;
  relative_days: number; // days from template start (0 = same day, 1 = next day, etc.)
  start_time?: string; // specific time of day
  is_all_day?: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  location?: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    frequency: number;
    end_after_occurrences?: number;
  };
};

type TemplateObjective = {
  id: string;
  title: string;
  description?: string;
  level: 'monthly' | 'weekly' | 'daily';
  aspect: AspectType;
  type: 'personal' | 'job';
  priority: 'low' | 'medium' | 'high';
  success_criteria?: string[];
  estimated_duration_days: number;
};

const mockTemplates: CalendarTemplate[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Start your day right with mindfulness, exercise, and healthy habits',
    category: 'productivity',
    isPublic: true,
    createdBy: 'system',
    usageCount: 1250,
    rating: 4.8,
    tags: ['health', 'productivity', 'mindfulness'],
    events: [
      {
        id: 'meditation',
        title: 'Morning Meditation',
        description: '10 minutes of mindfulness meditation',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 10,
        relative_days: 0,
        start_time: '07:00',
        priority: 'high',
        tags: ['mindfulness', 'mental-health']
      },
      {
        id: 'exercise',
        title: 'Daily Exercise',
        description: 'Cardio or strength training session',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 45,
        relative_days: 0,
        start_time: '07:15',
        priority: 'high',
        tags: ['fitness', 'health']
      },
      {
        id: 'breakfast',
        title: 'Healthy Breakfast',
        description: 'Nutritious morning meal preparation',
        aspect: 'food',
        type: 'personal',
        duration_minutes: 20,
        relative_days: 0,
        start_time: '08:15',
        priority: 'medium',
        tags: ['nutrition', 'health']
      }
    ],
    objectives: [
      {
        id: 'daily-exercise-goal',
        title: 'Complete daily exercise routine',
        level: 'daily',
        aspect: 'training',
        type: 'personal',
        priority: 'high',
        success_criteria: ['Complete full workout', 'Track progress', 'Feel energized'],
        estimated_duration_days: 1
      }
    ]
  },
  {
    id: 'client-meeting',
    name: 'Client Presentation Prep',
    description: 'Comprehensive preparation for important client meetings and presentations',
    category: 'work',
    isPublic: true,
    createdBy: 'system',
    usageCount: 890,
    rating: 4.6,
    tags: ['business', 'meetings', 'presentation'],
    events: [
      {
        id: 'research',
        title: 'Client Research',
        description: 'Review client history, needs, and previous interactions',
        aspect: 'business',
        type: 'job',
        duration_minutes: 60,
        relative_days: -1,
        start_time: '14:00',
        priority: 'high',
        tags: ['research', 'preparation']
      },
      {
        id: 'content-prep',
        title: 'Content Preparation',
        description: 'Prepare presentation materials and talking points',
        aspect: 'business',
        type: 'job',
        duration_minutes: 120,
        relative_days: -1,
        start_time: '16:00',
        priority: 'high',
        tags: ['presentation', 'content']
      },
      {
        id: 'rehearsal',
        title: 'Presentation Rehearsal',
        description: 'Practice delivery and handle Q&A preparation',
        aspect: 'business',
        type: 'job',
        duration_minutes: 90,
        relative_days: 0,
        start_time: '09:00',
        priority: 'high',
        tags: ['practice', 'presentation']
      },
      {
        id: 'meeting',
        title: 'Client Meeting',
        description: 'Main presentation and discussion',
        aspect: 'business',
        type: 'job',
        duration_minutes: 120,
        relative_days: 0,
        start_time: '11:00',
        priority: 'high',
        tags: ['meeting', 'presentation'],
        location: 'Conference Room A'
      }
    ]
  },
  {
    id: 'date-night',
    name: 'Romantic Date Night',
    description: 'Plan a special evening with your partner',
    category: 'personal',
    isPublic: true,
    createdBy: 'system',
    usageCount: 567,
    rating: 4.4,
    tags: ['relationships', 'romance', 'personal'],
    events: [
      {
        id: 'reservation',
        title: 'Restaurant Reservation',
        description: 'Book a table at a nice restaurant',
        aspect: 'friends',
        type: 'personal',
        duration_minutes: 10,
        relative_days: -3,
        start_time: '18:00',
        priority: 'medium',
        tags: ['reservation', 'dining']
      },
      {
        id: 'dinner',
        title: 'Romantic Dinner',
        description: 'Enjoy a special meal together',
        aspect: 'friends',
        type: 'personal',
        duration_minutes: 120,
        relative_days: 0,
        start_time: '19:00',
        priority: 'high',
        tags: ['dinner', 'romantic'],
        location: 'Favorite Restaurant'
      }
    ]
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review & Planning',
    description: 'Reflect on the past week and plan for the next one',
    category: 'productivity',
    isPublic: true,
    createdBy: 'system',
    usageCount: 743,
    rating: 4.7,
    tags: ['planning', 'reflection', 'productivity'],
    events: [
      {
        id: 'reflection',
        title: 'Week Reflection',
        description: 'Review accomplishments, challenges, and lessons learned',
        aspect: 'business',
        type: 'personal',
        duration_minutes: 45,
        relative_days: 0,
        start_time: '17:00',
        priority: 'high',
        tags: ['reflection', 'review']
      },
      {
        id: 'planning',
        title: 'Next Week Planning',
        description: 'Set goals and priorities for the coming week',
        aspect: 'business',
        type: 'personal',
        duration_minutes: 60,
        relative_days: 0,
        start_time: '17:45',
        priority: 'high',
        tags: ['planning', 'goals']
      }
    ]
  },
  {
    id: 'workout-routine',
    name: 'Weekly Workout Routine',
    description: 'Structured exercise plan for the week',
    category: 'health',
    isPublic: true,
    createdBy: 'system',
    usageCount: 932,
    rating: 4.5,
    tags: ['fitness', 'health', 'exercise'],
    events: [
      {
        id: 'monday-cardio',
        title: 'Monday Cardio',
        description: '45-minute cardio session',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 45,
        relative_days: 0,
        start_time: '07:00',
        priority: 'high',
        tags: ['cardio', 'monday'],
        recurrence: {
          pattern: 'weekly',
          frequency: 1
        }
      },
      {
        id: 'wednesday-strength',
        title: 'Wednesday Strength Training',
        description: 'Full body strength workout',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 60,
        relative_days: 2,
        start_time: '07:00',
        priority: 'high',
        tags: ['strength', 'wednesday'],
        recurrence: {
          pattern: 'weekly',
          frequency: 1
        }
      },
      {
        id: 'friday-yoga',
        title: 'Friday Yoga',
        description: 'Relaxing yoga session',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 45,
        relative_days: 4,
        start_time: '18:00',
        priority: 'medium',
        tags: ['yoga', 'friday', 'recovery'],
        recurrence: {
          pattern: 'weekly',
          frequency: 1
        }
      }
    ]
  }
];

const categoryIcons: Record<TemplateCategory, any> = {
  productivity: Zap,
  work: Briefcase,
  personal: Heart,
  social: Users,
  health: Dumbbell,
  custom: Settings
};

const categoryColors: Record<TemplateCategory, string> = {
  productivity: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  work: 'text-blue-600 bg-blue-50 border-blue-200',
  personal: 'text-purple-600 bg-purple-50 border-purple-200',
  social: 'text-green-600 bg-green-50 border-green-200',
  health: 'text-red-600 bg-red-50 border-red-200',
  custom: 'text-gray-600 bg-gray-50 border-gray-200'
};

export function CalendarTemplates({ onApplyTemplate }: {
  onApplyTemplate?: (template: CalendarTemplate, startDate: Date) => void;
}) {
  const [templates, setTemplates] = useState<CalendarTemplate[]>(mockTemplates);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CalendarTemplate | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [applyStartDate, setApplyStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom' as TemplateCategory,
    isPublic: false,
    tags: [] as string[],
    events: [] as TemplateEvent[],
    objectives: [] as TemplateObjective[]
  });

  // Filter templates based on category and search
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: TemplateCategory) => {
    const IconComponent = categoryIcons[category];
    return <IconComponent className="h-5 w-5" />;
  };

  const getCategoryColor = (category: TemplateCategory) => {
    return categoryColors[category];
  };

  const handleApplyTemplate = (template: CalendarTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template, new Date(applyStartDate));
    }
    setShowTemplateDetails(false);
  };

  const createTemplate = () => {
    const template: CalendarTemplate = {
      id: `custom_${Date.now()}`,
      ...newTemplate,
      createdBy: 'current_user',
      usageCount: 0,
      rating: 0
    };
    setTemplates([...templates, template]);
    setIsCreatingTemplate(false);
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      isPublic: false,
      tags: [],
      events: [],
      objectives: []
    });
  };

  const renderTemplateCard = (template: CalendarTemplate) => {
    const IconComponent = categoryIcons[template.category];

    return (
      <Card
        key={template.id}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => {
          setSelectedTemplate(template);
          setShowTemplateDetails(true);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(template.category)}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-muted-foreground">{template.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>{template.events.length} event{template.events.length !== 1 ? 's' : ''}</span>
            <span>{template.usageCount} uses</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`text-xs border ${getCategoryColor(template.category)}`}>
              {template.category}
            </Badge>
            {template.isPublic && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar Templates</h1>
            <p className="text-muted-foreground">Pre-built schedules for common scenarios</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button onClick={() => setIsCreatingTemplate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(value: TemplateCategory | 'all') => setSelectedCategory(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(renderTemplateCard)}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Template Details Dialog */}
      <Dialog open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && getCategoryIcon(selectedTemplate.category)}
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="py-4">
              <div className="mb-6">
                <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`border ${getCategoryColor(selectedTemplate.category)}`}>
                    {selectedTemplate.category}
                  </Badge>
                  {selectedTemplate.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {selectedTemplate.rating}
                  </span>
                  <span>{selectedTemplate.usageCount} uses</span>
                  <span>{selectedTemplate.events.length} events</span>
                  {selectedTemplate.objectives && (
                    <span>{selectedTemplate.objectives.length} objectives</span>
                  )}
                </div>
              </div>

              <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="objectives">Objectives</TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {selectedTemplate.events.map(event => (
                        <Card key={event.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{event.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    Day {event.relative_days === 0 ? '0' : `+${event.relative_days}`}
                                  </Badge>
                                </div>
                                {event.description && (
                                  <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {event.start_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {event.start_time}
                                    </span>
                                  )}
                                  {event.duration_minutes && (
                                    <span>{event.duration_minutes}m</span>
                                  )}
                                  {event.location && (
                                    <span>{event.location}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant="secondary"
                                  style={{
                                    backgroundColor: `${aspects.find(a => a.id === event.aspect)?.color}20`,
                                    color: aspects.find(a => a.id === event.aspect)?.color
                                  }}
                                  className="text-xs"
                                >
                                  {aspects.find(a => a.id === event.aspect)?.name}
                                </Badge>
                                <Badge
                                  variant={event.priority === 'high' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {event.priority}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="objectives" className="mt-4">
                  {selectedTemplate.objectives && selectedTemplate.objectives.length > 0 ? (
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {selectedTemplate.objectives.map(objective => (
                          <Card key={objective.id}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{objective.title}</h4>
                                  {objective.description && (
                                    <p className="text-xs text-muted-foreground mb-2">{objective.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {objective.level}
                                    </Badge>
                                    <span>{objective.estimated_duration_days} days</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: `${aspects.find(a => a.id === objective.aspect)?.color}20`,
                                      color: aspects.find(a => a.id === objective.aspect)?.color
                                    }}
                                    className="text-xs"
                                  >
                                    {aspects.find(a => a.id === objective.aspect)?.name}
                                  </Badge>
                                  <Badge
                                    variant={objective.priority === 'high' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {objective.priority}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No objectives in this template</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                <div className="flex-1">
                  <Label htmlFor="apply-date">Start Date</Label>
                  <Input
                    id="apply-date"
                    type="date"
                    value={applyStartDate}
                    onChange={(e) => setApplyStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowTemplateDetails(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleApplyTemplate(selectedTemplate)}>
                    <Play className="h-4 w-4 mr-1" />
                    Apply Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Weekly Review"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this template is for..."
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newTemplate.category} onValueChange={(value: TemplateCategory) => setNewTemplate({ ...newTemplate, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={newTemplate.isPublic ? 'public' : 'private'} onValueChange={(value) => setNewTemplate({ ...newTemplate, isPublic: value === 'public' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={createTemplate}
              disabled={!newTemplate.name.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}







