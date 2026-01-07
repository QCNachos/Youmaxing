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
  MessageCircle,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'ai' | 'user' | 'suggestion';
  content: string;
  aspectId?: string;
  timestamp: Date;
}

// AI greeting based on time
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Get personalized AI messages based on current aspect
function getAIMessages(aspectId: string): Message[] {
  const messages: Record<string, Message[]> = {
    training: [
      {
        id: '1',
        type: 'ai',
        content: `${getTimeGreeting()}! 💪 You've been crushing it this week — 3 workouts logged. Ready for today's session?`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'suggestion',
        content: 'Your recovery score is 85%. Perfect day for strength training.',
        aspectId: 'training',
        timestamp: new Date(),
      },
    ],
    food: [
      {
        id: '1',
        type: 'ai',
        content: `${getTimeGreeting()}! 🥗 You're hitting your protein goals consistently. Keep it up!`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'suggestion',
        content: 'Try adding more leafy greens today — your fiber intake was low yesterday.',
        aspectId: 'food',
        timestamp: new Date(),
      },
    ],
    finance: [
      {
        id: '1',
        type: 'ai',
        content: `${getTimeGreeting()}! 📈 Your savings are up 12% this month. You're on track for your travel fund goal!`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'suggestion',
        content: 'Consider moving $200 to your high-yield savings — interest rates are favorable.',
        aspectId: 'finance',
        timestamp: new Date(),
      },
    ],
    friends: [
      {
        id: '1',
        type: 'ai',
        content: `${getTimeGreeting()}! 👋 It's been 2 weeks since you caught up with Sarah. Maybe plan something?`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'suggestion',
        content: 'Alex mentioned wanting to try that new restaurant downtown.',
        aspectId: 'friends',
        timestamp: new Date(),
      },
    ],
    travel: [
      {
        id: '1',
        type: 'ai',
        content: `${getTimeGreeting()}! ✈️ You're 80% to your Japan trip fund! Just 3 more months at this pace.`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'suggestion',
        content: 'Flights to Tokyo are 15% cheaper right now — consider booking.',
        aspectId: 'travel',
        timestamp: new Date(),
      },
    ],
  };

  return messages[aspectId] || [
    {
      id: '1',
      type: 'ai',
      content: `${getTimeGreeting()}! ✨ I'm here to help you maximize your ${aspectId}. What would you like to focus on today?`,
      timestamp: new Date(),
    },
  ];
}

export function AIConversation() {
  const { currentAspect, setCurrentAspect } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);

  // Load messages when aspect changes
  useEffect(() => {
    setMessages(getAIMessages(currentAspect));
  }, [currentAspect]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
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
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const quickActions = [
    { label: 'Show my progress', icon: TrendingUp },
    { label: 'Give me a tip', icon: Lightbulb },
    { label: 'What should I do today?', icon: CheckCircle2 },
  ];

  return (
    <div className="h-full flex flex-col bg-black/20 backdrop-blur-sm border-t border-white/5">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3 animate-fade-in',
              message.type === 'user' && 'flex-row-reverse'
            )}
          >
            {/* Avatar */}
            {message.type === 'ai' && (
              <div 
                className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${currentAspectConfig?.color}80, ${currentAspectConfig?.color}40)`,
                }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            
            {message.type === 'suggestion' && (
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 text-amber-400" />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={cn(
                'max-w-[70%] px-4 py-3 rounded-2xl',
                message.type === 'user' 
                  ? 'bg-white/10 text-white ml-auto'
                  : message.type === 'suggestion'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100'
                  : 'bg-white/5 border border-white/10 text-white/90'
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${currentAspectConfig?.color}80, ${currentAspectConfig?.color}40)`,
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

      {/* Quick Actions */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white gap-2"
            onClick={() => {
              setInput(action.label);
            }}
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="w-full h-12 bg-white/5 border-white/10 rounded-2xl pl-4 pr-12 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-0"
            />
            <Button
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl h-9 w-9"
              style={{ 
                background: input.trim() ? `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)` : undefined 
              }}
              disabled={!input.trim()}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple response generator (will be replaced with actual AI)
function getAIResponse(input: string, aspectId: string): string {
  const lowInput = input.toLowerCase();
  
  if (lowInput.includes('progress')) {
    return "You're doing great! You've completed 68% of your weekly goals. Keep pushing! 🎯";
  }
  if (lowInput.includes('tip')) {
    return "Here's a pro tip: Consistency beats intensity. Small daily actions compound into massive results over time. 💡";
  }
  if (lowInput.includes('today') || lowInput.includes('should')) {
    return "Based on your patterns, I'd suggest focusing on your top priority first thing. You're most productive in the morning! ⚡";
  }
  
  return "Got it! I'm analyzing that and will help you optimize. Is there anything specific you'd like to focus on? 🤔";
}




