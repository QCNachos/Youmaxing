'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
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
} from 'lucide-react';

interface Message {
  id: string;
  type: 'ai' | 'user' | 'suggestion';
  content: string;
  aspectId: string;
  timestamp: Date;
}

// Filter out settings
const chatAspects = aspects.filter(a => a.id !== 'settings');

// Time-based greeting
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Initial AI messages (global context)
const initialMessages: Message[] = [
  {
    id: '1',
    type: 'ai',
    content: `${getTimeGreeting()}! 👋 I'm your YOUMAXING assistant. I'm here to help you maximize every aspect of your life. What would you like to focus on today?`,
    aspectId: 'general',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    type: 'suggestion',
    content: '💪 Training: Your workout streak is at 5 days! Consider scheduling your next session.',
    aspectId: 'training',
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: '3',
    type: 'suggestion',
    content: '📈 Finance: Market insights available. Tech stocks showing positive momentum.',
    aspectId: 'finance',
    timestamp: new Date(),
  },
];

export function GlobalChat() {
  const { currentAspect, theme } = useAppStore();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filterAspect, setFilterAspect] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);

  // Auto-filter to current aspect when it changes (optional UX)
  useEffect(() => {
    // Could auto-set filter here, but keeping it manual for user control
  }, [currentAspect]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages
  const filteredMessages = filterAspect 
    ? messages.filter(m => m.aspectId === filterAspect || m.aspectId === 'general')
    : messages;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      aspectId: currentAspect,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(input, currentAspect),
        aspectId: currentAspect,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
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
            )}>Always here to help</p>
          </div>
        </div>

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
          
          return (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 animate-fade-in',
                message.type === 'user' && 'flex-row-reverse'
              )}
            >
              {/* AI Avatar */}
              {message.type === 'ai' && (
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
              {message.type === 'suggestion' && (
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
                  message.type === 'user'
                    ? 'rounded-tr-lg'
                    : 'rounded-tl-lg',
                  message.type === 'user'
                    ? theme === 'light'
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/10 text-white'
                    : message.type === 'suggestion'
                    ? 'border'
                    : theme === 'light'
                      ? 'bg-slate-50 border border-slate-200 text-slate-700'
                      : 'bg-white/5 border border-white/10 text-white/90'
                )}
                style={message.type === 'suggestion' && msgAspect ? {
                  backgroundColor: `${msgAspect.color}${theme === 'light' ? '10' : '10'}`,
                  borderColor: `${msgAspect.color}${theme === 'light' ? '30' : '30'}`,
                  color: theme === 'light' ? undefined : 'rgba(255,255,255,0.9)',
                } : undefined}
              >
                <p className={cn(
                  "text-sm leading-relaxed",
                  message.type === 'suggestion' && theme === 'light' && "text-slate-700"
                )}>{message.content}</p>

                {/* Timestamp */}
                <p className={cn(
                  "text-[10px] mt-1.5",
                  message.type === 'user'
                    ? "text-white/60"
                    : theme === 'light' ? "text-slate-400" : "text-white/30"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
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
              <div className="flex gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", theme === 'light' ? "bg-violet-400" : "bg-white/40")} />
                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", theme === 'light' ? "bg-violet-400" : "bg-white/40")} style={{ animationDelay: '0.1s' }} />
                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", theme === 'light' ? "bg-violet-400" : "bg-white/40")} style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about ${currentAspectConfig?.name.toLowerCase() || 'anything'}...`}
            className={cn(
              "w-full h-11 rounded-2xl pl-4 pr-12 text-sm focus:ring-0",
              theme === 'light'
                ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-300"
                : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20"
            )}
          />
          <Button
            size="icon"
            className="absolute right-1.5 rounded-xl h-8 w-8 transition-all"
            style={{
              background: input.trim()
                ? `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)`
                : undefined
            }}
            disabled={!input.trim()}
            onClick={handleSend}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// AI Response generator
function getAIResponse(input: string, aspectId: string): string {
  const lowInput = input.toLowerCase();
  const aspectConfig = aspects.find(a => a.id === aspectId);
  
  if (lowInput.includes('progress') || lowInput.includes('how am i')) {
    return `Based on your ${aspectConfig?.name || 'activity'} data, you're doing great! You've completed 72% of your weekly goals. Keep it up! 🎯`;
  }
  if (lowInput.includes('tip') || lowInput.includes('advice')) {
    return `Here's a tip for ${aspectConfig?.name || 'you'}: Consistency beats intensity. Small daily actions compound into massive results over time. 💡`;
  }
  if (lowInput.includes('today') || lowInput.includes('should')) {
    return `For ${aspectConfig?.name || 'today'}, I'd suggest focusing on your top priority first. You're most productive in the morning! ⚡`;
  }
  if (lowInput.includes('help') || lowInput.includes('what can')) {
    return `I can help you with ${aspectConfig?.name || 'everything'}! Ask me for tips, track progress, get recommendations, or just chat. What interests you?`;
  }
  
  return `Got it! I'll help you optimize your ${aspectConfig?.name?.toLowerCase() || 'goals'}. Is there anything specific you'd like to focus on? 🤔`;
}

