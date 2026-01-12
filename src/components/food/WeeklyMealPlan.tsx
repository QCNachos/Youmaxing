'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Coffee,
  Sun,
  Moon,
  Apple,
  X,
  Search,
  Calendar,
} from 'lucide-react';
import { format, isToday, addDays } from 'date-fns';
import { ExportShareButtons } from './ExportShareButtons';
import {
  generatePDF,
  generateMealPlanPDFContent,
  shareContent,
  generateMealPlanShareText,
} from '@/lib/exportUtils';
import { useMealPlan, type MealSlot, type PlannedMeal } from '@/hooks/useMealPlan';
import type { Recipe } from '@/hooks/useRecipes';
import { RecipeCard } from './RecipeCard';
import { cn } from '@/lib/utils';

interface WeeklyMealPlanProps {
  recipes: Recipe[];
}

const mealSlots: { slot: MealSlot; icon: typeof Coffee; label: string; color: string }[] = [
  { slot: 'breakfast', icon: Coffee, label: 'Breakfast', color: '#F59E0B' },
  { slot: 'lunch', icon: Sun, label: 'Lunch', color: '#22C55E' },
  { slot: 'dinner', icon: Moon, label: 'Dinner', color: '#8B5CF6' },
  { slot: 'snack', icon: Apple, label: 'Snack', color: '#EC4899' },
];

export function WeeklyMealPlan({ recipes }: WeeklyMealPlanProps) {
  const {
    mealPlan,
    loading,
    currentWeekStart,
    getWeekDates,
    getDayPlan,
    setMealForDay,
    removeMealFromDay,
    goToNextWeek,
    goToPreviousWeek,
  } = useMealPlan();

  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customMeal, setCustomMeal] = useState('');

  const weekDates = getWeekDates();

  // Export/Share handlers
  const handleExportPDF = () => {
    const days = weekDates.map(date => {
      const dayPlan = getDayPlan(date);
      return {
        date: format(date, 'EEEE, MMM d'),
        breakfast: dayPlan?.breakfast?.recipeName || dayPlan?.breakfast?.customMeal,
        lunch: dayPlan?.lunch?.recipeName || dayPlan?.lunch?.customMeal,
        dinner: dayPlan?.dinner?.recipeName || dayPlan?.dinner?.customMeal,
        snacks: dayPlan?.snacks?.map(s => s.recipeName || s.customMeal || '').filter(Boolean),
      };
    });

    const html = generateMealPlanPDFContent({
      title: 'Weekly Meal Plan',
      weekStart: format(currentWeekStart, 'MMM d'),
      weekEnd: format(addDays(currentWeekStart, 6), 'MMM d, yyyy'),
      days,
      generatedAt: new Date().toISOString(),
    });

    generatePDF(html, `meal-plan-${format(currentWeekStart, 'yyyy-MM-dd')}`);
  };

  const handleShare = async (): Promise<boolean> => {
    const days = weekDates.map(date => {
      const dayPlan = getDayPlan(date);
      return {
        date: format(date, 'EEEE, MMM d'),
        breakfast: dayPlan?.breakfast?.recipeName || dayPlan?.breakfast?.customMeal,
        lunch: dayPlan?.lunch?.recipeName || dayPlan?.lunch?.customMeal,
        dinner: dayPlan?.dinner?.recipeName || dayPlan?.dinner?.customMeal,
        snacks: dayPlan?.snacks?.map(s => s.recipeName || s.customMeal || '').filter(Boolean),
      };
    });

    const text = generateMealPlanShareText(days);
    return shareContent(
      'Weekly Meal Plan',
      text
    );
  };

  const filteredRecipes = searchQuery
    ? recipes.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recipes;

  const handleAddMeal = (date: Date, slot: MealSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setSearchQuery('');
    setCustomMeal('');
    setIsAddingMeal(true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!selectedDate || !selectedSlot) return;
    
    await setMealForDay(selectedDate, selectedSlot, {
      recipeId: recipe.id,
      recipeName: recipe.name,
    });
    
    setIsAddingMeal(false);
  };

  const handleAddCustomMeal = async () => {
    if (!selectedDate || !selectedSlot || !customMeal.trim()) return;
    
    await setMealForDay(selectedDate, selectedSlot, {
      customMeal: customMeal.trim(),
    });
    
    setIsAddingMeal(false);
  };

  const handleRemoveMeal = async (date: Date, slot: MealSlot, snackIndex?: number) => {
    await removeMealFromDay(date, slot, snackIndex);
  };

  const renderMealSlot = (date: Date, slotConfig: typeof mealSlots[0]) => {
    const dayPlan = getDayPlan(date);
    const { slot, icon: Icon, label, color } = slotConfig;
    
    let meals: PlannedMeal[] = [];
    if (slot === 'snack' && dayPlan?.snacks) {
      meals = dayPlan.snacks;
    } else if (dayPlan && slot !== 'snack' && dayPlan[slot]) {
      meals = [dayPlan[slot]!];
    }

    return (
      <div key={slot} className="space-y-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" style={{ color }} />
          {label}
        </div>
        {meals.length > 0 ? (
          meals.map((meal, idx) => (
            <div 
              key={idx}
              className="group relative text-xs p-1.5 rounded bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="line-clamp-1">
                {meal.recipeName || meal.customMeal}
              </span>
              <button
                onClick={() => handleRemoveMeal(date, slot, slot === 'snack' ? idx : undefined)}
                className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))
        ) : (
          <button
            onClick={() => handleAddMeal(date, slot)}
            className="w-full text-xs p-1.5 rounded border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3 w-3 inline mr-1" />
            Add
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading meal plan...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Weekly Meal Plan
              <ExportShareButtons
                onExportPDF={handleExportPDF}
                onShare={handleShare}
              />
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(currentWeekStart, 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
              </span>
              <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => (
              <div 
                key={date.toISOString()}
                className={cn(
                  "p-2 rounded-lg border min-h-[200px]",
                  isToday(date) && "border-primary bg-primary/5"
                )}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground">
                    {format(date, 'EEE')}
                  </div>
                  <div className={cn(
                    "text-lg font-semibold",
                    isToday(date) && "text-primary"
                  )}>
                    {format(date, 'd')}
                  </div>
                </div>
                <div className="space-y-2">
                  {mealSlots.map((slotConfig) => renderMealSlot(date, slotConfig))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Meal Dialog */}
      <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add {selectedSlot && mealSlots.find(s => s.slot === selectedSlot)?.label}
              {selectedDate && ` - ${format(selectedDate, 'EEEE, MMM d')}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Custom meal input */}
            <div className="space-y-2">
              <Label>Quick add (custom meal)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Leftovers, Eating out..."
                  value={customMeal}
                  onChange={(e) => setCustomMeal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMeal()}
                />
                <Button onClick={handleAddCustomMeal} disabled={!customMeal.trim()}>
                  Add
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or select a recipe
                </span>
              </div>
            </div>

            {/* Recipe search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Recipe list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className="cursor-pointer"
                  >
                    <RecipeCard recipe={recipe} compact />
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {searchQuery ? 'No recipes found' : 'No recipes yet. Add some first!'}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

