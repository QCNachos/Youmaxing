'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Sparkles,
  Package,
  ChefHat,
  Loader2,
} from 'lucide-react';
import { useGrocery, type GroceryItem } from '@/hooks/useGrocery';
import { ExportShareButtons } from './ExportShareButtons';
import {
  generatePDF,
  generateGroceryPDFContent,
  shareContent,
  generateGroceryShareText,
} from '@/lib/exportUtils';
import { useInventory } from '@/hooks/useInventory';
import type { Recipe } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';

interface GroceryListProps {
  recipes: Recipe[];
  selectedRecipeIds?: string[];
}

export function GroceryList({ recipes, selectedRecipeIds = [] }: GroceryListProps) {
  const {
    groceryList,
    loading,
    addItem,
    removeItem,
    toggleItem,
    addFromRecipes,
    clearChecked,
    clearAll,
  } = useGrocery();
  
  const { items: inventoryItems } = useInventory();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    
    await addItem({
      name: newItemName.trim(),
      quantity: parseFloat(newItemQty) || 1,
      unit: newItemUnit.trim() || 'item',
    });
    
    setNewItemName('');
    setNewItemQty('1');
    setNewItemUnit('');
  };

  const handleGenerateFromRecipes = async () => {
    if (selectedRecipeIds.length === 0) return;
    
    setIsGenerating(true);
    const selectedRecipes = recipes.filter(r => selectedRecipeIds.includes(r.id));
    await addFromRecipes(selectedRecipes, inventoryItems);
    setIsGenerating(false);
  };

  const items = groceryList?.items || [];
  const checkedItems = items.filter(i => i.checked);
  const uncheckedItems = items.filter(i => !i.checked);

  // Export/Share handlers
  const handleExportPDF = () => {
    const html = generateGroceryPDFContent({
      title: groceryList?.name || 'Shopping List',
      items: uncheckedItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
      })),
      generatedAt: new Date().toISOString(),
    });

    generatePDF(html, `grocery-list-${new Date().toISOString().split('T')[0]}`);
  };

  const handleShare = async (): Promise<boolean> => {
    const text = generateGroceryShareText(
      uncheckedItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
      }))
    );
    return shareContent(
      groceryList?.name || 'Shopping List',
      text
    );
  };

  // Group by category if available
  const groupedUnchecked = uncheckedItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading grocery list...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Generate from recipes */}
      {selectedRecipeIds.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Generate from {selectedRecipeIds.length} recipe(s)</p>
                  <p className="text-xs text-muted-foreground">
                    AI will add ingredients, minus what you have in inventory
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleGenerateFromRecipes}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new item */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-500" />
            Grocery List
            <ExportShareButtons
              onExportPDF={handleExportPDF}
              onShare={handleShare}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1"
            />
            <Input
              placeholder="Qty"
              type="number"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="w-20"
            />
            <Input
              placeholder="Unit"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="w-24"
            />
            <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Your grocery list is empty</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add items manually or generate from your meal plan
              </p>
            </div>
          ) : (
            <>
              {/* Unchecked items grouped by category */}
              {Object.entries(groupedUnchecked).map(([category, categoryItems]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div className="flex-1">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {item.quantity} {item.unit}
                        </span>
                        {item.recipeName && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <ChefHat className="h-3 w-3 mr-1" />
                            {item.recipeName}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}

              {/* Checked items */}
              {checkedItems.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Completed ({checkedItems.length})
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearChecked}
                      className="text-xs"
                    >
                      Clear completed
                    </Button>
                  </div>
                  {checkedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg opacity-50"
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <span className="text-sm line-through flex-1">
                        {item.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          {item.quantity} {item.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

