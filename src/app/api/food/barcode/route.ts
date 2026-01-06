import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import type { FoodAnalysisResult, AnalyzedFood } from '@/types/database';

const barcodeSchema = z.object({
  barcode: z.string().min(8).max(14),
});

// OpenFoodFacts API response type (simplified)
interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  image_url?: string;
}

/**
 * Lookup food product by barcode using Open Food Facts API
 * This is a free, open-source food database
 */
async function lookupBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'YouMaxing Food App - Contact: support@youmaxing.app',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.status !== 1 || !data.product) {
      return null;
    }

    return data.product;
  } catch (error) {
    console.error('OpenFoodFacts API error:', error);
    return null;
  }
}

/**
 * Convert OpenFoodFacts product to our FoodAnalysisResult format
 */
function productToAnalysisResult(
  product: OpenFoodFactsProduct,
  barcode: string
): FoodAnalysisResult {
  const nutriments = product.nutriments || {};
  
  // Estimate serving size (default to 100g if not specified)
  const servingSize = product.serving_size || '100g';
  const servingMultiplier = parseServingMultiplier(servingSize);
  
  const calories = Math.round((nutriments['energy-kcal_100g'] || 0) * servingMultiplier);
  const protein = Math.round((nutriments.proteins_100g || 0) * servingMultiplier);
  const carbs = Math.round((nutriments.carbohydrates_100g || 0) * servingMultiplier);
  const fat = Math.round((nutriments.fat_100g || 0) * servingMultiplier);
  const fiber = Math.round((nutriments.fiber_100g || 0) * servingMultiplier);
  const sugar = Math.round((nutriments.sugars_100g || 0) * servingMultiplier);
  
  const foodName = [product.product_name, product.brands]
    .filter(Boolean)
    .join(' - ') || `Product ${barcode}`;

  const analyzedFood: AnalyzedFood = {
    name: foodName,
    quantity: 1,
    unit: servingSize,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    confidence: 0.95, // High confidence for barcode scans
  };

  return {
    foods: [analyzedFood],
    total_calories: calories,
    total_protein: protein,
    total_carbs: carbs,
    total_fat: fat,
    confidence: 0.95,
    suggestions: [
      `Data from Open Food Facts database`,
      servingSize !== '100g' ? `Serving size: ${servingSize}` : 'Nutrition per 100g',
    ],
  };
}

/**
 * Parse serving size string to get multiplier relative to 100g
 */
function parseServingMultiplier(servingSize: string): number {
  // Try to extract number from serving size
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*(g|ml|oz)?/i);
  
  if (match) {
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'g').toLowerCase();
    
    switch (unit) {
      case 'g':
      case 'ml':
        return value / 100;
      case 'oz':
        return (value * 28.35) / 100;
      default:
        return value / 100;
    }
  }
  
  // Default to 100g (multiplier of 1)
  return 1;
}

export async function POST(request: NextRequest) {
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
    const parsed = barcodeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid barcode format', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { barcode } = parsed.data;

    // Lookup product in OpenFoodFacts
    const product = await lookupBarcode(barcode);

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found',
        message: `No product found for barcode ${barcode}. Try entering the food manually.`,
      }, { status: 404 });
    }

    const result = productToAnalysisResult(product, barcode);

    // Log the lookup (if authenticated)
    if (userId && isSupabaseConfigured) {
      const supabase = await createClient() as any;
      await supabase.from('food_analysis_logs').insert({
        user_id: userId,
        input_type: 'barcode',
        input_data: barcode,
        ai_response: result,
        confidence: result.confidence,
      });
    }

    return NextResponse.json({
      success: true,
      result,
      product_image: product.image_url,
      source: 'openfoodfacts',
    });

  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup barcode', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


