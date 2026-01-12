'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Heart, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChefHat,
  Flame,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Recipe } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onMarkCooked?: (id: string) => void;
  onClick?: (recipe: Recipe) => void;
  compact?: boolean;
}

const difficultyColors = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
};

export function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onToggleFavorite,
  onMarkCooked,
  onClick,
  compact = false,
}: RecipeCardProps) {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  if (compact) {
    return (
      <Card 
        className="hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => onClick?.(recipe)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <ChefHat className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{recipe.name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {totalTime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {totalTime}m
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {recipe.servings}
                </span>
              </div>
            </div>
            {recipe.is_favorite && (
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/50 transition-colors overflow-hidden">
      {recipe.image_url && (
        <div 
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${recipe.image_url})` }}
        />
      )}
      <CardContent className={cn("p-4", !recipe.image_url && "pt-4")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold truncate cursor-pointer hover:text-primary"
                onClick={() => onClick?.(recipe)}
              >
                {recipe.name}
              </h3>
              {recipe.is_favorite && (
                <Heart className="h-4 w-4 text-red-500 fill-red-500 flex-shrink-0" />
              )}
            </div>
            {recipe.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(recipe)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite?.(recipe.id)}>
                <Heart className={cn("h-4 w-4 mr-2", recipe.is_favorite && "fill-current")} />
                {recipe.is_favorite ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMarkCooked?.(recipe.id)}>
                <ChefHat className="h-4 w-4 mr-2" />
                Mark as Cooked
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(recipe.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {totalTime > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          {recipe.nutrition_per_serving?.calories && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Flame className="h-4 w-4" />
              <span>{recipe.nutrition_per_serving.calories} cal</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {recipe.difficulty && (
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: `${difficultyColors[recipe.difficulty]}20`,
                color: difficultyColors[recipe.difficulty],
              }}
            >
              {recipe.difficulty}
            </Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline">{recipe.cuisine}</Badge>
          )}
          {recipe.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{recipe.tags.length - 2}
            </Badge>
          )}
        </div>

        {recipe.times_cooked > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Cooked {recipe.times_cooked} time{recipe.times_cooked > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

