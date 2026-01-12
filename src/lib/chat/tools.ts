/**
 * Calendar Chat Tools - Tool definitions and handlers for LLM-driven CRUD operations
 * 
 * This module defines:
 * 1. Tool schemas (compatible with OpenAI/Anthropic function calling)
 * 2. Tool execution handlers that call database functions
 * 3. Response formatters for user-friendly output
 */

import { format, addDays, startOfWeek, startOfMonth } from 'date-fns';
import {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  toggleTaskStatus,
  getWeeklyObjectives,
  createWeeklyObjective,
  updateWeeklyObjective,
  deleteWeeklyObjective,
  getMonthlyObjectives,
  createMonthlyObjective,
  updateMonthlyObjective,
  deleteMonthlyObjective,
  formatDateForDB,
  getWeekStart,
  getMonthStart,
} from '@/lib/db/tasks';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/db/calendar';
import type { AspectType } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  message: string;
  error?: string;
  affectedItems?: { id: string; title: string }[];
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const CALENDAR_TOOLS: ToolDefinition[] = [
  // ========== DAILY TASKS ==========
  {
    name: 'create_task',
    description: 'Create a new daily task for a specific date',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title/name' },
        date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
        type: { type: 'string', description: 'Task type', enum: ['personal', 'job'] },
        aspect_id: { type: 'string', description: 'Life aspect category', enum: ['training', 'food', 'sports', 'films', 'finance', 'business', 'travel', 'family', 'friends', 'events'] },
        priority: { type: 'string', description: 'Task priority level', enum: ['low', 'medium', 'high'] },
        description: { type: 'string', description: 'Optional task description' },
        estimated_duration_minutes: { type: 'number', description: 'Estimated time to complete in minutes' },
      },
      required: ['title', 'date', 'type', 'aspect_id'],
    },
  },
  {
    name: 'list_tasks',
    description: 'List all daily tasks for a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
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
        status: { type: 'string', description: 'New task status', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
        priority: { type: 'string', description: 'New priority level', enum: ['low', 'medium', 'high'] },
        description: { type: 'string', description: 'New description' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as completed or toggle its completion status',
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

  // ========== WEEKLY OBJECTIVES ==========
  {
    name: 'create_weekly_objective',
    description: 'Create a new weekly objective/goal',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Objective title' },
        date: { type: 'string', description: 'Any date within the target week (YYYY-MM-DD)' },
        type: { type: 'string', description: 'Objective type', enum: ['personal', 'job'] },
        aspect_id: { type: 'string', description: 'Life aspect category', enum: ['training', 'food', 'sports', 'films', 'finance', 'business', 'travel', 'family', 'friends', 'events'] },
        priority: { type: 'string', description: 'Priority level', enum: ['low', 'medium', 'high'] },
        description: { type: 'string', description: 'Optional description' },
      },
      required: ['title', 'date', 'type', 'aspect_id'],
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
    description: 'Update an existing weekly objective',
    parameters: {
      type: 'object',
      properties: {
        objective_id: { type: 'string', description: 'ID of the objective to update' },
        title: { type: 'string', description: 'New title' },
        status: { type: 'string', description: 'New status', enum: ['active', 'completed', 'cancelled'] },
        priority: { type: 'string', description: 'New priority', enum: ['low', 'medium', 'high'] },
        progress_percentage: { type: 'number', description: 'Progress percentage (0-100)' },
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

  // ========== MONTHLY OBJECTIVES ==========
  {
    name: 'create_monthly_objective',
    description: 'Create a new monthly goal/objective',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Objective title' },
        date: { type: 'string', description: 'Any date within the target month (YYYY-MM-DD)' },
        type: { type: 'string', description: 'Objective type', enum: ['personal', 'job'] },
        aspect_id: { type: 'string', description: 'Life aspect category', enum: ['training', 'food', 'sports', 'films', 'finance', 'business', 'travel', 'family', 'friends', 'events'] },
        priority: { type: 'string', description: 'Priority level', enum: ['low', 'medium', 'high'] },
        description: { type: 'string', description: 'Optional description' },
      },
      required: ['title', 'date', 'type', 'aspect_id'],
    },
  },
  {
    name: 'list_monthly_objectives',
    description: 'List monthly objectives for a specific month',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Any date within the target month (YYYY-MM-DD)' },
      },
      required: ['date'],
    },
  },
  {
    name: 'update_monthly_objective',
    description: 'Update an existing monthly objective',
    parameters: {
      type: 'object',
      properties: {
        objective_id: { type: 'string', description: 'ID of the objective to update' },
        title: { type: 'string', description: 'New title' },
        status: { type: 'string', description: 'New status', enum: ['active', 'completed', 'cancelled'] },
        priority: { type: 'string', description: 'New priority', enum: ['low', 'medium', 'high'] },
        progress_percentage: { type: 'number', description: 'Progress percentage (0-100)' },
      },
      required: ['objective_id'],
    },
  },
  {
    name: 'delete_monthly_objective',
    description: 'Delete a monthly objective',
    parameters: {
      type: 'object',
      properties: {
        objective_id: { type: 'string', description: 'ID of the objective to delete' },
      },
      required: ['objective_id'],
    },
  },

  // ========== CALENDAR EVENTS ==========
  {
    name: 'create_event',
    description: 'Create a new calendar event',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        start_date: { type: 'string', description: 'Start date and time in ISO format (YYYY-MM-DDTHH:MM:SS)' },
        end_date: { type: 'string', description: 'Optional end date and time' },
        type: { type: 'string', description: 'Event type', enum: ['personal', 'job'] },
        aspect: { type: 'string', description: 'Life aspect category', enum: ['training', 'food', 'sports', 'films', 'finance', 'business', 'travel', 'family', 'friends', 'events'] },
        description: { type: 'string', description: 'Event description' },
        location: { type: 'string', description: 'Event location' },
        all_day: { type: 'boolean', description: 'Whether this is an all-day event' },
      },
      required: ['title', 'start_date', 'type', 'aspect'],
    },
  },
  {
    name: 'list_events',
    description: 'List calendar events for a specific date or date range',
    parameters: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        end_date: { type: 'string', description: 'Optional end date in YYYY-MM-DD format' },
      },
      required: ['start_date'],
    },
  },
  {
    name: 'update_event',
    description: 'Update an existing calendar event',
    parameters: {
      type: 'object',
      properties: {
        event_id: { type: 'string', description: 'ID of the event to update' },
        title: { type: 'string', description: 'New title' },
        start_date: { type: 'string', description: 'New start date/time' },
        end_date: { type: 'string', description: 'New end date/time' },
        status: { type: 'string', description: 'New status', enum: ['scheduled', 'completed', 'cancelled'] },
        description: { type: 'string', description: 'New description' },
        location: { type: 'string', description: 'New location' },
      },
      required: ['event_id'],
    },
  },
  {
    name: 'delete_event',
    description: 'Delete a calendar event',
    parameters: {
      type: 'object',
      properties: {
        event_id: { type: 'string', description: 'ID of the event to delete' },
      },
      required: ['event_id'],
    },
  },
];

// ============================================================================
// TOOL EXECUTION HANDLERS
// ============================================================================

export async function executeCalendarTool(
  userId: string,
  toolName: string,
  parameters: Record<string, unknown>
): Promise<ToolExecutionResult> {
  try {
    switch (toolName) {
      // ========== DAILY TASKS ==========
      case 'create_task':
        return await handleCreateTask(userId, parameters);
      case 'list_tasks':
        return await handleListTasks(userId, parameters);
      case 'update_task':
        return await handleUpdateTask(parameters);
      case 'complete_task':
        return await handleCompleteTask(parameters);
      case 'delete_task':
        return await handleDeleteTask(parameters);

      // ========== WEEKLY OBJECTIVES ==========
      case 'create_weekly_objective':
        return await handleCreateWeeklyObjective(userId, parameters);
      case 'list_weekly_objectives':
        return await handleListWeeklyObjectives(userId, parameters);
      case 'update_weekly_objective':
        return await handleUpdateWeeklyObjective(parameters);
      case 'delete_weekly_objective':
        return await handleDeleteWeeklyObjective(parameters);

      // ========== MONTHLY OBJECTIVES ==========
      case 'create_monthly_objective':
        return await handleCreateMonthlyObjective(userId, parameters);
      case 'list_monthly_objectives':
        return await handleListMonthlyObjectives(userId, parameters);
      case 'update_monthly_objective':
        return await handleUpdateMonthlyObjective(parameters);
      case 'delete_monthly_objective':
        return await handleDeleteMonthlyObjective(parameters);

      // ========== CALENDAR EVENTS ==========
      case 'create_event':
        return await handleCreateEvent(userId, parameters);
      case 'list_events':
        return await handleListEvents(userId, parameters);
      case 'update_event':
        return await handleUpdateEvent(parameters);
      case 'delete_event':
        return await handleDeleteEvent(parameters);

      default:
        return {
          success: false,
          message: `Unknown tool: ${toolName}`,
          error: 'UNKNOWN_TOOL',
        };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Tool execution error (${toolName}):`, error);
    return {
      success: false,
      message: `Failed to execute ${toolName}`,
      error: errorMessage,
    };
  }
}

// ============================================================================
// TASK HANDLERS
// ============================================================================

async function handleCreateTask(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const task = await createDailyTask({
    user_id: userId,
    title: params.title as string,
    target_date: params.date as string,
    type: params.type as string,
    aspect_id: params.aspect_id as string,
    priority: (params.priority as string) || 'medium',
    description: params.description as string | undefined,
    estimated_duration_minutes: params.estimated_duration_minutes as number | undefined,
  });

  return {
    success: true,
    data: task,
    message: `Created task "${task.title}" for ${format(new Date(task.target_date), 'MMMM d, yyyy')}`,
    affectedItems: [{ id: task.id, title: task.title }],
  };
}

async function handleListTasks(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const date = params.date as string;
  const tasks = await getDailyTasks(userId, date);

  if (!tasks || tasks.length === 0) {
    return {
      success: true,
      data: [],
      message: `No tasks found for ${format(new Date(date), 'MMMM d, yyyy')}`,
    };
  }

  const taskList = tasks.map((t, i) => {
    const status = t.status === 'completed' ? '[x]' : '[ ]';
    const priority = t.priority === 'high' ? '!' : t.priority === 'low' ? '-' : '';
    return `${i + 1}. ${status} ${priority}${t.title} (${t.aspect_id})`;
  });

  return {
    success: true,
    data: tasks,
    message: `Tasks for ${format(new Date(date), 'MMMM d, yyyy')}:\n${taskList.join('\n')}`,
    affectedItems: tasks.map((t) => ({ id: t.id, title: t.title })),
  };
}

async function handleUpdateTask(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const taskId = params.task_id as string;
  const updates: Record<string, unknown> = {};
  
  if (params.title) updates.title = params.title;
  if (params.status) updates.status = params.status;
  if (params.priority) updates.priority = params.priority;
  if (params.description !== undefined) updates.description = params.description;

  const task = await updateDailyTask(taskId, updates);

  return {
    success: true,
    data: task,
    message: `Updated task "${task.title}"`,
    affectedItems: [{ id: task.id, title: task.title }],
  };
}

async function handleCompleteTask(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const taskId = params.task_id as string;
  const task = await toggleTaskStatus(taskId, 'pending');

  return {
    success: true,
    data: task,
    message: `Marked "${task.title}" as ${task.status}`,
    affectedItems: [{ id: task.id, title: task.title }],
  };
}

async function handleDeleteTask(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const taskId = params.task_id as string;
  await deleteDailyTask(taskId);

  return {
    success: true,
    message: 'Task deleted successfully',
  };
}

// ============================================================================
// WEEKLY OBJECTIVE HANDLERS
// ============================================================================

async function handleCreateWeeklyObjective(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const weekStart = getWeekStart(new Date(params.date as string));
  
  const objective = await createWeeklyObjective({
    user_id: userId,
    title: params.title as string,
    target_week_start: weekStart,
    type: params.type as string,
    aspect_id: params.aspect_id as string,
    priority: (params.priority as string) || 'medium',
    description: params.description as string | undefined,
  });

  return {
    success: true,
    data: objective,
    message: `Created weekly objective "${objective.title}" for week of ${format(new Date(weekStart), 'MMMM d, yyyy')}`,
    affectedItems: [{ id: objective.id, title: objective.title }],
  };
}

async function handleListWeeklyObjectives(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const weekStart = getWeekStart(new Date(params.date as string));
  const objectives = await getWeeklyObjectives(userId, weekStart);

  if (!objectives || objectives.length === 0) {
    return {
      success: true,
      data: [],
      message: `No weekly objectives found for week of ${format(new Date(weekStart), 'MMMM d, yyyy')}`,
    };
  }

  const objectiveList = objectives.map((o, i) => {
    const status = o.status === 'completed' ? '[x]' : '[ ]';
    return `${i + 1}. ${status} ${o.title} (${o.progress_percentage}% complete)`;
  });

  return {
    success: true,
    data: objectives,
    message: `Weekly objectives for week of ${format(new Date(weekStart), 'MMMM d, yyyy')}:\n${objectiveList.join('\n')}`,
    affectedItems: objectives.map((o) => ({ id: o.id, title: o.title })),
  };
}

async function handleUpdateWeeklyObjective(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const objectiveId = params.objective_id as string;
  const updates: Record<string, unknown> = {};
  
  if (params.title) updates.title = params.title;
  if (params.status) updates.status = params.status;
  if (params.priority) updates.priority = params.priority;
  if (params.progress_percentage !== undefined) updates.progress_percentage = params.progress_percentage;

  const objective = await updateWeeklyObjective(objectiveId, updates);

  return {
    success: true,
    data: objective,
    message: `Updated weekly objective "${objective.title}"`,
    affectedItems: [{ id: objective.id, title: objective.title }],
  };
}

async function handleDeleteWeeklyObjective(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const objectiveId = params.objective_id as string;
  await deleteWeeklyObjective(objectiveId);

  return {
    success: true,
    message: 'Weekly objective deleted successfully',
  };
}

// ============================================================================
// MONTHLY OBJECTIVE HANDLERS
// ============================================================================

async function handleCreateMonthlyObjective(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const monthStart = getMonthStart(new Date(params.date as string));
  
  const objective = await createMonthlyObjective({
    user_id: userId,
    title: params.title as string,
    target_month: monthStart,
    type: params.type as string,
    aspect_id: params.aspect_id as string,
    priority: (params.priority as string) || 'medium',
    description: params.description as string | undefined,
  });

  return {
    success: true,
    data: objective,
    message: `Created monthly objective "${objective.title}" for ${format(new Date(monthStart), 'MMMM yyyy')}`,
    affectedItems: [{ id: objective.id, title: objective.title }],
  };
}

async function handleListMonthlyObjectives(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const monthStart = getMonthStart(new Date(params.date as string));
  const objectives = await getMonthlyObjectives(userId, monthStart);

  if (!objectives || objectives.length === 0) {
    return {
      success: true,
      data: [],
      message: `No monthly objectives found for ${format(new Date(monthStart), 'MMMM yyyy')}`,
    };
  }

  const objectiveList = objectives.map((o, i) => {
    const status = o.status === 'completed' ? '[x]' : '[ ]';
    return `${i + 1}. ${status} ${o.title} (${o.progress_percentage}% complete)`;
  });

  return {
    success: true,
    data: objectives,
    message: `Monthly objectives for ${format(new Date(monthStart), 'MMMM yyyy')}:\n${objectiveList.join('\n')}`,
    affectedItems: objectives.map((o) => ({ id: o.id, title: o.title })),
  };
}

async function handleUpdateMonthlyObjective(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const objectiveId = params.objective_id as string;
  const updates: Record<string, unknown> = {};
  
  if (params.title) updates.title = params.title;
  if (params.status) updates.status = params.status;
  if (params.priority) updates.priority = params.priority;
  if (params.progress_percentage !== undefined) updates.progress_percentage = params.progress_percentage;

  const objective = await updateMonthlyObjective(objectiveId, updates);

  return {
    success: true,
    data: objective,
    message: `Updated monthly objective "${objective.title}"`,
    affectedItems: [{ id: objective.id, title: objective.title }],
  };
}

async function handleDeleteMonthlyObjective(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const objectiveId = params.objective_id as string;
  await deleteMonthlyObjective(objectiveId);

  return {
    success: true,
    message: 'Monthly objective deleted successfully',
  };
}

// ============================================================================
// CALENDAR EVENT HANDLERS
// ============================================================================

async function handleCreateEvent(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const event = await createCalendarEvent({
    user_id: userId,
    title: params.title as string,
    start_date: params.start_date as string,
    end_date: params.end_date as string | undefined,
    type: params.type as string,
    aspect: params.aspect as string,
    description: params.description as string | undefined,
    location: params.location as string | undefined,
    all_day: params.all_day as boolean | undefined,
  });

  return {
    success: true,
    data: event,
    message: `Created event "${event.title}" on ${format(new Date(event.start_date), 'MMMM d, yyyy')}`,
    affectedItems: [{ id: event.id, title: event.title }],
  };
}

async function handleListEvents(
  userId: string,
  params: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const startDate = params.start_date as string;
  const endDate = (params.end_date as string) || startDate;
  const events = await getCalendarEvents(userId, startDate, endDate);

  if (!events || events.length === 0) {
    return {
      success: true,
      data: [],
      message: `No events found for ${format(new Date(startDate), 'MMMM d, yyyy')}`,
    };
  }

  const eventList = events.map((e, i) => {
    const time = e.all_day ? 'All day' : format(new Date(e.start_date), 'h:mm a');
    return `${i + 1}. ${time} - ${e.title}`;
  });

  return {
    success: true,
    data: events,
    message: `Events for ${format(new Date(startDate), 'MMMM d, yyyy')}:\n${eventList.join('\n')}`,
    affectedItems: events.map((e) => ({ id: e.id, title: e.title })),
  };
}

async function handleUpdateEvent(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const eventId = params.event_id as string;
  const updates: Record<string, unknown> = {};
  
  if (params.title) updates.title = params.title;
  if (params.start_date) updates.start_date = params.start_date;
  if (params.end_date) updates.end_date = params.end_date;
  if (params.status) updates.status = params.status;
  if (params.description !== undefined) updates.description = params.description;
  if (params.location !== undefined) updates.location = params.location;

  const event = await updateCalendarEvent(eventId, updates);

  return {
    success: true,
    data: event,
    message: `Updated event "${event.title}"`,
    affectedItems: [{ id: event.id, title: event.title }],
  };
}

async function handleDeleteEvent(params: Record<string, unknown>): Promise<ToolExecutionResult> {
  const eventId = params.event_id as string;
  await deleteCalendarEvent(eventId);

  return {
    success: true,
    message: 'Event deleted successfully',
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get tool definitions formatted for Anthropic API
 */
export function getToolsForAnthropic() {
  return CALENDAR_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  }));
}

/**
 * Get tool definitions formatted for OpenAI API
 */
export function getToolsForOpenAI() {
  return CALENDAR_TOOLS.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

/**
 * Get the system prompt for calendar operations
 */
export function getCalendarSystemPrompt(currentDate: string, contextSummary: string): string {
  return `You are a helpful calendar and task management assistant for YOUMAXING. Your role is to help users manage their daily tasks, weekly objectives, monthly goals, and calendar events.

CURRENT CONTEXT:
${contextSummary}
Today's date: ${currentDate}

CAPABILITIES:
- Create, list, update, and delete daily tasks
- Create, list, update, and delete weekly objectives  
- Create, list, update, and delete monthly goals
- Create, list, update, and delete calendar events

IMPORTANT GUIDELINES:
1. When creating items, always ask for clarification if the type (personal/job) or aspect is unclear
2. Use the user's natural language to infer dates (e.g., "tomorrow", "next Monday", "this week")
3. For tasks, default to 'personal' type and 'training' aspect if not specified
4. When listing items, present them in a clear, numbered format
5. After completing an action, confirm what was done
6. If an operation fails, explain what went wrong and suggest alternatives

ASPECT MAPPING:
- Workout/Exercise/Gym = training
- Eating/Cooking/Diet = food  
- Movies/TV/Watch = films
- Money/Budget/Invest = finance
- Work/Meeting/Office = business
- Trip/Vacation/Destination = travel
- Family/Kids/Parents = family
- Social/Friends/Party = friends
- Concert/Conference/Festival = events
- Games/Sports/Match = sports

Be concise but helpful. Use the tools provided to execute the user's requests.`;
}


