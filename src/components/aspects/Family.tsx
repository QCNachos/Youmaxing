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
  Heart,
  Calendar,
  Gift,
  Phone,
  Plus,
  Cake,
  MessageCircle,
} from 'lucide-react';
import type { FamilyMember } from '@/types/database';
import { format, differenceInDays } from 'date-fns';

const mockMembers: FamilyMember[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Mom',
    relationship: 'Mother',
    birthday: '1965-03-15',
    notes: 'Loves gardening',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    name: 'Dad',
    relationship: 'Father',
    birthday: '1962-08-22',
    notes: 'Golf on Sundays',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    name: 'Sarah',
    relationship: 'Sister',
    birthday: '1995-11-08',
    notes: null,
    created_at: new Date().toISOString(),
  },
];

const upcomingEvents = [
  { title: "Mom's Birthday", date: 'March 15', type: 'birthday' },
  { title: 'Family Dinner', date: 'This Sunday', type: 'event' },
  { title: "Sarah's Graduation", date: 'June 10', type: 'event' },
];

const giftIdeas = [
  { person: 'Mom', ideas: ['Gardening set', 'Spa day', 'Cookbook'] },
  { person: 'Dad', ideas: ['Golf accessories', 'Watch', 'Book'] },
];

export function Family() {
  const [members, setMembers] = useState<FamilyMember[]>(mockMembers);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    birthday: '',
    notes: '',
  });

  const stats = [
    { label: 'Family Members', value: members.length },
    { label: 'Upcoming Birthdays', value: 2 },
    { label: 'Events This Month', value: 3 },
    { label: 'Last Call', value: '2 days ago' },
  ];

  const addMember = () => {
    const member: FamilyMember = {
      id: Date.now().toString(),
      user_id: '1',
      ...newMember,
      birthday: newMember.birthday || null,
      notes: newMember.notes || null,
      created_at: new Date().toISOString(),
    };
    setMembers([member, ...members]);
    setIsAddingMember(false);
    setNewMember({ name: '', relationship: '', birthday: '', notes: '' });
  };

  const getDaysUntilBirthday = (birthday: string) => {
    const today = new Date();
    const bday = new Date(birthday);
    bday.setFullYear(today.getFullYear());
    if (bday < today) bday.setFullYear(today.getFullYear() + 1);
    return differenceInDays(bday, today);
  };

  return (
    <AspectLayout
      aspectId="family"
      stats={stats}
      aiInsight="Mom's birthday is coming up in 2 weeks! Based on her interests, here are some gift ideas: gardening set, spa day voucher, or a nice cookbook."
      onAddNew={() => setIsAddingMember(true)}
      addNewLabel="Add Member"
    >
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Family</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="gifts">Gift Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          {members.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Add your family members"
              description="Keep track of birthdays, events, and stay connected."
              actionLabel="Add Member"
              onAction={() => setIsAddingMember(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <Card key={member.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-2xl">
                        💕
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.relationship}</p>
                        {member.birthday && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Cake className="h-3 w-3 mr-1" />
                              {format(new Date(member.birthday), 'MMM d')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              in {getDaysUntilBirthday(member.birthday)} days
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {member.notes && (
                      <p className="text-sm text-muted-foreground mt-3 pl-[72px]">{member.notes}</p>
                    )}
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
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                      {event.type === 'birthday' ? (
                        <Cake className="h-6 w-6 text-pink-500" />
                      ) : (
                        <Calendar className="h-6 w-6 text-pink-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Set Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gifts" className="mt-6">
          <div className="space-y-6">
            {giftIdeas.map((person, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-pink-500" />
                    Gift Ideas for {person.person}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {person.ideas.map((idea, i) => (
                      <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                        {idea}
                      </Badge>
                    ))}
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Idea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Input
                placeholder="e.g., Mother, Brother, Cousin"
                value={newMember.relationship}
                onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Birthday (optional)</Label>
              <Input
                type="date"
                value={newMember.birthday}
                onChange={(e) => setNewMember({ ...newMember, birthday: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Interests, important info..."
                value={newMember.notes}
                onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addMember}
              disabled={!newMember.name.trim() || !newMember.relationship.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

