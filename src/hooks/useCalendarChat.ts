/**
 * useCalendarChat - Hook for natural language calendar interactions
 * 
 * This hook integrates with the chat memory store and calendar chat API
 * to provide unified CRUD operations via natural language.
 */

import { useCallback } from 'react';
import { useChatStore, getConversationHistory } from '@/lib/chat/store';
import { format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface ToolResult {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

export interface CalendarChatResponse {
  message: string;
  toolResults?: ToolResult[];
  affectedItems?: Array<{ id: string; title: string; type: string }>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useCalendarChat() {
  const { 
    isProcessing, 
    setProcessing, 
    error, 
    setError,
    addMessage,
    updateContext,
    context,
  } = useChatStore();

  /**
   * Process a natural language message and execute calendar operations
   */
  const processMessage = useCallback(async (
    message: string
  ): Promise<CalendarChatResponse> => {
    setProcessing(true);
    setError(null);

    try {
      // Get conversation history for context
      const history = getConversationHistory(15);
      
      // Add the current message to history for the API call
      const messagesForAPI = [
        ...history,
        { role: 'user' as const, content: message },
      ];

      // Build context for the API
      const recentItems: Array<{ id: string; title: string; type: string }> = [];
      
      context.recentTasks.forEach((t) => {
        recentItems.push({ id: t.id, title: t.title, type: 'task' });
      });
      context.recentWeeklyObjectives.forEach((o) => {
        recentItems.push({ id: o.id, title: o.title, type: 'weekly_objective' });
      });
      context.recentMonthlyObjectives.forEach((o) => {
        recentItems.push({ id: o.id, title: o.title, type: 'monthly_objective' });
      });
      context.recentEvents.forEach((e) => {
        recentItems.push({ id: e.id, title: e.title, type: 'event' });
      });

      // Call the calendar chat API
      const response = await fetch('/api/calendar-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForAPI,
          context: {
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            recentItems: recentItems.slice(-10), // Keep last 10 items
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Request failed');
      }

      const data: CalendarChatResponse = await response.json();

      // Update context with affected items
      if (data.affectedItems) {
        const tasks = data.affectedItems
          .filter((i) => i.type === 'task')
          .map((i) => ({ id: i.id, title: i.title }));
        const weeklyObjectives = data.affectedItems
          .filter((i) => i.type === 'weekly_objective')
          .map((i) => ({ id: i.id, title: i.title }));
        const monthlyObjectives = data.affectedItems
          .filter((i) => i.type === 'monthly_objective')
          .map((i) => ({ id: i.id, title: i.title }));
        const events = data.affectedItems
          .filter((i) => i.type === 'event')
          .map((i) => ({ id: i.id, title: i.title }));

        updateContext({
          recentTasks: [...tasks, ...context.recentTasks].slice(0, 5),
          recentWeeklyObjectives: [...weeklyObjectives, ...context.recentWeeklyObjectives].slice(0, 5),
          recentMonthlyObjectives: [...monthlyObjectives, ...context.recentMonthlyObjectives].slice(0, 5),
          recentEvents: [...events, ...context.recentEvents].slice(0, 5),
        });
      }

      return data;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        message: `Sorry, I couldn't process that request: ${errorMessage}`,
      };
    } finally {
      setProcessing(false);
    }
  }, [context, setError, setProcessing, updateContext]);

  /**
   * Send a message and add it to the chat history
   * Returns the AI response
   */
  const sendMessage = useCallback(async (message: string): Promise<string> => {
    // Add user message to store
    addMessage({
      role: 'user',
      content: message,
      aspectId: 'general',
    });

    // Process the message
    const response = await processMessage(message);

    // Add AI response to store
    addMessage({
      role: 'assistant',
      content: response.message,
      aspectId: 'general',
      toolResults: response.toolResults?.map((r, i) => ({
        toolCallId: `tool-${Date.now()}-${i}`,
        success: r.success,
        data: r.data,
        message: r.message,
        error: r.error,
      })),
    });

    return response.message;
  }, [addMessage, processMessage]);

  /**
   * Clear the conversation and reset context
   */
  const clearConversation = useCallback(() => {
    useChatStore.getState().clearMessages();
  }, []);

  return {
    // Methods
    processMessage,
    sendMessage,
    clearConversation,
    
    // State
    processing: isProcessing,
    error,
    
    // Context
    context,
    updateContext,
  };
}

// ============================================================================
// INTENT DETECTION (for UI routing)
// ============================================================================

/**
 * Detect if a message is related to calendar/task operations
 * Used to determine if the message should be routed to calendar chat
 */
export function detectCalendarIntent(message: string): boolean {
  const lower = message.toLowerCase();
  
  // Primary calendar keywords
  const calendarKeywords = [
    'task', 'tasks', 'todo', 'to-do',
    'event', 'events', 'calendar', 'schedule', 'meeting',
    'objective', 'objectives', 'goal', 'goals',
    'weekly', 'monthly', 'daily',
    'remind', 'reminder',
  ];
  
  // Action keywords
  const actionKeywords = [
    'add', 'create', 'new', 'make',
    'show', 'list', 'what', 'view', 'see',
    'complete', 'done', 'finish', 'mark',
    'delete', 'remove', 'cancel',
    'update', 'change', 'edit', 'modify', 'reschedule',
  ];
  
  // Check for calendar keyword presence
  const hasCalendarKeyword = calendarKeywords.some(keyword => lower.includes(keyword));
  const hasActionKeyword = actionKeywords.some(keyword => lower.includes(keyword));
  
  // More specific patterns
  const patterns = [
    /add\s+(?:a\s+)?(?:task|event|meeting|goal|objective)/i,
    /create\s+(?:a\s+)?(?:task|event|meeting|goal|objective)/i,
    /show\s+(?:my\s+)?(?:tasks?|events?|calendar|schedule|goals?|objectives?)/i,
    /list\s+(?:my\s+)?(?:tasks?|events?|goals?|objectives?)/i,
    /what(?:'s|\s+is|\s+are)\s+(?:my\s+)?(?:tasks?|events?|schedule|goals?)/i,
    /(?:complete|finish|done\s+with)\s+(?:the\s+)?/i,
    /schedule\s+(?:a\s+)?/i,
    /(?:this|next)\s+(?:week|month)/i,
    /(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  ];
  
  const matchesPattern = patterns.some(pattern => pattern.test(lower));
  
  return matchesPattern || (hasCalendarKeyword && hasActionKeyword);
}

/**
 * Extract date references from natural language
 */
export function extractDateFromMessage(message: string): string | null {
  const lower = message.toLowerCase();
  const today = new Date();
  
  // Today
  if (lower.includes('today')) {
    return format(today, 'yyyy-MM-dd');
  }
  
  // Tomorrow
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return format(tomorrow, 'yyyy-MM-dd');
  }
  
  // Day names
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const currentDay = today.getDay();
      let daysUntil = i - currentDay;
      
      // If "next" is mentioned or the day is today/past, move to next week
      if (lower.includes('next') || daysUntil <= 0) {
        daysUntil += 7;
      }
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntil);
      return format(targetDate, 'yyyy-MM-dd');
    }
  }
  
  // This week / next week
  if (lower.includes('this week')) {
    return format(today, 'yyyy-MM-dd');
  }
  if (lower.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return format(nextWeek, 'yyyy-MM-dd');
  }
  
  // This month / next month
  if (lower.includes('this month')) {
    return format(today, 'yyyy-MM-dd');
  }
  if (lower.includes('next month')) {
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    return format(nextMonth, 'yyyy-MM-dd');
  }
  
  // Explicit date format (YYYY-MM-DD)
  const dateMatch = lower.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  
  // Natural date (e.g., "January 15", "Jan 15")
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                     'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  for (let i = 0; i < monthNames.length; i++) {
    const pattern = new RegExp(`(${monthNames[i]}|${monthAbbr[i]})\\s+(\\d{1,2})`, 'i');
    const match = lower.match(pattern);
    if (match) {
      const day = parseInt(match[2]);
      const year = today.getFullYear();
      const date = new Date(year, i, day);
      return format(date, 'yyyy-MM-dd');
    }
  }
  
  return null;
}
