'use client';

import * as React from 'react';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineStatusBanner } from './OfflineStatusBanner';
import { SwUpdateBanner } from './SwUpdateBanner';
import { TopHeader } from './TopHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col">
      <AppSidebar />
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <OfflineStatusBanner />
        <SwUpdateBanner />
        <TopHeader />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
