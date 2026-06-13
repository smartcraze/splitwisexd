"use client";

import { Bell } from "lucide-react";
import React from "react";

export function NotificationsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Activity alerts and reminders
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="p-4 rounded-2xl bg-muted">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-bold text-lg">You're all caught up!</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Notifications are coming soon. For now, check group pages for the
            latest activity.
          </p>
        </div>
      </div>
    </div>
  );
}
