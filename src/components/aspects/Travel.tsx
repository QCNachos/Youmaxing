'use client';

import { useState } from 'react';
import { AspectLayout, EmptyState } from './AspectLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
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
import { format } from 'date-fns';
import { WorldMap } from '@/components/WorldMap';
import { useTrips, useBucketList, useVisitedPlaces } from '@/hooks/useTravel';
import { AddTripDialog } from '@/components/travel/AddTripDialog';
import { AddBucketListDialog } from '@/components/travel/AddBucketListDialog';
import { AddVisitedPlaceDialog } from '@/components/travel/AddVisitedPlaceDialog';


const statusConfig = {
  dream: { label: 'Dream', icon: Heart, color: '#EC4899' },
  planning: { label: 'Planning', icon: Clock, color: '#F59E0B' },
  booked: { label: 'Booked', icon: Calendar, color: '#3B82F6' },
  completed: { label: 'Completed', icon: CheckCircle, color: '#22C55E' },
};

export function Travel() {
  const { theme } = useAppStore();
  const { trips, loading: tripsLoading } = useTrips();
  const { items: bucketList, loading: bucketLoading } = useBucketList();
  const { places: visitedPlaces, loading: placesLoading } = useVisitedPlaces();
  
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [isAddingBucketItem, setIsAddingBucketItem] = useState(false);
  const [isAddingPlace, setIsAddingPlace] = useState(false);

  const stats = [
    { label: 'Upcoming', value: trips.filter((t) => t.status === 'booked').length },
    { label: 'Planning', value: trips.filter((t) => t.status === 'planning').length },
    { label: 'Bucket List', value: bucketList.length },
    { label: 'Countries', value: `${visitedPlaces.length} visited` },
  ];

  const loading = tripsLoading || bucketLoading || placesLoading;

  return (
    <AspectLayout
      aspectId="travel"
      stats={stats}
      aiInsight="Your Tokyo trip is in 60 days! Based on your savings rate, you're on track for your $3,000 budget. Consider booking restaurants now - cherry blossom season gets busy!"
      onAddNew={() => setIsAddingTrip(true)}
      addNewLabel="Add Trip"
    >
      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trips">My Trips</TabsTrigger>
          <TabsTrigger value="bucketlist">Bucket List</TabsTrigger>
          <TabsTrigger value="map">World Map</TabsTrigger>
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
                const config = statusConfig[trip.status as keyof typeof statusConfig];
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
                            <h4 className={cn(
                              "font-semibold text-lg",
                              theme === 'light' ? "text-slate-900" : "text-white"
                            )}>
                              {trip.destination}
                            </h4>
                            <Badge
                              variant="secondary"
                              style={{ backgroundColor: `${config.color}20`, color: config.color }}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <div className={cn(
                            "flex items-center gap-4 mt-2 text-sm",
                            theme === 'light' ? "text-slate-500" : "text-white/60"
                          )}>
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
                            <p className={cn(
                              "text-sm mt-2",
                              theme === 'light' ? "text-slate-500" : "text-white/60"
                            )}>
                              {trip.notes}
                            </p>
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
            {bucketList.map((item) => (
              <Card key={item.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-medium",
                        theme === 'light' ? "text-slate-900" : "text-white"
                      )}>
                        {item.destination}
                      </h4>
                      <p className={cn(
                        "text-sm",
                        theme === 'light' ? "text-slate-500" : "text-white/60"
                      )}>
                        {item.reason}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsAddingBucketItem(true)}>
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[80px]">
                <Plus className={cn(
                  "h-5 w-5 mr-2",
                  theme === 'light' ? "text-slate-400" : "text-white/40"
                )} />
                <span className={cn(
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  Add to Bucket List
                </span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <WorldMap 
            visitedPlaces={visitedPlaces} 
            color="#06B6D4" 
            onAddPlace={() => setIsAddingPlace(true)}
          />
        </TabsContent>

        <TabsContent value="memories" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visitedPlaces.map((memory) => (
              <Card key={memory.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-2 block">{memory.emoji}</span>
                  <h4 className={cn(
                    "font-medium",
                    theme === 'light' ? "text-slate-900" : "text-white"
                  )}>
                    {memory.city || memory.country}
                  </h4>
                  <p className={cn(
                    "text-sm",
                    theme === 'light' ? "text-slate-500" : "text-white/60"
                  )}>
                    {memory.year}
                  </p>
                  {memory.rating && (
                    <div className="flex justify-center gap-1 mt-2">
                      {Array.from({ length: memory.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Trip Dialog */}
      <AddTripDialog
        open={isAddingTrip}
        onOpenChange={setIsAddingTrip}
        onSuccess={() => {}}
      />

      {/* Add Bucket List Item Dialog */}
      <AddBucketListDialog
        open={isAddingBucketItem}
        onOpenChange={setIsAddingBucketItem}
        onSuccess={() => {}}
      />

      {/* Add Visited Place Dialog */}
      <AddVisitedPlaceDialog
        open={isAddingPlace}
        onOpenChange={setIsAddingPlace}
        onSuccess={() => {}}
      />
    </AspectLayout>
  );
}



