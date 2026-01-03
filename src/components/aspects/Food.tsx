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
  Utensils, 
  Coffee,
  Sun,
  Moon,
  Apple,
  Plus,
  Flame,
  Droplets,
} from 'lucide-react';
import type { Meal } from '@/types/database';
import { format } from 'date-fns';

const mockMeals: Meal[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Avocado Toast with Eggs',
    type: 'breakfast',
    calories: 450,
    notes: null,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    name: 'Grilled Chicken Salad',
    type: 'lunch',
    calories: 520,
    notes: 'Extra dressing',
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const mealTypeConfig = {
  breakfast: { icon: Coffee, color: '#F59E0B', label: 'Breakfast' },
  lunch: { icon: Sun, color: '#22C55E', label: 'Lunch' },
  dinner: { icon: Moon, color: '#8B5CF6', label: 'Dinner' },
  snack: { icon: Apple, color: '#EC4899', label: 'Snack' },
};

const quickMeals = [
  { name: 'Oatmeal with Fruits', type: 'breakfast', calories: 350 },
  { name: 'Caesar Salad', type: 'lunch', calories: 400 },
  { name: 'Grilled Salmon', type: 'dinner', calories: 600 },
  { name: 'Protein Shake', type: 'snack', calories: 200 },
];

export function Food() {
  const [meals, setMeals] = useState<Meal[]>(mockMeals);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'lunch' as Meal['type'],
    calories: 0,
    notes: '',
  });

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const targetCalories = 2000;

  const stats = [
    { label: 'Today', value: `${totalCalories} cal`, trend: 'up' as const },
    { label: 'Target', value: `${targetCalories} cal` },
    { label: 'Meals Logged', value: meals.length },
    { label: 'Water', value: '6 glasses', trend: 'up' as const },
  ];

  const addMeal = () => {
    const meal: Meal = {
      id: Date.now().toString(),
      user_id: '1',
      ...newMeal,
      logged_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setMeals([meal, ...meals]);
    setIsAddingMeal(false);
    setNewMeal({ name: '', type: 'lunch', calories: 0, notes: '' });
  };

  return (
    <AspectLayout
      aspectId="food"
      stats={stats}
      aiInsight="You're doing great with protein intake! Consider adding more leafy greens to your dinner for better micronutrients."
      onAddNew={() => setIsAddingMeal(true)}
      addNewLabel="Log Meal"
    >
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="quickadd">Quick Add</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {/* Calorie Progress */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Calories Today
                </span>
                <span className="text-sm text-muted-foreground">
                  {totalCalories} / {targetCalories}
                </span>
              </div>
              <Progress value={(totalCalories / targetCalories) * 100} className="h-2" />
            </CardContent>
          </Card>

          {meals.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="No meals logged today"
              description="Start tracking your nutrition by logging your first meal."
              actionLabel="Log Meal"
              onAction={() => setIsAddingMeal(true)}
            />
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => {
                const config = mealTypeConfig[meal.type];
                const Icon = config.icon;
                return (
                  <Card key={meal.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${config.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{meal.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                              {config.label}
                            </Badge>
                            {meal.calories && (
                              <span className="text-sm text-muted-foreground">
                                {meal.calories} cal
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(meal.logged_at), 'HH:mm')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quickadd" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickMeals.map((meal, index) => {
              const config = mealTypeConfig[meal.type as keyof typeof mealTypeConfig];
              const Icon = config.icon;
              return (
                <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{meal.name}</h4>
                        <p className="text-sm text-muted-foreground">{meal.calories} cal</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewMeal({
                            name: meal.name,
                            type: meal.type as Meal['type'],
                            calories: meal.calories,
                            notes: '',
                          });
                          setIsAddingMeal(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Macros Today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Protein', value: 85, target: 120, color: '#EF4444' },
                  { name: 'Carbs', value: 180, target: 250, color: '#F59E0B' },
                  { name: 'Fat', value: 45, target: 65, color: '#22C55E' },
                ].map((macro) => (
                  <div key={macro.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{macro.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {macro.value}g / {macro.target}g
                      </span>
                    </div>
                    <Progress value={(macro.value / macro.target) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Hydration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                    <div
                      key={glass}
                      className={`w-8 h-12 rounded-lg border-2 ${
                        glass <= 6 ? 'bg-blue-500/20 border-blue-500' : 'border-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  6 of 8 glasses today
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Meal Dialog */}
      <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Meal Name</Label>
              <Input
                placeholder="e.g., Grilled Chicken Salad"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(mealTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={newMeal.type === type ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3"
                      style={newMeal.type === type ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewMeal({ ...newMeal, type: type as Meal['type'] })}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Calories (optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newMeal.calories || ''}
                onChange={(e) => setNewMeal({ ...newMeal, calories: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Any details..."
                value={newMeal.notes}
                onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addMeal}
              disabled={!newMeal.name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Meal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

