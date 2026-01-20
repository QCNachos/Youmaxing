'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Sparkles,
  Package,
  ChefHat,
  Loader2,
  Search,
  Archive,
  CheckCircle,
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

// Common quick-add items
const QUICK_ADD_ITEMS = [
  { name: 'Milk', emoji: '🥛', category: 'dairy' },
  { name: 'Bread', emoji: '🍞', category: 'pantry' },
  { name: 'Eggs', emoji: '🥚', category: 'dairy' },
  { name: 'Butter', emoji: '🧈', category: 'dairy' },
  { name: 'Cheese', emoji: '🧀', category: 'dairy' },
  { name: 'Bananas', emoji: '🍌', category: 'produce' },
  { name: 'Chicken', emoji: '🍗', category: 'meat' },
  { name: 'Rice', emoji: '🍚', category: 'pantry' },
];

// Full categorized item list for picker modal
const CATEGORIZED_ITEMS: Record<string, { name: string; emoji: string }[]> = {
  'Produce': [
    { name: 'Bananas', emoji: '🍌' },
    { name: 'Apples', emoji: '🍎' },
    { name: 'Oranges', emoji: '🍊' },
    { name: 'Lemons', emoji: '🍋' },
    { name: 'Avocados', emoji: '🥑' },
    { name: 'Tomatoes', emoji: '🍅' },
    { name: 'Onions', emoji: '🧅' },
    { name: 'Garlic', emoji: '🧄' },
    { name: 'Potatoes', emoji: '🥔' },
    { name: 'Carrots', emoji: '🥕' },
    { name: 'Broccoli', emoji: '🥦' },
    { name: 'Spinach', emoji: '🥬' },
    { name: 'Lettuce', emoji: '🥗' },
    { name: 'Peppers', emoji: '🫑' },
    { name: 'Mushrooms', emoji: '🍄' },
    { name: 'Cucumbers', emoji: '🥒' },
  ],
  'Dairy': [
    { name: 'Milk', emoji: '🥛' },
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Butter', emoji: '🧈' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Yogurt', emoji: '🥛' },
    { name: 'Cream', emoji: '🥛' },
    { name: 'Sour Cream', emoji: '🥛' },
    { name: 'Cream Cheese', emoji: '🧀' },
  ],
  'Meat': [
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Beef', emoji: '🥩' },
    { name: 'Pork', emoji: '🥓' },
    { name: 'Bacon', emoji: '🥓' },
    { name: 'Ground Beef', emoji: '🍖' },
    { name: 'Salmon', emoji: '🐟' },
    { name: 'Shrimp', emoji: '🦐' },
    { name: 'Turkey', emoji: '🦃' },
  ],
  'Pantry': [
    { name: 'Bread', emoji: '🍞' },
    { name: 'Rice', emoji: '🍚' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Flour', emoji: '🌾' },
    { name: 'Sugar', emoji: '🍬' },
    { name: 'Salt', emoji: '🧂' },
    { name: 'Olive Oil', emoji: '🫒' },
    { name: 'Vegetable Oil', emoji: '🛢️' },
    { name: 'Cereal', emoji: '🥣' },
    { name: 'Oatmeal', emoji: '🥣' },
    { name: 'Peanut Butter', emoji: '🥜' },
    { name: 'Honey', emoji: '🍯' },
    { name: 'Beans', emoji: '🫘' },
    { name: 'Canned Tomatoes', emoji: '🥫' },
  ],
  'Frozen': [
    { name: 'Ice Cream', emoji: '🍨' },
    { name: 'Frozen Pizza', emoji: '🍕' },
    { name: 'Frozen Vegetables', emoji: '🥦' },
    { name: 'Frozen Berries', emoji: '🫐' },
    { name: 'Frozen Chicken', emoji: '🍗' },
  ],
  'Beverages': [
    { name: 'Water', emoji: '💧' },
    { name: 'Orange Juice', emoji: '🍊' },
    { name: 'Coffee', emoji: '☕' },
    { name: 'Tea', emoji: '🍵' },
    { name: 'Soda', emoji: '🥤' },
    { name: 'Beer', emoji: '🍺' },
    { name: 'Wine', emoji: '🍷' },
  ],
  'Snacks': [
    { name: 'Chips', emoji: '🍟' },
    { name: 'Crackers', emoji: '🍘' },
    { name: 'Nuts', emoji: '🥜' },
    { name: 'Cookies', emoji: '🍪' },
    { name: 'Chocolate', emoji: '🍫' },
    { name: 'Popcorn', emoji: '🍿' },
    { name: 'Granola Bars', emoji: '🍫' },
  ],
};

interface GroceryListProps {
  recipes: Recipe[];
  selectedRecipeIds?: string[];
}

export function GroceryList({ recipes, selectedRecipeIds = [] }: GroceryListProps) {
  const {
    groceryList,
    loading,
    allItemsChecked,
    addItem,
    removeItem,
    toggleItem,
    addFromRecipes,
    clearChecked,
    clearAll,
    archiveList,
  } = useGrocery();
  
  const { items: inventoryItems } = useInventory();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showArchivePrompt, setShowArchivePrompt] = useState(false);

  // Handle archive
  const handleArchive = async () => {
    setIsArchiving(true);
    await archiveList();
    setIsArchiving(false);
    setShowArchivePrompt(false);
  };

  // Quick add handler
  const handleQuickAdd = async (itemName: string, category: string) => {
    await addItem({
      name: itemName,
      quantity: 1,
      unit: 'item',
      category,
    });
  };

  // Add from picker modal
  const handlePickerAdd = async (itemName: string, category: string) => {
    await addItem({
      name: itemName,
      quantity: pickerQuantity,
      unit: 'item',
      category,
    });
    setPickerQuantity(1);
  };

  // Filter items in picker based on search
  const getFilteredPickerItems = () => {
    if (!pickerSearch.trim()) return CATEGORIZED_ITEMS;
    
    const searchLower = pickerSearch.toLowerCase();
    const filtered: typeof CATEGORIZED_ITEMS = {};
    
    Object.entries(CATEGORIZED_ITEMS).forEach(([category, items]) => {
      const matchingItems = items.filter(item => 
        item.name.toLowerCase().includes(searchLower)
      );
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems;
      }
    });
    
    return filtered;
  };

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
          {/* Quick Add Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Quick Add</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPickerOpen(true)}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                More Items
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ADD_ITEMS.map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs hover:bg-green-500/10 hover:border-green-500/50"
                  onClick={() => handleQuickAdd(item.name, item.category)}
                >
                  <span className="mr-1">{item.emoji}</span>
                  {item.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Add */}
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
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {allItemsChecked && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>All done!</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleArchive}
                    disabled={isArchiving || items.length === 0}
                    className="text-green-600 border-green-600/30 hover:bg-green-500/10"
                  >
                    {isArchiving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Archive className="h-4 w-4 mr-1" />
                    )}
                    Archive List
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Item Picker Modal */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Add Items to List
            </DialogTitle>
          </DialogHeader>
          
          {/* Search and Quantity */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setPickerQuantity(Math.max(1, pickerQuantity - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{pickerQuantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setPickerQuantity(pickerQuantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Categorized Items */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {Object.entries(getFilteredPickerItems()).map(([category, categoryItems]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {categoryItems.map((item) => (
                      <Button
                        key={item.name}
                        variant="outline"
                        size="sm"
                        className="h-auto py-2 px-2 text-xs justify-start hover:bg-green-500/10 hover:border-green-500/50"
                        onClick={() => handlePickerAdd(item.name, category.toLowerCase())}
                      >
                        <span className="mr-1.5 text-base">{item.emoji}</span>
                        <span className="truncate">{item.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(getFilteredPickerItems()).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items match "{pickerSearch}"</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

