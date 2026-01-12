'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Ruler,
  Scale,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface WeightHeightEntry {
  id: string;
  user_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  recorded_date: string;
  notes: string | null;
  created_at: string;
}

interface WeightHeightTrackerProps {
  userId?: string;
  compact?: boolean;
}

export function WeightHeightTracker({ userId = '1', compact = false }: WeightHeightTrackerProps) {
  const { theme } = useAppStore();
  const [entries, setEntries] = useState<WeightHeightEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightHeightEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    weight_kg: '',
    height_cm: '',
    recorded_date: new Date(),
    notes: '',
  });

  // Load entries (mock data for now)
  useEffect(() => {
    // TODO: Load from database
    const mockEntries: WeightHeightEntry[] = [
      {
        id: '1',
        user_id: userId,
        weight_kg: 75.5,
        height_cm: 180,
        recorded_date: new Date().toISOString(),
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: userId,
        weight_kg: 75.0,
        height_cm: 180,
        recorded_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: null,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setEntries(mockEntries.sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()));
  }, [userId]);

  const currentWeight = entries[0]?.weight_kg || null;
  const currentHeight = entries[0]?.height_cm || null;

  // Calculate weight change
  const getWeightChange = () => {
    if (entries.length < 2) return null;
    const latest = entries[0].weight_kg;
    const previous = entries[1].weight_kg;
    if (!latest || !previous) return null;
    return latest - previous;
  };

  const weightChange = getWeightChange();

  const openAddDialog = () => {
    setNewEntry({
      weight_kg: currentWeight?.toString() || '',
      height_cm: currentHeight?.toString() || '',
      recorded_date: new Date(),
      notes: '',
    });
    setIsAddingEntry(true);
  };

  const openEditDialog = (entry: WeightHeightEntry) => {
    setNewEntry({
      weight_kg: entry.weight_kg?.toString() || '',
      height_cm: entry.height_cm?.toString() || '',
      recorded_date: new Date(entry.recorded_date),
      notes: entry.notes || '',
    });
    setEditingEntry(entry);
    setIsAddingEntry(true);
  };

  const closeDialog = () => {
    setIsAddingEntry(false);
    setEditingEntry(null);
    setNewEntry({
      weight_kg: '',
      height_cm: '',
      recorded_date: new Date(),
      notes: '',
    });
  };

  const saveEntry = () => {
    if (!newEntry.weight_kg && !newEntry.height_cm) {
      return; // At least one value required
    }

    const entry: WeightHeightEntry = {
      id: editingEntry?.id || Date.now().toString(),
      user_id: userId,
      weight_kg: newEntry.weight_kg ? parseFloat(newEntry.weight_kg) : null,
      height_cm: newEntry.height_cm ? parseFloat(newEntry.height_cm) : null,
      recorded_date: newEntry.recorded_date.toISOString(),
      notes: newEntry.notes || null,
      created_at: editingEntry?.created_at || new Date().toISOString(),
    };

    if (editingEntry) {
      setEntries(entries.map(e => e.id === entry.id ? entry : e).sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()));
    } else {
      setEntries([entry, ...entries].sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()));
    }

    // TODO: Save to database
    closeDialog();
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    // TODO: Delete from database
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Weight & Height</CardTitle>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Current Weight</Label>
              <p className="text-2xl font-bold mt-1">
                {currentWeight ? `${currentWeight} kg` : '—'}
              </p>
              {weightChange !== null && weightChange !== 0 && (
                <div className={cn("flex items-center gap-1 text-xs mt-1", weightChange > 0 ? "text-red-500" : "text-green-500")}>
                  {weightChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(weightChange).toFixed(1)} kg
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Current Height</Label>
              <p className="text-2xl font-bold mt-1">
                {currentHeight ? `${(currentHeight / 100).toFixed(2)} m` : '—'}
              </p>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">Recent Entries</Label>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{format(new Date(entry.recorded_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {entry.weight_kg && <span>{entry.weight_kg} kg</span>}
                        {entry.height_cm && <span>{entry.height_cm} cm</span>}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => openEditDialog(entry)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddingEntry} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add Weight & Height'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={newEntry.weight_kg}
                    onChange={(e) => setNewEntry({ ...newEntry, weight_kg: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="180"
                    value={newEntry.height_cm}
                    onChange={(e) => setNewEntry({ ...newEntry, height_cm: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newEntry.recorded_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEntry.recorded_date ? format(newEntry.recorded_date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEntry.recorded_date}
                      onSelect={(date) => date && setNewEntry({ ...newEntry, recorded_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Add notes..."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
                onClick={saveEntry}
                disabled={!newEntry.weight_kg && !newEntry.height_cm}
              >
                {editingEntry ? 'Update Entry' : 'Add Entry'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-orange-500" />
              Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {currentWeight ? `${currentWeight} kg` : '—'}
            </div>
            {weightChange !== null && weightChange !== 0 && (
              <div className={cn("flex items-center gap-2 text-sm", weightChange > 0 ? "text-red-500" : "text-green-500")}>
                {weightChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(weightChange).toFixed(1)} kg change
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-500" />
              Height
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currentHeight ? `${(currentHeight / 100).toFixed(2)} m (${currentHeight} cm)` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>History</CardTitle>
              <CardDescription>Track your weight and height over time</CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No entries yet</p>
              <p className="text-sm mt-1">Add your first weight or height measurement</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {entries.map((entry) => (
                  <Card key={entry.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(entry.recorded_date), 'MMMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            {entry.weight_kg && (
                              <div className="flex items-center gap-2">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                <span>{entry.weight_kg} kg</span>
                              </div>
                            )}
                            {entry.height_cm && (
                              <div className="flex items-center gap-2">
                                <Ruler className="h-4 w-4 text-muted-foreground" />
                                <span>{entry.height_cm} cm</span>
                              </div>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddingEntry} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add Weight & Height'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="75.5"
                  value={newEntry.weight_kg}
                  onChange={(e) => setNewEntry({ ...newEntry, weight_kg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="180"
                  value={newEntry.height_cm}
                  onChange={(e) => setNewEntry({ ...newEntry, height_cm: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newEntry.recorded_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEntry.recorded_date ? format(newEntry.recorded_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newEntry.recorded_date}
                    onSelect={(date) => date && setNewEntry({ ...newEntry, recorded_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Add notes..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={saveEntry}
              disabled={!newEntry.weight_kg && !newEntry.height_cm}
            >
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
