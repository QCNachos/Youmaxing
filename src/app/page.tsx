'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Dumbbell, Brain, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen mesh-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">YOUMAXING</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 text-sm mb-8 border border-violet-500/20">
            <Sparkles className="h-4 w-4" />
            AI-Powered Life Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Maximize
            <span className="gradient-text"> Every Aspect </span>
            of Your Life
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Your personal AI companion that helps you manage training, nutrition, finances, 
            relationships, and more — all in one beautiful interface.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 h-14 px-8 text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border/50 hover:bg-secondary">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-violet-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI That Knows You</h3>
              <p className="text-muted-foreground">
                Get personalized recommendations across all life aspects. Your AI learns your habits and helps you grow.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-pink-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-pink-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">11 Life Aspects</h3>
              <p className="text-muted-foreground">
                Training, Food, Finance, Travel, Friends, Family — manage everything that matters in dedicated mini-apps.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-cyan-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Unified Calendar</h3>
              <p className="text-muted-foreground">
                See your entire life at a glance. Events, workouts, social plans — all beautifully organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/30">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to become your best self?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands who are already using YOUMAXING to optimize their lives.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 h-14 px-8 text-lg font-semibold">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">YOUMAXING</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 YOUMAXING. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
