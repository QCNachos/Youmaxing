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
      case 'get_training_stats':
        return await getTrainingStats(userId);
      case 'add_to_grocery_list':
        return await addToGroceryList(userId, args);
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
  const today = format(now, 'yyyy-MM-dd');

  // Build insert object - only include fields that are in the base schema
  // Additional fields (workout_date, duration_seconds) may exist in DB but not types
  const insertData: Record<string, unknown> = {
    user_id: userId,
    type: args.type as string,
    title: args.title as string,
    duration_minutes: args.duration_minutes as number,
    notes: (args.notes as string) || null,
    intensity: (args.intensity as string) || 'medium',
    completed_at: now.toISOString(),
  };

  // Add optional fields that may exist in newer schema
  // These are added dynamically to avoid TypeScript errors
  (insertData as Record<string, unknown>).workout_date = today;
  if (args.duration_minutes) {
    (insertData as Record<string, unknown>).duration_seconds = (args.duration_minutes as number) * 60;
  }
  if (args.calories_burned) {
    (insertData as Record<string, unknown>).calories_burned = args.calories_burned;
  }

  console.log('[AI Tool] Logging training:', insertData);

  // Use type assertion for insert since we have extra fields
  const { data, error } = await supabase
    .from('training_logs')
    .insert(insertData as Parameters<typeof supabase.from<'training_logs'>>['0'] extends string ? never : Record<string, unknown>)
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
