'use client';

import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { type ProactiveMessage, type MessageType } from '@/lib/ai/messageTypes';
import { getLeaderById } from '@/lib/ai/curators';
import { 
  getQuickActionsForAspect, 
  getTodaysMeal, 
  getMealsWithTag,
  weeklyMealPlan,
  groceryList,
  trainingStats,
  todaysWorkoutPlan,
  workoutsThisWeek,
  financeStats,
  savingsGoals,
  recentTransactions,
  getFriendsToContact,
  getUpcomingBirthdays,
  upcomingTrips,
  mealsDatabase,
  getDayOfWeek,
} from '@/lib/miniAppData';
import {
  generateGlobalInsights,
  getGlobalGreeting,
  getGlobalQuickActions,
  getAspectSummaries,
  type GlobalInsight,
} from '@/lib/ai/globalAgent';

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
    training: `💪 **Training** - You're on a ${trainingStats.streak}-day streak!\n\nToday's plan: ${todaysWorkoutPlan.name} (~${todaysWorkoutPlan.estimatedDuration} min)\n\nWhat would you like to do?`,
    food: `🍽️ **Food** - Let's plan some great meals!\n\nTonight: ${getTodaysMeal()?.name || 'Nothing planned yet'}\n\nWhat can I help with?`,
    finance: `💰 **Finance** - Portfolio is ${financeStats.portfolioChange > 0 ? 'up' : 'down'} ${Math.abs(financeStats.portfolioChange)}%\n\nMonthly spend: $${financeStats.monthlySpent} / $${financeStats.monthlyBudget}\n\nHow can I help?`,
    friends: `👥 **Friends** - ${getFriendsToContact().length} friends you haven't talked to in a while.\n\n${getUpcomingBirthdays().length > 0 ? `Upcoming birthday: ${getUpcomingBirthdays()[0]?.name}` : 'No birthdays this month'}\n\nWhat would you like to do?`,
    travel: `✈️ **Travel** - Japan trip is ${upcomingTrips[0]?.fundProgress}% funded!\n\n${upcomingTrips.length} trips in planning.\n\nHow can I help?`,
    family: `👨‍👩‍👧‍👦 **Family** - Stay connected with the people who matter.\n\nAny family events or calls to plan?`,
    business: `💼 **Business** - Let's crush your goals today.\n\nWhat's the priority?`,
    sports: `🏆 **Sports** - Track your activities and find new ones.\n\nWhat would you like to do?`,
    films: `🎬 **Films & Series** - What's next on your watchlist?\n\nNeed recommendations?`,
    events: `📅 **Events** - Stay on top of what's happening.\n\nWhat can I help with?`,
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
  const { greeting, subtext } = getGlobalGreeting();
  const insights = generateGlobalInsights().slice(0, 2);
  
  let content = `${greeting}! 👋\n\n`;
  
  // Add top insights
  if (insights.length > 0) {
    content += insights.map(i => `${i.emoji} ${i.message}`).join('\n\n');
    content += '\n\nHow can I help you today?';
  } else {
    content += subtext;
  }
  
  return {
    id: 'global-welcome',
    type: 'ai-response',
    content,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);
  
  // Get appropriate quick actions based on mode
  const quickActions = mode === 'global' 
    ? getGlobalQuickActions()
    : getQuickActionsForAspect(currentAspect);

  // Reset messages when aspect changes or mode changes
  useEffect(() => {
    if (mode === 'global') {
      setMessages([getGlobalWelcomeMessage()]);
    } else {
      setMessages([getWelcomeMessage(currentAspect, currentAspectConfig?.name || 'Aspect')]);
    }
  }, [currentAspect, currentAspectConfig?.name, mode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ProactiveMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai-response',
        content: mode === 'global' 
          ? getGlobalAwareResponse(textToSend)
          : getAspectAwareResponse(textToSend, currentAspect),
        timestamp: new Date(),
        isFromUser: false,
        aspectId: mode === 'global' ? undefined : currentAspect,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 600 + Math.random() * 600);
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

// Format message content with markdown-like bold
function formatMessageContent(content: string, theme: 'dark' | 'light' = 'dark'): React.ReactNode {
  // Split by **bold** markers
  const parts = content.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className={theme === 'light' ? "font-semibold text-slate-800" : "font-semibold text-white"}>{part}</strong> : part
  );
}

// ============================================
// ASPECT-AWARE AI RESPONSES
// ============================================

function getAspectAwareResponse(input: string, aspectId: string): string {
  const lowInput = input.toLowerCase();

  // FOOD RESPONSES
  if (aspectId === 'food') {
    if (lowInput.includes('dinner') || lowInput.includes('tonight')) {
      const todaysMeal = getTodaysMeal();
      if (todaysMeal) {
        return `Tonight you planned **${todaysMeal.emoji} ${todaysMeal.name}**!\n\nIt's tagged as: ${todaysMeal.tags.join(', ')}\n${todaysMeal.prepTime ? `Prep time: ~${todaysMeal.prepTime} min` : ''}\n\nWant to change it or need the recipe?`;
      } else {
        return `Nothing planned for ${getDayOfWeek()} yet!\n\nHere are some quick options:\n• 🌯 Wrap Caesar/Ranch (10 min)\n• 🥞 Crêpes protéinées (Quick)\n• 🍝 Spaghetti aux saucisses (20 min)\n\nWhich sounds good?`;
      }
    }
    
    if (lowInput.includes('plan') && lowInput.includes('week')) {
      const planned = Object.entries(weeklyMealPlan)
        .filter(([_, meal]) => meal !== null)
        .map(([day, meal]) => `• ${day}: ${meal?.emoji} ${meal?.name}`)
        .join('\n');
      const unplanned = Object.entries(weeklyMealPlan)
        .filter(([_, meal]) => meal === null)
        .map(([day]) => day)
        .join(', ');
      
      return `Here's your current meal plan:\n\n${planned || 'Nothing planned yet'}\n\n${unplanned ? `Still need to plan: ${unplanned}\n\n` : ''}Want me to suggest meals for the empty days?`;
    }
    
    if (lowInput.includes('grocery') || lowInput.includes('list') || lowInput.includes('shopping')) {
      const unchecked = groceryList.filter(i => !i.checked);
      const checked = groceryList.filter(i => i.checked);
      
      return `📝 **Grocery List**\n\nStill need:\n${unchecked.map(i => `• ${i.item}`).join('\n')}\n\n✅ Already got (${checked.length} items)\n\nWant me to add anything based on this week's meals?`;
    }
    
    if (lowInput.includes('quick') || lowInput.includes('fast') || lowInput.includes('15 min')) {
      const quickMeals = getMealsWithTag('Quick');
      return `Here are your quick meals:\n\n${quickMeals.slice(0, 4).map(m => `• ${m.emoji} ${m.name} - ${m.tags.filter(t => t !== 'Quick').join(', ')}`).join('\n')}\n\nWhich one sounds good?`;
    }
    
    if (lowInput.includes('protein') || lowInput.includes('high-protein')) {
      const proteinMeals = getMealsWithTag('Protein-rich').concat(getMealsWithTag('High-protein'));
      return `High protein options:\n\n${proteinMeals.slice(0, 4).map(m => `• ${m.emoji} ${m.name}`).join('\n')}\n\nThese pair well with your training goals 💪`;
    }
  }

  // TRAINING RESPONSES
  if (aspectId === 'training') {
    if (lowInput.includes('today') || lowInput.includes('plan')) {
      return `Today's plan: **${todaysWorkoutPlan.name}** (~${todaysWorkoutPlan.estimatedDuration} min)\n\nExercises:\n${todaysWorkoutPlan.exercises.map(e => `• ${e.name}: ${e.sets} sets × ${e.reps}`).join('\n')}\n\nYou're on a **${trainingStats.streak}-day streak**! Ready to keep it going?`;
    }
    
    if (lowInput.includes('progress') || lowInput.includes('week') || lowInput.includes('doing')) {
      return `This week:\n\n• **${trainingStats.weeklyCompleted}/${trainingStats.weeklyGoal}** workouts completed ✅\n• **${trainingStats.caloriesBurned}** kcal burned\n• **${trainingStats.streak}-day** streak 🔥\n• Sleep avg: **${trainingStats.avgSleep}h**\n\nYou're crushing it! The consistency is what matters most.`;
    }
    
    if (lowInput.includes('log') || lowInput.includes('workout')) {
      return `Ready to log a workout!\n\nWhat did you do today?\n• Strength training\n• Cardio\n• Flexibility/Yoga\n• Sports activity\n\nOr just tell me what you did and I'll log it.`;
    }
    
    if (lowInput.includes('suggest') || lowInput.includes('recommend')) {
      return `Based on your recent workouts, I'd suggest:\n\n**Upper Body Day** - You hit lower body yesterday\n\nOr if you want variety:\n• 🏃 30-min Zone 2 cardio\n• 🧘 Mobility & stretching\n• 💪 Full body circuit\n\nWhat sounds good?`;
    }
  }

  // FINANCE RESPONSES
  if (aspectId === 'finance') {
    if (lowInput.includes('portfolio') || lowInput.includes('investment')) {
      return `📈 **Portfolio Status**\n\nTotal value: **$${financeStats.portfolioValue.toLocaleString()}**\nChange: ${financeStats.portfolioChange > 0 ? '+' : ''}${financeStats.portfolioChange}% this week\n\nYour diversification looks healthy. Want a detailed breakdown?`;
    }
    
    if (lowInput.includes('spending') || lowInput.includes('budget')) {
      const remaining = financeStats.monthlyBudget - financeStats.monthlySpent;
      return `💳 **Monthly Budget**\n\nSpent: **$${financeStats.monthlySpent}** / $${financeStats.monthlyBudget}\nRemaining: **$${remaining}** (${Math.round((remaining / financeStats.monthlyBudget) * 100)}%)\n\nRecent:\n${recentTransactions.slice(0, 3).map(t => `• ${t.description}: ${t.amount < 0 ? '-' : '+'}$${Math.abs(t.amount)}`).join('\n')}\n\nYou're under budget! Nice work.`;
    }
    
    if (lowInput.includes('saving') || lowInput.includes('goal')) {
      return `🎯 **Savings Goals**\n\n${savingsGoals.map(g => `• **${g.name}**: $${g.current.toLocaleString()} / $${g.target.toLocaleString()} (${Math.round((g.current / g.target) * 100)}%)${g.deadline ? ` - by ${g.deadline}` : ''}`).join('\n')}\n\nJapan trip is almost funded! 🎌`;
    }
    
    if (lowInput.includes('log') || lowInput.includes('expense')) {
      return `Let's log an expense.\n\nWhat did you spend on?\n• 🍔 Food & Dining\n• 🚗 Transportation\n• 🎬 Entertainment\n• 🛒 Shopping\n• Other\n\nOr just tell me: "Coffee $5.50"`;
    }
  }

  // FRIENDS RESPONSES
  if (aspectId === 'friends') {
    if (lowInput.includes('catch up') || lowInput.includes('talk') || lowInput.includes('contact')) {
      const toContact = getFriendsToContact();
      if (toContact.length > 0) {
        const daysAgo = (f: any) => Math.floor((Date.now() - f.lastContact.getTime()) / (24 * 60 * 60 * 1000));
        return `Friends you haven't talked to in a while:\n\n${toContact.map(f => `• **${f.name}** - ${daysAgo(f)} days ago${f.notes ? ` (${f.notes})` : ''}`).join('\n')}\n\nWant to send a quick message to one of them?`;
      }
      return `You're doing great staying connected! 🙌\n\nEveryone's been contacted in the last 2 weeks.`;
    }
    
    if (lowInput.includes('birthday')) {
      const upcoming = getUpcomingBirthdays();
      if (upcoming.length > 0) {
        return `🎂 **Upcoming Birthdays**\n\n${upcoming.map(f => `• ${f.name} - ${f.birthday?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`).join('\n')}\n\nNeed gift ideas?`;
      }
      return `No birthdays in the next 30 days!\n\nWant me to remind you when one is coming up?`;
    }
    
    if (lowInput.includes('plan') || lowInput.includes('hangout')) {
      return `Let's plan something! 🎉\n\nWho do you want to hang out with?\n\nOr I can suggest:\n• Group dinner (Sarah mentioned wanting to try that new restaurant)\n• Activity with Mike (hasn't connected in 20 days)\n• Weekend plans with Alex\n\nWhat sounds good?`;
    }
  }

  // TRAVEL RESPONSES
  if (aspectId === 'travel') {
    if (lowInput.includes('trip') || lowInput.includes('status') || lowInput.includes('plan')) {
      return `✈️ **Your Trips**\n\n${upcomingTrips.map(t => `• **${t.destination}** (${t.dates})\n  Status: ${t.status} | Fund: ${t.fundProgress}% 💰`).join('\n\n')}\n\nJapan is almost ready! Want to start planning the itinerary?`;
    }
    
    if (lowInput.includes('deal') || lowInput.includes('cheap') || lowInput.includes('flight')) {
      return `🔍 **Flight Deals**\n\nBased on your wishlist:\n• Tokyo: Prices dropped 18% this week! ✨\n• Lisbon: Good deals for spring\n• Reykjavik: Off-season prices available\n\nWant me to set up price alerts?`;
    }
  }

  // DEFAULT RESPONSES
  return `Got it! Let me help with ${aspectId}.\n\nBased on your data, here's what I'm seeing:\n\nWhat specifically would you like to explore?`;
}

// ============================================
// GLOBAL-AWARE AI RESPONSES
// ============================================

function getGlobalAwareResponse(input: string): string {
  const lowInput = input.toLowerCase();
  const summaries = getAspectSummaries();
  const insights = generateGlobalInsights();
  
  // DAILY OVERVIEW
  if (lowInput.includes('today') || lowInput.includes('overview') || lowInput.includes('what\'s on')) {
    const trainingSummary = summaries.find(s => s.aspectId === 'training');
    const foodSummary = summaries.find(s => s.aspectId === 'food');
    const friendsSummary = summaries.find(s => s.aspectId === 'friends');
    
    let response = `Here's your day at a glance:\n\n`;
    
    if (trainingSummary) {
      response += `💪 **Training**: ${trainingSummary.headline}. Today: ${todaysWorkoutPlan.name}\n`;
    }
    if (foodSummary) {
      response += `🍽️ **Food**: ${foodSummary.headline}\n`;
    }
    if (friendsSummary && friendsSummary.status === 'attention') {
      response += `👥 **Friends**: ${friendsSummary.headline}\n`;
    }
    
    // Add top insight
    if (insights.length > 0) {
      response += `\n${insights[0].emoji} **Insight**: ${insights[0].message}`;
    }
    
    return response;
  }
  
  // STATUS CHECK
  if (lowInput.includes('how am i') || lowInput.includes('status') || lowInput.includes('doing')) {
    let response = `Here's how you're doing across the board:\n\n`;
    
    for (const summary of summaries) {
      const statusEmoji = summary.status === 'good' ? '✅' : summary.status === 'attention' ? '⚠️' : '➖';
      response += `${statusEmoji} **${summary.aspectName}**: ${summary.headline}`;
      if (summary.details) {
        response += ` (${summary.details})`;
      }
      response += `\n`;
    }
    
    response += `\nOverall, you're doing great! The consistency in training is paying off. 💪`;
    
    return response;
  }
  
  // WHAT'S NEXT
  if (lowInput.includes('next') || lowInput.includes('focus') || lowInput.includes('priority')) {
    const attentionItems = summaries.filter(s => s.status === 'attention');
    const topInsights = insights.filter(i => i.priority === 'high' || i.priority === 'medium').slice(0, 2);
    
    let response = `Based on your data, here's what I'd focus on:\n\n`;
    
    if (attentionItems.length > 0) {
      response += `**Needs attention:**\n`;
      for (const item of attentionItems) {
        response += `• ${item.aspectName}: ${item.headline}\n`;
      }
      response += `\n`;
    }
    
    if (topInsights.length > 0) {
      response += `**Suggestions:**\n`;
      for (const insight of topInsights) {
        response += `• ${insight.emoji} ${insight.message}\n`;
      }
    }
    
    if (attentionItems.length === 0 && topInsights.length === 0) {
      response += `You're all caught up! Maybe take a moment to plan something fun?\n\n`;
      response += `Your Japan trip is ${upcomingTrips[0]?.fundProgress}% funded - exciting!`;
    }
    
    return response;
  }
  
  // SURPRISE ME
  if (lowInput.includes('surprise') || lowInput.includes('interesting') || lowInput.includes('insight')) {
    const connectionInsights = insights.filter(i => i.category === 'connection');
    const celebrationInsights = insights.filter(i => i.category === 'celebration');
    
    let response = `Here's something interesting:\n\n`;
    
    if (connectionInsights.length > 0) {
      response += `${connectionInsights[0].emoji} ${connectionInsights[0].message}\n\n`;
    } else if (celebrationInsights.length > 0) {
      response += `${celebrationInsights[0].emoji} ${celebrationInsights[0].message}\n\n`;
    } else {
      // Fun cross-aspect connection
      response += `🎯 Did you know? Your ${trainingStats.streak}-day workout streak and meal planning are probably connected. Consistent exercise tends to boost your motivation for healthy eating!\n\n`;
    }
    
    response += `Want to dive into any specific area?`;
    
    return response;
  }
  
  // TRAINING MENTION
  if (lowInput.includes('training') || lowInput.includes('workout') || lowInput.includes('exercise')) {
    return `💪 **Training Quick View**\n\n• Streak: ${trainingStats.streak} days 🔥\n• This week: ${trainingStats.weeklyCompleted}/${trainingStats.weeklyGoal} workouts\n• Today: ${todaysWorkoutPlan.name}\n\nWant me to open the Training mini-app for more details?`;
  }
  
  // FOOD MENTION
  if (lowInput.includes('food') || lowInput.includes('meal') || lowInput.includes('dinner')) {
    const todaysMeal = getTodaysMeal();
    return `🍽️ **Food Quick View**\n\n• Tonight: ${todaysMeal ? `${todaysMeal.emoji} ${todaysMeal.name}` : 'Nothing planned'}\n• Grocery list: ${groceryList.filter(i => !i.checked).length} items\n\nWant me to open the Food mini-app for the full meal plan?`;
  }
  
  // FINANCE MENTION
  if (lowInput.includes('finance') || lowInput.includes('money') || lowInput.includes('budget') || lowInput.includes('saving')) {
    return `💰 **Finance Quick View**\n\n• Portfolio: $${financeStats.portfolioValue.toLocaleString()} (${financeStats.portfolioChange > 0 ? '+' : ''}${financeStats.portfolioChange}%)\n• Monthly: $${financeStats.monthlySpent} / $${financeStats.monthlyBudget}\n• Japan fund: ${upcomingTrips[0]?.fundProgress}% complete\n\nWant me to open the Finance mini-app?`;
  }
  
  // FRIENDS MENTION
  if (lowInput.includes('friend') || lowInput.includes('social') || lowInput.includes('birthday')) {
    const toContact = getFriendsToContact();
    const upcomingBdays = getUpcomingBirthdays();
    return `👥 **Friends Quick View**\n\n• To catch up with: ${toContact.length} friends\n• Upcoming birthdays: ${upcomingBdays.length > 0 ? upcomingBdays.map(f => f.name).join(', ') : 'None this month'}\n\nWant me to open the Friends mini-app?`;
  }
  
  // DEFAULT GLOBAL RESPONSE
  return `I'm connected to all your life areas - training, food, finance, friends, travel, and more!\n\nTry asking:\n• "What's on today?"\n• "How am I doing?"\n• "What should I focus on?"\n• Or ask about any specific area\n\nWhat would you like to explore?`;
}
