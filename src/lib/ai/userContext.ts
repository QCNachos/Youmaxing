/**
 * User Context - Fetches real user data from Supabase to provide AI context
 * 
 * This module builds a structured context summary that gets injected into
 * the AI system prompt, giving the model awareness of the user's actual data.
 */

import { createClient } from '@/lib/supabase/server';
import { startOfWeek, endOfWeek, format, subDays, differenceInDays } from 'date-fns';
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
  weeklyMealLogs: number;
  lastMealLogged: string | null;
}

export interface UserContext {
  userName: string | null;
  training: TrainingContext;
  food: FoodContext;
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

  // Fetch all data in parallel for performance
  // Note: Using type assertions because the generated types may not include 
  // columns added in later migrations (workout_date, duration_seconds, etc.)
  
  // User preferences
  const userPrefsResult = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  const userPrefs = userPrefsResult as unknown as { 
    data: { display_name?: string; priority_aspects?: string[] } | null; 
    error: unknown 
  };
  
  // Training logs (last 30 days for streak calculation)
  const trainingLogsResult = await supabase
    .from('training_logs')
    .select('id, completed_at, type, duration_minutes, notes')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(30);
  const trainingLogs = trainingLogsResult as unknown as { 
    data: Array<{ id: string; completed_at: string | null; type: string | null; duration_minutes: number | null }> | null; 
    error: unknown 
  };
  
  // Sleep logs (last 7 days) - table may not be in generated types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sleepLogsResult = await (supabase as any)
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .order('sleep_date', { ascending: false })
    .limit(7);
  const sleepLogs = sleepLogsResult as { 
    data: Array<{ sleep_date: string; hours_slept: number }> | null; 
    error: unknown 
  };
  
  // Meals (this week)
  const mealLogsResult = await supabase
    .from('meals')
    .select('id, logged_at, type')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(20);
  const mealLogs = mealLogsResult;

  // Calculate training context - map completed_at to workout_date format
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
  const foodContext = calculateFoodContext(
    (mealLogs.data || []).map(m => ({
      id: m.id,
      date: m.logged_at ? format(new Date(m.logged_at), 'yyyy-MM-dd') : todayStr,
      meal_type: m.type || 'snack',
    })),
    todayStr
  );

  // Determine time of day
  const hour = now.getHours();
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  // Extract user preferences with proper typing
  const prefsData = userPrefs.data as { display_name?: string; priority_aspects?: string[] } | null;
  
  return {
    userName: prefsData?.display_name || null,
    training: trainingContext,
    food: foodContext,
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
    weeklyGoal: 5, // TODO: fetch from user preferences
    lastWorkoutDate: lastWorkout?.workout_date || null,
    lastWorkoutType: lastWorkout?.type || null,
    avgSleepHours: avgSleep ? Math.round(avgSleep * 10) / 10 : null,
    todaysSleep,
  };
}

/**
 * Calculate food-related context from logs
 */
function calculateFoodContext(
  mealLogs: Array<{ id: string; date: string; meal_type: string }>,
  todayStr: string
): FoodContext {
  const todaysMeals = mealLogs.filter(m => m.date === todayStr).length;
  const lastMeal = mealLogs.sort((a, b) => b.date.localeCompare(a.date))[0];

  return {
    todaysMeals,
    weeklyMealLogs: mealLogs.length,
    lastMealLogged: lastMeal?.date || null,
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
  const greeting = getTimeGreeting(context.timeOfDay);
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
- Meals logged today: ${context.food.todaysMeals}
- Meals logged this week: ${context.food.weeklyMealLogs}`;

  // Personality guidelines
  prompt += `

YOUR PERSONALITY:
- Be casual and friendly, like texting a knowledgeable friend
- Reference their actual data when relevant (streak, last workout, etc.)
- Keep responses concise (2-3 sentences for quick chats)
- Celebrate wins, gently nudge on missed goals
- No emojis unless the context really calls for it
- You can help log workouts, meals, and sleep when asked

${aspectId ? `CURRENT FOCUS: The user is in the ${aspectId} section of the app.` : 'GLOBAL MODE: User can ask about any aspect of their life.'}`;

  return prompt;
}

/**
 * Get appropriate greeting based on time of day
 */
function getTimeGreeting(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
  switch (timeOfDay) {
    case 'morning': return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening': return 'Good evening';
    case 'night': return 'Hey';
  }
}

/**
 * Build a minimal context summary for token efficiency
 */
export function buildMinimalContext(context: UserContext): string {
  return `User: ${context.userName || 'User'} | ${context.dayOfWeek} ${context.timeOfDay} | Training: ${context.training.currentStreak}d streak, ${context.training.weeklyWorkouts}/${context.training.weeklyGoal} this week | Sleep: ${context.training.avgSleepHours || '?'}h avg`;
}
