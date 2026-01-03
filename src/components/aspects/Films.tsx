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
import { 
  Film,
  Tv,
  Star,
  Clock,
  Plus,
  Play,
  Check,
  Bookmark,
} from 'lucide-react';
import type { WatchlistItem } from '@/types/database';

const mockWatchlist: WatchlistItem[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Dune: Part Two',
    type: 'movie',
    status: 'watched',
    rating: 9,
    notes: 'Epic!',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    title: 'The Bear',
    type: 'series',
    status: 'watching',
    rating: null,
    notes: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    title: 'Oppenheimer',
    type: 'movie',
    status: 'want_to_watch',
    rating: null,
    notes: null,
    created_at: new Date().toISOString(),
  },
];

const recommendations = [
  { title: 'Shogun', type: 'series', reason: 'Based on your love for epic dramas' },
  { title: 'Poor Things', type: 'movie', reason: 'Similar to films you rated highly' },
  { title: 'The Last of Us', type: 'series', reason: 'Trending now' },
];

const statusConfig = {
  want_to_watch: { label: 'Want to Watch', icon: Bookmark, color: '#F59E0B' },
  watching: { label: 'Watching', icon: Play, color: '#3B82F6' },
  watched: { label: 'Watched', icon: Check, color: '#22C55E' },
};

export function Films() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'movie' as WatchlistItem['type'],
    status: 'want_to_watch' as WatchlistItem['status'],
    rating: null as number | null,
  });

  const stats = [
    { label: 'Watched', value: watchlist.filter((i) => i.status === 'watched').length },
    { label: 'Watching', value: watchlist.filter((i) => i.status === 'watching').length },
    { label: 'Watchlist', value: watchlist.filter((i) => i.status === 'want_to_watch').length },
    { label: 'Avg Rating', value: '8.5 ★' },
  ];

  const addItem = () => {
    const item: WatchlistItem = {
      id: Date.now().toString(),
      user_id: '1',
      ...newItem,
      notes: null,
      created_at: new Date().toISOString(),
    };
    setWatchlist([item, ...watchlist]);
    setIsAddingItem(false);
    setNewItem({ title: '', type: 'movie', status: 'want_to_watch', rating: null });
  };

  return (
    <AspectLayout
      aspectId="films"
      stats={stats}
      aiInsight="Based on your recent watches, you might enjoy 'Shogun' - it has the epic storytelling you seem to love!"
      onAddNew={() => setIsAddingItem(true)}
      addNewLabel="Add to Watchlist"
    >
      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="mt-6">
          {watchlist.filter((i) => i.status !== 'watched').length === 0 ? (
            <EmptyState
              icon={Film}
              title="Your watchlist is empty"
              description="Add movies and series you want to watch."
              actionLabel="Add Title"
              onAction={() => setIsAddingItem(true)}
            />
          ) : (
            <div className="space-y-4">
              {watchlist
                .filter((i) => i.status !== 'watched')
                .map((item) => {
                  const config = statusConfig[item.status];
                  const StatusIcon = config.icon;
                  return (
                    <Card key={item.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            {item.type === 'movie' ? (
                              <Film className="h-6 w-6 text-purple-500" />
                            ) : (
                              <Tv className="h-6 w-6 text-purple-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary">{item.type}</Badge>
                              <Badge
                                variant="secondary"
                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            {item.status === 'want_to_watch' ? 'Start' : 'Mark Done'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                      {rec.type === 'movie' ? (
                        <Film className="h-6 w-6 text-violet-500" />
                      ) : (
                        <Tv className="h-6 w-6 text-violet-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewItem({ title: rec.title, type: rec.type as 'movie' | 'series', status: 'want_to_watch', rating: null });
                        addItem();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {watchlist
              .filter((i) => i.status === 'watched')
              .map((item) => (
                <Card key={item.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary">{item.type}</Badge>
                          {item.rating && (
                            <span className="text-sm flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {item.rating}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Watchlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Movie or series name"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(['movie', 'series', 'documentary'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={newItem.type === type ? 'default' : 'outline'}
                    onClick={() => setNewItem({ ...newItem, type })}
                  >
                    {type === 'movie' && <Film className="h-4 w-4 mr-1" />}
                    {type === 'series' && <Tv className="h-4 w-4 mr-1" />}
                    {type === 'documentary' && <Film className="h-4 w-4 mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={status}
                      type="button"
                      variant={newItem.status === status ? 'default' : 'outline'}
                      className="flex-1"
                      style={newItem.status === status ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewItem({ ...newItem, status: status as WatchlistItem['status'] })}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addItem}
              disabled={!newItem.title.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

