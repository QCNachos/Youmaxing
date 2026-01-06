'use client';

import { useState, useRef, useCallback } from 'react';
import { AspectLayout, EmptyState } from './AspectLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Utensils, 
  Coffee,
  Sun,
  Moon,
  Apple,
  Plus,
  Flame,
  Droplets,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  Pill,
  ScanBarcode,
  ChevronRight,
  X,
  Check,
  Loader2,
  Upload,
  Zap,
  Package,
} from 'lucide-react';
import type { Meal, FoodAnalysisResult, AnalyzedFood, Supplement, SupplementType } from '@/types/database';
import { format } from 'date-fns';

// Mock data for development
const mockMeals: Meal[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Avocado Toast with Eggs',
    type: 'breakfast',
    calories: 450,
    protein: 22,
    carbs: 35,
    fat: 25,
    fiber: 8,
    sugar: 3,
    sodium: 480,
    serving_size: '1 plate',
    image_url: null,
    ai_analyzed: true,
    ai_confidence: 0.89,
    ingredients: [
      { name: 'Sourdough bread', quantity: 2, unit: 'slices' },
      { name: 'Avocado', quantity: 0.5, unit: 'whole' },
      { name: 'Eggs', quantity: 2, unit: 'large' },
    ],
    source: 'image',
    notes: null,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    name: 'Grilled Chicken Salad',
    type: 'lunch',
    calories: 520,
    protein: 42,
    carbs: 18,
    fat: 28,
    fiber: 6,
    sugar: 8,
    sodium: 680,
    serving_size: '1 bowl',
    image_url: null,
    ai_analyzed: true,
    ai_confidence: 0.85,
    ingredients: [
      { name: 'Chicken breast', quantity: 6, unit: 'oz' },
      { name: 'Mixed greens', quantity: 3, unit: 'cups' },
      { name: 'Olive oil dressing', quantity: 2, unit: 'tbsp' },
    ],
    source: 'voice',
    notes: 'Extra dressing',
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const mockSupplements: Supplement[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Whey Protein Isolate',
    brand: 'Optimum Nutrition',
    type: 'protein',
    serving_size: '1 scoop (30g)',
    servings_per_container: 74,
    nutrition_per_serving: { calories: 120, protein: 24, carbs: 3, fat: 1 },
    notes: null,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    name: 'Creatine Monohydrate',
    brand: 'Thorne',
    type: 'creatine',
    serving_size: '5g',
    servings_per_container: 90,
    nutrition_per_serving: { creatine: 5 },
    notes: 'Take daily',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    name: 'Vitamin D3',
    brand: 'NOW Foods',
    type: 'vitamin',
    serving_size: '1 softgel',
    servings_per_container: 360,
    nutrition_per_serving: { vitamin_d: 5000 },
    notes: 'Morning with fat',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const mealTypeConfig = {
  breakfast: { icon: Coffee, color: '#F59E0B', label: 'Breakfast' },
  lunch: { icon: Sun, color: '#22C55E', label: 'Lunch' },
  dinner: { icon: Moon, color: '#8B5CF6', label: 'Dinner' },
  snack: { icon: Apple, color: '#EC4899', label: 'Snack' },
};

const supplementTypeConfig: Record<SupplementType, { icon: typeof Pill; color: string; label: string }> = {
  protein: { icon: Zap, color: '#EF4444', label: 'Protein' },
  creatine: { icon: Zap, color: '#3B82F6', label: 'Creatine' },
  vitamin: { icon: Pill, color: '#F59E0B', label: 'Vitamin' },
  mineral: { icon: Pill, color: '#6B7280', label: 'Mineral' },
  omega: { icon: Pill, color: '#14B8A6', label: 'Omega' },
  pre_workout: { icon: Zap, color: '#EC4899', label: 'Pre-Workout' },
  amino_acids: { icon: Zap, color: '#8B5CF6', label: 'Aminos' },
  herbal: { icon: Package, color: '#22C55E', label: 'Herbal' },
  other: { icon: Pill, color: '#6B7280', label: 'Other' },
};

const quickMeals = [
  { name: 'Oatmeal with Fruits', type: 'breakfast', calories: 350, protein: 12, carbs: 58, fat: 8 },
  { name: 'Caesar Salad', type: 'lunch', calories: 400, protein: 18, carbs: 22, fat: 28 },
  { name: 'Grilled Salmon', type: 'dinner', calories: 600, protein: 48, carbs: 12, fat: 38 },
  { name: 'Protein Shake', type: 'snack', calories: 200, protein: 24, carbs: 8, fat: 3 },
  { name: 'Greek Yogurt Bowl', type: 'snack', calories: 250, protein: 20, carbs: 28, fat: 6 },
  { name: 'Chicken Rice Bowl', type: 'lunch', calories: 550, protein: 38, carbs: 52, fat: 18 },
];

type InputMode = 'smart' | 'camera' | 'voice' | 'barcode' | 'manual';

export function Food() {
  const [meals, setMeals] = useState<Meal[]>(mockMeals);
  const [supplements] = useState<Supplement[]>(mockSupplements);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isAddingSupplement, setIsAddingSupplement] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('smart');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [smartInput, setSmartInput] = useState('');
  const [waterCount, setWaterCount] = useState(6);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'lunch' as Meal['type'],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: '',
  });
  const [barcodeInput, setBarcodeInput] = useState('');

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
  const targetCalories = 2000;
  const targetProtein = 120;
  const targetCarbs = 250;
  const targetFat = 65;

  const stats = [
    { label: 'Today', value: `${totalCalories} cal`, trend: 'up' as const },
    { label: 'Protein', value: `${totalProtein}g` },
    { label: 'Meals', value: meals.length },
    { label: 'Water', value: `${waterCount}/8`, trend: waterCount >= 6 ? 'up' as const : undefined },
  ];

  // Barcode lookup
  const lookupBarcode = async () => {
    if (!barcodeInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/food/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: barcodeInput.trim() }),
      });
      
      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        // Product not found - switch to manual entry
        alert(data.message || 'Product not found. Try entering manually.');
        setInputMode('manual');
      }
    } catch (error) {
      console.error('Barcode lookup failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Smart text analysis
  const analyzeSmartInput = async () => {
    if (!smartInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: 'text',
          text: smartInput,
          meal_type: newMeal.type,
        }),
      });
      
      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Image capture and analysis
  const handleImageCapture = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: 'image',
          image: base64,
          meal_type: newMeal.type,
        }),
      });
      
      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Send for transcription
        setIsAnalyzing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          
          const transcribeResponse = await fetch('/api/food/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          const transcribeData = await transcribeResponse.json();
          if (transcribeData.success && transcribeData.transcript) {
            // Now analyze the transcript
            const analyzeResponse = await fetch('/api/food/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input_type: 'voice',
                voice_transcript: transcribeData.transcript,
                meal_type: newMeal.type,
              }),
            });
            
            const analyzeData = await analyzeResponse.json();
            if (analyzeData.success && analyzeData.result) {
              setAnalysisResult(analyzeData.result);
              setSmartInput(transcribeData.transcript);
            }
          }
        } catch (error) {
          console.error('Voice processing failed:', error);
        } finally {
          setIsAnalyzing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Could not start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Add meal from analysis
  const addMealFromAnalysis = useCallback(() => {
    if (!analysisResult) return;

    const meal: Meal = {
      id: Date.now().toString(),
      user_id: '1',
      name: analysisResult.foods.map(f => f.name).join(', '),
      type: analysisResult.meal_type_guess || newMeal.type,
      calories: analysisResult.total_calories,
      protein: analysisResult.total_protein,
      carbs: analysisResult.total_carbs,
      fat: analysisResult.total_fat,
      fiber: analysisResult.foods.reduce((sum, f) => sum + (f.fiber || 0), 0),
      sugar: analysisResult.foods.reduce((sum, f) => sum + (f.sugar || 0), 0),
      sodium: null,
      serving_size: null,
      image_url: null,
      ai_analyzed: true,
      ai_confidence: analysisResult.confidence,
      ingredients: analysisResult.foods.map(f => ({
        name: f.name,
        quantity: f.quantity,
        unit: f.unit,
        calories: f.calories,
      })),
      source: inputMode === 'camera' ? 'image' : inputMode === 'voice' ? 'voice' : 'manual',
      notes: newMeal.notes || null,
      logged_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setMeals([meal, ...meals]);
    resetAddMealState();
  }, [analysisResult, inputMode, meals, newMeal.notes, newMeal.type]);

  const resetAddMealState = () => {
    setIsAddingMeal(false);
    setAnalysisResult(null);
    setSmartInput('');
    setNewMeal({ name: '', type: 'lunch', calories: 0, protein: 0, carbs: 0, fat: 0, notes: '' });
    setInputMode('smart');
  };

  const addManualMeal = () => {
    const meal: Meal = {
      id: Date.now().toString(),
      user_id: '1',
      name: newMeal.name,
      type: newMeal.type,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbs: newMeal.carbs,
      fat: newMeal.fat,
      fiber: null,
      sugar: null,
      sodium: null,
      serving_size: null,
      image_url: null,
      ai_analyzed: false,
      ai_confidence: null,
      ingredients: [],
      source: 'manual',
      notes: newMeal.notes || null,
      logged_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setMeals([meal, ...meals]);
    resetAddMealState();
  };

  return (
    <AspectLayout
      aspectId="food"
      stats={stats}
      aiInsight="You're doing great with protein intake! Consider adding more leafy greens to your dinner for better micronutrients."
      onAddNew={() => setIsAddingMeal(true)}
      addNewLabel="Log Meal"
    >
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="quickadd">Quick Add</TabsTrigger>
          <TabsTrigger value="supplements">Supplements</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {/* Calorie Progress */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Calories Today
                </span>
                <span className="text-sm text-muted-foreground">
                  {totalCalories} / {targetCalories}
                </span>
              </div>
              <Progress value={(totalCalories / targetCalories) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Smart Input Bar */}
          <Card className="mb-6 border-2 border-dashed border-primary/20 bg-gradient-to-r from-violet-500/5 to-pink-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-violet-500" />
                <span className="text-sm font-medium flex-1">Quick log with AI</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setInputMode('camera'); setIsAddingMeal(true); }}
                  >
                    <Camera className="h-4 w-4" />
                    Photo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => { setInputMode('voice'); setIsAddingMeal(true); }}
                  >
                    <Mic className="h-4 w-4" />
                    Voice
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-violet-600 to-pink-600"
                    onClick={() => { setInputMode('smart'); setIsAddingMeal(true); }}
                  >
                    <Plus className="h-4 w-4" />
                    Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {meals.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="No meals logged today"
              description="Start tracking your nutrition by logging your first meal."
              actionLabel="Log Meal"
              onAction={() => setIsAddingMeal(true)}
            />
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => {
                const config = mealTypeConfig[meal.type];
                const Icon = config.icon;
                return (
                  <Card key={meal.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                          style={{ backgroundColor: `${config.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: config.color }} />
                          {meal.ai_analyzed && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                              <Sparkles className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{meal.name}</h4>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <Badge variant="secondary" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                              {config.label}
                            </Badge>
                            {meal.calories && (
                              <span className="text-sm text-muted-foreground">
                                {meal.calories} cal
                              </span>
                            )}
                            {meal.protein && (
                              <span className="text-xs text-muted-foreground">
                                P: {meal.protein}g
                              </span>
                            )}
                            {meal.source !== 'manual' && (
                              <Badge variant="outline" className="text-xs">
                                {meal.source === 'image' && <Camera className="h-3 w-3 mr-1" />}
                                {meal.source === 'voice' && <Mic className="h-3 w-3 mr-1" />}
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(meal.logged_at), 'HH:mm')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quickadd" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickMeals.map((meal, index) => {
              const config = mealTypeConfig[meal.type as keyof typeof mealTypeConfig];
              const Icon = config.icon;
              return (
                <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{meal.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {meal.calories} cal · P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const newMealEntry: Meal = {
                            id: Date.now().toString(),
                            user_id: '1',
                            name: meal.name,
                            type: meal.type as Meal['type'],
                            calories: meal.calories,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fat: meal.fat,
                            fiber: null,
                            sugar: null,
                            sodium: null,
                            serving_size: null,
                            image_url: null,
                            ai_analyzed: false,
                            ai_confidence: null,
                            ingredients: [],
                            source: 'quick_add',
                            notes: null,
                            logged_at: new Date().toISOString(),
                            created_at: new Date().toISOString(),
                          };
                          setMeals([newMealEntry, ...meals]);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="supplements" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Supplements</h3>
            <Button size="sm" onClick={() => setIsAddingSupplement(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Supplement
            </Button>
          </div>
          
          <div className="space-y-4">
            {supplements.map((supplement) => {
              const config = supplementTypeConfig[supplement.type];
              const Icon = config.icon;
              return (
                <Card key={supplement.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{supplement.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                            {config.label}
                          </Badge>
                          {supplement.brand && (
                            <span className="text-sm text-muted-foreground">{supplement.brand}</span>
                          )}
                        </div>
                        {supplement.serving_size && (
                          <p className="text-xs text-muted-foreground mt-1">{supplement.serving_size}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          0 today
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {supplements.length === 0 && (
            <EmptyState
              icon={Pill}
              title="No supplements tracked"
              description="Add your supplements to track daily intake."
              actionLabel="Add Supplement"
              onAction={() => setIsAddingSupplement(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Macros Today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Protein', value: totalProtein, target: targetProtein, color: '#EF4444', unit: 'g' },
                  { name: 'Carbs', value: totalCarbs, target: targetCarbs, color: '#F59E0B', unit: 'g' },
                  { name: 'Fat', value: totalFat, target: targetFat, color: '#22C55E', unit: 'g' },
                ].map((macro) => (
                  <div key={macro.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{macro.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {macro.value}{macro.unit} / {macro.target}{macro.unit}
                      </span>
                    </div>
                    <Progress value={(macro.value / macro.target) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Hydration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                    <button
                      key={glass}
                      onClick={() => setWaterCount(glass)}
                      className={`w-8 h-12 rounded-lg border-2 transition-colors ${
                        glass <= waterCount 
                          ? 'bg-blue-500/20 border-blue-500' 
                          : 'border-border hover:border-blue-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {waterCount} of 8 glasses today
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Meal Dialog - Enhanced with AI */}
      <Dialog open={isAddingMeal} onOpenChange={(open) => !open && resetAddMealState()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Log Meal with AI
            </DialogTitle>
          </DialogHeader>

          {/* Input Mode Selector */}
          <div className="grid grid-cols-5 gap-2 py-4">
            {[
              { mode: 'smart' as InputMode, icon: Sparkles, label: 'Smart' },
              { mode: 'camera' as InputMode, icon: Camera, label: 'Photo' },
              { mode: 'voice' as InputMode, icon: Mic, label: 'Voice' },
              { mode: 'barcode' as InputMode, icon: ScanBarcode, label: 'Scan' },
              { mode: 'manual' as InputMode, icon: Utensils, label: 'Manual' },
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={inputMode === mode ? 'default' : 'outline'}
                className={`flex flex-col h-auto py-3 ${inputMode === mode ? 'bg-gradient-to-r from-violet-600 to-pink-600' : ''}`}
                onClick={() => setInputMode(mode)}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
            </div>

          {/* Meal Type Selector */}
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(mealTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={newMeal.type === type ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3"
                      style={newMeal.type === type ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewMeal({ ...newMeal, type: type as Meal['type'] })}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

          {/* Smart Input Mode */}
          {inputMode === 'smart' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Describe what you ate</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 2 eggs, avocado toast, coffee with milk..."
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && analyzeSmartInput()}
                  />
                  <Button 
                    onClick={analyzeSmartInput} 
                    disabled={isAnalyzing || !smartInput.trim()}
                    className="bg-gradient-to-r from-violet-600 to-pink-600"
                  >
                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI will analyze and estimate calories & nutrients
                </p>
              </div>
            </div>
          )}

          {/* Camera Input Mode */}
          {inputMode === 'camera' && (
            <div className="space-y-4 py-4">
              <div 
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageCapture(file);
                  }}
                />
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">Analyzing your meal...</p>
                  </div>
                ) : (
                  <>
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Take a photo or upload</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Point at your meal and AI will identify it
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Voice Input Mode */}
          {inputMode === 'voice' && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isAnalyzing}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-gradient-to-r from-violet-600 to-pink-600 hover:scale-105'
                  }`}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-10 w-10 text-white" />
                  ) : (
                    <Mic className="h-10 w-10 text-white" />
                  )}
                </button>
                <p className="text-sm text-muted-foreground text-center">
                  {isAnalyzing 
                    ? 'Processing your voice...' 
                    : isRecording 
                      ? 'Listening... tap to stop' 
                      : 'Tap to start recording'}
                </p>
                {smartInput && (
                  <Card className="w-full">
                    <CardContent className="p-3">
                      <p className="text-sm">&ldquo;{smartInput}&rdquo;</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Barcode Scan Mode */}
          {inputMode === 'barcode' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Enter Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 5449000000996"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
                    maxLength={14}
                    inputMode="numeric"
                  />
                  <Button 
                    onClick={lookupBarcode} 
                    disabled={isAnalyzing || barcodeInput.length < 8}
                    className="bg-gradient-to-r from-violet-600 to-pink-600"
                  >
                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanBarcode className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the barcode from the product packaging (8-14 digits)
                </p>
              </div>
              
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50">
                  <ScanBarcode className="h-8 w-8 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Camera scanning coming soon!</p>
                    <p className="text-xs text-muted-foreground">For now, enter the barcode manually</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input Mode */}
          {inputMode === 'manual' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Meal Name</Label>
                <Input
                  placeholder="e.g., Grilled Chicken Salad"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label>Calories</Label>
              <Input
                type="number"
                placeholder="0"
                value={newMeal.calories || ''}
                onChange={(e) => setNewMeal({ ...newMeal, calories: parseInt(e.target.value) || 0 })}
              />
                </div>
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newMeal.protein || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newMeal.carbs || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newMeal.fat || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: parseInt(e.target.value) || 0 })}
                  />
                </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Any details..."
                value={newMeal.notes}
                onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
                onClick={addManualMeal}
              disabled={!newMeal.name.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Meal
              </Button>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="space-y-4 py-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  AI Analysis
                </h4>
                <Badge variant="secondary">
                  {Math.round(analysisResult.confidence * 100)}% confident
                </Badge>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  {analysisResult.foods.map((food, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.quantity} {food.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{food.calories} cal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>{analysisResult.total_calories} calories</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>P: {analysisResult.total_protein}g</span>
                      <span>C: {analysisResult.total_carbs}g</span>
                      <span>F: {analysisResult.total_fat}g</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResult.suggestions.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAnalysisResult(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Adjust
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
                  onClick={addMealFromAnalysis}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Log Meal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Supplement Dialog */}
      <Dialog open={isAddingSupplement} onOpenChange={setIsAddingSupplement}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Supplement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplement Name</Label>
              <Input placeholder="e.g., Whey Protein" />
            </div>
            <div className="space-y-2">
              <Label>Brand (optional)</Label>
              <Input placeholder="e.g., Optimum Nutrition" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(supplementTypeConfig).slice(0, 6).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant="outline"
                      className="flex flex-col h-auto py-2"
                    >
                      <Icon className="h-4 w-4 mb-1" style={{ color: config.color }} />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Serving Size</Label>
              <Input placeholder="e.g., 1 scoop (30g)" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={() => setIsAddingSupplement(false)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}
