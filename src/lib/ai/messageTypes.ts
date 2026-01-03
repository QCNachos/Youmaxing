import type { AspectType } from '@/types/database';
import { getPersona, getTimeOfDay, type PersonaType } from './personas';
import { getRandomInsightForAspect, getLeaderById, formatInsightWithAttribution } from './curators';

export type MessageType = 
  | 'morning-briefing'
  | 'insight-drop'
  | 'nudge'
  | 'celebration'
  | 'curated-wisdom'
  | 'check-in'
  | 'user-message'
  | 'ai-response';

export interface ProactiveMessage {
  id: string;
  type: MessageType;
  content: string;
  aspectId?: AspectType;
  timestamp: Date;
  isFromUser: boolean;
  metadata?: {
    leaderId?: string;
    actionable?: boolean;
    actionLabel?: string;
    actionType?: 'navigate' | 'log' | 'confirm' | 'dismiss';
  };
}

// Generate a morning briefing message
export function generateMorningBriefing(
  userName: string,
  personaType: PersonaType = 'geek-buddy',
  aspectHighlights: { aspect: AspectType; highlight: string }[]
): ProactiveMessage {
  const persona = getPersona(personaType);
  const greeting = persona.greeting(userName, 'morning');
  
  let content = `${greeting}\n\nQuick rundown for today:\n`;
  aspectHighlights.forEach(({ aspect, highlight }) => {
    content += `\n• **${aspect.charAt(0).toUpperCase() + aspect.slice(1)}**: ${highlight}`;
  });

  return {
    id: `briefing-${Date.now()}`,
    type: 'morning-briefing',
    content,
    timestamp: new Date(),
    isFromUser: false,
    metadata: {
      actionable: false,
    },
  };
}

// Generate a celebration message
export function generateCelebration(
  achievement: string,
  aspectId: AspectType,
  personaType: PersonaType = 'geek-buddy'
): ProactiveMessage {
  const persona = getPersona(personaType);
  const content = persona.celebrate(achievement);

  return {
    id: `celebration-${Date.now()}`,
    type: 'celebration',
    content,
    aspectId,
    timestamp: new Date(),
    isFromUser: false,
    metadata: {
      actionable: false,
    },
  };
}

// Generate a nudge message
export function generateNudge(
  task: string,
  aspectId: AspectType,
  context?: string,
  personaType: PersonaType = 'geek-buddy'
): ProactiveMessage {
  const persona = getPersona(personaType);
  const content = persona.nudge(task, context);

  return {
    id: `nudge-${Date.now()}`,
    type: 'nudge',
    content,
    aspectId,
    timestamp: new Date(),
    isFromUser: false,
    metadata: {
      actionable: true,
      actionLabel: 'Do it now',
      actionType: 'navigate',
    },
  };
}

// Generate an insight drop message
export function generateInsightDrop(
  topic: string,
  insight: string,
  aspectId: AspectType,
  personaType: PersonaType = 'geek-buddy'
): ProactiveMessage {
  const persona = getPersona(personaType);
  const content = persona.insight(topic, insight);

  return {
    id: `insight-${Date.now()}`,
    type: 'insight-drop',
    content,
    aspectId,
    timestamp: new Date(),
    isFromUser: false,
    metadata: {
      actionable: false,
    },
  };
}

// Generate a curated wisdom message from a thought leader
export function generateCuratedWisdom(
  aspectId: AspectType,
  personaType: PersonaType = 'geek-buddy'
): ProactiveMessage | null {
  const insight = getRandomInsightForAspect(aspectId);
  if (!insight) return null;

  const leader = getLeaderById(insight.leaderId);
  if (!leader) return null;

  const persona = getPersona(personaType);
  const formattedInsight = formatInsightWithAttribution(insight);
  
  const intros = [
    `${leader.name} on this topic:`,
    `Relevant take from ${leader.name}:`,
    `${leader.name} just dropped some wisdom:`,
    `This from ${leader.name} feels relevant:`,
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];

  return {
    id: `wisdom-${Date.now()}`,
    type: 'curated-wisdom',
    content: `${intro}\n\n${formattedInsight}`,
    aspectId,
    timestamp: new Date(),
    isFromUser: false,
    metadata: {
      leaderId: leader.id,
      actionable: true,
      actionLabel: 'Learn more',
      actionType: 'navigate',
    },
  };
}

// Generate a check-in message
export function generateCheckIn(
  context: string,
  personaType: PersonaType = 'geek-buddy'
): ProactiveMessage {
  const checkIns = {
    'geek-buddy': [
      "You've been quiet today. Everything good? No pressure - just checking in.",
      "Hey, noticed you haven't logged anything today. All good?",
      "Quick check - how's your day going?",
    ],
    'coach': [
      "Status check: How are you tracking on today's goals?",
      "Mid-day accountability: Are you on track?",
      "Checking in on your progress. What's the status?",
    ],
    'analyst': [
      "Data gap detected: No activity logged today. Please update for accurate tracking.",
      "Status update requested. Current progress unknown.",
      "Awaiting input for daily metrics. Please log activity.",
    ],
  };

  const messages = checkIns[personaType] || checkIns['geek-buddy'];
  const content = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: `checkin-${Date.now()}`,
    type: 'check-in',
    content,
    timestamp: new Date(),
    isFromUser: false,
    metadata: {
      actionable: true,
      actionLabel: 'Log now',
      actionType: 'log',
    },
  };
}

// Create a user message
export function createUserMessage(content: string, aspectId?: AspectType): ProactiveMessage {
  return {
    id: `user-${Date.now()}`,
    type: 'user-message',
    content,
    aspectId,
    timestamp: new Date(),
    isFromUser: true,
  };
}

// Create an AI response message
export function createAIResponse(content: string, aspectId?: AspectType): ProactiveMessage {
  return {
    id: `ai-${Date.now()}`,
    type: 'ai-response',
    content,
    aspectId,
    timestamp: new Date(),
    isFromUser: false,
  };
}

// Sample proactive messages for demo
export function generateDemoMessages(userName: string = 'there'): ProactiveMessage[] {
  const now = new Date();
  const messages: ProactiveMessage[] = [];

  // Morning briefing
  messages.push({
    id: 'demo-1',
    type: 'morning-briefing',
    content: `Morning ${userName}! 👋\n\nQuick rundown for today:\n\n• **Training**: Upper body day - you're on a 6-day streak 🔥\n• **Finance**: Market's up 2%, portfolio looking good\n• **Family**: Dad's birthday in 5 days - want gift ideas?`,
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    isFromUser: false,
  });

  // Curated wisdom
  messages.push({
    id: 'demo-2',
    type: 'curated-wisdom',
    content: `Naval on wealth that hit different:\n\n"Seek wealth, not money or status. Wealth is having assets that earn while you sleep." — Naval Ravikant\n\nRelevant for your finance goals?`,
    aspectId: 'finance',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    isFromUser: false,
    metadata: {
      leaderId: 'naval-ravikant',
    },
  });

  // Nudge
  messages.push({
    id: 'demo-3',
    type: 'nudge',
    content: `Quick thing - you mentioned wanting to call Mom more often. Last call was 8 days ago. Quick 5-min check-in?`,
    aspectId: 'family',
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    isFromUser: false,
    metadata: {
      actionable: true,
      actionLabel: 'Call now',
      actionType: 'navigate',
    },
  });

  // Celebration
  messages.push({
    id: 'demo-4',
    type: 'celebration',
    content: `Yo, 7-day workout streak! That's what I'm talking about 🔥\n\nYou've burned 2,800 kcal this week. Keep that energy.`,
    aspectId: 'training',
    timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
    isFromUser: false,
  });

  // Insight drop
  messages.push({
    id: 'demo-5',
    type: 'insight-drop',
    content: `Random thought: You've been crushing workouts but sleep is averaging 6.2h.\n\nHuberman says that's leaving gains on the table. Worth looking at?`,
    aspectId: 'training',
    timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 min ago
    isFromUser: false,
    metadata: {
      leaderId: 'andrew-huberman',
      actionable: true,
      actionLabel: 'Tell me more',
      actionType: 'navigate',
    },
  });

  return messages;
}

