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
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
} from 'lucide-react';
import type { FinanceEntry } from '@/types/database';
import { format } from 'date-fns';

const mockEntries: FinanceEntry[] = [
  {
    id: '1',
    user_id: '1',
    type: 'income',
    category: 'Salary',
    amount: 5000,
    currency: 'USD',
    description: 'Monthly salary',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    type: 'expense',
    category: 'Groceries',
    amount: 150,
    currency: 'USD',
    description: 'Weekly groceries',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    type: 'saving',
    category: 'Emergency Fund',
    amount: 500,
    currency: 'USD',
    description: null,
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const savingsGoals = [
  { name: 'Travel Fund', current: 2400, target: 3000, emoji: '✈️' },
  { name: 'Emergency Fund', current: 8000, target: 10000, emoji: '🛡️' },
  { name: 'New Laptop', current: 800, target: 2000, emoji: '💻' },
];

const typeConfig = {
  income: { label: 'Income', icon: ArrowUpRight, color: '#22C55E' },
  expense: { label: 'Expense', icon: ArrowDownRight, color: '#EF4444' },
  investment: { label: 'Investment', icon: TrendingUp, color: '#3B82F6' },
  saving: { label: 'Saving', icon: PiggyBank, color: '#8B5CF6' },
};

export function Finance() {
  const [entries, setEntries] = useState<FinanceEntry[]>(mockEntries);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'expense' as FinanceEntry['type'],
    category: '',
    amount: 0,
    description: '',
  });

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = entries.filter((e) => e.type === 'saving').reduce((sum, e) => sum + e.amount, 0);

  const stats = [
    { label: 'Income', value: `$${totalIncome.toLocaleString()}`, trend: 'up' as const },
    { label: 'Expenses', value: `$${totalExpenses.toLocaleString()}` },
    { label: 'Saved', value: `$${totalSavings.toLocaleString()}`, trend: 'up' as const },
    { label: 'Net', value: `$${(totalIncome - totalExpenses).toLocaleString()}` },
  ];

  const addEntry = () => {
    const entry: FinanceEntry = {
      id: Date.now().toString(),
      user_id: '1',
      ...newEntry,
      currency: 'USD',
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setEntries([entry, ...entries]);
    setIsAddingEntry(false);
    setNewEntry({ type: 'expense', category: '', amount: 0, description: '' });
  };

  return (
    <AspectLayout
      aspectId="finance"
      stats={stats}
      aiInsight="You're 80% towards your travel fund goal! At this rate, you'll reach it in 2 weeks. Consider setting up auto-transfer to speed things up."
      onAddNew={() => setIsAddingEntry(true)}
      addNewLabel="Add Transaction"
    >
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="goals">Savings Goals</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          {entries.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No transactions yet"
              description="Start tracking your finances by adding your first transaction."
              actionLabel="Add Transaction"
              onAction={() => setIsAddingEntry(true)}
            />
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const config = typeConfig[entry.type];
                const Icon = config.icon;
                return (
                  <Card key={entry.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${config.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{entry.category}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              variant="secondary"
                              style={{ backgroundColor: `${config.color}20`, color: config.color }}
                            >
                              {config.label}
                            </Badge>
                            {entry.description && (
                              <span className="text-sm text-muted-foreground">{entry.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-semibold"
                            style={{ color: entry.type === 'expense' ? '#EF4444' : '#22C55E' }}
                          >
                            {entry.type === 'expense' ? '-' : '+'}${entry.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <div className="space-y-4">
            {savingsGoals.map((goal, index) => {
              const percentage = Math.round((goal.current / goal.target) * 100);
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{percentage}%</Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Savings Goal
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  Monthly Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Housing', spent: 1500, budget: 1500 },
                  { category: 'Food', spent: 400, budget: 600 },
                  { category: 'Entertainment', spent: 150, budget: 200 },
                  { category: 'Transportation', spent: 80, budget: 200 },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{item.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ${item.spent} / ${item.budget}
                      </span>
                    </div>
                    <Progress value={(item.spent / item.budget) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Investments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-3xl font-bold">$12,450</p>
                  <p className="text-sm text-green-500 mt-1">+5.2% this month</p>
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    { name: 'S&P 500 ETF', value: '$8,200', change: '+3.1%' },
                    { name: 'Tech Stocks', value: '$3,100', change: '+8.5%' },
                    { name: 'Crypto', value: '$1,150', change: '+12.3%' },
                  ].map((inv) => (
                    <div key={inv.name} className="flex items-center justify-between text-sm">
                      <span>{inv.name}</span>
                      <div className="text-right">
                        <span className="font-medium">{inv.value}</span>
                        <span className="text-green-500 ml-2">{inv.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Entry Dialog */}
      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(typeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={newEntry.type === type ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3"
                      style={newEntry.type === type ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewEntry({ ...newEntry, type: type as FinanceEntry['type'] })}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newEntry.amount || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="e.g., Groceries"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="What was this for?"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addEntry}
              disabled={!newEntry.category.trim() || newEntry.amount <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

