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
  PartyPopper,
  Bell,
  BookOpen,
  MessageCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { generateDemoMessages, type ProactiveMessage, type MessageType } from '@/lib/ai/messageTypes';
import { getLeaderById } from '@/lib/ai/curators';

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

export function ProactiveChat() {
  const { currentAspect } = useAppStore();
  const [messages, setMessages] = useState<ProactiveMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);

  // Load demo messages on mount
  useEffect(() => {
    setMessages(generateDemoMessages('Antoine'));
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ProactiveMessage = {
      id: `user-${Date.now()}`,
      type: 'user-message',
      content: input,
      timestamp: new Date(),
      isFromUser: true,
      aspectId: currentAspect,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ProactiveMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai-response',
        content: getAIResponse(input, currentAspect),
        timestamp: new Date(),
        isFromUser: false,
        aspectId: currentAspect,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${currentAspectConfig?.color || '#8B5CF6'}80, ${currentAspectConfig?.color || '#8B5CF6'}40)` 
          }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold">Your Geek Buddy</h2>
          <p className="text-white/40 text-xs">Always here to help you maximize</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

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
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex-shrink-0 px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5">
        {[
          "What should I focus on today?",
          "Give me a quick win",
          "How am I doing this week?",
        ].map((suggestion) => (
          <Button
            key={suggestion}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white text-xs px-4"
            onClick={() => setInput(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-white/5">
        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message your buddy..."
            className="w-full h-12 bg-white/5 border-white/10 rounded-2xl pl-4 pr-14 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-0"
          />
          <Button
            size="icon"
            className="absolute right-2 rounded-xl h-8 w-8 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
            disabled={!input.trim()}
            onClick={handleSend}
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
  const aspectConfig = message.aspectId ? aspects.find(a => a.id === message.aspectId) : null;
  const Icon = messageTypeIcons[message.type] || Sparkles;
  const leader = message.metadata?.leaderId ? getLeaderById(message.metadata.leaderId) : null;

  if (message.isFromUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] bg-gradient-to-r from-violet-600/80 to-pink-600/80 px-4 py-3 rounded-2xl rounded-br-md">
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
              <span className="text-[10px] text-white/40">
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
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20'
              : message.type === 'curated-wisdom'
              ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20'
              : 'bg-white/5 border border-white/10'
          )}
        >
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
            {formatMessageContent(message.content)}
          </p>
        </div>

        {/* Action Button */}
        {message.metadata?.actionable && message.metadata.actionLabel && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-8 px-3 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white gap-1"
          >
            {message.metadata.actionLabel}
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}

        {/* Timestamp */}
        <p className="text-white/30 text-[10px] mt-2">{formatRelativeTime(message.timestamp)}</p>
      </div>
    </div>
  );
}

// Format message content with markdown-like bold
function formatMessageContent(content: string): React.ReactNode {
  // Split by **bold** markers
  const parts = content.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => 
    i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part
  );
}

// Simple AI response generator (placeholder)
function getAIResponse(input: string, aspectId: string): string {
  const lowInput = input.toLowerCase();

  if (lowInput.includes('focus') || lowInput.includes('today')) {
    return "Based on your patterns, I'd prioritize that upper body workout first thing - you're most consistent in the morning.\n\nThen tackle the finance review before lunch when your focus is sharp.\n\nSound like a plan?";
  }
  
  if (lowInput.includes('quick win')) {
    return "Easy one: You're 3 glasses away from your water goal today. 💧\n\nAlso, responding to that email you've been putting off - 5 mins max, gets it off your mental plate.";
  }
  
  if (lowInput.includes('how') && (lowInput.includes('doing') || lowInput.includes('week'))) {
    return "Honestly? Pretty solid week:\n\n• **Training**: 5/7 days completed ✅\n• **Sleep**: Averaging 7.2h (up from 6.8h last week)\n• **Finance**: Stayed under budget by $85\n\nThe sleep improvement is huge btw - that's where the real gains come from.";
  }

  return `Got it! Let me think about that for ${aspectId}...\n\nBased on what you've shared, here's my take: focus on consistency over perfection. Small daily actions compound into big results.\n\nWant me to break it down further?`;
}

