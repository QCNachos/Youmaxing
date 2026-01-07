/**
 * useCalendarChat - Hook for natural language calendar interactions
 * 
 * This hook enables the chat to process natural language requests
 * and execute calendar operations.
 */

import { useState, useCallback } from 'react';
import { executeCalendarTool, formatToolResponse, CALENDAR_TOOLS } from '@/lib/calendar-tools';
import { format } from 'date-fns';

export interface CalendarChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export function useCalendarChat() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process a natural language message and extract/execute tool calls
   * 
   * This is a simplified version - in production, you'd call an LLM API
   * to parse the message and generate tool calls.
   */
  const processMessage = useCallback(async (message: string): Promise<{
    response: string;
    toolResults?: ToolResult[];
  }> => {
    setProcessing(true);
    setError(null);

    try {
      // Parse the message for common patterns
      const toolCalls = parseMessageForToolCalls(message);
      
      if (toolCalls.length === 0) {
        // No calendar operations detected
        return {
          response: "I can help you with calendar operations! Try:\n• Add a task\n• Show my tasks\n• Create a weekly objective\n• List my monthly goals\n• Schedule an event",
        };
      }

      // Execute all tool calls
      const results: ToolResult[] = [];
      for (const toolCall of toolCalls) {
        const result = await executeCalendarTool(toolCall.name, toolCall.parameters);
        results.push(result);
      }

      // Format the response
      const response = results
        .map(result => formatToolResponse(result))
        .join('\n\n');

      return {
        response,
        toolResults: results,
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred';
      setError(errorMessage);
      return {
        response: `❌ Error: ${errorMessage}`,
      };
    } finally {
      setProcessing(false);
    }
  }, []);

  /**
   * Execute a specific tool directly
   */
  const executeTool = useCallback(async (
    toolName: string,
    parameters: Record<string, any>
  ): Promise<ToolResult> => {
    setProcessing(true);
    setError(null);

    try {
      const result = await executeCalendarTool(toolName, parameters);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    processMessage,
    executeTool,
    processing,
    error,
    tools: CALENDAR_TOOLS,
  };
}

/**
 * Simple pattern matching for common calendar operations
 * 
 * In production, this would be replaced with LLM API calls
 * (e.g., OpenAI function calling, Anthropic tool use, etc.)
 */
function parseMessageForToolCalls(message: string): ToolCall[] {
  const lower = message.toLowerCase();
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  
  const toolCalls: ToolCall[] = [];

  // CREATE TASK patterns
  if (lower.includes('add task') || lower.includes('create task') || lower.includes('new task')) {
    // Extract task details
    const title = extractQuotedText(message) || extractAfterKeyword(message, ['task', 'add', 'create']);
    const date = extractDate(lower) || today;
    const type = lower.includes('work') || lower.includes('job') ? 'job' : 'personal';
    const aspect_id = extractAspect(lower);
    const priority = extractPriority(lower);

    if (title) {
      toolCalls.push({
        name: 'create_task',
        parameters: {
          title,
          date,
          type,
          ...(type === 'personal' && aspect_id ? { aspect_id } : {}),
          ...(priority ? { priority } : {}),
        },
      });
    }
  }

  // LIST TASKS patterns
  if (lower.includes('show task') || lower.includes('list task') || lower.includes('my tasks') || lower.includes('what tasks')) {
    const date = extractDate(lower) || today;
    toolCalls.push({
      name: 'list_tasks',
      parameters: { date },
    });
  }

  // COMPLETE TASK patterns
  if (lower.includes('complete') || lower.includes('done') || lower.includes('finish')) {
    // This would need context to get the task_id
    // For now, we'll need to implement a two-step process:
    // 1. List tasks to get IDs
    // 2. User specifies which one to complete
    
    // Simple pattern: "complete task [number]" from a recent list
    const taskMatch = message.match(/task\s+(\d+)/i);
    if (taskMatch) {
      // This would require maintaining conversation context
      // For now, just note that we need the ID
      return toolCalls;
    }
  }

  // CREATE WEEKLY OBJECTIVE patterns
  if (lower.includes('weekly objective') || lower.includes('weekly goal') || lower.includes('this week')) {
    const title = extractQuotedText(message) || extractAfterKeyword(message, ['objective', 'goal', 'week']);
    const type = lower.includes('work') || lower.includes('job') ? 'job' : 'personal';
    const aspect_id = extractAspect(lower);

    if (title) {
      toolCalls.push({
        name: 'create_weekly_objective',
        parameters: {
          title,
          date: today,
          type,
          ...(type === 'personal' && aspect_id ? { aspect_id } : {}),
        },
      });
    }
  }

  // LIST WEEKLY OBJECTIVES
  if (lower.includes('show weekly') || lower.includes('list weekly') || lower.includes('my week')) {
    toolCalls.push({
      name: 'list_weekly_objectives',
      parameters: { date: today },
    });
  }

  // CREATE MONTHLY GOAL patterns
  if (lower.includes('monthly goal') || lower.includes('monthly objective') || lower.includes('this month')) {
    const title = extractQuotedText(message) || extractAfterKeyword(message, ['goal', 'objective', 'month']);
    const type = lower.includes('work') || lower.includes('job') ? 'job' : 'personal';
    const aspect_id = extractAspect(lower);

    if (title) {
      toolCalls.push({
        name: 'create_monthly_goal',
        parameters: {
          title,
          date: today,
          type,
          ...(type === 'personal' && aspect_id ? { aspect_id } : {}),
        },
      });
    }
  }

  // LIST MONTHLY GOALS
  if (lower.includes('show monthly') || lower.includes('list monthly') || lower.includes('my month')) {
    toolCalls.push({
      name: 'list_monthly_goals',
      parameters: { date: today },
    });
  }

  // CREATE EVENT patterns
  if (lower.includes('add event') || lower.includes('create event') || lower.includes('schedule')) {
    const title = extractQuotedText(message) || extractAfterKeyword(message, ['event', 'schedule', 'meeting']);
    const date = extractDate(lower) || today;
    const time = extractTime(message);
    const type = lower.includes('work') || lower.includes('job') ? 'job' : 'personal';
    const aspect = extractAspect(lower);

    if (title) {
      toolCalls.push({
        name: 'create_calendar_event',
        parameters: {
          title,
          date,
          type,
          ...(time ? { time } : {}),
          ...(type === 'personal' && aspect ? { aspect } : {}),
        },
      });
    }
  }

  // LIST EVENTS
  if (lower.includes('show event') || lower.includes('list event') || lower.includes('my events')) {
    const date = extractDate(lower) || today;
    toolCalls.push({
      name: 'list_calendar_events',
      parameters: { date },
    });
  }

  return toolCalls;
}

// ============================================================================
// HELPER FUNCTIONS FOR PARSING
// ============================================================================

function extractQuotedText(text: string): string | null {
  const match = text.match(/"([^"]+)"|'([^']+)'/);
  return match ? (match[1] || match[2]) : null;
}

function extractAfterKeyword(text: string, keywords: string[]): string {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}\\s+(.+?)(?:\\s+for|\\s+on|\\s+at|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

function extractDate(text: string): string | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  
  if (text.includes('today')) return today;
  if (text.includes('tomorrow')) return tomorrow;
  
  // Look for YYYY-MM-DD format
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return dateMatch[1];
  
  // Look for natural dates like "january 15" or "jan 15"
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  for (let i = 0; i < monthNames.length; i++) {
    const monthPattern = new RegExp(`(${monthNames[i]}|${monthAbbr[i]})\\s+(\\d{1,2})`, 'i');
    const match = text.match(monthPattern);
    if (match) {
      const day = parseInt(match[2]);
      const year = new Date().getFullYear();
      return format(new Date(year, i, day), 'yyyy-MM-dd');
    }
  }
  
  return null;
}

function extractTime(text: string): string | null {
  // Look for HH:MM format
  const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const meridian = timeMatch[3]?.toLowerCase();
    
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Look for natural time like "7am" or "3pm"
  const naturalTimeMatch = text.match(/(\d{1,2})\s*(am|pm)/i);
  if (naturalTimeMatch) {
    let hours = parseInt(naturalTimeMatch[1]);
    const meridian = naturalTimeMatch[2].toLowerCase();
    
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:00`;
  }
  
  return null;
}

function extractAspect(text: string): string | null {
  const aspectKeywords = {
    training: ['training', 'gym', 'workout', 'exercise', 'fitness'],
    food: ['food', 'meal', 'diet', 'nutrition', 'eat', 'cook'],
    finance: ['finance', 'money', 'budget', 'investment', 'savings'],
    business: ['business', 'work', 'meeting', 'client', 'project'],
    friends: ['friends', 'social', 'hangout', 'party', 'dinner'],
    sleep: ['sleep', 'rest', 'bedtime', 'nap'],
  };

  for (const [aspect, keywords] of Object.entries(aspectKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return aspect;
    }
  }

  return null;
}

function extractPriority(text: string): string | null {
  if (text.includes('high priority') || text.includes('urgent') || text.includes('important')) {
    return 'high';
  }
  if (text.includes('low priority') || text.includes('whenever')) {
    return 'low';
  }
  return null;
}

