/**
 * Chat Module Exports
 * 
 * Central export for all chat-related functionality.
 */

// Store
export { 
  useChatStore, 
  getConversationHistory,
  getContextSummary,
  type ChatMessage,
  type ToolCall,
  type ToolResult,
  type ChatContext,
} from './store';

// Tools
export {
  CALENDAR_TOOLS,
  executeCalendarTool,
  getToolsForAnthropic,
  getToolsForOpenAI,
  getCalendarSystemPrompt,
  type ToolDefinition,
  type ToolExecutionResult,
} from './tools';


