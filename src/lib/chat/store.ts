/**
 * Chat Memory Store - Shared conversation state for sidebar/expanded modes
 * 
 * This store persists chat history and context across different chat views,
 * ensuring the AI has the same memory whether accessed from sidebar or expanded mode.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  aspectId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

export interface ChatContext {
  // Current date context for operations
  currentDate: string;
  // Recently referenced items (for follow-up operations)
  recentTasks: { id: string; title: string }[];
  recentWeeklyObjectives: { id: string; title: string }[];
  recentMonthlyObjectives: { id: string; title: string }[];
  recentEvents: { id: string; title: string }[];
}

interface ChatStore {
  // Messages
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  
  // Context for follow-up operations
  context: ChatContext;
  updateContext: (updates: Partial<ChatContext>) => void;
  
  // Processing state
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const getInitialContext = (): ChatContext => ({
  currentDate: new Date().toISOString().split('T')[0],
  recentTasks: [],
  recentWeeklyObjectives: [],
  recentMonthlyObjectives: [],
  recentEvents: [],
});

const getWelcomeMessage = (): ChatMessage => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  return {
    id: 'welcome',
    role: 'assistant',
    content: `${greeting}! I can help you manage your calendar, tasks, and objectives. Try saying things like:

- "Add a task to review project proposal tomorrow"
- "Create a weekly objective to exercise 3 times"
- "Show my tasks for today"
- "Set a monthly goal to read 4 books"
- "Schedule a meeting with John at 3pm on Friday"

What would you like to do?`,
    timestamp: new Date(),
    aspectId: 'general',
  };
};

// ============================================================================
// STORE
// ============================================================================

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Messages
      messages: [getWelcomeMessage()],
      
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      
      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }));
      },
      
      clearMessages: () => {
        set({ messages: [getWelcomeMessage()], context: getInitialContext() });
      },
      
      // Context
      context: getInitialContext(),
      
      updateContext: (updates) => {
        set((state) => ({
          context: { ...state.context, ...updates },
        }));
      },
      
      // Processing state
      isProcessing: false,
      setProcessing: (processing) => set({ isProcessing: processing }),
      
      // Error state
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'youmaxing-chat-store',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        context: state.context,
      }),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get conversation history formatted for LLM API
 */
export function getConversationHistory(maxMessages = 20): { role: 'user' | 'assistant'; content: string }[] {
  const { messages } = useChatStore.getState();
  
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-maxMessages)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
}

/**
 * Get context summary for system prompt
 */
export function getContextSummary(): string {
  const { context } = useChatStore.getState();
  
  const parts: string[] = [
    `Current date: ${context.currentDate}`,
  ];
  
  if (context.recentTasks.length > 0) {
    parts.push(`Recent tasks: ${context.recentTasks.map((t) => `"${t.title}" (ID: ${t.id})`).join(', ')}`);
  }
  
  if (context.recentWeeklyObjectives.length > 0) {
    parts.push(`Recent weekly objectives: ${context.recentWeeklyObjectives.map((o) => `"${o.title}" (ID: ${o.id})`).join(', ')}`);
  }
  
  if (context.recentMonthlyObjectives.length > 0) {
    parts.push(`Recent monthly objectives: ${context.recentMonthlyObjectives.map((o) => `"${o.title}" (ID: ${o.id})`).join(', ')}`);
  }
  
  if (context.recentEvents.length > 0) {
    parts.push(`Recent events: ${context.recentEvents.map((e) => `"${e.title}" (ID: ${e.id})`).join(', ')}`);
  }
  
  return parts.join('\n');
}


