'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function AppLayout({ children, rightSidebar }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Main + Right Sidebar */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
          <div className="px-4 py-5 lg:px-6 xl:px-8 max-w-screen-2xl">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        {rightSidebar && (
          <aside className="hidden xl:flex flex-col w-72 2xl:w-80 min-w-0 shrink-0 border-l border-border bg-card overflow-y-auto scrollbar-thin">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}