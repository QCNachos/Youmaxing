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
  Users,
  MessageCircle,
  Phone,
  Calendar,
  Plus,
  Clock,
  Coffee,
  Beer,
} from 'lucide-react';
import type { Friend } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

const mockFriends: Friend[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Alex Chen',
    how_met: 'College',
    last_contact: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Loves hiking and photography',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    name: 'Jordan Smith',
    how_met: 'Work',
    last_contact: new Date(Date.now() - 14 * 86400000).toISOString(),
    notes: 'Great for coffee chats',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    name: 'Sam Taylor',
    how_met: 'Gym',
    last_contact: new Date(Date.now() - 30 * 86400000).toISOString(),
    notes: null,
    created_at: new Date().toISOString(),
  },
];

const hangoutIdeas = [
  { activity: 'Coffee catch-up', emoji: '☕', duration: '1 hour' },
  { activity: 'Dinner & drinks', emoji: '🍕', duration: '2-3 hours' },
  { activity: 'Movie night', emoji: '🎬', duration: '3 hours' },
  { activity: 'Hiking trip', emoji: '🥾', duration: 'Half day' },
  { activity: 'Game night', emoji: '🎮', duration: '3-4 hours' },
  { activity: 'Brunch', emoji: '🥞', duration: '1-2 hours' },
];

export function Friends() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [newFriend, setNewFriend] = useState({
    name: '',
    how_met: '',
    notes: '',
  });

  const getContactStatus = (lastContact: string | null) => {
    if (!lastContact) return { label: 'Never', color: '#6B7280' };
    const days = Math.floor((Date.now() - new Date(lastContact).getTime()) / 86400000);
    if (days <= 7) return { label: 'Recent', color: '#22C55E' };
    if (days <= 30) return { label: 'This month', color: '#F59E0B' };
    return { label: 'Overdue', color: '#EF4444' };
  };

  const stats = [
    { label: 'Close Friends', value: friends.length },
    { label: 'Recent Contact', value: friends.filter(f => f.last_contact && (Date.now() - new Date(f.last_contact).getTime()) < 7 * 86400000).length },
    { label: 'Hangouts This Month', value: 4 },
    { label: 'Need to Catch Up', value: friends.filter(f => f.last_contact && (Date.now() - new Date(f.last_contact).getTime()) > 14 * 86400000).length },
  ];

  const addFriend = () => {
    const friend: Friend = {
      id: Date.now().toString(),
      user_id: '1',
      ...newFriend,
      how_met: newFriend.how_met || null,
      notes: newFriend.notes || null,
      last_contact: null,
      created_at: new Date().toISOString(),
    };
    setFriends([friend, ...friends]);
    setIsAddingFriend(false);
    setNewFriend({ name: '', how_met: '', notes: '' });
  };

  return (
    <AspectLayout
      aspectId="friends"
      stats={stats}
      aiInsight="You haven't seen Sam in about a month. Based on their interests, maybe suggest a gym session or coffee catch-up this week?"
      onAddNew={() => setIsAddingFriend(true)}
      addNewLabel="Add Friend"
    >
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="plan">Plan Hangout</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          {friends.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Add your friends"
              description="Keep track of your friendships and never lose touch."
              actionLabel="Add Friend"
              onAction={() => setIsAddingFriend(true)}
            />
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => {
                const status = getContactStatus(friend.last_contact);
                return (
                  <Card key={friend.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center text-xl font-bold text-orange-500">
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{friend.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            {friend.how_met && (
                              <span className="text-sm text-muted-foreground">
                                Met: {friend.how_met}
                              </span>
                            )}
                            <Badge
                              variant="secondary"
                              style={{ backgroundColor: `${status.color}20`, color: status.color }}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {friend.last_contact
                                ? formatDistanceToNow(new Date(friend.last_contact), { addSuffix: true })
                                : 'Never contacted'}
                            </Badge>
                          </div>
                          {friend.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{friend.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Plan
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

        <TabsContent value="plan" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hangoutIdeas.map((idea, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">{idea.emoji}</span>
                    <span className="font-medium">{idea.activity}</span>
                    <span className="text-xs text-muted-foreground">{idea.duration}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Catch-ups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {friends
                .filter(f => f.last_contact && (Date.now() - new Date(f.last_contact).getTime()) > 14 * 86400000)
                .map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-500">
                      {friend.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last seen {formatDistanceToNow(new Date(friend.last_contact!), { addSuffix: true })}
                      </p>
                    </div>
                    <Button size="sm">
                      <Coffee className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {[
              { friend: 'Alex Chen', activity: 'Hiking at Mt. Tamalpais', date: '3 days ago', emoji: '🥾' },
              { friend: 'Jordan Smith', activity: 'Coffee at Blue Bottle', date: '2 weeks ago', emoji: '☕' },
              { friend: 'Group', activity: 'Board game night', date: '3 weeks ago', emoji: '🎲' },
            ].map((hangout, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{hangout.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{hangout.activity}</h4>
                      <p className="text-sm text-muted-foreground">
                        with {hangout.friend} · {hangout.date}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Friend Dialog */}
      <Dialog open={isAddingFriend} onOpenChange={setIsAddingFriend}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Friend's name"
                value={newFriend.name}
                onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>How you met (optional)</Label>
              <Input
                placeholder="e.g., College, Work, Gym"
                value={newFriend.how_met}
                onChange={(e) => setNewFriend({ ...newFriend, how_met: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Interests, reminders..."
                value={newFriend.notes}
                onChange={(e) => setNewFriend({ ...newFriend, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addFriend}
              disabled={!newFriend.name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}



