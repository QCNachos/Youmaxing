import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import type { FoodAnalysisResult, FoodInputType } from '@/types/database';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const analyzeBodySchema = z.object({
  input_type: z.enum(['image', 'voice', 'text', 'barcode']),
  // For text input: description of food
  text: z.string().max(2000).optional(),
  // For image input: base64 encoded image or URL
  image: z.string().optional(),
  image_url: z.string().url().optional(),
  // For barcode: the barcode number
  barcode: z.string().optional(),
  // For voice: transcribed text (or audio will be transcribed first)
  voice_transcript: z.string().optional(),
  // Context for better analysis
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
});

const FOOD_ANALYSIS_PROMPT = `You are an expert nutritionist AI. Analyze the food described or shown and provide accurate nutritional estimates.

IMPORTANT GUIDELINES:
- Be precise with portion estimates based on typical serving sizes
- If unsure about exact amounts, use common restaurant/home serving sizes
- Include all visible/mentioned items
- For complex dishes, break down key ingredients
- Confidence should reflect how certain you are (0.5-0.95 range)

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "foods": [
    {
      "name": "Item name",
      "quantity": 1,
      "unit": "cup|piece|oz|g|slice|serving",
      "calories": 250,
      "protein": 10,
      "carbs": 30,
      "fat": 8,
      "fiber": 3,
      "sugar": 5,
      "confidence": 0.85
    }
  ],
  "total_calories": 500,
  "total_protein": 25,
  "total_carbs": 60,
  "total_fat": 15,
  "confidence": 0.82,
  "meal_type_guess": "lunch",
  "suggestions": ["Consider adding vegetables for fiber", "Good protein content!"]
}`;

async function analyzeWithOpenAI(
  inputType: FoodInputType,
  content: string,
  imageUrl?: string,
  mealType?: string
): Promise<FoodAnalysisResult> {
  if (!openai) throw new Error('OpenAI not configured');

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: FOOD_ANALYSIS_PROMPT },
  ];

  if (inputType === 'image' && imageUrl) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: imageUrl, detail: 'high' },
        },
        {
          type: 'text',
          text: `Analyze this food image and provide nutritional breakdown.${mealType ? ` This appears to be ${mealType}.` : ''}`,
        },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: `Analyze this food and provide nutritional breakdown: "${content}"${mealType ? ` (${mealType})` : ''}`,
    });
  }

  const response = await openai.chat.completions.create({
    model: inputType === 'image' ? 'gpt-4o' : 'gpt-4-turbo-preview',
    messages,
    max_tokens: 1000,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const result = response.choices[0]?.message?.content;
  if (!result) throw new Error('No response from OpenAI');

  return JSON.parse(result) as FoodAnalysisResult;
}

async function analyzeWithClaude(
  inputType: FoodInputType,
  content: string,
  imageBase64?: string,
  mealType?: string
): Promise<FoodAnalysisResult> {
  if (!anthropic) throw new Error('Anthropic not configured');

  const messageContent: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

  if (inputType === 'image' && imageBase64) {
    // Extract media type and data from base64
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: match[2],
        },
      });
    }
    messageContent.push({
      type: 'text',
      text: `Analyze this food image and provide nutritional breakdown in JSON format.${mealType ? ` This appears to be ${mealType}.` : ''}`,
    });
  } else {
    messageContent.push({
      type: 'text',
      text: `Analyze this food and provide nutritional breakdown in JSON format: "${content}"${mealType ? ` (${mealType})` : ''}`,
    });
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: FOOD_ANALYSIS_PROMPT,
    messages: [{ role: 'user', content: messageContent }],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') throw new Error('No response from Claude');

  // Extract JSON from response (Claude might wrap it in markdown)
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse JSON response');

  return JSON.parse(jsonMatch[0]) as FoodAnalysisResult;
}

// Fallback mock response for demo/dev mode
function getMockAnalysis(content: string, mealType?: string): FoodAnalysisResult {
  const mockFoods = [
    { 
      name: content || 'Mixed meal', 
      quantity: 1, 
      unit: 'serving', 
      calories: 450, 
      protein: 25, 
      carbs: 45, 
      fat: 18, 
      fiber: 5, 
      sugar: 8, 
      confidence: 0.75 
    },
  ];

  return {
    foods: mockFoods,
    total_calories: mockFoods.reduce((sum, f) => sum + f.calories, 0),
    total_protein: mockFoods.reduce((sum, f) => sum + f.protein, 0),
    total_carbs: mockFoods.reduce((sum, f) => sum + f.carbs, 0),
    total_fat: mockFoods.reduce((sum, f) => sum + f.fat, 0),
    confidence: 0.75,
    meal_type_guess: mealType as FoodAnalysisResult['meal_type_guess'] || 'lunch',
    suggestions: [
      'AI analysis unavailable - this is a demo estimate',
      'Add your API keys for accurate analysis',
    ],
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication check in production
    let userId: string | undefined;
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
      }
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    const body = await request.json();
    const parsed = analyzeBodySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { input_type, text, image, image_url, barcode, voice_transcript, meal_type } = parsed.data;

    let result: FoodAnalysisResult;
    const content = text || voice_transcript || barcode || '';

    // Try to analyze with available AI provider
    if (input_type === 'image' && (image || image_url)) {
      // Image analysis - prefer GPT-4o for URL, Claude for base64
      if (image_url && openai) {
        result = await analyzeWithOpenAI(input_type, content, image_url, meal_type);
      } else if (image && anthropic) {
        result = await analyzeWithClaude(input_type, content, image, meal_type);
      } else if (image && openai) {
        // Convert base64 to data URL for OpenAI
        result = await analyzeWithOpenAI(input_type, content, image, meal_type);
      } else {
        result = getMockAnalysis(content, meal_type);
      }
    } else if (input_type === 'barcode') {
      // For barcode, we'd typically call a food database API (OpenFoodFacts, etc.)
      // For now, use AI to estimate if we can't find it
      if (openai) {
        result = await analyzeWithOpenAI('text', `Food product with barcode ${barcode}`, undefined, meal_type);
      } else if (anthropic) {
        result = await analyzeWithClaude('text', `Food product with barcode ${barcode}`, undefined, meal_type);
      } else {
        result = getMockAnalysis(`Product ${barcode}`, meal_type);
      }
    } else {
      // Text or voice transcript analysis
      if (openai) {
        result = await analyzeWithOpenAI(input_type, content, undefined, meal_type);
      } else if (anthropic) {
        result = await analyzeWithClaude(input_type, content, undefined, meal_type);
      } else {
        result = getMockAnalysis(content, meal_type);
      }
    }

    const processingTime = Date.now() - startTime;

    // Log the analysis (if authenticated)
    if (userId && isSupabaseConfigured) {
      const supabase = await createClient() as any;
      await supabase.from('food_analysis_logs').insert({
        user_id: userId,
        input_type,
        input_data: content || null,
        image_url: image_url || null,
        ai_response: result,
        confidence: result.confidence,
        processing_time_ms: processingTime,
      });
    }

    return NextResponse.json({
      success: true,
      result,
      processing_time_ms: processingTime,
    });

  } catch (error) {
    console.error('Food analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze food', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


