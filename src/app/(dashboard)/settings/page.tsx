'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { BillingSettings } from '@/components/settings/BillingSettings';

function SettingsContent() {
  // TODO: Get actual user ID from auth
  const userId = 'demo-user-id';
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value);
  };

  // Prevent any parent click handlers
  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab Navigation */}
          <TabsList 
            className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 flex-wrap"
            onClick={handleTabClick}
          >
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
          <TabsContent value="profile" className="mt-0">
            <div className="space-y-4">
              <ProfileSettings userId={userId} />
            </div>
          </TabsContent>
          
          {/* Insight Agent Tab */}
          <TabsContent value="insights" className="mt-0">
            <div className="space-y-4">
              <InsightAgentSettings userId={userId} />
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0">
            <div className="space-y-4">
              <NotificationsSettings userId={userId} />
            </div>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-0">
            <div className="space-y-4">
              <PrivacySettings />
            </div>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-0">
            <div className="space-y-4">
              <AppearanceSettings />
            </div>
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-0">
            <div className="space-y-4">
              <BillingSettings />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
