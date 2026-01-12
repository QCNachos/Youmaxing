'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  ChefHat,
  Clock,
  Users,
  X,
} from 'lucide-react';
import type { Recipe, RecipeInsert, RecipeIngredient, RecipeInstruction } from '@/hooks/useRecipes';

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: RecipeInsert) => Promise<void>;
  editingRecipe?: Recipe | null;
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: '#22C55E' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'hard', label: 'Hard', color: '#EF4444' },
];

const defaultIngredient: RecipeIngredient = { name: '', quantity: 1, unit: '' };
const defaultInstruction: RecipeInstruction = { step: 1, text: '' };

export function AddRecipeDialog({ 
  open, 
  onOpenChange, 
  onSave,
  editingRecipe,
}: AddRecipeDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(2);
  const [prepTime, setPrepTime] = useState<number | ''>('');
  const [cookTime, setCookTime] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [cuisine, setCuisine] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ ...defaultIngredient }]);
  const [instructions, setInstructions] = useState<RecipeInstruction[]>([{ ...defaultInstruction }]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setDescription(editingRecipe.description || '');
      setServings(editingRecipe.servings);
      setPrepTime(editingRecipe.prep_time_minutes || '');
      setCookTime(editingRecipe.cook_time_minutes || '');
      setDifficulty(editingRecipe.difficulty);
      setCuisine(editingRecipe.cuisine || '');
      setIngredients(editingRecipe.ingredients.length > 0 ? editingRecipe.ingredients : [{ ...defaultIngredient }]);
      setInstructions(editingRecipe.instructions.length > 0 ? editingRecipe.instructions : [{ ...defaultInstruction }]);
      setTags(editingRecipe.tags);
      setSourceUrl(editingRecipe.source_url || '');
    } else {
      resetForm();
    }
  }, [editingRecipe, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setServings(2);
    setPrepTime('');
    setCookTime('');
    setDifficulty(null);
    setCuisine('');
    setIngredients([{ ...defaultIngredient }]);
    setInstructions([{ ...defaultInstruction }]);
    setTags([]);
    setTagInput('');
    setSourceUrl('');
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ...defaultIngredient }]);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, { step: instructions.length + 1, text: '' }]);
  };

  const updateInstruction = (index: number, text: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], text };
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }));
      setInstructions(updated);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      const recipe: RecipeInsert = {
        name: name.trim(),
        description: description.trim() || null,
        servings,
        prep_time_minutes: prepTime || null,
        cook_time_minutes: cookTime || null,
        difficulty,
        cuisine: cuisine.trim() || null,
        ingredients: ingredients.filter(i => i.name.trim()),
        instructions: instructions.filter(i => i.text.trim()),
        nutrition_per_serving: null,
        image_url: null,
        tags,
        is_favorite: editingRecipe?.is_favorite || false,
        source_url: sourceUrl.trim() || null,
      };

      await onSave(recipe);
      onOpenChange(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-green-500" />
            {editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipe Name *</Label>
              <Input
                placeholder="e.g., Chicken Stir Fry"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the dish..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Servings
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Prep (min)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : '')}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Cook (min)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : '')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="flex gap-2">
                  {difficultyOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={difficulty === opt.value ? 'default' : 'outline'}
                      size="sm"
                      style={difficulty === opt.value ? { backgroundColor: opt.color } : undefined}
                      onClick={() => setDifficulty(opt.value as 'easy' | 'medium' | 'hard')}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cuisine</Label>
                <Input
                  placeholder="e.g., Italian, Asian..."
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <Label>Ingredients</Label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Qty"
                  type="number"
                  min={0}
                  step="0.1"
                  className="w-20"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                />
                <Input
                  placeholder="Unit"
                  className="w-24"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                />
                <Input
                  placeholder="Ingredient name"
                  className="flex-1"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <Label>Instructions</Label>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="w-8 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                  {instruction.step}
                </div>
                <Textarea
                  placeholder={`Step ${instruction.step}...`}
                  className="flex-1"
                  rows={2}
                  value={instruction.text}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                  disabled={instructions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInstruction}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <Label>Source URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {saving ? 'Saving...' : editingRecipe ? 'Update Recipe' : 'Add Recipe'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

