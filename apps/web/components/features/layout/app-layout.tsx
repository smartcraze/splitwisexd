"use client";

import type React from "react";
import { AppSidebar } from "./app-sidebar";
import { TopNavbar } from "./top-navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  onGroupCreated?: () => void;
}

export function AppLayout({ children, onGroupCreated }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <AppSidebar />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopNavbar onGroupCreated={onGroupCreated} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
