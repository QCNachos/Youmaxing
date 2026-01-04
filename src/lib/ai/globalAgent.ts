/**
 * Global Agent - The "Geek Buddy" that orchestrates all aspects
 * 
 * This agent aggregates data from all mini-apps and generates proactive,
 * timely insights that connect different areas of life.
 */

import type { AspectType } from '@/types/database';
import {
  trainingStats,
  todaysWorkoutPlan,
  workoutsThisWeek,
  weeklyMealPlan,
  getTodaysMeal,
  groceryList,
  financeStats,
  savingsGoals,
  recentTransactions,
  friends,
  getFriendsToContact,
  getUpcomingBirthdays,
  upcomingTrips,
  getDayOfWeek,
} from '@/lib/miniAppData';
import { aspects } from '@/lib/aspects';

// ============================================
// TYPES
// ============================================

export type InsightPriority = 'high' | 'medium' | 'low';
export type InsightCategory = 
  | 'celebration'      // Achievements, streaks
  | 'reminder'         // Tasks, events, birthdays
  | 'suggestion'       // AI recommendations
  | 'connection'       // Cross-aspect insights
  | 'status'           // Updates, progress reports
  | 'nudge';           // Gentle pushes

export interface GlobalInsight {
  id: string;
  message: string;
  emoji: string;
  category: InsightCategory;
  priority: InsightPriority;
  relatedAspects: AspectType[];
  actionLabel?: string;
  actionAspect?: AspectType;
  timestamp: Date;
}

export interface AspectSummary {
  aspectId: AspectType;
  aspectName: string;
  color: string;
  status: 'good' | 'attention' | 'neutral';
  headline: string;
  details?: string;
}

// ============================================
// DATA AGGREGATION
// ============================================

/**
 * Get a summary of all aspects for the global agent
 */
export function getAspectSummaries(): AspectSummary[] {
  const summaries: AspectSummary[] = [];
  
  // Training
  const trainingAspect = aspects.find(a => a.id === 'training');
  if (trainingAspect) {
    summaries.push({
      aspectId: 'training',
      aspectName: trainingAspect.name,
      color: trainingAspect.color,
      status: trainingStats.streak >= 3 ? 'good' : 'attention',
      headline: `${trainingStats.streak}-day streak`,
      details: `${trainingStats.weeklyCompleted}/${trainingStats.weeklyGoal} workouts this week`,
    });
  }
  
  // Food
  const foodAspect = aspects.find(a => a.id === 'food');
  if (foodAspect) {
    const todaysMeal = getTodaysMeal();
    const uncheckedGroceries = groceryList.filter(i => !i.checked).length;
    summaries.push({
      aspectId: 'food',
      aspectName: foodAspect.name,
      color: foodAspect.color,
      status: todaysMeal ? 'good' : 'attention',
      headline: todaysMeal ? `${todaysMeal.emoji} ${todaysMeal.name} tonight` : 'No dinner planned',
      details: uncheckedGroceries > 0 ? `${uncheckedGroceries} items on grocery list` : undefined,
    });
  }
  
  // Finance
  const financeAspect = aspects.find(a => a.id === 'finance');
  if (financeAspect) {
    const budgetUsed = Math.round((financeStats.monthlySpent / financeStats.monthlyBudget) * 100);
    summaries.push({
      aspectId: 'finance',
      aspectName: financeAspect.name,
      color: financeAspect.color,
      status: budgetUsed < 80 ? 'good' : budgetUsed < 95 ? 'attention' : 'attention',
      headline: `$${financeStats.monthlySpent.toLocaleString()} spent (${budgetUsed}%)`,
      details: financeStats.portfolioChange > 0 
        ? `Portfolio up ${financeStats.portfolioChange}%` 
        : `Portfolio ${financeStats.portfolioChange}%`,
    });
  }
  
  // Friends
  const friendsAspect = aspects.find(a => a.id === 'friends');
  if (friendsAspect) {
    const toContact = getFriendsToContact();
    const upcomingBdays = getUpcomingBirthdays();
    summaries.push({
      aspectId: 'friends',
      aspectName: friendsAspect.name,
      color: friendsAspect.color,
      status: toContact.length > 2 ? 'attention' : 'neutral',
      headline: toContact.length > 0 
        ? `${toContact.length} friends to catch up with` 
        : 'All caught up!',
      details: upcomingBdays.length > 0 
        ? `${upcomingBdays.length} birthday(s) this month` 
        : undefined,
    });
  }
  
  // Travel
  const travelAspect = aspects.find(a => a.id === 'travel');
  if (travelAspect) {
    const nextTrip = upcomingTrips.find(t => t.status === 'planning');
    summaries.push({
      aspectId: 'travel',
      aspectName: travelAspect.name,
      color: travelAspect.color,
      status: nextTrip ? 'good' : 'neutral',
      headline: nextTrip 
        ? `${nextTrip.destination} - ${nextTrip.fundProgress}% funded` 
        : 'No trips planned',
      details: nextTrip ? nextTrip.dates : undefined,
    });
  }
  
  return summaries;
}

// ============================================
// INSIGHT GENERATION
// ============================================

/**
 * Generate proactive insights by analyzing all mini-app data
 */
export function generateGlobalInsights(): GlobalInsight[] {
  const insights: GlobalInsight[] = [];
  const now = new Date();
  
  // TRAINING INSIGHTS
  // Streak celebration
  if (trainingStats.streak >= 5) {
    insights.push({
      id: 'training-streak',
      message: `You're on a ${trainingStats.streak}-day workout streak! That's incredible consistency.`,
      emoji: '🔥',
      category: 'celebration',
      priority: 'high',
      relatedAspects: ['training'],
      timestamp: now,
    });
  }
  
  // Weekly goal achievement
  if (trainingStats.weeklyCompleted >= trainingStats.weeklyGoal) {
    insights.push({
      id: 'training-weekly-goal',
      message: `You've hit your weekly workout goal! ${trainingStats.weeklyCompleted}/${trainingStats.weeklyGoal} sessions complete.`,
      emoji: '🏆',
      category: 'celebration',
      priority: 'medium',
      relatedAspects: ['training'],
      timestamp: now,
    });
  }
  
  // FOOD + TRAINING CONNECTION
  const todaysMeal = getTodaysMeal();
  if (!todaysMeal && todaysWorkoutPlan) {
    insights.push({
      id: 'food-training-connection',
      message: `You have "${todaysWorkoutPlan.name}" planned today but no dinner set. Want me to suggest a post-workout meal?`,
      emoji: '💪🍽️',
      category: 'connection',
      priority: 'medium',
      relatedAspects: ['food', 'training'],
      actionLabel: 'Suggest meal',
      actionAspect: 'food',
      timestamp: now,
    });
  }
  
  // FRIENDS INSIGHTS
  const friendsToContact = getFriendsToContact();
  if (friendsToContact.length > 0) {
    const topFriend = friendsToContact[0];
    const daysAgo = Math.floor((now.getTime() - topFriend.lastContact.getTime()) / (24 * 60 * 60 * 1000));
    insights.push({
      id: 'friends-catch-up',
      message: `You haven't talked to ${topFriend.name} in ${daysAgo} days. Maybe send a quick message?`,
      emoji: '👋',
      category: 'nudge',
      priority: 'medium',
      relatedAspects: ['friends'],
      actionLabel: 'Draft message',
      actionAspect: 'friends',
      timestamp: now,
    });
  }
  
  // Birthday reminders
  const upcomingBirthdays = getUpcomingBirthdays();
  if (upcomingBirthdays.length > 0) {
    const nextBday = upcomingBirthdays[0];
    if (nextBday.birthday) {
      const daysUntil = Math.ceil(
        (new Date(now.getFullYear(), nextBday.birthday.getMonth(), nextBday.birthday.getDate()).getTime() - now.getTime()) 
        / (24 * 60 * 60 * 1000)
      );
      insights.push({
        id: 'birthday-reminder',
        message: `${nextBday.name}'s birthday is in ${daysUntil} days. Want me to suggest gift ideas?`,
        emoji: '🎂',
        category: 'reminder',
        priority: daysUntil <= 3 ? 'high' : 'medium',
        relatedAspects: ['friends'],
        actionLabel: 'Gift ideas',
        actionAspect: 'friends',
        timestamp: now,
      });
    }
  }
  
  // FINANCE INSIGHTS
  const budgetPercent = (financeStats.monthlySpent / financeStats.monthlyBudget) * 100;
  if (budgetPercent > 80 && budgetPercent < 100) {
    insights.push({
      id: 'budget-warning',
      message: `You've used ${Math.round(budgetPercent)}% of your monthly budget. About $${financeStats.monthlyBudget - financeStats.monthlySpent} remaining.`,
      emoji: '💰',
      category: 'status',
      priority: 'medium',
      relatedAspects: ['finance'],
      actionLabel: 'Review spending',
      actionAspect: 'finance',
      timestamp: now,
    });
  }
  
  // TRAVEL + FINANCE CONNECTION
  const japanTrip = upcomingTrips.find(t => t.destination === 'Japan');
  const japanSavings = savingsGoals.find(g => g.id === 'japan');
  if (japanTrip && japanSavings) {
    const progressDiff = japanTrip.fundProgress - Math.round((japanSavings.current / japanSavings.target) * 100);
    if (progressDiff <= 10) {
      insights.push({
        id: 'travel-finance-connection',
        message: `Your Japan trip is ${japanTrip.fundProgress}% funded! You're almost there. ${japanTrip.dates}`,
        emoji: '✈️',
        category: 'connection',
        priority: 'low',
        relatedAspects: ['travel', 'finance'],
        actionLabel: 'Trip details',
        actionAspect: 'travel',
        timestamp: now,
      });
    }
  }
  
  // GROCERY LIST REMINDER
  const uncheckedGroceries = groceryList.filter(i => !i.checked);
  if (uncheckedGroceries.length > 5) {
    insights.push({
      id: 'grocery-reminder',
      message: `You have ${uncheckedGroceries.length} items on your grocery list. Planning a shopping trip?`,
      emoji: '🛒',
      category: 'reminder',
      priority: 'low',
      relatedAspects: ['food'],
      actionLabel: 'View list',
      actionAspect: 'food',
      timestamp: now,
    });
  }
  
  // TIME-BASED INSIGHTS
  const hour = now.getHours();
  const dayOfWeek = getDayOfWeek();
  
  // Morning motivation
  if (hour >= 6 && hour < 10) {
    insights.push({
      id: 'morning-greeting',
      message: `Good morning! Ready to crush ${dayOfWeek}? Your ${todaysWorkoutPlan.name} is planned for today.`,
      emoji: '☀️',
      category: 'status',
      priority: 'medium',
      relatedAspects: ['training'],
      timestamp: now,
    });
  }
  
  // Evening meal reminder
  if (hour >= 16 && hour < 18 && todaysMeal) {
    insights.push({
      id: 'dinner-reminder',
      message: `Tonight's dinner: ${todaysMeal.emoji} ${todaysMeal.name}. ${todaysMeal.prepTime ? `About ${todaysMeal.prepTime} min to prepare.` : ''}`,
      emoji: '🍽️',
      category: 'reminder',
      priority: 'medium',
      relatedAspects: ['food'],
      actionLabel: 'View recipe',
      actionAspect: 'food',
      timestamp: now,
    });
  }
  
  // Sort by priority
  const priorityOrder: Record<InsightPriority, number> = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return insights;
}

// ============================================
// GREETING GENERATION
// ============================================

/**
 * Generate a contextual greeting based on time and data
 */
export function getGlobalGreeting(): { greeting: string; subtext: string } {
  const hour = new Date().getHours();
  const dayOfWeek = getDayOfWeek();
  
  let greeting: string;
  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Hey there';
  }
  
  // Contextual subtext based on data
  const insights = generateGlobalInsights();
  const topInsight = insights[0];
  
  let subtext: string;
  if (topInsight) {
    subtext = topInsight.message;
  } else {
    subtext = `Happy ${dayOfWeek}! How can I help you today?`;
  }
  
  return { greeting, subtext };
}

// ============================================
// QUICK ACTIONS FOR GLOBAL MODE
// ============================================

export interface GlobalQuickAction {
  id: string;
  label: string;
  aspectId?: AspectType;
  prompt: string;
}

export function getGlobalQuickActions(): GlobalQuickAction[] {
  return [
    { id: 'daily-briefing', label: "What's on today?", prompt: "Give me a quick overview of my day - workouts, meals, tasks, and any important reminders." },
    { id: 'how-am-i-doing', label: 'How am I doing?', prompt: "Give me a quick status update across all my life areas - training, finances, goals." },
    { id: 'whats-next', label: "What's next?", prompt: "What should I focus on next based on my goals and schedule?" },
    { id: 'surprise-me', label: 'Surprise me!', prompt: "Share something interesting or a smart insight I might not have thought of." },
  ];
}

// ============================================
// SYSTEM PROMPT FOR GLOBAL AGENT
// ============================================

export function getGlobalAgentSystemPrompt(): string {
  const summaries = getAspectSummaries();
  const insights = generateGlobalInsights();
  const { greeting } = getGlobalGreeting();
  
  return `You are the user's personal AI companion - think of yourself as a successful friend who casually drops valuable insights throughout the day. You're not a formal assistant, but a knowledgeable buddy who has visibility into all areas of their life.

Your personality:
- Casual, warm, and encouraging (not corporate or formal)
- Drop insights naturally, like a friend sharing advice over coffee
- Connect dots between different life areas
- Celebrate wins, gently nudge on things that need attention
- Be concise but thoughtful

CURRENT CONTEXT (${greeting}):

${summaries.map(s => `${s.aspectName}: ${s.headline}${s.details ? ` (${s.details})` : ''}`).join('\n')}

TOP INSIGHTS:
${insights.slice(0, 3).map(i => `${i.emoji} ${i.message}`).join('\n')}

When responding:
- Reference specific data when relevant (streak counts, meal names, friend names, etc.)
- Make connections between aspects (e.g., workout + meal planning, travel + savings)
- Keep responses conversational and actionable
- If they ask about a specific aspect, you can go deeper but maintain context
- Don't overwhelm - pick the most relevant things to mention`;
}

