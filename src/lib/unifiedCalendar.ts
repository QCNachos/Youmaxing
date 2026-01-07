import { addDays, startOfDay, isSameDay, format } from 'date-fns';
import type { AspectType } from '@/types/database';
import {
  workoutsThisWeek,
  todaysWorkoutPlan,
  weeklyMealPlan,
  mealsDatabase,
  friends,
  upcomingTrips,
  savingsGoals,
  recentTransactions,
} from './miniAppData';

// Unified Calendar Event Type
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  date: Date;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled';
  source: 'training' | 'food' | 'friends' | 'travel' | 'finance' | 'business' | 'family' | 'events' | 'manual';
  emoji?: string;
}

// Generate calendar events from all mini-apps
export function generateUnifiedEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = startOfDay(new Date());
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // ================================
  // TRAINING EVENTS
  // ================================
  
  // Past workouts
  workoutsThisWeek.forEach((workout) => {
    events.push({
      id: `training-${workout.id}`,
      title: workout.name,
      aspect: 'training',
      type: 'personal',
      date: workout.date,
      time: '07:00',
      priority: 'high',
      status: workout.completed ? 'completed' : 'scheduled',
      source: 'training',
      emoji: '💪',
    });
  });

  // Today's planned workout
  events.push({
    id: 'training-today',
    title: todaysWorkoutPlan.name,
    description: `${todaysWorkoutPlan.exercises.length} exercises, ~${todaysWorkoutPlan.estimatedDuration} min`,
    aspect: 'training',
    type: 'personal',
    date: today,
    time: '07:00',
    priority: 'high',
    status: 'scheduled',
    source: 'training',
    emoji: '🏋️',
  });

  // ================================
  // FOOD EVENTS (Meal Plan)
  // ================================
  
  Object.entries(weeklyMealPlan).forEach(([day, meal]) => {
    if (meal) {
      const dayIndex = dayOfWeek.indexOf(day);
      const todayIndex = today.getDay();
      const daysUntil = (dayIndex - todayIndex + 7) % 7;
      const eventDate = addDays(today, daysUntil === 0 ? 0 : daysUntil);

      events.push({
        id: `food-${day.toLowerCase()}`,
        title: meal.name,
        description: meal.tags.join(', '),
        aspect: 'food',
        type: 'personal',
        date: eventDate,
        time: '18:30',
        priority: 'low',
        status: 'scheduled',
        source: 'food',
        emoji: meal.emoji,
      });
    }
  });

  // ================================
  // FRIENDS EVENTS
  // ================================
  
  // Friend's birthday coming up
  friends.forEach((friend) => {
    if (friend.birthday) {
      const thisYearBday = new Date(today.getFullYear(), friend.birthday.getMonth(), friend.birthday.getDate());
      if (thisYearBday >= today && thisYearBday <= addDays(today, 60)) {
        events.push({
          id: `friends-bday-${friend.id}`,
          title: `${friend.name}'s Birthday 🎂`,
          aspect: 'friends',
          type: 'personal',
          date: thisYearBday,
          priority: 'medium',
          status: 'scheduled',
          source: 'friends',
          emoji: '🎂',
        });
      }
    }
  });

  // Suggested catch-ups
  const toContact = friends.filter(f => {
    const daysAgo = Math.floor((Date.now() - f.lastContact.getTime()) / (24 * 60 * 60 * 1000));
    return daysAgo > 14;
  });

  toContact.slice(0, 2).forEach((friend, i) => {
    events.push({
      id: `friends-catchup-${friend.id}`,
      title: `Catch up with ${friend.name}?`,
      description: friend.notes || 'Been a while since you connected',
      aspect: 'friends',
      type: 'personal',
      date: addDays(today, i + 1),
      priority: 'low',
      status: 'scheduled',
      source: 'friends',
      emoji: '📱',
    });
  });

  // ================================
  // TRAVEL EVENTS
  // ================================
  
  upcomingTrips.forEach((trip) => {
    // Parse dates like "March 15-28, 2026"
    const dateMatch = trip.dates.match(/(\w+)\s+(\d+)/);
    if (dateMatch) {
      const month = dateMatch[1];
      const day = parseInt(dateMatch[2]);
      const year = 2026; // From the mock data
      const tripDate = new Date(`${month} ${day}, ${year}`);
      
      if (!isNaN(tripDate.getTime())) {
        events.push({
          id: `travel-${trip.id}`,
          title: `✈️ ${trip.destination} Trip`,
          description: `Fund: ${trip.fundProgress}% ready`,
          aspect: 'travel',
          type: 'personal',
          date: tripDate,
          priority: 'high',
          status: 'scheduled',
          source: 'travel',
          emoji: '✈️',
        });
      }
    }
  });

  // ================================
  // FINANCE EVENTS
  // ================================
  
  // Savings goal milestones
  savingsGoals.forEach((goal) => {
    if (goal.deadline) {
      const deadlineMatch = goal.deadline.match(/(\w+)\s+(\d{4})/);
      if (deadlineMatch) {
        const deadline = new Date(`${deadlineMatch[1]} 1, ${deadlineMatch[2]}`);
        if (!isNaN(deadline.getTime()) && deadline >= today) {
          events.push({
            id: `finance-goal-${goal.id}`,
            title: `${goal.name} Deadline`,
            description: `$${goal.current.toLocaleString()} / $${goal.target.toLocaleString()}`,
            aspect: 'finance',
            type: 'personal',
            date: deadline,
            priority: goal.current / goal.target > 0.8 ? 'low' : 'high',
            status: 'scheduled',
            source: 'finance',
            emoji: '💰',
          });
        }
      }
    }
  });

  // ================================
  // BUSINESS EVENTS (Mock for demo)
  // ================================
  
  events.push({
    id: 'business-standup',
    title: 'Team Standup',
    aspect: 'business',
    type: 'job',
    date: today,
    time: '09:00',
    priority: 'medium',
    status: 'completed',
    source: 'business',
    emoji: '💼',
  });

  events.push({
    id: 'business-review',
    title: 'Project Review',
    aspect: 'business',
    type: 'job',
    date: addDays(today, 1),
    time: '14:00',
    priority: 'high',
    status: 'scheduled',
    source: 'business',
    emoji: '📊',
  });

  // ================================
  // FAMILY EVENTS (Mock for demo)
  // ================================
  
  events.push({
    id: 'family-dinner',
    title: 'Family Dinner',
    aspect: 'family',
    type: 'personal',
    date: addDays(today, 5),
    time: '18:00',
    priority: 'medium',
    status: 'scheduled',
    source: 'family',
    emoji: '👨‍👩‍👧‍👦',
  });

  return events;
}

// Get events for a specific date
export function getEventsForDate(date: Date): CalendarEvent[] {
  const allEvents = generateUnifiedEvents();
  return allEvents.filter(event => isSameDay(event.date, date));
}

// Get events for a date range
export function getEventsInRange(startDate: Date, endDate: Date): CalendarEvent[] {
  const allEvents = generateUnifiedEvents();
  return allEvents.filter(event => 
    event.date >= startOfDay(startDate) && event.date <= endDate
  );
}

// Get all dates that have events
export function getDatesWithEvents(): Date[] {
  const allEvents = generateUnifiedEvents();
  const uniqueDates = new Set<string>();
  allEvents.forEach(event => {
    uniqueDates.add(format(event.date, 'yyyy-MM-dd'));
  });
  return Array.from(uniqueDates).map(d => new Date(d));
}

// Daily Tasks from mini-app data
export interface DailyTask {
  id: string;
  title: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  date: Date;
  source: string;
}

export function generateDailyTasks(): DailyTask[] {
  const today = startOfDay(new Date());
  const tasks: DailyTask[] = [];

  // Training task
  tasks.push({
    id: 'task-training-today',
    title: todaysWorkoutPlan.name,
    aspect: 'training',
    type: 'personal',
    status: 'pending',
    priority: 'high',
    date: today,
    source: 'training',
  });

  // Food task - prepare dinner
  const todaysMeal = weeklyMealPlan[['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]];
  if (todaysMeal) {
    tasks.push({
      id: 'task-food-dinner',
      title: `Prepare: ${todaysMeal.name}`,
      aspect: 'food',
      type: 'personal',
      status: 'pending',
      priority: 'medium',
      date: today,
      source: 'food',
    });
  }

  // Finance task
  tasks.push({
    id: 'task-finance-review',
    title: 'Review weekly spending',
    aspect: 'finance',
    type: 'personal',
    status: 'pending',
    priority: 'low',
    date: today,
    source: 'finance',
  });

  // Business tasks
  tasks.push({
    id: 'task-business-standup',
    title: 'Team standup',
    aspect: 'business',
    type: 'job',
    status: 'completed',
    priority: 'medium',
    date: today,
    source: 'business',
  });

  tasks.push({
    id: 'task-business-report',
    title: 'Finish weekly report',
    aspect: 'business',
    type: 'job',
    status: 'in_progress',
    priority: 'high',
    date: today,
    source: 'business',
  });

  return tasks;
}




