'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  Package, 
  DollarSign,
  Plus,
  Check,
  X,
  Calendar,
  MapPin,
  FileText,
} from 'lucide-react';

interface TripPlan {
  destination: string;
  startDate: string;
  endDate: string;
  budget: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
  };
  packingList: { item: string; packed: boolean }[];
  thingsToDo: { activity: string; done: boolean; priority: 'high' | 'medium' | 'low' }[];
  restaurants: { name: string; cuisine: string; notes: string }[];
  notes: string;
}

interface TripPlanningTemplateProps {
  tripName?: string;
  onSave?: (plan: TripPlan) => void;
}

export function TripPlanningTemplate({ tripName, onSave }: TripPlanningTemplateProps) {
  const { theme } = useAppStore();
  const [plan, setPlan] = useState<TripPlan>({
    destination: tripName || '',
    startDate: '',
    endDate: '',
    budget: {
      flights: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      other: 0,
    },
    packingList: [
      { item: 'Passport & ID', packed: false },
      { item: 'Phone charger', packed: false },
      { item: 'Medications', packed: false },
    ],
    thingsToDo: [],
    restaurants: [],
    notes: '',
  });

  const [newPackingItem, setNewPackingItem] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newActivityPriority, setNewActivityPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', notes: '' });

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';
  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10';

  const totalBudget = Object.values(plan.budget).reduce((sum, val) => sum + val, 0);

  const addPackingItem = () => {
    if (newPackingItem.trim()) {
      setPlan({
        ...plan,
        packingList: [...plan.packingList, { item: newPackingItem, packed: false }],
      });
      setNewPackingItem('');
    }
  };

  const togglePacked = (index: number) => {
    const updated = [...plan.packingList];
    updated[index].packed = !updated[index].packed;
    setPlan({ ...plan, packingList: updated });
  };

  const removePackingItem = (index: number) => {
    setPlan({
      ...plan,
      packingList: plan.packingList.filter((_, i) => i !== index),
    });
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setPlan({
        ...plan,
        thingsToDo: [...plan.thingsToDo, { activity: newActivity, done: false, priority: newActivityPriority }],
      });
      setNewActivity('');
      setNewActivityPriority('medium');
    }
  };

  const toggleActivity = (index: number) => {
    const updated = [...plan.thingsToDo];
    updated[index].done = !updated[index].done;
    setPlan({ ...plan, thingsToDo: updated });
  };

  const removeActivity = (index: number) => {
    setPlan({
      ...plan,
      thingsToDo: plan.thingsToDo.filter((_, i) => i !== index),
    });
  };

  const addRestaurant = () => {
    if (newRestaurant.name.trim()) {
      setPlan({
        ...plan,
        restaurants: [...plan.restaurants, newRestaurant],
      });
      setNewRestaurant({ name: '', cuisine: '', notes: '' });
    }
  };

  const removeRestaurant = (index: number) => {
    setPlan({
      ...plan,
      restaurants: plan.restaurants.filter((_, i) => i !== index),
    });
  };

  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#22C55E',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={cn("border", cardBg)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Trip Planning Template
            </CardTitle>
            {onSave && (
              <Button onClick={() => onSave(plan)} size="sm">
                Save Plan
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={plan.destination}
                onChange={(e) => setPlan({ ...plan, destination: e.target.value })}
                placeholder="e.g., Tokyo, Japan"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={plan.startDate}
                onChange={(e) => setPlan({ ...plan, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={plan.endDate}
                onChange={(e) => setPlan({ ...plan, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      <Card className={cn("border", cardBg)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'flights', label: 'Flights', icon: Plane },
              { key: 'accommodation', label: 'Accommodation', icon: Hotel },
              { key: 'food', label: 'Food', icon: Utensils },
              { key: 'activities', label: 'Activities', icon: Camera },
              { key: 'other', label: 'Other', icon: Package },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="space-y-2">
                <Label className="flex items-center gap-2 text-xs">
                  <Icon className="h-3 w-3" />
                  {label}
                </Label>
                <Input
                  type="number"
                  value={plan.budget[key as keyof typeof plan.budget] || ''}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      budget: { ...plan.budget, [key]: parseFloat(e.target.value) || 0 },
                    })
                  }
                  placeholder="$0"
                />
              </div>
            ))}
          </div>
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className={cn("font-semibold", textPrimary)}>Total Budget:</span>
              <span className="text-2xl font-bold text-primary">
                ${totalBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packing List */}
      <Card className={cn("border", cardBg)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Packing List
            <Badge variant="secondary" className="ml-2">
              {plan.packingList.filter(i => i.packed).length}/{plan.packingList.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newPackingItem}
              onChange={(e) => setNewPackingItem(e.target.value)}
              placeholder="Add item to pack..."
              onKeyDown={(e) => e.key === 'Enter' && addPackingItem()}
            />
            <Button onClick={addPackingItem} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {plan.packingList.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                )}
              >
                <button
                  onClick={() => togglePacked(index)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    item.packed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {item.packed && <Check className="h-3 w-3 text-white" />}
                </button>
                <span
                  className={cn(
                    "flex-1",
                    item.packed ? 'line-through opacity-50' : '',
                    textPrimary
                  )}
                >
                  {item.item}
                </span>
                <button
                  onClick={() => removePackingItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Things to Do */}
      <Card className={cn("border", cardBg)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Things to Do
            <Badge variant="secondary" className="ml-2">
              {plan.thingsToDo.filter(a => a.done).length}/{plan.thingsToDo.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Add activity..."
              onKeyDown={(e) => e.key === 'Enter' && addActivity()}
              className="flex-1"
            />
            <select
              value={newActivityPriority}
              onChange={(e) => setNewActivityPriority(e.target.value as 'high' | 'medium' | 'low')}
              className={cn(
                "px-3 py-2 rounded-md border text-sm",
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-white/5 border-white/10 text-white'
              )}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button onClick={addActivity} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {plan.thingsToDo.map((activity, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                )}
              >
                <button
                  onClick={() => toggleActivity(index)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    activity.done
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {activity.done && <Check className="h-3 w-3 text-white" />}
                </button>
                <span
                  className={cn(
                    "flex-1",
                    activity.done ? 'line-through opacity-50' : '',
                    textPrimary
                  )}
                >
                  {activity.activity}
                </span>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: priorityColors[activity.priority],
                    color: priorityColors[activity.priority],
                  }}
                  className="text-xs"
                >
                  {activity.priority}
                </Badge>
                <button
                  onClick={() => removeActivity(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restaurants */}
      <Card className={cn("border", cardBg)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Restaurants & Places to Eat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newRestaurant.name}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
              placeholder="Restaurant name"
            />
            <Input
              value={newRestaurant.cuisine}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
              placeholder="Cuisine type"
            />
            <div className="flex gap-2">
              <Input
                value={newRestaurant.notes}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, notes: e.target.value })}
                placeholder="Notes"
              />
              <Button onClick={addRestaurant} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {plan.restaurants.map((restaurant, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  theme === 'light' ? 'bg-slate-50' : 'bg-white/5'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", textPrimary)}>{restaurant.name}</span>
                    {restaurant.cuisine && (
                      <Badge variant="secondary" className="text-xs">
                        {restaurant.cuisine}
                      </Badge>
                    )}
                  </div>
                  {restaurant.notes && (
                    <p className={cn("text-sm mt-1", textSecondary)}>{restaurant.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => removeRestaurant(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className={cn("border", cardBg)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={plan.notes}
            onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
            placeholder="Important information, visa requirements, emergency contacts, etc."
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}

