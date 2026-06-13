"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight, Plus, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/features/auth/auth-context";
import { CreateGroupModal } from "@/components/features/dashboard/create-group-modal";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { GroupsSkeleton } from "./groups-skeleton";

const GROUP_IMAGES = [
  "/travel-1.png",
  "/food-1.png",
  "/travel-2.png",
  "/food-2.png",
];
const GROUP_KEYWORDS: { keywords: string[]; src: string }[] = [
  {
    keywords: [
      "trip",
      "travel",
      "tour",
      "vacation",
      "goa",
      "ladakh",
      "trek",
      "hike",
      "mountain",
      "beach",
    ],
    src: "/travel-1.png",
  },
  {
    keywords: [
      "food",
      "eat",
      "lunch",
      "dinner",
      "restaurant",
      "cafe",
      "pizza",
      "snack",
    ],
    src: "/food-1.png",
  },
  {
    keywords: ["flat", "house", "room", "home", "rent", "flatmate"],
    src: "/food-2.png",
  },
];

function getGroupImage(name: string, index: number): string {
  const lower = name.toLowerCase();
  for (const m of GROUP_KEYWORDS) {
    if (m.keywords.some((k) => lower.includes(k))) return m.src;
  }
  return GROUP_IMAGES[index % GROUP_IMAGES.length];
}

export function GroupsView({ initialGroups }: { initialGroups: any[] }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>(initialGroups);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) fetchGroups();
  }, [user, fetchGroups]);

  if (loading) {
    return <GroupsSkeleton />;
  }

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Your Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {groups.length} {groups.length === 1 ? "group" : "groups"} total
          </p>
        </div>
        <CreateGroupModal onGroupCreated={fetchGroups} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">
              {search ? "No groups match your search" : "No groups yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search
                ? "Try a different keyword."
                : "Create a group to start tracking shared expenses."}
            </p>
          </div>
          {!search && <CreateGroupModal onGroupCreated={fetchGroups} />}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            whileHover={{
              y: -3,
              transition: { type: "spring", stiffness: 400, damping: 28 },
            }}
            className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Cover image */}
            <div className="relative h-36 w-full overflow-hidden">
              <Image
                src={getGroupImage(group.name, idx)}
                alt={group.name}
                fill
                loading={idx === 0 ? "eager" : "lazy"}
                priority={idx === 0}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <Users className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                {group.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1 min-h-[1rem]">
                {group.description || "No description"}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(group.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Link
                  href={`/dashboard/groups/${group.id}`}
                  className="flex items-center gap-0.5 font-semibold text-primary hover:underline"
                >
                  Open <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Create new CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: filtered.length * 0.05 }}
          className="rounded-2xl border-2 border-dashed border-border bg-card/50 hover:border-primary/40 hover:shadow-md transition-all overflow-hidden flex flex-col items-center justify-center p-8 text-center gap-3 min-h-[230px] group cursor-pointer"
        >
          <div className="p-3.5 rounded-2xl bg-primary/8 group-hover:bg-primary/15 transition-colors">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Create a new group</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start tracking expenses with friends and family.
            </p>
          </div>
          <CreateGroupModal onGroupCreated={fetchGroups} />
        </motion.div>
      </div>
    </div>
  );
}
