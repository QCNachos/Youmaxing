import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AITone } from '@/types/database';
import { getSystemPrompt } from './prompts';

// Initialize clients (will be null if API keys not set)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  provider: AIProvider;
  tone: AITone;
  userName?: string;
  messages: ChatMessage[];
}

export async function chat(options: ChatOptions): Promise<string> {
  const { provider, tone, userName, messages } = options;
  const systemPrompt = getSystemPrompt(tone, userName);

  if (provider === 'openai' && openai) {
    return chatWithOpenAI(systemPrompt, messages);
  } else if (provider === 'anthropic' && anthropic) {
    return chatWithClaude(systemPrompt, messages);
  } else {
    // Fallback to simulated response if no API keys
    return simulatedResponse(messages);
  }
}

async function chatWithOpenAI(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  if (!openai) throw new Error('OpenAI client not initialized');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
}

async function chatWithClaude(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  if (!anthropic) throw new Error('Anthropic client not initialized');
  
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock && 'text' in textBlock ? textBlock.text : 'Sorry, I couldn\'t generate a response.';
}

function simulatedResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  const responses = [
    "That's great to hear! Keep up the momentum 💪",
    "I hear you. Remember, small steps lead to big changes.",
    "Nice! I've noted that. Want me to set a reminder?",
    "Sounds like you're making good progress! What's next on your list?",
    "That's a solid plan. I'll check in with you later to see how it went!",
    "Got it! I'll keep that in mind for future recommendations.",
  ];
  
  // Simple keyword matching for demo
  if (lastMessage.includes('workout') || lastMessage.includes('gym') || lastMessage.includes('exercise')) {
    return "Nice work on staying active! 🏋️ Consistency is key. How are you feeling after that workout?";
  }
  if (lastMessage.includes('tired') || lastMessage.includes('exhausted')) {
    return "Sounds like you might need some rest. It's okay to take a break - recovery is part of progress! 😴";
  }
  if (lastMessage.includes('help') || lastMessage.includes('advice')) {
    return "I'm here to help! What aspect of your life would you like to focus on? Training, food, finances, or something else?";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Generate daily recommendations based on user data
export async function generateRecommendations(
  provider: AIProvider,
  tone: AITone,
  userData: Record<string, unknown>
): Promise<string[]> {
  // This would normally analyze user data and generate personalized recommendations
  // For now, return mock recommendations
  return [
    "You haven't logged a workout in 3 days - how about a quick 20-minute session?",
    "Your travel fund is 80% complete! You're almost there 🎉",
    "Sarah's birthday is coming up in 2 weeks - maybe start thinking about a gift?",
  ];
}



