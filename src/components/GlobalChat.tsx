'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useChatStore, type ChatMessage } from '@/lib/chat/store';
import { useCalendarChat, detectCalendarIntent } from '@/hooks/useCalendarChat';
import { aspects } from '@/lib/aspects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Send,
  Sparkles,
  Lightbulb,
  Filter,
  X,
  Calendar,
  CheckCircle2,
  Target,
  Trash2,
  Loader2,
} from 'lucide-react';

// Filter out settings from aspects
const chatAspects = aspects.filter(a => a.id !== 'settings');

// ============================================================================
// COMPONENT
// ============================================================================

export function GlobalChat() {
  const { currentAspect, theme } = useAppStore();
  const { 
    messages, 
    addMessage, 
    clearMessages,
    isProcessing: storeProcessing,
  } = useChatStore();
  const { sendMessage, processing: chatProcessing } = useCalendarChat();
  
  const [input, setInput] = useState('');
  const [filterAspect, setFilterAspect] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);
  const isProcessing = storeProcessing || chatProcessing;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages by aspect
  const filteredMessages = filterAspect 
    ? messages.filter(m => m.aspectId === filterAspect || m.aspectId === 'general' || !m.aspectId)
    : messages;

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const messageText = input.trim();
    setInput('');

    // Check if this is a calendar-related message
    const isCalendarMessage = detectCalendarIntent(messageText);

    if (isCalendarMessage) {
      // Use the calendar chat hook which handles adding messages
      await sendMessage(messageText);
    } else {
      // Add user message
      addMessage({
        role: 'user',
        content: messageText,
        aspectId: currentAspect,
      });

      // For non-calendar messages, use the regular chat API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.slice(-10).map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })).concat([{ role: 'user', content: messageText }]),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          addMessage({
            role: 'assistant',
            content: data.message || 'I understood your request.',
            aspectId: currentAspect,
          });
        } else {
          // Fallback response
          addMessage({
            role: 'assistant',
            content: getAIResponse(messageText, currentAspect),
            aspectId: currentAspect,
          });
        }
      } catch {
        // Fallback response on error
        addMessage({
          role: 'assistant',
          content: getAIResponse(messageText, currentAspect),
          aspectId: currentAspect,
        });
      }
    }
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div className={cn(
      "h-full flex flex-col backdrop-blur-sm rounded-3xl border overflow-hidden transition-all duration-300",
      theme === 'light'
        ? "bg-white/70 border-violet-200/40 shadow-lg shadow-violet-200/20"
        : "bg-black/30 border-white/5"
    )}>
      {/* Header with Filters */}
      <div className={cn(
        "flex items-center justify-between px-5 py-4 border-b",
        theme === 'light' ? "border-violet-100" : "border-white/5"
      )}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${currentAspectConfig?.color}80, ${currentAspectConfig?.color}40)`,
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-sm",
              theme === 'light' ? "text-slate-800" : "text-white"
            )}>AI Assistant</h3>
            <p className={cn(
              "text-xs",
              theme === 'light' ? "text-slate-400" : "text-white/40"
            )}>Tasks, Calendar & More</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className={cn(
              "rounded-xl",
              theme === 'light'
                ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                : "text-white/40 hover:text-red-400 hover:bg-red-500/10"
            )}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "rounded-xl gap-2",
              theme === 'light'
                ? cn(
                    "text-slate-500 hover:text-violet-600 hover:bg-violet-50",
                    filterAspect && "bg-violet-50 text-violet-600"
                  )
                : cn(
                    "text-white/60 hover:text-white hover:bg-white/10",
                    filterAspect && "bg-white/10 text-white"
                  )
            )}
          >
            <Filter className="h-4 w-4" />
            {filterAspect ? (
              <span className="text-xs">
                {chatAspects.find(a => a.id === filterAspect)?.name}
              </span>
            ) : (
              <span className="text-xs">All</span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className={cn(
          "px-4 py-3 border-b flex flex-wrap gap-2 animate-fade-in",
          theme === 'light' ? "border-violet-100" : "border-white/5"
        )}>
          <button
            onClick={() => { setFilterAspect(null); setShowFilters(false); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              theme === 'light'
                ? !filterAspect
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                : !filterAspect
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
            )}
          >
            All Messages
          </button>
          {chatAspects.map((aspect) => {
            const Icon = aspect.icon;
            return (
              <button
                key={aspect.id}
                onClick={() => { setFilterAspect(aspect.id); setShowFilters(false); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                  filterAspect === aspect.id
                    ? theme === 'light' ? "text-white" : "text-white"
                    : theme === 'light'
                      ? "bg-slate-100 text-slate-500 hover:text-slate-700"
                      : "bg-white/5 text-white/50 hover:text-white/70"
                )}
                style={filterAspect === aspect.id ? {
                  backgroundColor: `${aspect.color}${theme === 'light' ? '' : '40'}`,
                } : undefined}
              >
                <Icon className="h-3 w-3" />
                {aspect.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Indicator */}
      {filterAspect && !showFilters && (
        <div className={cn(
          "px-4 py-2 border-b flex items-center gap-2",
          theme === 'light' ? "border-violet-100" : "border-white/5"
        )}>
          <span className={cn("text-xs", theme === 'light' ? "text-slate-400" : "text-white/40")}>Showing:</span>
          <div
            className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{
              backgroundColor: `${chatAspects.find(a => a.id === filterAspect)?.color}${theme === 'light' ? '20' : '30'}`,
              color: chatAspects.find(a => a.id === filterAspect)?.color
            }}
          >
            {(() => {
              const asp = chatAspects.find(a => a.id === filterAspect);
              if (!asp) return null;
              const Icon = asp.icon;
              return <><Icon className="h-3 w-3" />{asp.name}</>;
            })()}
          </div>
          <button
            onClick={() => setFilterAspect(null)}
            className={cn(
              "ml-auto transition-colors",
              theme === 'light' ? "text-slate-400 hover:text-slate-600" : "text-white/40 hover:text-white/60"
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {filteredMessages.map((message) => {
          const msgAspect = chatAspects.find(a => a.id === message.aspectId);
          const isUser = message.role === 'user';
          const isSuggestion = message.content.startsWith('[suggestion]');
          
          return (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 animate-fade-in',
                isUser && 'flex-row-reverse'
              )}
            >
              {/* AI Avatar */}
              {!isUser && !isSuggestion && (
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentAspectConfig?.color}70, ${currentAspectConfig?.color}30)`,
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              
              {/* Suggestion Avatar */}
              {isSuggestion && (
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: msgAspect ? `${msgAspect.color}30` : 'rgba(251, 191, 36, 0.2)',
                  }}
                >
                  {msgAspect ? (
                    <msgAspect.icon className="h-3.5 w-3.5" style={{ color: msgAspect.color }} />
                  ) : (
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  'max-w-[75%] px-4 py-2.5 rounded-2xl',
                  isUser
                    ? 'rounded-tr-lg'
                    : 'rounded-tl-lg',
                  isUser
                    ? theme === 'light'
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/10 text-white'
                    : isSuggestion
                    ? 'border'
                    : theme === 'light'
                      ? 'bg-slate-50 border border-slate-200 text-slate-700'
                      : 'bg-white/5 border border-white/10 text-white/90'
                )}
                style={isSuggestion && msgAspect ? {
                  backgroundColor: `${msgAspect.color}${theme === 'light' ? '10' : '10'}`,
                  borderColor: `${msgAspect.color}${theme === 'light' ? '30' : '30'}`,
                  color: theme === 'light' ? undefined : 'rgba(255,255,255,0.9)',
                } : undefined}
              >
                <p className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  isSuggestion && theme === 'light' && "text-slate-700"
                )}>
                  {isSuggestion ? message.content.replace('[suggestion]', '') : message.content}
                </p>

                {/* Tool results indicator */}
                {message.toolResults && message.toolResults.length > 0 && (
                  <div className={cn(
                    "mt-2 pt-2 border-t flex items-center gap-2",
                    theme === 'light' ? "border-slate-200" : "border-white/10"
                  )}>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      {message.toolResults.length} action(s) completed
                    </span>
                  </div>
                )}

                {/* Timestamp */}
                <p className={cn(
                  "text-[10px] mt-1.5",
                  isUser
                    ? "text-white/60"
                    : theme === 'light' ? "text-slate-400" : "text-white/30"
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isProcessing && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentAspectConfig?.color}70, ${currentAspectConfig?.color}30)`,
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className={cn(
              "px-4 py-2.5 rounded-2xl rounded-tl-lg",
              theme === 'light'
                ? "bg-slate-50 border border-slate-200"
                : "bg-white/5 border border-white/10"
            )}>
              <div className="flex items-center gap-2">
                <Loader2 className={cn(
                  "h-4 w-4 animate-spin",
                  theme === 'light' ? "text-violet-500" : "text-white/60"
                )} />
                <span className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/50"
                )}>
                  Processing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className={cn(
        "px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-none",
        theme === 'light' ? "border-violet-100" : "border-white/5"
      )}>
        {[
          { label: 'Show my tasks', icon: CheckCircle2 },
          { label: 'Add a task', icon: Calendar },
          { label: 'Weekly objectives', icon: Target },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => setInput(action.label)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
              theme === 'light'
                ? "bg-violet-50 text-violet-600 hover:bg-violet-100"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
            )}
          >
            <action.icon className="h-3 w-3" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className={cn(
        "px-4 py-4 border-t",
        theme === 'light' ? "border-violet-100" : "border-white/5"
      )}>
        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Add a task, check my schedule, set a goal..."
            disabled={isProcessing}
            className={cn(
              "w-full h-11 rounded-2xl pl-4 pr-12 text-sm focus:ring-0",
              theme === 'light'
                ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-300"
                : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20",
              isProcessing && "opacity-50"
            )}
          />
          <Button
            size="icon"
            className="absolute right-1.5 rounded-xl h-8 w-8 transition-all"
            style={{
              background: input.trim() && !isProcessing
                ? `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)`
                : undefined
            }}
            disabled={!input.trim() || isProcessing}
            onClick={handleSend}
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FALLBACK AI RESPONSE
// ============================================================================

function getAIResponse(input: string, aspectId: string): string {
  const lowInput = input.toLowerCase();
  const aspectConfig = aspects.find(a => a.id === aspectId);
  
  if (lowInput.includes('progress') || lowInput.includes('how am i')) {
    return `Based on your ${aspectConfig?.name || 'activity'} data, you're doing great! You've completed 72% of your weekly goals. Keep it up!`;
  }
  if (lowInput.includes('tip') || lowInput.includes('advice')) {
    return `Here's a tip for ${aspectConfig?.name || 'you'}: Consistency beats intensity. Small daily actions compound into massive results over time.`;
  }
  if (lowInput.includes('today') || lowInput.includes('should')) {
    return `For ${aspectConfig?.name || 'today'}, I'd suggest focusing on your top priority first. You're most productive in the morning!`;
  }
  if (lowInput.includes('help') || lowInput.includes('what can')) {
    return `I can help you manage your tasks, calendar, and objectives! Try asking me to:
- Add a task for today
- Show my weekly objectives
- Create a monthly goal
- Schedule a meeting
- List my events for tomorrow

What would you like to do?`;
  }
  
  return `I can help you with that! If you want to manage your calendar, tasks, or objectives, just ask me directly. For example: "Add a task to review the project tomorrow" or "Show my tasks for today".`;
}
