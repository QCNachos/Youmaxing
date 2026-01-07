'use client';

import { useState } from 'react';
import { AspectLayout, EmptyState } from './AspectLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// Load map dynamically (client-side only) to avoid SSR issues
const InteractiveWorldMap = dynamic(
  () => import('@/components/InteractiveWorldMap').then(mod => ({ default: mod.InteractiveWorldMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[2/1] rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-white/60">Loading map...</p>
      </div>
    )
  }
);
import { useTrips, useBucketList, useVisitedPlaces } from '@/hooks/useTravel';
import { AddTripDialog } from '@/components/travel/AddTripDialog';
import { AddBucketListDialog } from '@/components/travel/AddBucketListDialog';
import { AddVisitedPlaceDialog } from '@/components/travel/AddVisitedPlaceDialog';
import { EditTripDialog } from '@/components/travel/EditTripDialog';
import { EditBucketListDialog } from '@/components/travel/EditBucketListDialog';
import { EditVisitedPlaceDialog } from '@/components/travel/EditVisitedPlaceDialog';
import { TripPlanningTemplate } from '@/components/travel/TripPlanningTemplate';


const statusConfig = {
  dream: { label: 'Dream', icon: Heart, color: '#EC4899' },
  planning: { label: 'Planning', icon: Clock, color: '#F59E0B' },
  booked: { label: 'Booked', icon: Calendar, color: '#3B82F6' },
  completed: { label: 'Completed', icon: CheckCircle, color: '#22C55E' },
};

export function Travel() {
  console.log('Travel component rendered - version with Edit buttons');
  
  const { theme } = useAppStore();
  const { trips } = useTrips();
  const { items: bucketList } = useBucketList();
  const { places: visitedPlaces } = useVisitedPlaces();
  
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [isAddingBucketItem, setIsAddingBucketItem] = useState(false);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [editingTrip, setEditingTrip] = useState<typeof trips[0] | null>(null);
  const [editingBucketItem, setEditingBucketItem] = useState<typeof bucketList[0] | null>(null);
  const [editingPlace, setEditingPlace] = useState<typeof visitedPlaces[0] | null>(null);


  const stats = [
    { label: 'Upcoming', value: trips.filter((t) => t.status === 'booked').length },
    { label: 'Planning', value: trips.filter((t) => t.status === 'planning').length },
    { label: 'Bucket List', value: bucketList.length },
    { label: 'Countries', value: `${visitedPlaces.length} visited` },
  ];

  return (
    <AspectLayout
      aspectId="travel"
      stats={stats}
      aiInsight="Your Tokyo trip is in 60 days! Based on your savings rate, you're on track for your $3,000 budget. Consider booking restaurants now - cherry blossom season gets busy!"
      onAddNew={() => setIsAddingTrip(true)}
      addNewLabel="Add Trip"
    >
      {/* VISUAL TEST - RED BANNER */}
      <div className="bg-red-600 text-white p-6 mb-4 rounded-lg text-center font-bold text-2xl border-4 border-yellow-400">
        🔴 TEST: If you see this RED BOX, new code is loaded! Edit buttons are on cards below! 🔴
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          onClick={() => setIsAddingTrip(true)}
          className="bg-gradient-to-r from-violet-600 to-pink-600"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Trip
        </Button>
        <Button
          onClick={() => setIsAddingBucketItem(true)}
          variant="outline"
          size="sm"
        >
          <Heart className="h-4 w-4 mr-2" />
          Add to Bucket List
        </Button>
        <Button
          onClick={() => setIsAddingPlace(true)}
          variant="outline"
          size="sm"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Log Visited Place
        </Button>
      </div>

      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trips">✏️ TRIPS (CLICK TO EDIT)</TabsTrigger>
          <TabsTrigger value="planner">Plan Trip</TabsTrigger>
          <TabsTrigger value="bucketlist">✏️ BUCKET (CLICK TO EDIT)</TabsTrigger>
          <TabsTrigger value="map">World Map</TabsTrigger>
          <TabsTrigger value="memories">✏️ MEMORIES (CLICK TO EDIT)</TabsTrigger>
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
                    <CardFooter className="border-t border-white/10 !py-3">
                      <Button
                        onClick={() => {
                          console.log('EDIT TRIP BUTTON CLICKED');
                          setEditingTrip(trip);
                        }}
                        size="sm"
                        variant="ghost"
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Trip
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planner" className="mt-6">
          <TripPlanningTemplate />
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
                <CardFooter className="border-t border-white/10 !py-3">
                  <Button
                    onClick={() => {
                      console.log('EDIT BUCKET ITEM BUTTON CLICKED');
                      setEditingBucketItem(item);
                    }}
                    size="sm"
                    variant="ghost"
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardFooter>
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
          <InteractiveWorldMap 
            visitedPlaces={visitedPlaces.map(place => ({
              id: place.id,
              country: place.country,
              city: place.city || undefined,
              year: place.year,
              emoji: place.emoji || '🌍',
              coordinates: { x: place.coordinates_x, y: place.coordinates_y },
              notes: place.notes || undefined,
              rating: place.rating || undefined
            }))} 
            color="#06B6D4" 
            onAddPlace={() => setIsAddingPlace(true)}
            onPlaceClick={(place) => {
              // Find the full place object from visitedPlaces
              const fullPlace = visitedPlaces.find(p => p.id === place.id);
              if (fullPlace) setEditingPlace(fullPlace);
            }}
          />
        </TabsContent>

        <TabsContent value="memories" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visitedPlaces.map((memory) => (
              <Card key={memory.id} className="hover:border-primary/50 transition-colors relative group">
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
                <CardFooter className="border-t border-white/10 !py-2">
                  <Button
                    onClick={() => {
                      console.log('EDIT PLACE BUTTON CLICKED');
                      setEditingPlace(memory);
                    }}
                    size="sm"
                    variant="ghost"
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardFooter>
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

      {/* Edit Trip Dialog */}
      <EditTripDialog
        open={!!editingTrip}
        onOpenChange={(open) => !open && setEditingTrip(null)}
        trip={editingTrip}
        onSuccess={() => setEditingTrip(null)}
      />

      {/* Edit Bucket List Dialog */}
      <EditBucketListDialog
        open={!!editingBucketItem}
        onOpenChange={(open) => !open && setEditingBucketItem(null)}
        item={editingBucketItem}
        onSuccess={() => setEditingBucketItem(null)}
      />

      {/* Edit Visited Place Dialog */}
      <EditVisitedPlaceDialog
        open={!!editingPlace}
        onOpenChange={(open) => !open && setEditingPlace(null)}
        place={editingPlace}
        onSuccess={() => setEditingPlace(null)}
      />
    </AspectLayout>
  );
}



