import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAIClient } from '@/lib/ai/client';
import type { TrainingType, TrainingIntensity, BodyPart, WorkoutTemplateExercise } from '@/types/database';

interface GenerateWorkoutRequest {
  goal: string;
  duration_minutes: number;
  training_type: TrainingType;
  body_parts: BodyPart[];
  intensity: TrainingIntensity;
  equipment?: string[];
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
}

// POST - Generate AI workout
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateWorkoutRequest = await request.json();
    const {
      goal,
      duration_minutes,
      training_type,
      body_parts,
      intensity,
      equipment = [],
      fitness_level = 'intermediate',
    } = body;

    if (!goal || !training_type) {
      return NextResponse.json({ error: 'Goal and training type are required' }, { status: 400 });
    }

    // Get AI client
    const aiClient = await getAIClient(user.id);

    // Build the prompt
    const prompt = buildWorkoutPrompt({
      goal,
      duration_minutes,
      training_type,
      body_parts,
      intensity,
      equipment,
      fitness_level,
    });

    // Generate workout using AI
    const response = await aiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional fitness trainer. Generate structured workout plans in JSON format. 
Always respond with valid JSON only, no markdown or explanation.
The response should follow this exact structure:
{
  "title": "Workout title",
  "description": "Brief description",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": 12,
      "duration_seconds": null,
      "rest_seconds": 60,
      "notes": "Optional form tips"
    }
  ]
}
For cardio exercises, use duration_seconds instead of sets/reps.
Include appropriate rest periods between exercises.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json({ error: 'Failed to generate workout' }, { status: 500 });
    }

    // Parse the AI response
    let workoutPlan;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      workoutPlan = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, content);
      return NextResponse.json({ error: 'Failed to parse workout plan' }, { status: 500 });
    }

    // Save the template to the database
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        user_id: user.id,
        title: workoutPlan.title,
        description: workoutPlan.description,
        training_type,
        body_parts,
        duration_minutes,
        intensity,
        exercises: workoutPlan.exercises,
        is_ai_generated: true,
        is_public: false,
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error saving template:', templateError);
      // Still return the workout even if saving fails
      return NextResponse.json({
        template: {
          ...workoutPlan,
          training_type,
          body_parts,
          duration_minutes,
          intensity,
          is_ai_generated: true,
        },
        saved: false,
      });
    }

    return NextResponse.json({
      template,
      saved: true,
    });
  } catch (error) {
    console.error('AI workout generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildWorkoutPrompt(params: GenerateWorkoutRequest): string {
  const {
    goal,
    duration_minutes,
    training_type,
    body_parts,
    intensity,
    equipment,
    fitness_level,
  } = params;

  let prompt = `Create a ${duration_minutes}-minute ${training_type} workout for a ${fitness_level} level person.

Goal: ${goal}

`;

  if (body_parts.length > 0) {
    prompt += `Target body parts: ${body_parts.join(', ')}\n`;
  }

  prompt += `Intensity level: ${intensity}\n`;

  if (equipment && equipment.length > 0) {
    prompt += `Available equipment: ${equipment.join(', ')}\n`;
  } else {
    prompt += `Equipment: Bodyweight only or minimal equipment\n`;
  }

  prompt += `
Requirements:
- Include warm-up and cool-down phases
- Provide appropriate rest periods
- Include form tips for key exercises
- Make sure total time fits within ${duration_minutes} minutes
- Match the ${intensity} intensity level`;

  return prompt;
}

// GET - Fetch saved templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePublic = searchParams.get('includePublic') === 'true';
    const trainingType = searchParams.get('trainingType');

    let query = supabase
      .from('workout_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (includePublic) {
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
    } else {
      query = query.eq('user_id', user.id);
    }

    if (trainingType) {
      query = query.eq('training_type', trainingType);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Templates GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Templates DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

