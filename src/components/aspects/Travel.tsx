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
import { Progress } from '@/components/ui/progress';
import { 
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Plus,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { Trip } from '@/types/database';
import { format } from 'date-fns';

const mockTrips: Trip[] = [
  {
    id: '1',
    user_id: '1',
    destination: 'Tokyo, Japan',
    status: 'booked',
    start_date: new Date(Date.now() + 60 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 74 * 86400000).toISOString(),
    budget: 3000,
    notes: 'Cherry blossom season!',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    destination: 'Barcelona, Spain',
    status: 'planning',
    start_date: null,
    end_date: null,
    budget: 2000,
    notes: null,
    created_at: new Date().toISOString(),
  },
];

const bucketList = [
  { destination: 'Iceland', emoji: '🇮🇸', reason: 'Northern Lights' },
  { destination: 'New Zealand', emoji: '🇳🇿', reason: 'Adventure sports' },
  { destination: 'Maldives', emoji: '🇲🇻', reason: 'Beach relaxation' },
  { destination: 'Peru', emoji: '🇵🇪', reason: 'Machu Picchu' },
];

const statusConfig = {
  dream: { label: 'Dream', icon: Heart, color: '#EC4899' },
  planning: { label: 'Planning', icon: Clock, color: '#F59E0B' },
  booked: { label: 'Booked', icon: Calendar, color: '#3B82F6' },
  completed: { label: 'Completed', icon: CheckCircle, color: '#22C55E' },
};

export function Travel() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    status: 'dream' as Trip['status'],
    budget: 0,
    notes: '',
  });

  const stats = [
    { label: 'Upcoming', value: trips.filter((t) => t.status === 'booked').length },
    { label: 'Planning', value: trips.filter((t) => t.status === 'planning').length },
    { label: 'Bucket List', value: bucketList.length },
    { label: 'Countries', value: '12 visited' },
  ];

  const addTrip = () => {
    const trip: Trip = {
      id: Date.now().toString(),
      user_id: '1',
      ...newTrip,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
    };
    setTrips([trip, ...trips]);
    setIsAddingTrip(false);
    setNewTrip({ destination: '', status: 'dream', budget: 0, notes: '' });
  };

  return (
    <AspectLayout
      aspectId="travel"
      stats={stats}
      aiInsight="Your Tokyo trip is in 60 days! Based on your savings rate, you're on track for your $3,000 budget. Consider booking restaurants now - cherry blossom season gets busy!"
      onAddNew={() => setIsAddingTrip(true)}
      addNewLabel="Add Trip"
    >
      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trips">My Trips</TabsTrigger>
          <TabsTrigger value="bucketlist">Bucket List</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-6">
          {trips.length === 0 ? (
            <EmptyState
              icon={Plane}
              title="No trips planned"
              description="Start dreaming! Add your next adventure."
              actionLabel="Add Trip"
              onAction={() => setIsAddingTrip(true)}
            />
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => {
                const config = statusConfig[trip.status];
                const StatusIcon = config.icon;
                return (
                  <Card key={trip.id} className="hover:border-primary/50 transition-colors overflow-hidden">
                    <div 
                      className="h-2" 
                      style={{ backgroundColor: config.color }}
                    />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                        >
                          ✈️
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{trip.destination}</h4>
                            <Badge
                              variant="secondary"
                              style={{ backgroundColor: `${config.color}20`, color: config.color }}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {trip.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(trip.start_date), 'MMM d, yyyy')}
                              </span>
                            )}
                            {trip.budget && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${trip.budget.toLocaleString()} budget
                              </span>
                            )}
                          </div>
                          {trip.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{trip.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bucketlist" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bucketList.map((item, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.destination}</h4>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewTrip({ destination: item.destination, status: 'dream', budget: 0, notes: item.reason });
                        setIsAddingTrip(true);
                      }}
                    >
                      Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsAddingTrip(true)}>
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[80px]">
                <Plus className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">Add to Bucket List</span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memories" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { destination: 'Paris', year: '2024', emoji: '🇫🇷' },
              { destination: 'Bali', year: '2023', emoji: '🇮🇩' },
              { destination: 'NYC', year: '2023', emoji: '🇺🇸' },
              { destination: 'London', year: '2022', emoji: '🇬🇧' },
            ].map((memory, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-2 block">{memory.emoji}</span>
                  <h4 className="font-medium">{memory.destination}</h4>
                  <p className="text-sm text-muted-foreground">{memory.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Trip Dialog */}
      <Dialog open={isAddingTrip} onOpenChange={setIsAddingTrip}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                placeholder="Where to?"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
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
                      variant={newTrip.status === status ? 'default' : 'outline'}
                      size="sm"
                      style={newTrip.status === status ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewTrip({ ...newTrip, status: status as Trip['status'] })}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget (optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newTrip.budget || ''}
                onChange={(e) => setNewTrip({ ...newTrip, budget: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Any details..."
                value={newTrip.notes}
                onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addTrip}
              disabled={!newTrip.destination.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

