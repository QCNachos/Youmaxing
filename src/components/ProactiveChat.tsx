'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Send,
  Sparkles,
  Lightbulb,
  PartyPopper,
  Bell,
  BookOpen,
  MessageCircle,
  ChevronRight,
  ExternalLink,
  Zap,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { type ProactiveMessage, type MessageType } from '@/lib/ai/messageTypes';
import { getLeaderById } from '@/lib/ai/curators';
import { 
  getQuickActionsForAspect,
} from '@/lib/miniAppData';
import {
  getGlobalQuickActions,
} from '@/lib/ai/globalAgent';

// Model info type
interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  costTier: string;
  description: string;
}

// Message type icons
const messageTypeIcons: Record<MessageType, React.ComponentType<{ className?: string }>> = {
  'morning-briefing': Sparkles,
  'insight-drop': Lightbulb,
  'nudge': Bell,
  'celebration': PartyPopper,
  'curated-wisdom': BookOpen,
  'check-in': MessageCircle,
  'user-message': MessageCircle,
  'ai-response': Sparkles,
};

// Format timestamp
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatTime(date);
}

// Generate welcome message based on aspect
function getWelcomeMessage(aspectId: string, aspectName: string): ProactiveMessage {
  const welcomes: Record<string, string> = {
    training: `Hey! Ready to help with your training. You can ask me about your progress, log workouts, or get suggestions.`,
    food: `Hey! Let's plan some great meals. I can help you track what you eat, suggest recipes, or plan your week.`,
    finance: `Hey! I'm here to help with your finances. Ask about your spending, savings goals, or log expenses.`,
    friends: `Hey! Let's stay connected with the people who matter. I can remind you who to catch up with or help plan hangouts.`,
    travel: `Hey! Ready to help plan your adventures. Ask about your trips, find deals, or plan your next destination.`,
    family: `Hey! Stay connected with family. I can help with events, reminders, or planning gatherings.`,
    business: `Hey! Let's crush your business goals. What's the priority today?`,
    sports: `Hey! Track your activities and find new ones. What would you like to do?`,
    films: `Hey! What's next on your watchlist? I can help with recommendations.`,
    events: `Hey! Stay on top of what's happening. What can I help with?`,
  };

  return {
    id: 'welcome',
    type: 'ai-response',
    content: welcomes[aspectId] || `Welcome to **${aspectName}**! How can I help you today?`,
    timestamp: new Date(),
    isFromUser: false,
    aspectId: aspectId as any,
  };
}

// Generate global welcome message
function getGlobalWelcomeMessage(): ProactiveMessage {
  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else if (hour < 21) greeting = 'Good evening';
  else greeting = 'Hey there';
  
  return {
    id: 'global-welcome',
    type: 'ai-response',
    content: `${greeting}! I'm your AI buddy, connected to all your life areas. Ask me anything about your training, meals, goals, or just say hi!`,
    timestamp: new Date(),
    isFromUser: false,
  };
}

// Props for ProactiveChat
interface ProactiveChatProps {
  mode?: 'global' | 'aspect';
}

export function ProactiveChat({ mode = 'aspect' }: ProactiveChatProps) {
  const router = useRouter();
  const { currentAspect, theme } = useAppStore();
  const [messages, setMessages] = useState<ProactiveMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);
  
  // Get appropriate quick actions based on mode
  const quickActions = mode === 'global' 
    ? getGlobalQuickActions()
    : getQuickActionsForAspect(currentAspect);

  // Determine the conversation aspect key
  const conversationAspect = mode === 'global' ? 'global' : currentAspect;

  // Fetch available models on mount
  useEffect(() => {
    fetch('/api/chat/models')
      .then(res => res.json())
      .then(data => {
        setAvailableModels(data.models || []);
        if (data.defaultModel) {
          setSelectedModel(data.defaultModel);
        }
      })
      .catch(err => console.error('Failed to fetch models:', err));
  }, []);

  // Load conversation history from database
  // Only reload when conversationAspect actually changes (not when carousel moves in global mode)
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingHistory(true);
    
    fetch(`/api/conversations?aspect=${conversationAspect}`)
      .then(res => res.json())
      .then(data => {
        if (isCancelled) return;
        
        if (data.messages && data.messages.length > 0) {
          // Restore messages with proper Date objects
          const restoredMessages = data.messages.map((m: ProactiveMessage & { timestamp: string }) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(restoredMessages);
        } else {
          // No saved history, show welcome message
          if (mode === 'global') {
            setMessages([getGlobalWelcomeMessage()]);
          } else {
            // Get the aspect name for the welcome message
            const aspectConfig = aspects.find((a) => a.id === conversationAspect);
            setMessages([getWelcomeMessage(conversationAspect, aspectConfig?.name || 'Aspect')]);
          }
        }
        setError(null);
      })
      .catch(err => {
        if (isCancelled) return;
        console.error('Failed to load conversation:', err);
        // Fallback to welcome message
        if (mode === 'global') {
          setMessages([getGlobalWelcomeMessage()]);
        } else {
          const aspectConfig = aspects.find((a) => a.id === conversationAspect);
          setMessages([getWelcomeMessage(conversationAspect, aspectConfig?.name || 'Aspect')]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }
      });
    
    return () => {
      isCancelled = true;
    };
  }, [conversationAspect, mode]); // Only depends on conversationAspect and mode - not currentAspect

  // Save conversation to database (debounced)
  useEffect(() => {
    // Don't save empty conversations or while loading
    if (messages.length === 0 || isLoadingHistory) return;
    
    // Don't save if only welcome message
    const hasUserMessages = messages.some(m => m.isFromUser);
    if (!hasUserMessages && messages.length === 1) return;

    // Debounce saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      // Serialize messages for storage
      const serializableMessages = messages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }));

      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: serializableMessages,
          aspect: conversationAspect,
        }),
      }).catch(err => {
        console.error('Failed to save conversation:', err);
      });
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, conversationAspect, isLoadingHistory]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build conversation history for API (last 10 messages, excluding welcome)
  const buildConversationHistory = useCallback(() => {
    return messages
      .filter(m => m.id !== 'welcome' && m.id !== 'global-welcome')
      .slice(-9) // Keep last 9 to leave room for new message
      .map(m => ({
        role: m.isFromUser ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: ProactiveMessage = {
      id: `user-${Date.now()}`,
      type: 'user-message',
      content: textToSend,
      timestamp: new Date(),
      isFromUser: true,
      aspectId: currentAspect,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Build conversation history and add new message
      const history = buildConversationHistory();
      history.push({ role: 'user', content: textToSend });

      // Call the real AI API with selected model
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          aspectId: mode === 'aspect' ? currentAspect : undefined,
          enableTools: true,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to get response');
      }

      // Build metadata based on what was used
      let metadata: ProactiveMessage['metadata'] = undefined;
      if (data.toolsUsed) {
        metadata = { 
          actionable: true, 
          actionLabel: `Used: ${data.toolsUsed.join(', ')}` 
        };
      } else if (data.webSearchUsed) {
        metadata = {
          actionable: true,
          actionLabel: 'Searched the web',
        };
      }

      // Append sources only if the AI didn't already include links in the response
      let messageContent = data.message;
      const hasLinksInResponse = /\[.*?\]\(https?:\/\/.*?\)/.test(data.message);
      if (data.sources && data.sources.length > 0 && !hasLinksInResponse) {
        messageContent += '\n\n**Sources:**\n' + data.sources
          .slice(0, 3)
          .map((s: { title: string; url: string }) => `- [${s.title}](${s.url})`)
          .join('\n');
      }

      const aiResponse: ProactiveMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai-response',
        content: messageContent,
        timestamp: new Date(),
        isFromUser: false,
        aspectId: mode === 'global' ? undefined : currentAspect,
        metadata,
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      
      // Add error message to chat
      const errorResponse: ProactiveMessage = {
        id: `error-${Date.now()}`,
        type: 'ai-response',
        content: `Sorry, I ran into an issue: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
        isFromUser: false,
        aspectId: mode === 'global' ? undefined : currentAspect,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  // Navigate to aspect mini-app
  const goToMiniApp = () => {
    if (mode === 'aspect' && currentAspect) {
      router.push(`/${currentAspect}`);
    }
  };

  // Clear conversation history
  const clearConversation = async () => {
    // Delete from database
    try {
      await fetch(`/api/conversations?aspect=${conversationAspect}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear conversation:', err);
    }
    
    // Reset to welcome message
    if (mode === 'global') {
      setMessages([getGlobalWelcomeMessage()]);
    } else {
      setMessages([getWelcomeMessage(currentAspect, currentAspectConfig?.name || 'Aspect')]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header - Shows context based on mode */}
      <div className={cn(
        "flex-shrink-0 px-6 py-4 border-b flex items-center gap-3",
        theme === 'light' ? "border-violet-100" : "border-white/5"
      )}>
        {mode === 'global' ? (
          // GLOBAL MODE HEADER
          <>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8B5CF680, #EC489980)'
              }}
            >
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className={cn("font-semibold", theme === 'light' ? "text-slate-800" : "text-white")}>Your AI Buddy</h2>
              <p className={cn("text-xs", theme === 'light' ? "text-slate-400" : "text-white/40")}>Connected to all your life areas</p>
            </div>
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 transition-all hover:opacity-80",
                  theme === 'light' 
                    ? "bg-slate-100 text-slate-600" 
                    : "bg-white/10 text-white/70"
                )}
              >
                {availableModels.find(m => m.id === selectedModel)?.name || 'Auto'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showModelSelector && (
                <div className={cn(
                  "absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg z-50 min-w-[180px]",
                  theme === 'light' ? "bg-white border border-slate-200" : "bg-slate-800 border border-white/10"
                )}>
                  {availableModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs flex flex-col gap-0.5 hover:bg-opacity-50",
                        selectedModel === model.id 
                          ? (theme === 'light' ? "bg-violet-50" : "bg-violet-500/20")
                          : (theme === 'light' ? "hover:bg-slate-50" : "hover:bg-white/5"),
                        theme === 'light' ? "text-slate-700" : "text-white/90"
                      )}
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className={cn(
                        "text-[10px]",
                        theme === 'light' ? "text-slate-400" : "text-white/40"
                      )}>{model.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Clear conversation button */}
            <button
              onClick={clearConversation}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                theme === 'light' 
                  ? "text-slate-400 hover:text-slate-600 hover:bg-slate-100" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/10"
              )}
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div
              className="px-2 py-1 rounded-full text-[10px] font-medium bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-400"
            >
              <Sparkles className="h-3 w-3 inline mr-1" />
              Global
            </div>
          </>
        ) : (
          // ASPECT MODE HEADER
          <>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentAspectConfig?.color || '#8B5CF6'}80, ${currentAspectConfig?.color || '#8B5CF6'}40)`
              }}
            >
              {currentAspectConfig?.icon && <currentAspectConfig.icon className="h-5 w-5 text-white" />}
            </div>
            <div className="flex-1">
              <h2 className={cn("font-semibold", theme === 'light' ? "text-slate-800" : "text-white")}>{currentAspectConfig?.name}</h2>
              <p className={cn("text-xs", theme === 'light' ? "text-slate-400" : "text-white/40")}>AI-powered assistant</p>
            </div>
            {/* Model Selector for Aspect Mode */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 transition-all hover:opacity-80",
                  theme === 'light' 
                    ? "bg-slate-100 text-slate-600" 
                    : "bg-white/10 text-white/70"
                )}
              >
                {availableModels.find(m => m.id === selectedModel)?.name || 'Auto'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showModelSelector && (
                <div className={cn(
                  "absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg z-50 min-w-[180px]",
                  theme === 'light' ? "bg-white border border-slate-200" : "bg-slate-800 border border-white/10"
                )}>
                  {availableModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs flex flex-col gap-0.5 hover:bg-opacity-50",
                        selectedModel === model.id 
                          ? (theme === 'light' ? "bg-violet-50" : "bg-violet-500/20")
                          : (theme === 'light' ? "hover:bg-slate-50" : "hover:bg-white/5"),
                        theme === 'light' ? "text-slate-700" : "text-white/90"
                      )}
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className={cn(
                        "text-[10px]",
                        theme === 'light' ? "text-slate-400" : "text-white/40"
                      )}>{model.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Clear conversation button */}
            <button
              onClick={clearConversation}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                theme === 'light' 
                  ? "text-slate-400 hover:text-slate-600 hover:bg-slate-100" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/10"
              )}
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={goToMiniApp}
              className={cn(
                "px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 transition-all hover:scale-105 cursor-pointer",
              )}
              style={{
                backgroundColor: `${currentAspectConfig?.color}20`,
                color: currentAspectConfig?.color
              }}
              title={`Open ${currentAspectConfig?.name} mini-app`}
            >
              Mini-App
              <ExternalLink className="h-2.5 w-2.5" />
            </button>
          </>
        )}
      </div>
      
      {/* Click outside to close model selector */}
      {showModelSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowModelSelector(false)}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className={cn(
              "animate-pulse text-sm",
              theme === 'light' ? "text-slate-400" : "text-white/40"
            )}>
              Loading conversation...
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${currentAspectConfig?.color || '#8B5CF6'}80, ${currentAspectConfig?.color || '#8B5CF6'}40)`
              }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className={cn(
              "px-4 py-3 rounded-2xl",
              theme === 'light'
                ? "bg-slate-50 border border-slate-200"
                : "bg-white/5 border border-white/10"
            )}>
              <div className="flex gap-1">
                <span className={cn("w-2 h-2 rounded-full animate-bounce", theme === 'light' ? "bg-violet-400" : "bg-white/40")} />
                <span className={cn("w-2 h-2 rounded-full animate-bounce", theme === 'light' ? "bg-violet-400" : "bg-white/40")} style={{ animationDelay: '0.1s' }} />
                <span className={cn("w-2 h-2 rounded-full animate-bounce", theme === 'light' ? "bg-violet-400" : "bg-white/40")} style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Dynamic per mode */}
      <div className={cn(
        "flex-shrink-0 px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t",
        theme === 'light' ? "border-violet-100" : "border-white/5"
      )}>
        {quickActions.slice(0, 4).map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className={cn(
              "flex-shrink-0 rounded-full text-xs px-4 gap-2",
              theme === 'light'
                ? "bg-slate-50 hover:bg-violet-50 border border-slate-200 text-slate-600 hover:text-violet-600"
                : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white"
            )}
            onClick={() => handleQuickAction(action.prompt)}
          >
            {'icon' in action && action.icon && <action.icon className="h-3.5 w-3.5" />}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <div className={cn(
        "flex-shrink-0 px-6 py-4 border-t",
        theme === 'light' ? "border-violet-100" : "border-white/5"
      )}>
        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'global' 
              ? "Ask me anything..." 
              : `Ask about ${currentAspectConfig?.name.toLowerCase()}...`}
            className={cn(
              "w-full h-12 rounded-2xl pl-4 pr-14 focus:ring-0",
              theme === 'light'
                ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-300"
                : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20"
            )}
          />
          <Button
            size="icon"
            className="absolute right-2 rounded-xl h-8 w-8"
            style={{
              background: input.trim()
                ? `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)`
                : undefined
            }}
            disabled={!input.trim()}
            onClick={() => handleSend()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: ProactiveMessage }) {
  const { theme } = useAppStore();
  const aspectConfig = message.aspectId ? aspects.find(a => a.id === message.aspectId) : null;
  const Icon = messageTypeIcons[message.type] || Sparkles;
  const leader = message.metadata?.leaderId ? getLeaderById(message.metadata.leaderId) : null;

  if (message.isFromUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div
          className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md"
          style={{
            background: aspectConfig
              ? `linear-gradient(135deg, ${aspectConfig.color}90, ${aspectConfig.color}70)`
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(139, 92, 246, 0.7))'
          }}
        >
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p className="text-white/50 text-[10px] mt-1.5 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: aspectConfig
            ? `linear-gradient(135deg, ${aspectConfig.color}80, ${aspectConfig.color}40)`
            : 'linear-gradient(135deg, #8B5CF680, #8B5CF640)'
        }}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>

      {/* Message Content */}
      <div className="flex-1 max-w-[85%]">
        {/* Message Type Badge (for special messages) */}
        {message.type !== 'ai-response' && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: aspectConfig ? `${aspectConfig.color}20` : 'rgba(139, 92, 246, 0.2)',
                color: aspectConfig?.color || '#8B5CF6'
              }}
            >
              {message.type.replace('-', ' ')}
            </span>
            {leader && (
              <span className={cn("text-[10px]", theme === 'light' ? "text-slate-400" : "text-white/40")}>
                via {leader.name}
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl rounded-tl-md',
            message.type === 'celebration'
              ? theme === 'light'
                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20'
              : message.type === 'curated-wisdom'
              ? theme === 'light'
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200'
                : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20'
              : theme === 'light'
                ? 'bg-slate-50 border border-slate-200'
                : 'bg-white/5 border border-white/10'
          )}
        >
          <p className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            theme === 'light' ? "text-slate-700" : "text-white/90"
          )}>
            {formatMessageContent(message.content, theme)}
          </p>
        </div>

        {/* Action Button */}
        {message.metadata?.actionable && message.metadata.actionLabel && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "mt-2 h-8 px-3 text-xs rounded-full gap-1",
              theme === 'light'
                ? "bg-slate-50 hover:bg-violet-50 border border-slate-200 text-slate-600 hover:text-violet-600"
                : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white"
            )}
          >
            {message.metadata.actionLabel}
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}

        {/* Timestamp */}
        <p className={cn("text-[10px] mt-2", theme === 'light' ? "text-slate-400" : "text-white/30")}>{formatRelativeTime(message.timestamp)}</p>
      </div>
    </div>
  );
}

// Format message content with rich markdown support
function formatMessageContent(content: string, theme: 'dark' | 'light' = 'dark'): React.ReactNode {
  const textColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const boldColor = theme === 'light' ? 'text-slate-800' : 'text-white';
  const linkColor = theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300';
  const bulletColor = theme === 'light' ? 'text-slate-400' : 'text-slate-500';
  
  // Split content into lines for processing
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        // Skip empty lines but preserve spacing
        if (!trimmedLine) {
          return <div key={lineIndex} className="h-1" />;
        }
        
        // Check if it's a bullet point
        const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
        const bulletContent = isBullet ? trimmedLine.slice(2) : trimmedLine;
        
        // Process inline formatting (bold and links)
        const formattedContent = formatInlineContent(bulletContent, boldColor, linkColor);
        
        if (isBullet) {
          return (
            <div key={lineIndex} className="flex items-start gap-2 pl-1">
              <span className={`${bulletColor} mt-1.5 text-xs`}>&#x2022;</span>
              <span className={textColor}>{formattedContent}</span>
            </div>
          );
        }
        
        return (
          <div key={lineIndex} className={textColor}>
            {formattedContent}
          </div>
        );
      })}
    </div>
  );
}

// Format inline content: **bold** and [text](url) links
function formatInlineContent(text: string, boldColor: string, linkColor: string): React.ReactNode {
  // Combined regex for bold and links
  const regex = /\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    if (match[1] !== undefined) {
      // Bold text: **text**
      parts.push(
        <strong key={`bold-${keyIndex++}`} className={`font-semibold ${boldColor}`}>
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // Link: [text](url)
      parts.push(
        <a 
          key={`link-${keyIndex++}`} 
          href={match[3]} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${linkColor} underline underline-offset-2 transition-colors`}
        >
          {match[2]}
        </a>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

