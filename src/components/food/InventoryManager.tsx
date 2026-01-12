'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit,
  AlertTriangle,
  Refrigerator,
  Snowflake,
  Archive,
  Search,
  Minus,
  Calendar,
  Lock,
} from 'lucide-react';
import { useInventory, type InventoryItem, type InventoryItemInsert, type InventoryLocation, type InventoryCategory } from '@/hooks/useInventory';
import { format, differenceInDays } from 'date-fns';
import { ExportShareButtons } from './ExportShareButtons';
import {
  generatePDF,
  generateInventoryPDFContent,
  shareContent,
  generateInventoryShareText,
} from '@/lib/exportUtils';
import { cn } from '@/lib/utils';

interface InventoryManagerProps {
  isPremium?: boolean;
}

const locationConfig = {
  pantry: { icon: Archive, label: 'Pantry', color: '#F59E0B' },
  fridge: { icon: Refrigerator, label: 'Fridge', color: '#3B82F6' },
  freezer: { icon: Snowflake, label: 'Freezer', color: '#06B6D4' },
};

const categoryOptions: { value: InventoryCategory; label: string }[] = [
  { value: 'produce', label: 'Produce' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'grains', label: 'Grains' },
  { value: 'canned', label: 'Canned' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'spices', label: 'Spices' },
  { value: 'other', label: 'Other' },
];

export function InventoryManager({ isPremium = false }: InventoryManagerProps) {
  const {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getByLocation,
    getExpiringSoon,
    getExpired,
    adjustQuantity,
  } = useInventory();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<InventoryLocation>('fridge');

  // Form state
  const [formData, setFormData] = useState<Partial<InventoryItemInsert>>({
    name: '',
    quantity: 1,
    unit: '',
    location: 'fridge',
    category: null,
    expiration_date: null,
    notes: null,
  });

  const expiringItems = getExpiringSoon(7);
  const expiredItems = getExpired();
  const locationItems = getByLocation(selectedLocation);
  
  const filteredItems = searchQuery
    ? locationItems.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locationItems;

  // Export/Share handlers
  const handleExportPDF = () => {
    const html = generateInventoryPDFContent({
      title: `${locationConfig[selectedLocation].label} Inventory`,
      items: filteredItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit || 'items',
        location: locationConfig[i.location].label,
        expiration_date: i.expiration_date,
      })),
      location: locationConfig[selectedLocation].label,
      generatedAt: new Date().toISOString(),
    });

    generatePDF(html, `inventory-${selectedLocation}-${new Date().toISOString().split('T')[0]}`);
  };

  const handleShare = async (): Promise<boolean> => {
    const text = generateInventoryShareText(
      filteredItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit || 'items',
      }))
    );
    return shareContent(
      `${locationConfig[selectedLocation].label} Inventory`,
      text
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 1,
      unit: '',
      location: 'fridge',
      category: null,
      expiration_date: null,
      notes: null,
    });
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) return;

    if (editingItem) {
      await updateItem(editingItem.id, formData as InventoryItemInsert);
    } else {
      await addItem(formData as InventoryItemInsert);
    }

    setIsAddingItem(false);
    resetForm();
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || '',
      location: item.location,
      category: item.category,
      expiration_date: item.expiration_date,
      notes: item.notes,
    });
    setIsAddingItem(true);
  };

  const getExpiryBadge = (item: InventoryItem) => {
    if (!item.expiration_date) return null;
    
    const daysUntil = differenceInDays(new Date(item.expiration_date), new Date());
    
    if (daysUntil < 0) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    } else if (daysUntil <= 3) {
      return <Badge className="text-xs bg-red-500">Expires in {daysUntil}d</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge className="text-xs bg-yellow-500">Expires in {daysUntil}d</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Expiring Soon Alert */}
      {(expiringItems.length > 0 || expiredItems.length > 0) && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium text-sm">Attention needed</p>
                <p className="text-xs text-muted-foreground">
                  {expiredItems.length > 0 && `${expiredItems.length} expired items. `}
                  {expiringItems.length > 0 && `${expiringItems.length} items expiring soon.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              Inventory
              <ExportShareButtons
                onExportPDF={handleExportPDF}
                onShare={handleShare}
              />
            </CardTitle>
            <Button size="sm" onClick={() => setIsAddingItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location tabs */}
          <Tabs value={selectedLocation} onValueChange={(v) => setSelectedLocation(v as InventoryLocation)}>
            <TabsList className="grid grid-cols-3 w-full">
              {(Object.entries(locationConfig) as [InventoryLocation, typeof locationConfig.pantry][]).map(([loc, config]) => {
                const Icon = config.icon;
                const count = getByLocation(loc).length;
                return (
                  <TabsTrigger key={loc} value={loc} className="gap-2">
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                    {config.label}
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-1">{count}</Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Items list */}
            <TabsContent value={selectedLocation} className="mt-4 space-y-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No items found' : `No items in ${locationConfig[selectedLocation].label}`}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {getExpiryBadge(item)}
                        {isPremium && item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{item.quantity} {item.unit || 'items'}</span>
                        {isPremium && item.expiration_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.expiration_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => adjustQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => adjustQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Premium upsell for free users */}
          {!isPremium && (
            <div className="p-4 rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="font-medium text-sm">Unlock Premium Features</p>
                  <p className="text-xs text-muted-foreground">
                    Categories, expiry alerts, barcode scanning, and more
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={(open) => {
        setIsAddingItem(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                placeholder="e.g., Milk, Eggs..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  placeholder="e.g., lbs, oz..."
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-2">
                {(Object.entries(locationConfig) as [InventoryLocation, typeof locationConfig.pantry][]).map(([loc, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={loc}
                      type="button"
                      variant={formData.location === loc ? 'default' : 'outline'}
                      className="flex-1"
                      style={formData.location === loc ? { backgroundColor: config.color } : undefined}
                      onClick={() => setFormData({ ...formData, location: loc })}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {isPremium && (
              <>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border bg-background"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory || null })}
                  >
                    <option value="">Select category...</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    value={formData.expiration_date || ''}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value || null })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional notes..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsAddingItem(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name?.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {editingItem ? 'Update' : 'Add Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

