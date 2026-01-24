/**
 * Aspect Tools - OpenAI function calling tools for logging data
 * 
 * These tools allow the AI to create training logs, food logs, and sleep logs
 * via natural language conversation.
 */

import type OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const ASPECT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'log_training',
      description: 'Log a workout or training session for the user. Use this when the user mentions they did a workout, went to the gym, ran, etc.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['strength', 'cardio', 'flexibility', 'hiit', 'sports', 'other'],
            description: 'The type of workout',
          },
          title: {
            type: 'string',
            description: 'A short title for the workout (e.g., "Upper Body Day", "5K Run")',
          },
          duration_minutes: {
            type: 'number',
            description: 'Duration of the workout in minutes',
          },
          notes: {
            type: 'string',
            description: 'Optional notes about the workout',
          },
          intensity: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Intensity level of the workout',
          },
          calories_burned: {
            type: 'number',
            description: 'Estimated calories burned (optional)',
          },
        },
        required: ['type', 'title', 'duration_minutes'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_sleep',
      description: 'Log sleep hours for the user. Use this when the user mentions how much they slept.',
      parameters: {
        type: 'object',
        properties: {
          hours_slept: {
            type: 'number',
            description: 'Number of hours slept (e.g., 7.5)',
          },
          quality_rating: {
            type: 'number',
            enum: [1, 2, 3, 4, 5],
            description: 'Sleep quality rating from 1 (poor) to 5 (excellent)',
          },
          notes: {
            type: 'string',
            description: 'Optional notes about sleep (e.g., "woke up once")',
          },
          sleep_date: {
            type: 'string',
            description: 'Date of sleep in YYYY-MM-DD format. Defaults to today if not specified.',
          },
        },
        required: ['hours_slept'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_food',
      description: 'Log a meal or food intake for the user. Use this when the user mentions what they ate.',
      parameters: {
        type: 'object',
        properties: {
          meal_type: {
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            description: 'Type of meal',
          },
          description: {
            type: 'string',
            description: 'Description of what was eaten',
          },
          calories: {
            type: 'number',
            description: 'Estimated calories (optional)',
          },
          protein_g: {
            type: 'number',
            description: 'Estimated protein in grams (optional)',
          },
          notes: {
            type: 'string',
            description: 'Additional notes',
          },
        },
        required: ['meal_type', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_training_stats',
      description: 'Get the user\'s training statistics like workout streak, weekly workouts, etc.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_todays_meals',
      description: 'Get the meals logged for today. Use when user asks what they ate today.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_nutrition_summary',
      description: 'Get nutrition summary (calories, protein) for today or this week.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'week'],
            description: 'Time period for the summary',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_meal',
      description: 'Delete a logged meal. Use when user wants to remove a meal entry.',
      parameters: {
        type: 'object',
        properties: {
          meal_description: {
            type: 'string',
            description: 'Description of the meal to delete (will fuzzy match)',
          },
        },
        required: ['meal_description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_grocery_list',
      description: 'Add an item to the user\'s grocery/shopping list. Use this when the user asks to add something to their shopping list or grocery list.',
      parameters: {
        type: 'object',
        properties: {
          item_name: {
            type: 'string',
            description: 'Name of the item to add (e.g., "butter", "milk", "eggs")',
          },
          quantity: {
            type: 'number',
            description: 'Quantity of items (default 1)',
          },
          unit: {
            type: 'string',
            description: 'Unit of measurement (e.g., "lbs", "oz", "pack", "bottle")',
          },
          category: {
            type: 'string',
            enum: ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'beverages', 'snacks', 'other'],
            description: 'Category for organizing the list',
          },
        },
        required: ['item_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remove_from_grocery_list',
      description: 'Remove an item from the user\'s grocery list. Use this when the user asks to remove or delete something from their shopping list.',
      parameters: {
        type: 'object',
        properties: {
          item_name: {
            type: 'string',
            description: 'Name of the item to remove (will fuzzy match)',
          },
        },
        required: ['item_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'toggle_grocery_item',
      description: 'Mark a grocery item as checked/unchecked. Use this when the user says they got an item or want to uncheck it.',
      parameters: {
        type: 'object',
        properties: {
          item_name: {
            type: 'string',
            description: 'Name of the item to toggle',
          },
          checked: {
            type: 'boolean',
            description: 'Whether to mark as checked (true) or unchecked (false)',
          },
        },
        required: ['item_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_grocery_list',
      description: 'Get the current grocery list items. Use this when the user asks what\'s on their list or wants to see their grocery list.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_checked_grocery_items',
      description: 'Remove all checked items from the grocery list. Use when user wants to clear completed items.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'archive_grocery_list',
      description: 'Archive the current grocery list and start fresh. Use when shopping is complete or user wants to save the list for history.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  // SPORTS TOOLS
  {
    type: 'function',
    function: {
      name: 'log_sport_activity',
      description: 'Log a recreational sports activity (basketball, tennis, golf, etc.). Different from training/workouts.',
      parameters: {
        type: 'object',
        properties: {
          sport: { type: 'string', description: 'Name of the sport (e.g., basketball, tennis, golf)' },
          duration_minutes: { type: 'number', description: 'Duration in minutes' },
          location: { type: 'string', description: 'Where the activity took place' },
          with_team: { type: 'boolean', description: 'Was this a team/group activity?' },
          notes: { type: 'string', description: 'Additional notes' },
        },
        required: ['sport'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_sport_activities',
      description: 'Get recent sports activities.',
      parameters: {
        type: 'object',
        properties: {
          sport: { type: 'string', description: 'Filter by specific sport' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_sport_activity',
      description: 'Delete a sports activity.',
      parameters: {
        type: 'object',
        properties: {
          sport_name: { type: 'string', description: 'Name of the sport to delete (will match most recent)' },
        },
        required: ['sport_name'],
      },
    },
  },
  // BUSINESS TOOLS
  {
    type: 'function',
    function: {
      name: 'create_project',
      description: 'Create a new business project.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Project name' },
          description: { type: 'string', description: 'Project description' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level' },
          deadline: { type: 'string', description: 'Deadline date (YYYY-MM-DD format)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_project_status',
      description: 'Update the status of a business project.',
      parameters: {
        type: 'object',
        properties: {
          project_name: { type: 'string', description: 'Project name to update' },
          status: { type: 'string', enum: ['idea', 'planning', 'active', 'paused', 'completed'], description: 'New status' },
        },
        required: ['project_name', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_projects',
      description: 'Get business projects, optionally filtered by status.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['idea', 'planning', 'active', 'paused', 'completed'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_project',
      description: 'Delete a business project.',
      parameters: {
        type: 'object',
        properties: {
          project_name: { type: 'string', description: 'Project name to delete' },
        },
        required: ['project_name'],
      },
    },
  },
  // EVENTS/CALENDAR TOOLS
  {
    type: 'function',
    function: {
      name: 'create_event',
      description: 'Create a calendar event.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title' },
          description: { type: 'string', description: 'Event description' },
          start_date: { type: 'string', description: 'Start date/time (ISO format or natural language like "tomorrow 3pm")' },
          end_date: { type: 'string', description: 'End date/time (optional)' },
          aspect: { type: 'string', description: 'Related aspect (sports, business, etc.)' },
          all_day: { type: 'boolean', description: 'Is this an all-day event?' },
        },
        required: ['title', 'start_date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_events',
      description: 'Get upcoming calendar events.',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Number of days to look ahead (default 7)' },
          aspect: { type: 'string', description: 'Filter by aspect' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_event',
      description: 'Delete a calendar event.',
      parameters: {
        type: 'object',
        properties: {
          event_title: { type: 'string', description: 'Event title to delete (will fuzzy match)' },
        },
        required: ['event_title'],
      },
    },
  },
  // TRAINING ADDITIONAL TOOLS
  {
    type: 'function',
    function: {
      name: 'get_recent_workouts',
      description: 'Get recent workout/training sessions.',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Number of days to look back (default 7)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_workout',
      description: 'Delete a workout entry.',
      parameters: {
        type: 'object',
        properties: {
          workout_description: { type: 'string', description: 'Workout type or description to delete' },
        },
        required: ['workout_description'],
      },
    },
  },
  // TV/WATCHLIST TOOLS
  {
    type: 'function',
    function: {
      name: 'add_to_watchlist',
      description: 'Add a movie or TV show to the watchlist.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Movie or show title' },
          media_type: { type: 'string', enum: ['movie', 'tv'], description: 'Type of media' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_watchlist',
      description: 'Get the current watchlist.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['want_to_watch', 'watching', 'watched'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_watch_status',
      description: 'Update the watch status of a movie/show.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title to update' },
          status: { type: 'string', enum: ['want_to_watch', 'watching', 'watched'] },
          rating: { type: 'number', description: 'Rating out of 10 (optional)' },
        },
        required: ['title', 'status'],
      },
    },
  },
  // TRAVEL TOOLS
  {
    type: 'function',
    function: {
      name: 'add_trip',
      description: 'Add a trip to the travel planner.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', description: 'Destination city or country' },
          start_date: { type: 'string', description: 'Trip start date' },
          end_date: { type: 'string', description: 'Trip end date' },
          notes: { type: 'string', description: 'Trip notes or plans' },
        },
        required: ['destination'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_trips',
      description: 'Get upcoming trips.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_bucket_list',
      description: 'Add a destination to the travel bucket list.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', description: 'Place to add to bucket list' },
          reason: { type: 'string', description: 'Why you want to visit' },
        },
        required: ['destination'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_place_visited',
      description: 'Mark a place as visited.',
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', description: 'Place visited' },
          visit_date: { type: 'string', description: 'Date of visit' },
          notes: { type: 'string', description: 'Notes about the visit' },
        },
        required: ['destination'],
      },
    },
  },
];

// ============================================================================
// TOOL EXECUTION
// ============================================================================

/**
 * Execute a tool call and return the result
 */
export async function executeAspectTool(
  userId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  try {
    switch (toolName) {
      case 'log_training':
        return await logTraining(userId, args);
      case 'log_sleep':
        return await logSleep(userId, args);
      case 'log_food':
        return await logFood(userId, args);
      case 'get_todays_meals':
        return await getTodaysMeals(userId);
      case 'get_nutrition_summary':
        return await getNutritionSummary(userId, args);
      case 'delete_meal':
        return await deleteMeal(userId, args);
      case 'get_training_stats':
        return await getTrainingStats(userId);
      case 'add_to_grocery_list':
        return await addToGroceryList(userId, args);
      case 'remove_from_grocery_list':
        return await removeFromGroceryList(userId, args);
      case 'toggle_grocery_item':
        return await toggleGroceryItem(userId, args);
      case 'get_grocery_list':
        return await getGroceryList(userId);
      case 'clear_checked_grocery_items':
        return await clearCheckedGroceryItems(userId);
      case 'archive_grocery_list':
        return await archiveGroceryList(userId);
      // Sports tools
      case 'log_sport_activity':
        return await logSportActivity(userId, args);
      case 'get_sport_activities':
        return await getSportActivities(userId, args);
      case 'delete_sport_activity':
        return await deleteSportActivity(userId, args);
      // Business tools
      case 'create_project':
        return await createProject(userId, args);
      case 'update_project_status':
        return await updateProjectStatus(userId, args);
      case 'get_projects':
        return await getProjects(userId, args);
      case 'delete_project':
        return await deleteProject(userId, args);
      // Events tools
      case 'create_event':
        return await createEvent(userId, args);
      case 'get_upcoming_events':
        return await getUpcomingEvents(userId, args);
      case 'delete_event':
        return await deleteEvent(userId, args);
      // Training additional tools
      case 'get_recent_workouts':
        return await getRecentWorkouts(userId, args);
      case 'delete_workout':
        return await deleteWorkout(userId, args);
      // TV/Watchlist tools
      case 'add_to_watchlist':
        return await addToWatchlist(userId, args);
      case 'get_watchlist':
        return await getWatchlist(userId, args);
      case 'update_watch_status':
        return await updateWatchStatus(userId, args);
      // Travel tools
      case 'add_trip':
        return await addTrip(userId, args);
      case 'get_upcoming_trips':
        return await getUpcomingTrips(userId);
      case 'add_to_bucket_list':
        return await addToBucketList(userId, args);
      case 'mark_place_visited':
        return await markPlaceVisited(userId, args);
      default:
        return {
          success: false,
          message: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Log a training/workout session
 */
async function logTraining(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const now = new Date();

  // Build notes with extra info (pace, conditions, etc.)
  let notesContent = (args.notes as string) || '';
  if (args.pace) {
    notesContent = `Pace: ${args.pace}. ${notesContent}`.trim();
  }

  console.log('[AI Tool] Logging training with args:', args);

  // Insert using only columns that exist in the training_logs schema
  const { data, error } = await supabase
    .from('training_logs')
    .insert({
      user_id: userId,
      title: (args.title as string) || `${args.type} workout`,
      type: (args.type as string) || 'cardio',
      duration_minutes: (args.duration_minutes as number) || null,
      intensity: (args.intensity as string) || 'medium',
      notes: notesContent || null,
      completed_at: now.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[AI Tool] Error logging training:', error);
    return {
      success: false,
      message: `Failed to log workout: ${error.message}`,
    };
  }

  console.log('[AI Tool] Successfully logged training:', data);

  return {
    success: true,
    message: `Logged "${args.title}" - ${args.duration_minutes} minutes of ${args.type}`,
    data: { id: (data as { id: string }).id, title: (data as { title: string }).title },
  };
}

/**
 * Log sleep hours
 * Note: sleep_logs table was added in migration 00018 and may not be in generated types
 */
async function logSleep(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const sleepDate = (args.sleep_date as string) || format(new Date(), 'yyyy-MM-dd');

  // Upsert to handle updating existing entry for the day
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (supabase as any)
    .from('sleep_logs')
    .upsert(
      {
        user_id: userId,
        sleep_date: sleepDate,
        hours_slept: args.hours_slept as number,
        quality_rating: (args.quality_rating as number) || null,
        notes: (args.notes as string) || null,
      },
      { onConflict: 'user_id,sleep_date' }
    )
    .select()
    .single();
  
  const { data, error } = result as unknown as { 
    data: { id: string; hours_slept: number } | null; 
    error: { message: string } | null 
  };

  if (error) {
    console.error('Error logging sleep:', error);
    return {
      success: false,
      message: `Failed to log sleep: ${error.message}`,
    };
  }

  const qualityText = args.quality_rating 
    ? ` (quality: ${args.quality_rating}/5)` 
    : '';

  return {
    success: true,
    message: `Logged ${args.hours_slept} hours of sleep for ${sleepDate}${qualityText}`,
    data: { id: data?.id, hours: data?.hours_slept },
  };
}

/**
 * Log a meal
 */
async function logFood(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  // Build meal name from description
  const mealName = args.description as string;

  const { data, error } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      name: mealName,
      type: args.meal_type as string,
      calories: (args.calories as number) || null,
      notes: (args.notes as string) || null,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging meal:', error);
    return {
      success: false,
      message: `Failed to log meal: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Logged ${args.meal_type}: ${mealName}`,
    data: { id: data.id },
  };
}

// ============================================================================
// GET TODAY'S MEALS
// ============================================================================

async function getTodaysMeals(userId: string): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: meals, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: true });

  if (error) {
    return { success: false, message: 'Failed to fetch meals' };
  }

  if (!meals || meals.length === 0) {
    return {
      success: true,
      message: "You haven't logged any meals today. What did you eat?",
      data: { meals: [], count: 0 },
    };
  }

  const mealSummary = meals.map(m => `${m.type}: ${m.name}${m.calories ? ` (${m.calories} cal)` : ''}`).join(', ');
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return {
    success: true,
    message: `Today's meals: ${mealSummary}. Total: ${totalCalories} calories.`,
    data: { meals, count: meals.length, totalCalories },
  };
}

// ============================================================================
// GET NUTRITION SUMMARY
// ============================================================================

async function getNutritionSummary(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const period = (args.period as string) || 'today';
  
  let startDate: string;
  const today = new Date();
  
  if (period === 'week') {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    startDate = format(weekAgo, 'yyyy-MM-dd');
  } else {
    startDate = format(today, 'yyyy-MM-dd');
  }

  const { data: meals, error } = await supabase
    .from('meals')
    .select('calories, type, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', `${startDate}T00:00:00`)
    .order('logged_at', { ascending: true });

  if (error) {
    return { success: false, message: 'Failed to fetch nutrition data' };
  }

  const totalCalories = meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
  const mealCount = meals?.length || 0;
  const avgCaloriesPerMeal = mealCount > 0 ? Math.round(totalCalories / mealCount) : 0;

  const periodLabel = period === 'week' ? 'This week' : 'Today';
  
  return {
    success: true,
    message: `${periodLabel}: ${totalCalories} calories from ${mealCount} meal${mealCount !== 1 ? 's' : ''}. Average ${avgCaloriesPerMeal} cal/meal.`,
    data: { totalCalories, mealCount, avgCaloriesPerMeal, period },
  };
}

// ============================================================================
// DELETE MEAL
// ============================================================================

async function deleteMeal(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const mealDesc = (args.meal_description as string).toLowerCase();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get today's meals
  const { data: meals, error: fetchError } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', `${today}T00:00:00`)
    .order('logged_at', { ascending: false });

  if (fetchError || !meals || meals.length === 0) {
    return { success: false, message: 'No meals found today to delete' };
  }

  // Find matching meal
  const meal = meals.find(m => m.name.toLowerCase().includes(mealDesc));
  
  if (!meal) {
    const recentMeals = meals.slice(0, 3).map(m => m.name).join(', ');
    return { 
      success: false, 
      message: `Couldn't find meal matching "${args.meal_description}". Recent meals: ${recentMeals}` 
    };
  }

  const { error: deleteError } = await supabase
    .from('meals')
    .delete()
    .eq('id', meal.id);

  if (deleteError) {
    return { success: false, message: 'Failed to delete meal' };
  }

  return {
    success: true,
    message: `Deleted ${meal.type}: ${meal.name}`,
    data: { deletedMeal: meal.name },
  };
}

/**
 * Get training statistics for the user
 */
async function getTrainingStats(userId: string): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const now = new Date();
  const weekStart = format(new Date(now.setDate(now.getDate() - now.getDay() + 1)), 'yyyy-MM-dd');

  // Get this week's workouts - using completed_at as it's in the base types
  const weeklyLogsResult = await supabase
    .from('training_logs')
    .select('id, completed_at, type, duration_minutes')
    .eq('user_id', userId)
    .gte('completed_at', weekStart);
  
  const { data: weeklyLogs, error: weeklyError } = weeklyLogsResult as unknown as { 
    data: Array<{ id: string; completed_at: string; type: string; duration_minutes: number | null }> | null; 
    error: { message: string } | null 
  };

  if (weeklyError) {
    return {
      success: false,
      message: `Failed to fetch stats: ${weeklyError.message}`,
    };
  }

  // Get recent sleep
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sleepLogsResult = await (supabase as any)
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .order('sleep_date', { ascending: false })
    .limit(7);
  
  const { data: sleepLogs } = sleepLogsResult as unknown as { 
    data: Array<{ hours_slept: number }> | null; 
    error: unknown 
  };

  const avgSleep = sleepLogs && sleepLogs.length > 0
    ? (sleepLogs.reduce((sum, s) => sum + s.hours_slept, 0) / sleepLogs.length).toFixed(1)
    : null;

  const totalMinutes = weeklyLogs?.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) || 0;

  return {
    success: true,
    message: `This week: ${weeklyLogs?.length || 0} workouts, ${totalMinutes} total minutes. Avg sleep: ${avgSleep || 'no data'}h`,
    data: {
      weeklyWorkouts: weeklyLogs?.length || 0,
      totalMinutes,
      avgSleep,
    },
  };
}

// ============================================================================
// ADD TO GROCERY LIST
// ============================================================================

async function addToGroceryList(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  
  const itemName = args.item_name as string;
  const quantity = (args.quantity as number) || 1;
  const unit = (args.unit as string) || '';
  const category = (args.category as string) || 'other';

  // Find or create the active grocery list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList, error: fetchError } = await (supabase as any)
    .from('grocery_lists')
    .select('id, items')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  let listId: string;
  let currentItems: Array<{ id: string; name: string; quantity: number; unit: string; category: string; checked: boolean }> = [];

  if (fetchError || !existingList) {
    // Create a new grocery list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newList, error: createError } = await (supabase as any)
      .from('grocery_lists')
      .insert({
        user_id: userId,
        name: 'Shopping List',
        items: [],
        is_active: true,
      })
      .select('id')
      .single();

    if (createError || !newList) {
      console.error('Failed to create grocery list:', createError);
      return {
        success: false,
        message: 'Failed to create grocery list',
      };
    }
    listId = newList.id;
  } else {
    listId = existingList.id;
    currentItems = (existingList.items as typeof currentItems) || [];
  }

  // Add the new item
  const newItem = {
    id: `item-${Date.now()}`,
    name: itemName,
    quantity,
    unit,
    category,
    checked: false,
  };

  const updatedItems = [...currentItems, newItem];

  // Update the grocery list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('grocery_lists')
    .update({ 
      items: updatedItems,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId);

  if (updateError) {
    console.error('Failed to update grocery list:', updateError);
    return {
      success: false,
      message: 'Failed to add item to grocery list',
    };
  }

  const quantityStr = quantity > 1 ? `${quantity} ${unit}`.trim() : '';
  const displayName = quantityStr ? `${quantityStr} ${itemName}` : itemName;

  return {
    success: true,
    message: `Added ${displayName} to your grocery list`,
    data: { itemName, quantity, unit, category },
  };
}

// ============================================================================
// REMOVE FROM GROCERY LIST
// ============================================================================

async function removeFromGroceryList(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const itemName = (args.item_name as string).toLowerCase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList, error: fetchError } = await (supabase as any)
    .from('grocery_lists')
    .select('id, items')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (fetchError || !existingList) {
    return { success: false, message: 'No active grocery list found' };
  }

  const items = existingList.items as Array<{ id: string; name: string; quantity: number; unit: string; category: string; checked: boolean }>;
  
  // Fuzzy match - find item containing the search term
  const itemIndex = items.findIndex(i => i.name.toLowerCase().includes(itemName));
  
  if (itemIndex === -1) {
    const availableItems = items.map(i => i.name).slice(0, 5).join(', ');
    return { 
      success: false, 
      message: `Item "${args.item_name}" not found. Items on your list: ${availableItems || 'none'}` 
    };
  }

  const removedItem = items[itemIndex];
  items.splice(itemIndex, 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('grocery_lists')
    .update({ items, updated_at: new Date().toISOString() })
    .eq('id', existingList.id);

  if (updateError) {
    return { success: false, message: 'Failed to remove item' };
  }

  return {
    success: true,
    message: `Removed ${removedItem.name} from your grocery list`,
    data: { removedItem: removedItem.name },
  };
}

// ============================================================================
// TOGGLE GROCERY ITEM
// ============================================================================

async function toggleGroceryItem(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const itemName = (args.item_name as string).toLowerCase();
  const checked = args.checked !== undefined ? args.checked as boolean : true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList, error: fetchError } = await (supabase as any)
    .from('grocery_lists')
    .select('id, items')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (fetchError || !existingList) {
    return { success: false, message: 'No active grocery list found' };
  }

  const items = existingList.items as Array<{ id: string; name: string; quantity: number; unit: string; category: string; checked: boolean }>;
  const itemIndex = items.findIndex(i => i.name.toLowerCase().includes(itemName));
  
  if (itemIndex === -1) {
    return { success: false, message: `Item "${args.item_name}" not found on your list` };
  }

  items[itemIndex].checked = checked;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('grocery_lists')
    .update({ items, updated_at: new Date().toISOString() })
    .eq('id', existingList.id);

  if (updateError) {
    return { success: false, message: 'Failed to update item' };
  }

  const status = checked ? 'checked off' : 'unchecked';
  return {
    success: true,
    message: `${items[itemIndex].name} ${status}`,
    data: { item: items[itemIndex].name, checked },
  };
}

// ============================================================================
// GET GROCERY LIST
// ============================================================================

async function getGroceryList(userId: string): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList, error: fetchError } = await (supabase as any)
    .from('grocery_lists')
    .select('id, name, items')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (fetchError || !existingList) {
    return { 
      success: true, 
      message: 'Your grocery list is empty. Would you like to add something?',
      data: { items: [], total: 0 },
    };
  }

  const items = existingList.items as Array<{ name: string; quantity: number; unit: string; checked: boolean }>;
  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  if (items.length === 0) {
    return { 
      success: true, 
      message: 'Your grocery list is empty. Would you like to add something?',
      data: { items: [], total: 0 },
    };
  }

  const uncheckedList = unchecked.map(i => `${i.quantity} ${i.unit} ${i.name}`.trim()).join(', ');
  const checkedCount = checked.length;

  let message = `You have ${unchecked.length} item${unchecked.length !== 1 ? 's' : ''} to get: ${uncheckedList}`;
  if (checkedCount > 0) {
    message += `. ${checkedCount} item${checkedCount !== 1 ? 's' : ''} already checked off.`;
  }

  return {
    success: true,
    message,
    data: { items: unchecked, checked: checked.length, total: items.length },
  };
}

// ============================================================================
// CLEAR CHECKED GROCERY ITEMS
// ============================================================================

async function clearCheckedGroceryItems(userId: string): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList, error: fetchError } = await (supabase as any)
    .from('grocery_lists')
    .select('id, items')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (fetchError || !existingList) {
    return { success: false, message: 'No active grocery list found' };
  }

  const items = existingList.items as Array<{ id: string; name: string; checked: boolean }>;
  const checkedCount = items.filter(i => i.checked).length;
  
  if (checkedCount === 0) {
    return { success: true, message: 'No checked items to clear' };
  }

  const uncheckedItems = items.filter(i => !i.checked);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('grocery_lists')
    .update({ items: uncheckedItems, updated_at: new Date().toISOString() })
    .eq('id', existingList.id);

  if (updateError) {
    return { success: false, message: 'Failed to clear items' };
  }

  return {
    success: true,
    message: `Cleared ${checkedCount} checked item${checkedCount !== 1 ? 's' : ''} from your list`,
    data: { cleared: checkedCount, remaining: uncheckedItems.length },
  };
}

// ============================================================================
// ARCHIVE GROCERY LIST
// ============================================================================

async function archiveGroceryList(userId: string): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList, error: fetchError } = await (supabase as any)
    .from('grocery_lists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (fetchError || !existingList) {
    return { success: false, message: 'No active grocery list to archive' };
  }

  const items = existingList.items as Array<{ checked: boolean }>;
  if (items.length === 0) {
    return { success: false, message: 'Your grocery list is empty, nothing to archive' };
  }

  const checkedCount = items.filter(i => i.checked).length;

  // Create archive entry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: archiveError } = await (supabase as any)
    .from('grocery_list_archive')
    .insert({
      user_id: userId,
      original_list_id: existingList.id,
      name: existingList.name,
      items: existingList.items,
      total_items: items.length,
      checked_items: checkedCount,
      created_at: existingList.created_at,
    });

  if (archiveError) {
    console.error('Failed to archive list:', archiveError);
    return { success: false, message: 'Failed to archive list' };
  }

  // Clear the current list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: clearError } = await (supabase as any)
    .from('grocery_lists')
    .update({ items: [], updated_at: new Date().toISOString() })
    .eq('id', existingList.id);

  if (clearError) {
    return { success: false, message: 'Archived but failed to clear list' };
  }

  return {
    success: true,
    message: `Archived your grocery list with ${items.length} items. Starting fresh!`,
    data: { archived: items.length, checked: checkedCount },
  };
}

// ============================================================================
// SPORTS TOOLS
// ============================================================================

async function logSportActivity(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('sports_activities')
    .insert({
      user_id: userId,
      sport: args.sport as string,
      duration_minutes: (args.duration_minutes as number) || null,
      location: (args.location as string) || null,
      with_team: (args.with_team as boolean) || false,
      notes: (args.notes as string) || null,
      activity_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Failed to log sports activity' };
  }

  const duration = data.duration_minutes ? ` for ${data.duration_minutes} minutes` : '';
  const team = data.with_team ? ' (team game)' : '';
  
  return {
    success: true,
    message: `Logged ${data.sport}${duration}${team}`,
    data: { id: data.id },
  };
}

async function getSportActivities(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  
  let query = supabase
    .from('sports_activities')
    .select('*')
    .eq('user_id', userId)
    .order('activity_date', { ascending: false })
    .limit(10);

  if (args.sport) {
    query = query.ilike('sport', `%${args.sport}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, message: 'Failed to fetch activities' };
  }

  if (!data || data.length === 0) {
    return { success: true, message: 'No sports activities logged yet.', data: { activities: [] } };
  }

  const summary = data.slice(0, 5).map(a => 
    `${a.sport}${a.duration_minutes ? ` (${a.duration_minutes}min)` : ''} - ${format(new Date(a.activity_date), 'MMM d')}`
  ).join(', ');

  return {
    success: true,
    message: `Recent activities: ${summary}`,
    data: { activities: data, count: data.length },
  };
}

async function deleteSportActivity(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const sportName = (args.sport_name as string).toLowerCase();

  const { data: activities, error: fetchError } = await supabase
    .from('sports_activities')
    .select('*')
    .eq('user_id', userId)
    .ilike('sport', `%${sportName}%`)
    .order('activity_date', { ascending: false })
    .limit(1);

  if (fetchError || !activities || activities.length === 0) {
    return { success: false, message: `No ${args.sport_name} activity found to delete` };
  }

  const activity = activities[0];
  const { error: deleteError } = await supabase
    .from('sports_activities')
    .delete()
    .eq('id', activity.id);

  if (deleteError) {
    return { success: false, message: 'Failed to delete activity' };
  }

  return {
    success: true,
    message: `Deleted ${activity.sport} activity from ${format(new Date(activity.activity_date), 'MMM d')}`,
  };
}

// ============================================================================
// BUSINESS TOOLS
// ============================================================================

async function createProject(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_projects')
    .insert({
      user_id: userId,
      name: args.name as string,
      description: (args.description as string) || null,
      status: 'idea',
      priority: (args.priority as string) || 'medium',
      deadline: (args.deadline as string) || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Failed to create project' };
  }

  return {
    success: true,
    message: `Created project: ${data.name}`,
    data: { id: data.id },
  };
}

async function updateProjectStatus(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const projectName = (args.project_name as string).toLowerCase();
  const newStatus = args.status as string;

  const { data: projects, error: fetchError } = await supabase
    .from('business_projects')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${projectName}%`)
    .limit(1);

  if (fetchError || !projects || projects.length === 0) {
    return { success: false, message: `Project "${args.project_name}" not found` };
  }

  const project = projects[0];
  const { error: updateError } = await supabase
    .from('business_projects')
    .update({ status: newStatus })
    .eq('id', project.id);

  if (updateError) {
    return { success: false, message: 'Failed to update project status' };
  }

  return {
    success: true,
    message: `Updated "${project.name}" status to ${newStatus}`,
  };
}

async function getProjects(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  let query = supabase
    .from('business_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (args.status) {
    query = query.eq('status', args.status);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, message: 'Failed to fetch projects' };
  }

  if (!data || data.length === 0) {
    return { success: true, message: 'No projects found.', data: { projects: [] } };
  }

  const summary = data.slice(0, 5).map(p => `${p.name} (${p.status})`).join(', ');

  return {
    success: true,
    message: `Projects: ${summary}`,
    data: { projects: data, count: data.length },
  };
}

async function deleteProject(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const projectName = (args.project_name as string).toLowerCase();

  const { data: projects, error: fetchError } = await supabase
    .from('business_projects')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${projectName}%`)
    .limit(1);

  if (fetchError || !projects || projects.length === 0) {
    return { success: false, message: `Project "${args.project_name}" not found` };
  }

  const { error: deleteError } = await supabase
    .from('business_projects')
    .delete()
    .eq('id', projects[0].id);

  if (deleteError) {
    return { success: false, message: 'Failed to delete project' };
  }

  return { success: true, message: `Deleted project: ${projects[0].name}` };
}

// ============================================================================
// EVENTS/CALENDAR TOOLS
// ============================================================================

async function createEvent(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  
  // Parse the start date - handle natural language
  let startDate = args.start_date as string;
  if (startDate && !startDate.includes('T')) {
    startDate = new Date(startDate).toISOString();
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      title: args.title as string,
      description: (args.description as string) || null,
      aspect: (args.aspect as string) || 'events',
      start_date: startDate,
      end_date: (args.end_date as string) || null,
      all_day: (args.all_day as boolean) || false,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Failed to create event' };
  }

  return {
    success: true,
    message: `Created event: ${data.title} on ${format(new Date(data.start_date), 'MMM d')}`,
    data: { id: data.id },
  };
}

async function getUpcomingEvents(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const days = (args.days as number) || 7;
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_date', now.toISOString())
    .lte('start_date', futureDate.toISOString())
    .order('start_date', { ascending: true });

  if (args.aspect) {
    query = query.eq('aspect', args.aspect);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, message: 'Failed to fetch events' };
  }

  if (!data || data.length === 0) {
    return { 
      success: true, 
      message: `No events in the next ${days} days.`, 
      data: { events: [] } 
    };
  }

  const summary = data.map(e => 
    `${e.title} (${format(new Date(e.start_date), 'MMM d')})`
  ).join(', ');

  return {
    success: true,
    message: `Upcoming events: ${summary}`,
    data: { events: data, count: data.length },
  };
}

async function deleteEvent(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const eventTitle = (args.event_title as string).toLowerCase();

  const { data: events, error: fetchError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .ilike('title', `%${eventTitle}%`)
    .order('start_date', { ascending: true })
    .limit(1);

  if (fetchError || !events || events.length === 0) {
    return { success: false, message: `Event "${args.event_title}" not found` };
  }

  const { error: deleteError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', events[0].id);

  if (deleteError) {
    return { success: false, message: 'Failed to delete event' };
  }

  return { success: true, message: `Deleted event: ${events[0].title}` };
}

// ============================================================================
// TRAINING ADDITIONAL TOOLS
// ============================================================================

async function getRecentWorkouts(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const days = (args.days as number) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('training_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('workout_date', startDate.toISOString())
    .order('workout_date', { ascending: false });

  if (error) {
    return { success: false, message: 'Failed to fetch workouts' };
  }

  if (!data || data.length === 0) {
    return { 
      success: true, 
      message: `No workouts in the last ${days} days.`, 
      data: { workouts: [] } 
    };
  }

  const summary = data.slice(0, 5).map(w => 
    `${w.workout_type}${w.duration_minutes ? ` (${w.duration_minutes}min)` : ''}`
  ).join(', ');

  return {
    success: true,
    message: `Recent workouts: ${summary}`,
    data: { workouts: data, count: data.length },
  };
}

async function deleteWorkout(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const workoutDesc = (args.workout_description as string).toLowerCase();

  const { data: workouts, error: fetchError } = await supabase
    .from('training_logs')
    .select('*')
    .eq('user_id', userId)
    .ilike('workout_type', `%${workoutDesc}%`)
    .order('workout_date', { ascending: false })
    .limit(1);

  if (fetchError || !workouts || workouts.length === 0) {
    return { success: false, message: `No "${args.workout_description}" workout found` };
  }

  const { error: deleteError } = await supabase
    .from('training_logs')
    .delete()
    .eq('id', workouts[0].id);

  if (deleteError) {
    return { success: false, message: 'Failed to delete workout' };
  }

  return { success: true, message: `Deleted ${workouts[0].workout_type} workout` };
}

// ============================================================================
// TV/WATCHLIST TOOLS
// ============================================================================

async function addToWatchlist(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  // Note: This is a simplified implementation - in production would integrate with TMDB
  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      title: args.title as string,
      media_type: (args.media_type as string) || 'movie',
      status: 'want_to_watch',
    })
    .select()
    .single();

  if (error) {
    // Check if already exists
    if (error.code === '23505') {
      return { success: false, message: `${args.title} is already on your watchlist` };
    }
    return { success: false, message: 'Failed to add to watchlist' };
  }

  return {
    success: true,
    message: `Added "${data.title}" to your watchlist`,
    data: { id: data.id },
  };
}

async function getWatchlist(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  let query = supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (args.status) {
    query = query.eq('status', args.status);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, message: 'Failed to fetch watchlist' };
  }

  if (!data || data.length === 0) {
    return { success: true, message: 'Your watchlist is empty.', data: { items: [] } };
  }

  const byStatus = {
    want_to_watch: data.filter(i => i.status === 'want_to_watch'),
    watching: data.filter(i => i.status === 'watching'),
    watched: data.filter(i => i.status === 'watched'),
  };

  let message = '';
  if (byStatus.watching.length > 0) {
    message += `Currently watching: ${byStatus.watching.map(i => i.title).join(', ')}. `;
  }
  if (byStatus.want_to_watch.length > 0) {
    message += `Want to watch: ${byStatus.want_to_watch.slice(0, 3).map(i => i.title).join(', ')}`;
    if (byStatus.want_to_watch.length > 3) message += ` and ${byStatus.want_to_watch.length - 3} more`;
  }

  return {
    success: true,
    message: message || 'Your watchlist is empty.',
    data: { items: data, count: data.length },
  };
}

async function updateWatchStatus(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();
  const title = (args.title as string).toLowerCase();
  const newStatus = args.status as string;
  const rating = args.rating as number | undefined;

  const { data: items, error: fetchError } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .ilike('title', `%${title}%`)
    .limit(1);

  if (fetchError || !items || items.length === 0) {
    return { success: false, message: `"${args.title}" not found on your watchlist` };
  }

  const updates: Record<string, unknown> = { status: newStatus };
  if (rating !== undefined) {
    updates.user_rating = rating;
  }

  const { error: updateError } = await supabase
    .from('watchlist')
    .update(updates)
    .eq('id', items[0].id);

  if (updateError) {
    return { success: false, message: 'Failed to update status' };
  }

  let message = `Updated "${items[0].title}" to ${newStatus}`;
  if (rating !== undefined) {
    message += ` with rating ${rating}/10`;
  }

  return { success: true, message };
}

// ============================================================================
// TRAVEL TOOLS
// ============================================================================

async function addTrip(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      destination: args.destination as string,
      start_date: (args.start_date as string) || null,
      end_date: (args.end_date as string) || null,
      notes: (args.notes as string) || null,
      status: args.start_date ? 'booked' : 'planning',
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Failed to add trip' };
  }

  const dates = data.start_date 
    ? ` from ${format(new Date(data.start_date), 'MMM d')}${data.end_date ? ` to ${format(new Date(data.end_date), 'MMM d')}` : ''}`
    : '';

  return {
    success: true,
    message: `Added trip to ${data.destination}${dates}`,
    data: { id: data.id },
  };
}

async function getUpcomingTrips(userId: string): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .or('status.eq.planning,status.eq.booked')
    .order('start_date', { ascending: true });

  if (error) {
    return { success: false, message: 'Failed to fetch trips' };
  }

  if (!data || data.length === 0) {
    return { success: true, message: 'No upcoming trips planned.', data: { trips: [] } };
  }

  const summary = data.map(t => 
    `${t.destination}${t.start_date ? ` (${format(new Date(t.start_date), 'MMM d')})` : ''}`
  ).join(', ');

  return {
    success: true,
    message: `Upcoming trips: ${summary}`,
    data: { trips: data, count: data.length },
  };
}

async function addToBucketList(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bucket_list')
    .insert({
      user_id: userId,
      destination: args.destination as string,
      reason: (args.reason as string) || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: `${args.destination} is already on your bucket list` };
    }
    return { success: false, message: 'Failed to add to bucket list' };
  }

  return {
    success: true,
    message: `Added ${data.destination} to your bucket list`,
    data: { id: data.id },
  };
}

async function markPlaceVisited(userId: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('visited_places')
    .insert({
      user_id: userId,
      destination: args.destination as string,
      visit_date: (args.visit_date as string) || new Date().toISOString(),
      notes: (args.notes as string) || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'Failed to mark as visited' };
  }

  return {
    success: true,
    message: `Marked ${data.destination} as visited`,
    data: { id: data.id },
  };
}
