/**
 * Calendar Tools - Natural Language CRUD Operations
 * 
 * This file re-exports from the new chat module for backward compatibility.
 * New code should import from '@/lib/chat' instead.
 */

// Re-export from the new chat module
export {
  CALENDAR_TOOLS,
  executeCalendarTool,
  getToolsForAnthropic,
  getToolsForOpenAI,
  getCalendarSystemPrompt,
  type ToolDefinition,
  type ToolExecutionResult,
} from './chat/tools';

// Legacy type alias for backward compatibility
export type ToolResult = {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
};

/**
 * Format tool response for display
 */
export function formatToolResponse(result: ToolResult): string {
  if (!result.success) {
    return result.error ? `Error: ${result.error}` : result.message || 'Operation failed';
  }
  return result.message || 'Operation completed';
}
