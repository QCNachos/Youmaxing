import type { AspectType } from '@/types/database';
import { 
  Dumbbell, 
  Utensils, 
  Trophy, 
  Film, 
  Wallet, 
  Briefcase, 
  Plane, 
  Users, 
  Heart, 
  Calendar,
  Plus,
  ListChecks,
  TrendingUp,
  ShoppingCart,
  Target,
  Clock,
  MessageCircle,
  Gift,
  Map,
  CreditCard,
  PiggyBank,
  LineChart,
  Play,
  Star,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// QUICK ACTIONS PER ASPECT
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  prompt: string; // What to send to AI when clicked
}

export const aspectQuickActions: Record<AspectType, QuickAction[]> = {
  training: [
    { id: 'log-workout', label: 'Log Workout', icon: Plus, prompt: 'I want to log my workout' },
    { id: 'todays-plan', label: "Today's Plan", icon: Target, prompt: "What's my training plan for today?" },
    { id: 'check-progress', label: 'My Progress', icon: TrendingUp, prompt: 'How am I doing with my training this week?' },
    { id: 'suggest-workout', label: 'Suggest Workout', icon: Dumbbell, prompt: 'Suggest a workout for me based on my goals' },
  ],
  food: [
    { id: 'whats-dinner', label: "What's for Dinner?", icon: Utensils, prompt: "What's planned for dinner tonight?" },
    { id: 'plan-week', label: 'Plan My Week', icon: Calendar, prompt: 'Help me plan my meals for the week' },
    { id: 'grocery-list', label: 'Grocery List', icon: ShoppingCart, prompt: 'Generate my grocery list based on this week\'s meal plan' },
    { id: 'quick-meal', label: 'Quick Meal Ideas', icon: Clock, prompt: 'Suggest a quick meal I can make in 15 minutes' },
  ],
  sports: [
    { id: 'upcoming-games', label: 'Upcoming Games', icon: Calendar, prompt: 'What sports events are coming up?' },
    { id: 'my-activities', label: 'My Activities', icon: Trophy, prompt: 'Show me my sports activities this week' },
    { id: 'find-activity', label: 'Find Activity', icon: Play, prompt: 'Help me find a sports activity to join' },
    { id: 'log-activity', label: 'Log Activity', icon: Plus, prompt: 'I want to log a sports activity' },
  ],
  films: [
    { id: 'whats-next', label: 'What to Watch?', icon: Film, prompt: 'What should I watch tonight?' },
    { id: 'my-watchlist', label: 'My Watchlist', icon: ListChecks, prompt: 'Show me my watchlist' },
    { id: 'add-to-list', label: 'Add to List', icon: Plus, prompt: 'I want to add something to my watchlist' },
    { id: 'rate-movie', label: 'Rate Something', icon: Star, prompt: 'I want to rate something I just watched' },
  ],
  finance: [
    { id: 'portfolio-status', label: 'Portfolio Status', icon: LineChart, prompt: "How's my portfolio doing?" },
    { id: 'log-expense', label: 'Log Expense', icon: CreditCard, prompt: 'I want to log an expense' },
    { id: 'savings-goals', label: 'Savings Goals', icon: PiggyBank, prompt: 'How am I doing on my savings goals?' },
    { id: 'budget-check', label: 'Budget Check', icon: Wallet, prompt: "How's my spending this month?" },
  ],
  business: [
    { id: 'todays-priorities', label: "Today's Priorities", icon: Target, prompt: 'What should I focus on today for business?' },
    { id: 'pending-tasks', label: 'Pending Tasks', icon: ListChecks, prompt: 'Show me my pending business tasks' },
    { id: 'add-task', label: 'Add Task', icon: Plus, prompt: 'I want to add a business task' },
    { id: 'weekly-review', label: 'Weekly Review', icon: TrendingUp, prompt: 'Give me a weekly business review' },
  ],
  travel: [
    { id: 'trip-status', label: 'Trip Status', icon: Plane, prompt: "How's my trip planning going?" },
    { id: 'find-deals', label: 'Find Deals', icon: TrendingUp, prompt: 'Are there any good travel deals right now?' },
    { id: 'plan-trip', label: 'Plan a Trip', icon: Map, prompt: 'Help me plan a new trip' },
    { id: 'packing-list', label: 'Packing List', icon: ListChecks, prompt: 'Generate a packing list for my upcoming trip' },
  ],
  family: [
    { id: 'family-events', label: 'Family Events', icon: Calendar, prompt: 'What family events are coming up?' },
    { id: 'birthdays', label: 'Birthdays', icon: Gift, prompt: 'Any family birthdays coming up?' },
    { id: 'call-reminder', label: 'Who to Call?', icon: MessageCircle, prompt: "Who in my family should I catch up with?" },
    { id: 'plan-gathering', label: 'Plan Gathering', icon: Users, prompt: 'Help me plan a family gathering' },
  ],
  friends: [
    { id: 'whos-free', label: "Who's Free?", icon: Users, prompt: 'Which friends might be free this weekend?' },
    { id: 'plan-hangout', label: 'Plan Hangout', icon: Calendar, prompt: 'Help me plan a hangout with friends' },
    { id: 'birthdays', label: 'Birthdays', icon: Gift, prompt: 'Any friend birthdays coming up?' },
    { id: 'catch-up', label: 'Who to Catch Up?', icon: MessageCircle, prompt: "Who haven't I talked to in a while?" },
  ],
  events: [
    { id: 'upcoming', label: 'Upcoming Events', icon: Calendar, prompt: 'What events do I have coming up?' },
    { id: 'add-event', label: 'Add Event', icon: Plus, prompt: 'I want to add a new event' },
    { id: 'find-events', label: 'Find Events', icon: Map, prompt: 'Find interesting events near me' },
    { id: 'todays-schedule', label: "Today's Schedule", icon: Clock, prompt: "What's on my schedule today?" },
  ],
  settings: [
    { id: 'preferences', label: 'Preferences', icon: Target, prompt: 'Show me my preferences' },
    { id: 'help', label: 'Help', icon: MessageCircle, prompt: 'I need help with something' },
  ],
};

// ============================================
// MOCK MINI-APP DATA
// ============================================

// FOOD DATA (like user's Notion)
export interface Meal {
  id: string;
  name: string;
  emoji: string;
  tags: string[];
  prepTime?: number; // minutes
  ingredients?: string[];
}

export interface WeeklyMealPlan {
  [day: string]: Meal | null;
}

export const mealsDatabase: Meal[] = [
  // Breakfast
  { id: 'overnight-oats', name: 'Overnight Oats', emoji: '🌙', tags: ['Healthy', 'Quick', 'Breakfast'] },
  { id: 'egg-muffins', name: 'Egg Muffins', emoji: '🧁', tags: ['Protein-rich', 'Breakfast', 'Meal-prep'] },
  { id: 'smoothie', name: 'Smoothie', emoji: '🍓', tags: ['Healthy', 'Quick', 'Breakfast'] },
  { id: 'crepes-protein', name: 'Crêpes protéinées', emoji: '🥞', tags: ['Healthy', 'Quick', 'Breakfast', 'Protein-rich'] },
  { id: 'toast-creton', name: 'Toast creton', emoji: '🍞', tags: ['Quick', 'Breakfast'] },
  
  // Dinner
  { id: 'hachis-parmentier', name: 'Hachis parmentier boeuf braisé', emoji: '🍄', tags: ['Meat', 'Comfort'], prepTime: 45 },
  { id: 'tartare-saumon', name: 'Tartare (Saumon)', emoji: '🐟', tags: ['Fish', 'Healthy'], prepTime: 20 },
  { id: 'tartare-boeuf', name: 'Tartare (Boeuf)', emoji: '🍄', tags: ['Meat', 'Protein-rich'], prepTime: 15 },
  { id: 'steak-frites', name: 'Steak Frites', emoji: '🍄', tags: ['Meat', 'High-protein', 'Classic'], prepTime: 30 },
  { id: 'saumon', name: 'Saumon', emoji: '🍣', tags: ['Fish', 'Healthy', 'Omega-3s'], prepTime: 25 },
  { id: 'spaghetti-saucisses', name: 'Spaghetti aux saucisses', emoji: '🍝', tags: ['Pasta', 'Quick'], prepTime: 20 },
  { id: 'wrap-caesar', name: 'Wrap Ceasar/Ranch', emoji: '🌯', tags: ['Quick', 'Lunch'], prepTime: 10 },
  { id: 'chili-vege', name: 'Chili (vege)', emoji: '🌶️', tags: ['Mexican', 'Vege', 'Healthy'], prepTime: 40 },
  { id: 'salade-tacos', name: 'Salade Tacos', emoji: '🥗', tags: ['Mexican', 'Salad', 'Healthy'], prepTime: 15 },
  { id: 'poulet-champignon', name: 'Poulet champignon', emoji: '🍄', tags: ['Chicken', 'Comfort'], prepTime: 35 },
  { id: 'bol-patate-douce', name: 'Bol patate douce, avocat, pois chiches', emoji: '🥙', tags: ['Vege', 'Healthy', 'Bowl'], prepTime: 25 },
  { id: 'tacos-poulet', name: 'Tacos poulet(ranch) avec salade de chou', emoji: '🌮', tags: ['Mexican', 'Chicken', 'Quick'], prepTime: 20 },
];

export const weeklyMealPlan: Record<string, Meal | null> = {
  Sunday: null,
  Monday: mealsDatabase.find(m => m.id === 'poulet-champignon') || null,
  Tuesday: mealsDatabase.find(m => m.id === 'bol-patate-douce') || null,
  Wednesday: mealsDatabase.find(m => m.id === 'tacos-poulet') || null,
  Thursday: mealsDatabase.find(m => m.id === 'tartare-saumon') || null,
  Friday: null,
  Saturday: null,
};

export const groceryList = [
  { item: 'Lait', checked: false },
  { item: 'Porc haché pour creton', checked: true },
  { item: 'Tomates cerises', checked: false },
  { item: 'Fromage cottage', checked: true },
  { item: 'Pain', checked: true },
  { item: 'Avocat', checked: false },
  { item: 'Pois chiches', checked: false },
  { item: 'Saumon frais', checked: false },
  { item: 'Poulet', checked: false },
  { item: 'Champignons', checked: false },
];

// TRAINING DATA
export interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports';
  duration: number; // minutes
  date: Date;
  completed: boolean;
}

export const workoutsThisWeek: Workout[] = [
  { id: 'w1', name: 'Upper Body Strength', type: 'strength', duration: 60, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), completed: true },
  { id: 'w2', name: 'Morning Run (5k)', type: 'cardio', duration: 30, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completed: true },
  { id: 'w3', name: 'Lower Body Strength', type: 'strength', duration: 55, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), completed: true },
  { id: 'w4', name: 'Yoga & Mobility', type: 'flexibility', duration: 45, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: true },
  { id: 'w5', name: 'HIIT Session', type: 'cardio', duration: 25, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: true },
  { id: 'w6', name: 'Push Day', type: 'strength', duration: 50, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: true },
];

export const todaysWorkoutPlan = {
  name: 'Upper Body Day',
  exercises: [
    { name: 'Bench Press', sets: 4, reps: '8-10' },
    { name: 'Rows', sets: 4, reps: '8-10' },
    { name: 'Shoulder Press', sets: 3, reps: '10-12' },
    { name: 'Pull-ups', sets: 3, reps: 'Max' },
    { name: 'Tricep Dips', sets: 3, reps: '12-15' },
  ],
  estimatedDuration: 45,
};

export const trainingStats = {
  streak: 6,
  weeklyGoal: 5,
  weeklyCompleted: 6,
  caloriesBurned: 2450,
  avgSleep: 7.2,
};

// FINANCE DATA
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export const recentTransactions: Transaction[] = [
  { id: 't1', description: 'Groceries - Metro', amount: -85.20, category: 'Food', date: new Date() },
  { id: 't2', description: 'Salary', amount: 2500.00, category: 'Income', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 't3', description: 'Netflix', amount: -15.99, category: 'Entertainment', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 't4', description: 'Coffee - Starbucks', amount: -5.50, category: 'Food', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 't5', description: 'Gas', amount: -65.00, category: 'Transportation', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
];

export const savingsGoals = [
  { id: 'japan', name: 'Japan Trip', target: 5000, current: 4500, deadline: 'March 2026' },
  { id: 'emergency', name: 'Emergency Fund', target: 10000, current: 7500, deadline: null },
  { id: 'car', name: 'New Car', target: 15000, current: 3200, deadline: 'December 2026' },
];

export const financeStats = {
  netWorth: 45230,
  monthlyBudget: 3500,
  monthlySpent: 2850,
  portfolioValue: 12500,
  portfolioChange: 1.8, // percent
};

// FRIENDS DATA
export interface Friend {
  id: string;
  name: string;
  lastContact: Date;
  birthday?: Date;
  notes?: string;
}

export const friends: Friend[] = [
  { id: 'f1', name: 'Sarah', lastContact: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), birthday: new Date('1995-03-15') },
  { id: 'f2', name: 'Alex', lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), birthday: new Date('1994-01-10') },
  { id: 'f3', name: 'Mike', lastContact: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), notes: 'Wants to try that new restaurant' },
  { id: 'f4', name: 'Emma', lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), birthday: new Date('1996-07-22') },
  { id: 'f5', name: 'David', lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
];

// TRAVEL DATA
export const upcomingTrips = [
  { id: 'trip1', destination: 'Japan', dates: 'March 15-28, 2026', status: 'planning', fundProgress: 90 },
  { id: 'trip2', destination: 'Italy', dates: 'August 2026', status: 'idea', fundProgress: 20 },
];

export const travelWishlist = [
  { destination: 'Iceland', priority: 'high' },
  { destination: 'New Zealand', priority: 'medium' },
  { destination: 'Portugal', priority: 'high' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getQuickActionsForAspect(aspectId: AspectType): QuickAction[] {
  return aspectQuickActions[aspectId] || [];
}

export function getDayOfWeek(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

export function getTodaysMeal(): Meal | null {
  const today = getDayOfWeek();
  return weeklyMealPlan[today] || null;
}

export function getMealsWithTag(tag: string): Meal[] {
  return mealsDatabase.filter(m => m.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
}

export function getFriendsToContact(): Friend[] {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  return friends.filter(f => f.lastContact < twoWeeksAgo);
}

export function getUpcomingBirthdays(): Friend[] {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return friends.filter(f => {
    if (!f.birthday) return false;
    const thisYearBday = new Date(now.getFullYear(), f.birthday.getMonth(), f.birthday.getDate());
    return thisYearBday >= now && thisYearBday <= nextMonth;
  });
}



