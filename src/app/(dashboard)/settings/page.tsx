'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  User,
  Brain,
  Bell,
  Shield,
  Palette,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { InsightAgentSettings } from '@/components/settings/InsightAgentSettings';

export default function SettingsPage() {
  // TODO: Get actual user ID from auth
  const userId = 'demo-user-id';
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'insights', label: 'Insight Agent', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="insights" className="w-full">
          {/* Tab Navigation */}
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>
          
          {/* Insight Agent Tab */}
          <TabsContent value="insights">
            <InsightAgentSettings userId={userId} />
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Notification Preferences</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Privacy & Security</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Appearance</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Billing & Subscription</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


