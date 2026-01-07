/**
 * Calendar Tools - Natural Language CRUD Operations
 * 
 * This module provides a structured interface for LLMs to interact with
 * calendar events, daily tasks, weekly objectives, and monthly goals.
 */

import { createClient } from '@/lib/supabase/client';
import { 
  fetchDailyTasks, 
  createDailyTask, 
  updateDailyTask, 
  deleteDailyTask,
  fetchWeeklyObjectives,
  createWeeklyObjective,
  updateWeeklyObjective,
  deleteWeeklyObjective,
  fetchMonthlyObjectives,
  createMonthlyObjective,
  updateMonthlyObjective,
  deleteMonthlyObjective,
} from '@/lib/db/tasks';
import type { AspectType } from '@/types/database';
import { format, parseISO, isValid } from 'date-fns';

// ============================================================================
// TOOL DEFINITIONS FOR LLM
// ============================================================================

export const CALENDAR_TOOLS = [
  {
    name: 'create_task',
    description: 'Create a new daily task for a specific date',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        description: { type: 'string', description: 'Optional task description' },
        aspect_id: { 
          type: 'string', 
          description: 'Life aspect category (training, food, finance, business, friends, sleep). Only for personal tasks.',
          enum: ['training', 'food', 'finance', 'business', 'friends', 'sleep']
        },
        type: { 
          type: 'string', 
          description: 'Task type: personal or job',
          enum: ['personal', 'job']
        },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
        estimated_duration_minutes: { type: 'number', description: 'Estimated duration in minutes' },
      },
      required: ['title', 'date', 'type'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List all daily tasks for a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
      required: ['date'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing daily task',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'ID of the task to update' },
        title: { type: 'string', description: 'New task title' },
        description: { type: 'string', description: 'New task description' },
        status: { 
          type: 'string', 
          description: 'Task status',
          enum: ['pending', 'in_progress', 'completed']
        },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
        estimated_duration_minutes: { type: 'number', description: 'Estimated duration in minutes' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as completed',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'ID of the task to complete' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a daily task',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'ID of the task to delete' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'create_weekly_objective',
    description: 'Create a new weekly objective',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Objective title' },
        date: { type: 'string', description: 'Any date within the target week (YYYY-MM-DD)' },
        description: { type: 'string', description: 'Optional objective description' },
        aspect_id: { 
          type: 'string', 
          description: 'Life aspect category. Only for personal objectives.',
          enum: ['training', 'food', 'finance', 'business', 'friends', 'sleep']
        },
        type: { 
          type: 'string', 
          description: 'Objective type: personal or job',
          enum: ['personal', 'job']
        },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
        progress_percentage: { type: 'number', description: 'Progress (0-100)' },
      },
      required: ['title', 'date', 'type'],
    },
  },
  {
    name: 'list_weekly_objectives',
    description: 'List weekly objectives for a specific week',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Any date within the target week (YYYY-MM-DD)' },
      },
      required: ['date'],
    },
  },
  {
    name: 'update_weekly_objective',
    description: 'Update a weekly objective',
    parameters: {
      type: 'object',
      properties: {
        objective_id: { type: 'string', description: 'ID of the objective to update' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        progress_percentage: { type: 'number', description: 'Progress (0-100)' },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
      },
      required: ['objective_id'],
    },
  },
  {
    name: 'delete_weekly_objective',
    description: 'Delete a weekly objective',
    parameters: {
      type: 'object',
      properties: {
        objective_id: { type: 'string', description: 'ID of the objective to delete' },
      },
      required: ['objective_id'],
    },
  },
  {
    name: 'create_monthly_goal',
    description: 'Create a new monthly goal',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Goal title' },
        date: { type: 'string', description: 'Any date within the target month (YYYY-MM-DD)' },
        description: { type: 'string', description: 'Optional goal description' },
        aspect_id: { 
          type: 'string', 
          description: 'Life aspect category. Only for personal goals.',
          enum: ['training', 'food', 'finance', 'business', 'friends', 'sleep']
        },
        type: { 
          type: 'string', 
          description: 'Goal type: personal or job',
          enum: ['personal', 'job']
        },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
        progress_percentage: { type: 'number', description: 'Progress (0-100)' },
      },
      required: ['title', 'date', 'type'],
    },
  },
  {
    name: 'list_monthly_goals',
    description: 'List monthly goals for a specific month',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Any date within the target month (YYYY-MM-DD)' },
      },
      required: ['date'],
    },
  },
  {
    name: 'update_monthly_goal',
    description: 'Update a monthly goal',
    parameters: {
      type: 'object',
      properties: {
        goal_id: { type: 'string', description: 'ID of the goal to update' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        progress_percentage: { type: 'number', description: 'Progress (0-100)' },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
      },
      required: ['goal_id'],
    },
  },
  {
    name: 'delete_monthly_goal',
    description: 'Delete a monthly goal',
    parameters: {
      type: 'object',
      properties: {
        goal_id: { type: 'string', description: 'ID of the goal to delete' },
      },
      required: ['goal_id'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Create a calendar event',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        date: { type: 'string', description: 'Event date in YYYY-MM-DD format' },
        time: { type: 'string', description: 'Event time in HH:MM format (optional)' },
        description: { type: 'string', description: 'Event description (optional)' },
        aspect: { 
          type: 'string', 
          description: 'Life aspect category. Only for personal events.',
          enum: ['training', 'food', 'finance', 'business', 'friends', 'sleep']
        },
        type: { 
          type: 'string', 
          description: 'Event type: personal or job',
          enum: ['personal', 'job']
        },
        priority: { 
          type: 'string', 
          description: 'Priority level',
          enum: ['low', 'medium', 'high']
        },
      },
      required: ['title', 'date', 'type'],
    },
  },
  {
    name: 'list_calendar_events',
    description: 'List calendar events for a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
      required: ['date'],
    },
  },
] as const;

// ============================================================================
// TOOL HANDLERS
// ============================================================================

type ToolResult = {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
};

/**
 * Main dispatcher for calendar tool calls
 */
export async function executeCalendarTool(
  toolName: string,
  parameters: Record<string, any>
): Promise<ToolResult> {
  try {
    switch (toolName) {
      // Daily Tasks
      case 'create_task':
        return await handleCreateTask(parameters);
      case 'list_tasks':
        return await handleListTasks(parameters);
      case 'update_task':
        return await handleUpdateTask(parameters);
      case 'complete_task':
        return await handleCompleteTask(parameters);
      case 'delete_task':
        return await handleDeleteTask(parameters);
      
      // Weekly Objectives
      case 'create_weekly_objective':
        return await handleCreateWeeklyObjective(parameters);
      case 'list_weekly_objectives':
        return await handleListWeeklyObjectives(parameters);
      case 'update_weekly_objective':
        return await handleUpdateWeeklyObjective(parameters);
      case 'delete_weekly_objective':
        return await handleDeleteWeeklyObjective(parameters);
      
      // Monthly Goals
      case 'create_monthly_goal':
        return await handleCreateMonthlyGoal(parameters);
      case 'list_monthly_goals':
        return await handleListMonthlyGoals(parameters);
      case 'update_monthly_goal':
        return await handleUpdateMonthlyGoal(parameters);
      case 'delete_monthly_goal':
        return await handleDeleteMonthlyGoal(parameters);
      
      // Calendar Events
      case 'create_calendar_event':
        return await handleCreateCalendarEvent(parameters);
      case 'list_calendar_events':
        return await handleListCalendarEvents(parameters);
      
      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error: any) {
    console.error(`Error executing tool ${toolName}:`, error);
    return {
      success: false,
      error: error?.message || 'An error occurred',
    };
  }
}

// ============================================================================
// DAILY TASKS HANDLERS
// ============================================================================

async function handleCreateTask(params: any): Promise<ToolResult> {
  const { title, date, description, aspect_id, type, priority, estimated_duration_minutes } = params;
  
  // Validate date
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  // If type is job, use 'business' as default aspect
  const finalAspectId = type === 'job' ? 'business' : (aspect_id || 'training');
  
  const task = await createDailyTask({
    title,
    date: parsedDate,
    description: description || '',
    aspect_id: finalAspectId as AspectType,
    type: type || 'personal',
    priority: priority || 'medium',
    estimated_duration_minutes: estimated_duration_minutes || 30,
  });

  return {
    success: true,
    data: task,
    message: `✅ Task created: "${title}" for ${format(parsedDate, 'MMMM d, yyyy')}`,
  };
}

async function handleListTasks(params: any): Promise<ToolResult> {
  const { date } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const tasks = await fetchDailyTasks(parsedDate);
  
  return {
    success: true,
    data: tasks,
    message: `Found ${tasks.length} task${tasks.length !== 1 ? 's' : ''} for ${format(parsedDate, 'MMMM d, yyyy')}`,
  };
}

async function handleUpdateTask(params: any): Promise<ToolResult> {
  const { task_id, ...updates } = params;
  
  await updateDailyTask(task_id, updates);
  
  return {
    success: true,
    message: '✅ Task updated successfully',
  };
}

async function handleCompleteTask(params: any): Promise<ToolResult> {
  const { task_id } = params;
  
  await updateDailyTask(task_id, { status: 'completed' });
  
  return {
    success: true,
    message: '✅ Task marked as completed',
  };
}

async function handleDeleteTask(params: any): Promise<ToolResult> {
  const { task_id } = params;
  
  await deleteDailyTask(task_id);
  
  return {
    success: true,
    message: '🗑️ Task deleted',
  };
}

// ============================================================================
// WEEKLY OBJECTIVES HANDLERS
// ============================================================================

async function handleCreateWeeklyObjective(params: any): Promise<ToolResult> {
  const { title, date, description, aspect_id, type, priority, progress_percentage } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const finalAspectId = type === 'job' ? 'business' : (aspect_id || 'training');
  
  const objective = await createWeeklyObjective({
    title,
    week_start_date: parsedDate,
    description: description || '',
    aspect_id: finalAspectId as AspectType,
    type: type || 'personal',
    priority: priority || 'medium',
    progress_percentage: progress_percentage || 0,
  });

  return {
    success: true,
    data: objective,
    message: `✅ Weekly objective created: "${title}"`,
  };
}

async function handleListWeeklyObjectives(params: any): Promise<ToolResult> {
  const { date } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const objectives = await fetchWeeklyObjectives(parsedDate);
  
  return {
    success: true,
    data: objectives,
    message: `Found ${objectives.length} weekly objective${objectives.length !== 1 ? 's' : ''}`,
  };
}

async function handleUpdateWeeklyObjective(params: any): Promise<ToolResult> {
  const { objective_id, ...updates } = params;
  
  await updateWeeklyObjective(objective_id, updates);
  
  return {
    success: true,
    message: '✅ Weekly objective updated',
  };
}

async function handleDeleteWeeklyObjective(params: any): Promise<ToolResult> {
  const { objective_id } = params;
  
  await deleteWeeklyObjective(objective_id);
  
  return {
    success: true,
    message: '🗑️ Weekly objective deleted',
  };
}

// ============================================================================
// MONTHLY GOALS HANDLERS
// ============================================================================

async function handleCreateMonthlyGoal(params: any): Promise<ToolResult> {
  const { title, date, description, aspect_id, type, priority, progress_percentage } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const finalAspectId = type === 'job' ? 'business' : (aspect_id || 'training');
  
  const goal = await createMonthlyObjective({
    title,
    month_start_date: parsedDate,
    description: description || '',
    aspect_id: finalAspectId as AspectType,
    type: type || 'personal',
    priority: priority || 'medium',
    progress_percentage: progress_percentage || 0,
  });

  return {
    success: true,
    data: goal,
    message: `✅ Monthly goal created: "${title}"`,
  };
}

async function handleListMonthlyGoals(params: any): Promise<ToolResult> {
  const { date } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const goals = await fetchMonthlyObjectives(parsedDate);
  
  return {
    success: true,
    data: goals,
    message: `Found ${goals.length} monthly goal${goals.length !== 1 ? 's' : ''}`,
  };
}

async function handleUpdateMonthlyGoal(params: any): Promise<ToolResult> {
  const { goal_id, ...updates } = params;
  
  await updateMonthlyObjective(goal_id, updates);
  
  return {
    success: true,
    message: '✅ Monthly goal updated',
  };
}

async function handleDeleteMonthlyGoal(params: any): Promise<ToolResult> {
  const { goal_id } = params;
  
  await deleteMonthlyObjective(goal_id);
  
  return {
    success: true,
    message: '🗑️ Monthly goal deleted',
  };
}

// ============================================================================
// CALENDAR EVENTS HANDLERS
// ============================================================================

async function handleCreateCalendarEvent(params: any): Promise<ToolResult> {
  const { title, date, time, description, aspect, type, priority } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const finalAspect = type === 'job' ? 'business' : (aspect || 'training');

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      title,
      date: format(parsedDate, 'yyyy-MM-dd'),
      time: time || null,
      description: description || null,
      aspect: finalAspect,
      type: type || 'personal',
      priority: priority || 'medium',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    data,
    message: `✅ Event created: "${title}" ${time ? `at ${time}` : ''} on ${format(parsedDate, 'MMMM d, yyyy')}`,
  };
}

async function handleListCalendarEvents(params: any): Promise<ToolResult> {
  const { date } = params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', format(parsedDate, 'yyyy-MM-dd'))
    .order('time', { ascending: true });

  if (error) throw error;

  return {
    success: true,
    data: events || [],
    message: `Found ${events?.length || 0} event${events?.length !== 1 ? 's' : ''} for ${format(parsedDate, 'MMMM d, yyyy')}`,
  };
}

// ============================================================================
// HELPER FUNCTIONS FOR LLM CONTEXT
// ============================================================================

/**
 * Generate a formatted response for the LLM to present to the user
 */
export function formatToolResponse(result: ToolResult): string {
  if (!result.success) {
    return `❌ Error: ${result.error}`;
  }

  let response = result.message || '✅ Operation completed';

  // Add data details if present
  if (result.data) {
    if (Array.isArray(result.data)) {
      // List of items
      if (result.data.length > 0) {
        response += '\n\n';
        result.data.forEach((item: any, index: number) => {
          const status = item.status === 'completed' ? '✅' : '⏳';
          const progress = item.progress_percentage !== undefined ? ` (${item.progress_percentage}%)` : '';
          response += `${index + 1}. ${status} ${item.title}${progress}\n`;
          
          if (item.description) {
            response += `   ${item.description}\n`;
          }
          
          // Add metadata
          const meta = [];
          if (item.priority) meta.push(`Priority: ${item.priority}`);
          if (item.type) meta.push(`Type: ${item.type}`);
          if (item.aspect_id || item.aspect) meta.push(`Category: ${item.aspect_id || item.aspect}`);
          if (item.time) meta.push(`Time: ${item.time}`);
          if (item.estimated_duration_minutes) meta.push(`Duration: ${item.estimated_duration_minutes}min`);
          
          if (meta.length > 0) {
            response += `   ${meta.join(' • ')}\n`;
          }
          
          response += '\n';
        });
      }
    } else if (typeof result.data === 'object') {
      // Single item
      response += `\n\nID: ${result.data.id}`;
    }
  }

  return response;
}

/**
 * Get system prompt for calendar operations
 */
export function getCalendarSystemPrompt(): string {
  return `
You have access to calendar management tools. You can help users:

1. **Daily Tasks** - Create, list, update, complete, or delete daily tasks
2. **Weekly Objectives** - Manage weekly goals and objectives
3. **Monthly Goals** - Track long-term monthly goals
4. **Calendar Events** - Schedule and manage calendar events

**Important Rules:**
- When type is "job", DO NOT ask for aspect_id (it defaults to business)
- When type is "personal", aspect_id is required (training, food, finance, business, friends, sleep)
- Always use YYYY-MM-DD format for dates
- For "today", use the current date
- For "tomorrow", add 1 day to current date
- For "this week/month", use current date

**Natural Language Examples:**
- "Add a gym task for tomorrow" → create_task with date=tomorrow
- "Show my tasks for today" → list_tasks with date=today
- "Mark task XYZ as done" → complete_task with task_id
- "Create weekly objective to read 3 books" → create_weekly_objective
- "Update my monthly goal progress to 50%" → update_monthly_goal with progress_percentage=50
- "Delete that meeting" → Need to get task_id first by listing

Always provide friendly, contextual responses after executing operations.
`;
}

