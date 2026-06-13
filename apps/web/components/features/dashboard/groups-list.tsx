"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

interface GroupsListProps {
  groups: Group[];
}

export function GroupsList({ groups }: GroupsListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-card text-center">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No groups yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Create a group to start sharing expenses with friends, family, or
          flatmates.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group, index) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -2 }}
          className="group relative rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {group.name}
              </h3>
              <Users className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {group.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(group.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <Link
              href={`/groups/${group.id}`}
              className="flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              View Details
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
