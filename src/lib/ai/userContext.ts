/**
 * User Context - Fetches real user data from Supabase to provide AI context
 * 
 * This module builds a structured context summary that gets injected into
 * the AI system prompt, giving the model awareness of the user's actual data.
 */

import { createClient } from '@/lib/supabase/server';
import { startOfWeek, endOfWeek, format, subDays, differenceInDays, addDays } from 'date-fns';
import type { AspectType } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingContext {
  currentStreak: number;
  weeklyWorkouts: number;
  weeklyGoal: number;
  lastWorkoutDate: string | null;
  lastWorkoutType: string | null;
  avgSleepHours: number | null;
  todaysSleep: number | null;
}

export interface FoodContext {
  todaysMeals: number;
  todaysCalories: number;
  weeklyMealLogs: number;
  lastMealLogged: string | null;
  groceryItemsCount: number;
}

export interface SportsContext {
  thisMonthActivities: number;
  favoriteSport: string | null;
  lastActivity: string | null;
}

export interface BusinessContext {
  activeProjects: number;
  ideasCount: number;
  upcomingDeadlines: number;
}

export interface EventsContext {
  todayEvents: number;
  upcomingWeekEvents: number;
  nextEvent: string | null;
}

export interface TravelContext {
  upcomingTrips: number;
  bucketListCount: number;
  placesVisited: number;
}

export interface UserContext {
  userName: string | null;
  training: TrainingContext;
  food: FoodContext;
  sports: SportsContext;
  business: BusinessContext;
  events: EventsContext;
  travel: TravelContext;
  priorityAspects: AspectType[];
  todayDate: string;
  dayOfWeek: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

// ============================================================================
// CONTEXT FETCHING
// ============================================================================

/**
 * Fetch comprehensive user context for AI system prompt
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  const supabase = await createClient();
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekFromNow = addDays(now, 7);

  // Fetch all data in parallel for performance
  const [
    userPrefsResult,
    trainingLogsResult,
    sleepLogsResult,
    mealLogsResult,
    groceryResult,
    sportsResult,
    projectsResult,
    eventsResult,
    tripsResult,
    bucketListResult,
    visitedResult,
  ] = await Promise.all([
    // User preferences
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
    
    // Training logs (last 30 days)
    supabase.from('training_logs').select('id, completed_at, type, duration_minutes')
      .eq('user_id', userId).order('completed_at', { ascending: false }).limit(30),
    
    // Sleep logs (last 7 days)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('sleep_logs').select('*')
      .eq('user_id', userId).order('sleep_date', { ascending: false }).limit(7),
    
    // Meals (recent)
    supabase.from('meals').select('id, logged_at, type, calories')
      .eq('user_id', userId).order('logged_at', { ascending: false }).limit(20),
    
    // Grocery list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('grocery_lists').select('items')
      .eq('user_id', userId).eq('is_active', true).single(),
    
    // Sports activities (this month)
    supabase.from('sports_activities').select('sport, activity_date')
      .eq('user_id', userId).gte('activity_date', monthStart.toISOString())
      .order('activity_date', { ascending: false }),
    
    // Business projects
    supabase.from('business_projects').select('id, status, deadline')
      .eq('user_id', userId),
    
    // Calendar events (upcoming week)
    supabase.from('calendar_events').select('id, title, start_date')
      .eq('user_id', userId).gte('start_date', now.toISOString())
      .lte('start_date', weekFromNow.toISOString())
      .order('start_date', { ascending: true }),
    
    // Trips
    supabase.from('trips').select('id, status')
      .eq('user_id', userId).or('status.eq.planning,status.eq.booked'),
    
    // Bucket list
    supabase.from('bucket_list').select('id').eq('user_id', userId),
    
    // Visited places
    supabase.from('visited_places').select('id').eq('user_id', userId),
  ]);

  // Type assertions for results
  const userPrefs = userPrefsResult as unknown as { 
    data: { display_name?: string; priority_aspects?: string[] } | null; 
    error: unknown 
  };
  
  const trainingLogs = trainingLogsResult as unknown as { 
    data: Array<{ id: string; completed_at: string | null; type: string | null; duration_minutes: number | null }> | null; 
    error: unknown 
  };
  
  const sleepLogs = sleepLogsResult as { 
    data: Array<{ sleep_date: string; hours_slept: number }> | null; 
    error: unknown 
  };
  
  const mealLogs = mealLogsResult as unknown as {
    data: Array<{ id: string; logged_at: string | null; type: string | null; calories: number | null }> | null;
    error: unknown;
  };
  
  const groceryList = groceryResult as { data: { items: unknown[] } | null; error: unknown };
  
  const sportsActivities = sportsResult as unknown as {
    data: Array<{ sport: string; activity_date: string }> | null;
    error: unknown;
  };
  
  const projects = projectsResult as unknown as {
    data: Array<{ id: string; status: string; deadline: string | null }> | null;
    error: unknown;
  };
  
  const events = eventsResult as unknown as {
    data: Array<{ id: string; title: string; start_date: string }> | null;
    error: unknown;
  };
  
  const trips = tripsResult as unknown as { data: Array<{ id: string }> | null; error: unknown };
  const bucketList = bucketListResult as unknown as { data: Array<{ id: string }> | null; error: unknown };
  const visited = visitedResult as unknown as { data: Array<{ id: string }> | null; error: unknown };

  // Calculate training context
  const mappedTrainingLogs = (trainingLogs.data || []).map(log => ({
    workout_date: log.completed_at ? format(new Date(log.completed_at), 'yyyy-MM-dd') : todayStr,
    type: log.type || 'other',
    duration_minutes: log.duration_minutes,
  }));
  
  const trainingContext = calculateTrainingContext(
    mappedTrainingLogs,
    sleepLogs.data || [],
    weekStart,
    weekEnd,
    todayStr
  );

  // Calculate food context
  const todaysMeals = (mealLogs.data || []).filter(m => 
    m.logged_at && format(new Date(m.logged_at), 'yyyy-MM-dd') === todayStr
  );
  
  const foodContext: FoodContext = {
    todaysMeals: todaysMeals.length,
    todaysCalories: todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
    weeklyMealLogs: (mealLogs.data || []).length,
    lastMealLogged: mealLogs.data?.[0]?.logged_at || null,
    groceryItemsCount: Array.isArray(groceryList.data?.items) ? groceryList.data.items.length : 0,
  };

  // Calculate sports context
  const sportCounts: Record<string, number> = {};
  (sportsActivities.data || []).forEach(a => {
    sportCounts[a.sport] = (sportCounts[a.sport] || 0) + 1;
  });
  const favoriteSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  const sportsContext: SportsContext = {
    thisMonthActivities: (sportsActivities.data || []).length,
    favoriteSport,
    lastActivity: sportsActivities.data?.[0]?.sport || null,
  };

  // Calculate business context
  const projectsData = projects.data || [];
  const activeProjects = projectsData.filter(p => p.status === 'active').length;
  const ideasCount = projectsData.filter(p => p.status === 'idea').length;
  const upcomingDeadlines = projectsData.filter(p => 
    p.deadline && new Date(p.deadline) > now && new Date(p.deadline) < weekFromNow
  ).length;
  
  const businessContext: BusinessContext = {
    activeProjects,
    ideasCount,
    upcomingDeadlines,
  };

  // Calculate events context
  const eventsData = events.data || [];
  const todayEvents = eventsData.filter(e => 
    format(new Date(e.start_date), 'yyyy-MM-dd') === todayStr
  );
  
  const eventsContext: EventsContext = {
    todayEvents: todayEvents.length,
    upcomingWeekEvents: eventsData.length,
    nextEvent: eventsData[0]?.title || null,
  };

  // Calculate travel context
  const travelContext: TravelContext = {
    upcomingTrips: (trips.data || []).length,
    bucketListCount: (bucketList.data || []).length,
    placesVisited: (visited.data || []).length,
  };

  // Determine time of day
  const hour = now.getHours();
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  // Extract user preferences
  const prefsData = userPrefs.data as { display_name?: string; priority_aspects?: string[] } | null;
  
  return {
    userName: prefsData?.display_name || null,
    training: trainingContext,
    food: foodContext,
    sports: sportsContext,
    business: businessContext,
    events: eventsContext,
    travel: travelContext,
    priorityAspects: (prefsData?.priority_aspects as AspectType[]) || [],
    todayDate: todayStr,
    dayOfWeek: format(now, 'EEEE'),
    timeOfDay,
  };
}

/**
 * Calculate training-related context from logs
 */
function calculateTrainingContext(
  trainingLogs: Array<{ workout_date: string; type: string; duration_minutes?: number | null }>,
  sleepLogs: Array<{ sleep_date: string; hours_slept: number }>,
  weekStart: Date,
  weekEnd: Date,
  todayStr: string
): TrainingContext {
  // Calculate streak
  let streak = 0;
  if (trainingLogs.length > 0) {
    const sortedDates = [...new Set(trainingLogs.map(l => l.workout_date))].sort().reverse();
    const today = new Date(todayStr);
    let expectedDate = today;
    
    for (const dateStr of sortedDates) {
      const logDate = new Date(dateStr);
      const daysDiff = differenceInDays(expectedDate, logDate);
      
      if (daysDiff === 0 || daysDiff === 1) {
        streak++;
        expectedDate = logDate;
      } else {
        break;
      }
    }
  }

  // Weekly workouts count
  const weeklyWorkouts = trainingLogs.filter(log => {
    const logDate = new Date(log.workout_date);
    return logDate >= weekStart && logDate <= weekEnd;
  }).length;

  // Last workout info
  const lastWorkout = trainingLogs[0];

  // Sleep stats
  const todaysSleep = sleepLogs.find(s => s.sleep_date === todayStr)?.hours_slept || null;
  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((sum, s) => sum + s.hours_slept, 0) / sleepLogs.length
    : null;

  return {
    currentStreak: streak,
    weeklyWorkouts,
    weeklyGoal: 5,
    lastWorkoutDate: lastWorkout?.workout_date || null,
    lastWorkoutType: lastWorkout?.type || null,
    avgSleepHours: avgSleep ? Math.round(avgSleep * 10) / 10 : null,
    todaysSleep,
  };
}

// ============================================================================
// SYSTEM PROMPT BUILDING
// ============================================================================

/**
 * Build a dynamic system prompt with real user context
 */
export function buildContextualSystemPrompt(
  context: UserContext,
  aspectId?: AspectType
): string {
  const userName = context.userName || 'there';

  let prompt = `You are the user's AI life companion in YOUMAXING - think of yourself as a successful, knowledgeable friend who casually helps them optimize their life.

CURRENT CONTEXT:
- User: ${userName}
- Today: ${context.dayOfWeek}, ${context.todayDate}
- Time: ${context.timeOfDay}

USER'S REAL DATA:`;

  // Training context
  prompt += `
TRAINING:
- Workout streak: ${context.training.currentStreak} days
- This week: ${context.training.weeklyWorkouts}/${context.training.weeklyGoal} workouts`;
  
  if (context.training.lastWorkoutDate) {
    const daysAgo = differenceInDays(new Date(context.todayDate), new Date(context.training.lastWorkoutDate));
    prompt += `\n- Last workout: ${daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`} (${context.training.lastWorkoutType})`;
  }
  
  if (context.training.avgSleepHours) {
    prompt += `\n- Avg sleep (7d): ${context.training.avgSleepHours}h`;
  }

  // Food context
  prompt += `

FOOD:
- Meals logged today: ${context.food.todaysMeals}${context.food.todaysCalories > 0 ? ` (${context.food.todaysCalories} cal)` : ''}
- Grocery list items: ${context.food.groceryItemsCount}`;

  // Sports context
  if (context.sports.thisMonthActivities > 0) {
    prompt += `

SPORTS:
- Activities this month: ${context.sports.thisMonthActivities}
- Favorite sport: ${context.sports.favoriteSport || 'N/A'}`;
  }

  // Business context
  if (context.business.activeProjects > 0 || context.business.ideasCount > 0) {
    prompt += `

BUSINESS:
- Active projects: ${context.business.activeProjects}
- Ideas: ${context.business.ideasCount}
- Upcoming deadlines: ${context.business.upcomingDeadlines}`;
  }

  // Events context
  prompt += `

EVENTS:
- Today: ${context.events.todayEvents} event${context.events.todayEvents !== 1 ? 's' : ''}
- This week: ${context.events.upcomingWeekEvents} upcoming${context.events.nextEvent ? `, next: ${context.events.nextEvent}` : ''}`;

  // Travel context
  if (context.travel.upcomingTrips > 0 || context.travel.bucketListCount > 0) {
    prompt += `

TRAVEL:
- Upcoming trips: ${context.travel.upcomingTrips}
- Bucket list: ${context.travel.bucketListCount} places
- Places visited: ${context.travel.placesVisited}`;
  }

  // Personality guidelines
  prompt += `

YOUR PERSONALITY:
- Be casual and friendly, like texting a knowledgeable friend
- Reference their actual data when relevant (streak, last workout, etc.)
- Keep responses concise (2-3 sentences for quick chats)
- Celebrate wins, gently nudge on missed goals
- No emojis unless the context really calls for it
- You can help log workouts, meals, activities, events, and more when asked

AVAILABLE TOOLS:
You have access to tools for managing:
- Training: log workouts, get stats, delete workouts
- Food: log meals, get nutrition summary, manage grocery list
- Sports: log activities, get recent activities
- Business: create/update projects, change status
- Events: create/update/delete calendar events
- TV/Movies: manage watchlist
- Travel: add trips, bucket list items, mark places visited

${aspectId ? `CURRENT FOCUS: The user is in the ${aspectId} section of the app.` : 'GLOBAL MODE: User can ask about any aspect of their life.'}`;

  return prompt;
}

/**
 * Build a minimal context summary for token efficiency
 */
export function buildMinimalContext(context: UserContext): string {
  return `User: ${context.userName || 'User'} | ${context.dayOfWeek} ${context.timeOfDay} | Training: ${context.training.currentStreak}d streak, ${context.training.weeklyWorkouts}/${context.training.weeklyGoal} this week | Sleep: ${context.training.avgSleepHours || '?'}h avg | Events today: ${context.events.todayEvents} | Projects: ${context.business.activeProjects} active`;
}
