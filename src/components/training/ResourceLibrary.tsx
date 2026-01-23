'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Plus,
  ExternalLink,
  Youtube,
  Instagram,
  Video,
  FileText,
  Image,
  Link2,
  Star,
  Trash2,
  Search,
  Filter,
  Heart,
} from 'lucide-react';
import { useTrainingResources } from '@/hooks/useTraining';
import type { TrainingResource, ResourceType, TrainingType, BodyPart } from '@/types/database';

const RESOURCE_ICONS: Record<ResourceType, React.ComponentType<any>> = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Video,
  article: FileText,
  image: Image,
  other: Link2,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  youtube: '#FF0000',
  instagram: '#E4405F',
  tiktok: '#000000',
  article: '#3B82F6',
  image: '#10B981',
  other: '#6B7280',
};

const TRAINING_TYPES: { value: TrainingType; label: string }[] = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Strength' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'sports', label: 'Sports' },
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

interface ResourceLibraryProps {
  compact?: boolean;
}

export function ResourceLibrary({ compact = false }: ResourceLibraryProps) {
  const { theme } = useAppStore();
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    training_type: '' as TrainingType | '',
    body_parts: [] as BodyPart[],
    notes: '',
  });

  const { resources, loading, createResource, toggleFavorite, deleteResource } = useTrainingResources({
    favoritesOnly: showFavoritesOnly,
  });

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!resource.title.toLowerCase().includes(query) && 
          !resource.notes?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterType && resource.resource_type !== filterType) {
      return false;
    }
    return true;
  });

  const handleSave = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    setSaving(true);
    try {
      await createResource({
        title: newResource.title.trim(),
        url: newResource.url.trim(),
        training_type: newResource.training_type || null,
        body_parts: newResource.body_parts,
        notes: newResource.notes.trim() || null,
      });
      setIsAddingResource(false);
      setNewResource({ title: '', url: '', training_type: '', body_parts: [], notes: '' });
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const toggleBodyPart = (part: BodyPart) => {
    setNewResource(prev => ({
      ...prev,
      body_parts: prev.body_parts.includes(part)
        ? prev.body_parts.filter(p => p !== part)
        : [...prev.body_parts, part],
    }));
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Resources
            </CardTitle>
            <Button size="sm" onClick={() => setIsAddingResource(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
            </div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No resources saved yet
            </p>
          ) : (
            <div className="space-y-2">
              {resources.slice(0, 3).map((resource) => {
                const Icon = RESOURCE_ICONS[resource.resource_type];
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                      theme === 'light' ? "hover:bg-slate-100" : "hover:bg-white/5"
                    )}
                  >
                    {resource.thumbnail_url ? (
                      <img
                        src={resource.thumbnail_url}
                        alt={resource.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${RESOURCE_COLORS[resource.resource_type]}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: RESOURCE_COLORS[resource.resource_type] }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        theme === 'light' ? "text-slate-900" : "text-white"
                      )}>
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {resource.resource_type}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>

        <AddResourceDialog
          open={isAddingResource}
          onOpenChange={setIsAddingResource}
          newResource={newResource}
          setNewResource={setNewResource}
          onSave={handleSave}
          saving={saving}
          toggleBodyPart={toggleBodyPart}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart className={cn("h-4 w-4 mr-1", showFavoritesOnly && "fill-current")} />
            Favorites
          </Button>
          <select
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value || null)}
          >
            <option value="">All Types</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="article">Articles</option>
            <option value="image">Images</option>
            <option value="other">Other</option>
          </select>
          <Button onClick={() => setIsAddingResource(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Youtube className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {resources.length === 0 
                ? "No resources saved yet. Add your first training video or article!"
                : "No resources match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const Icon = RESOURCE_ICONS[resource.resource_type];
            return (
              <Card key={resource.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {resource.thumbnail_url ? (
                    <img
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: `${RESOURCE_COLORS[resource.resource_type]}20` }}
                    >
                      <Icon
                        className="h-12 w-12"
                        style={{ color: RESOURCE_COLORS[resource.resource_type] }}
                      />
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-white" />
                    </a>
                    <button
                      onClick={() => handleToggleFavorite(resource.id)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          resource.is_favorite ? "fill-red-500 text-red-500" : "text-white"
                        )}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 rounded-full bg-white/20 hover:bg-red-500/50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className="bg-black/60 text-white border-0"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {resource.resource_type}
                    </Badge>
                  </div>

                  {/* Favorite indicator */}
                  {resource.is_favorite && (
                    <div className="absolute top-2 right-2">
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className={cn(
                    "font-medium line-clamp-2 mb-2",
                    theme === 'light' ? "text-slate-900" : "text-white"
                  )}>
                    {resource.title}
                  </h3>

                  <div className="flex flex-wrap gap-1">
                    {resource.training_type && (
                      <Badge variant="outline" className="text-xs">
                        {resource.training_type}
                      </Badge>
                    )}
                    {resource.body_parts.slice(0, 2).map((part) => (
                      <Badge key={part} variant="secondary" className="text-xs">
                        {part.replace('_', ' ')}
                      </Badge>
                    ))}
                    {resource.body_parts.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.body_parts.length - 2}
                      </Badge>
                    )}
                  </div>

                  {resource.notes && (
                    <p className={cn(
                      "text-sm mt-2 line-clamp-2",
                      theme === 'light' ? "text-slate-500" : "text-white/60"
                    )}>
                      {resource.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddResourceDialog
        open={isAddingResource}
        onOpenChange={setIsAddingResource}
        newResource={newResource}
        setNewResource={setNewResource}
        onSave={handleSave}
        saving={saving}
        toggleBodyPart={toggleBodyPart}
      />
    </div>
  );
}

// Separate dialog component
function AddResourceDialog({
  open,
  onOpenChange,
  newResource,
  setNewResource,
  onSave,
  saving,
  toggleBodyPart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newResource: { title: string; url: string; training_type: TrainingType | ''; body_parts: BodyPart[]; notes: string };
  setNewResource: (resource: { title: string; url: string; training_type: TrainingType | ''; body_parts: BodyPart[]; notes: string }) => void;
  onSave: () => void;
  saving: boolean;
  toggleBodyPart: (part: BodyPart) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-violet-500" />
            Add Training Resource
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube, Instagram, TikTok, or article URL
            </p>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g., Full Body HIIT Workout"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Training Type (optional)</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={newResource.training_type}
              onChange={(e) => setNewResource({ ...newResource, training_type: (e.target.value || '') as TrainingType | '' })}
            >
              <option value="">Select type...</option>
              {TRAINING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Body Parts (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((part) => (
                <Button
                  key={part.value}
                  type="button"
                  variant={newResource.body_parts.includes(part.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleBodyPart(part.value)}
                >
                  {part.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="Why is this helpful?"
              value={newResource.notes}
              onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
            onClick={onSave}
            disabled={!newResource.title.trim() || !newResource.url.trim() || saving}
          >
            {saving ? 'Saving...' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

