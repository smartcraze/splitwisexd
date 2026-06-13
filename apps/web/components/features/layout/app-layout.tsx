"use client";

import React, { Suspense } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopNavbar } from "./top-navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  onGroupCreated?: () => void;
}

export function AppLayout({ children, onGroupCreated }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Suspense fallback={<div className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar border-r border-sidebar-border z-30" />}>
        <AppSidebar />
      </Suspense>
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Suspense fallback={<div className="sticky top-0 z-20 h-16 border-b border-border bg-card/95 backdrop-blur-md px-6 shadow-sm" />}>
          <TopNavbar onGroupCreated={onGroupCreated} />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
