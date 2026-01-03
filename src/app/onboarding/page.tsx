'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Camera,
  Instagram,
  Music,
  Check,
  User,
  Coins,
  Twitter,
  Wallet,
  Activity,
  Target,
  Zap,
  Gift,
} from 'lucide-react';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';
import { cn } from '@/lib/utils';

type OnboardingStep = 'welcome' | 'avatar' | 'priorities' | 'goals' | 'social' | 'complete';

// Points configuration
const POINTS = {
  name: 50,
  avatar: 100,
  priorityEach: 20,
  goal: 30,
  socialEach: 150,
  completion: 200,
};

// Goals/Lifestyle options
const lifestyleGoals = [
  { id: 'fitness', label: 'Get fitter & healthier', icon: Activity, points: 30 },
  { id: 'wealth', label: 'Build wealth & invest', icon: Wallet, points: 30 },
  { id: 'social', label: 'Strengthen relationships', icon: User, points: 30 },
  { id: 'productivity', label: 'Be more productive', icon: Target, points: 30 },
  { id: 'balance', label: 'Better work-life balance', icon: Zap, points: 30 },
];

// Social connections with points
const socialConnections = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, points: 150, description: 'Sync your social life' },
  { id: 'spotify', name: 'Spotify', icon: Music, points: 100, description: 'Music & entertainment' },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, points: 150, description: 'Stay on trends' },
  { id: 'health', name: 'Apple Health', icon: Activity, points: 200, description: 'Fitness & wellness data' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<AspectType[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [connectedSocial, setConnectedSocial] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);

  const steps: OnboardingStep[] = ['welcome', 'avatar', 'priorities', 'goals', 'social', 'complete'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Calculate total points
  const calculatePoints = () => {
    let total = 0;
    if (name.trim()) total += POINTS.name;
    total += selectedPriorities.length * POINTS.priorityEach;
    total += selectedGoals.length * POINTS.goal;
    connectedSocial.forEach(id => {
      const social = socialConnections.find(s => s.id === id);
      if (social) total += social.points;
    });
    return total;
  };

  // Update points with animation
  useEffect(() => {
    const newPoints = calculatePoints();
    if (newPoints > points) {
      setLastPointsEarned(newPoints - points);
      setShowPointsAnimation(true);
      setTimeout(() => setShowPointsAnimation(false), 1500);
    }
    setPoints(newPoints);
  }, [name, selectedPriorities, selectedGoals, connectedSocial]);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const togglePriority = (aspectId: AspectType) => {
    if (selectedPriorities.includes(aspectId)) {
      setSelectedPriorities(selectedPriorities.filter((id) => id !== aspectId));
    } else if (selectedPriorities.length < 5) {
      setSelectedPriorities([...selectedPriorities, aspectId]);
    }
  };

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const toggleSocial = (socialId: string) => {
    if (connectedSocial.includes(socialId)) {
      setConnectedSocial(connectedSocial.filter((id) => id !== socialId));
    } else {
      setConnectedSocial([...connectedSocial, socialId]);
    }
  };

  const completeOnboarding = () => {
    // Add completion bonus
    const finalPoints = points + POINTS.completion;
    // In a real app, save points to database here
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-pink-950/30" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/20 rounded-full blur-[100px] animate-pulse" />

      {/* Progress Bar & Points */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <Progress value={progress} className="h-1 rounded-none" />
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white">YOUMAXING</span>
          </div>
          
          {/* Points Display */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 transition-all",
              showPointsAnimation && "scale-110 border-amber-400"
            )}>
              <Coins className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-amber-300">{points}</span>
              {showPointsAnimation && (
                <span className="text-green-400 text-sm font-bold animate-bounce">
                  +{lastPointsEarned}
                </span>
              )}
            </div>
            <span className="text-sm text-white/50">
              Step {currentStepIndex + 1}/{steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 pt-28 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white">Welcome to YOUMAXING!</CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Let&apos;s personalize your journey. Earn points as you go!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-white/80">What should we call you?</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                    />
                    {name.trim() && (
                      <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500/20 text-green-400 border-green-500/30">
                        +{POINTS.name} pts
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full h-14 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-lg font-semibold"
                  onClick={nextStep}
                  disabled={!name.trim()}
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Avatar Step */}
          {step === 'avatar' && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl text-white">Create Your Avatar</CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Scan your face for a personalized 3D experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="flex flex-col items-center">
                  <div className="w-44 h-44 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 border-2 border-dashed border-violet-500/50 flex items-center justify-center relative">
                    <Camera className="h-14 w-14 text-white/40" />
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                  </div>
                  <Button variant="outline" className="mt-6 h-12 px-6 border-violet-500/50 text-white hover:bg-violet-500/20">
                    <Camera className="mr-2 h-5 w-5" />
                    Scan Face
                    <Badge className="ml-3 bg-green-500/20 text-green-400 border-green-500/30">
                      +{POINTS.avatar} pts
                    </Badge>
                  </Button>
                  <div className="text-center mt-6 space-y-2 max-w-sm">
                    <p className="text-sm text-white/60">
                      We&apos;ll create a personalized 3D avatar that represents you
                    </p>
                    <p className="text-xs text-white/40">
                      Optional: Enable health markers analysis for skin health, 
                      stress levels, and wellness insights
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 h-12 border-white/10 text-white/70 hover:bg-white/5" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
                    onClick={nextStep}
                  >
                    Skip for now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priorities Step */}
          {step === 'priorities' && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl text-white">What matters most?</CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Select up to 5 aspects to prioritize • +{POINTS.priorityEach} pts each
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {aspects.filter((a) => a.id !== 'settings').map((aspect) => {
                    const Icon = aspect.icon;
                    const isSelected = selectedPriorities.includes(aspect.id);
                    const index = selectedPriorities.indexOf(aspect.id);
                    return (
                      <button
                        key={aspect.id}
                        onClick={() => togglePriority(aspect.id)}
                        className={cn(
                          'p-4 rounded-2xl border-2 transition-all relative group',
                          isSelected
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        )}
                      >
                        {isSelected && (
                          <Badge
                            className="absolute -top-2 -right-2 h-7 w-7 p-0 flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: aspect.color }}
                          >
                            {index + 1}
                          </Badge>
                        )}
                        <Icon
                          className={cn("h-7 w-7 mx-auto mb-2 transition-transform group-hover:scale-110")}
                          style={{ color: aspect.color }}
                        />
                        <p className="text-sm font-medium text-white">{aspect.name}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-12 border-white/10 text-white/70 hover:bg-white/5" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals Step (replaced Tone) */}
          {step === 'goals' && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl text-white">What are your goals?</CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Help us understand what you want to achieve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-3">
                  {lifestyleGoals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          'w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group',
                          isSelected
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                          isSelected ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-white flex-1 text-left">{goal.label}</span>
                        {isSelected ? (
                          <Check className="h-6 w-6 text-green-400" />
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            +{goal.points} pts
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-12 border-white/10 text-white/70 hover:bg-white/5" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Step */}
          {step === 'social' && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="h-6 w-6 text-amber-400" />
                  <span className="text-amber-400 font-semibold">Bonus Points!</span>
                </div>
                <CardTitle className="text-3xl text-white">Connect Your Accounts</CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Unlock personalized insights and earn extra points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-3">
                  {socialConnections.map((social) => {
                    const Icon = social.icon;
                    const isConnected = connectedSocial.includes(social.id);
                    return (
                      <button
                        key={social.id}
                        onClick={() => toggleSocial(social.id)}
                        className={cn(
                          'w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group',
                          isConnected
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                          isConnected ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white">{social.name}</p>
                          <p className="text-sm text-white/50">{social.description}</p>
                        </div>
                        {isConnected ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-400" />
                            <Badge className="bg-green-500 text-white">Connected</Badge>
                          </div>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm px-3 py-1">
                            +{social.points} pts
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-12 border-white/10 text-white/70 hover:bg-white/5" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-black flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-white">You&apos;re all set, {name}!</CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Your personalized experience is ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {/* Points Summary */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 text-center">
                  <p className="text-white/60 text-sm mb-2">Total Points Earned</p>
                  <div className="flex items-center justify-center gap-3">
                    <Coins className="h-8 w-8 text-amber-400" />
                    <span className="text-4xl font-bold text-amber-300">{points + POINTS.completion}</span>
                  </div>
                  <p className="text-green-400 text-sm mt-2">
                    +{POINTS.completion} completion bonus!
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-white/5 space-y-3">
                  {selectedPriorities.length > 0 && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Check className="h-5 w-5 text-green-400" />
                      <span>{selectedPriorities.length} priority aspects selected</span>
                    </div>
                  )}
                  {selectedGoals.length > 0 && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Check className="h-5 w-5 text-green-400" />
                      <span>{selectedGoals.length} goals set</span>
                    </div>
                  )}
                  {connectedSocial.length > 0 && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Check className="h-5 w-5 text-green-400" />
                      <span>{connectedSocial.length} accounts connected</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/60 text-sm pt-2 border-t border-white/10">
                    <Sparkles className="h-4 w-4" />
                    <span>AI tone: Chill (changeable in Settings)</span>
                  </div>
                </div>

                <Button
                  className="w-full h-16 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-xl font-bold"
                  onClick={completeOnboarding}
                >
                  Start Maximizing
                  <Sparkles className="ml-3 h-6 w-6" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
