"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CreateGroupModal } from "./create-group-modal";

interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  _memberCount?: number;
  _balance?: number;
}

interface GroupsListProps {
  groups: Group[];
  onGroupCreated?: () => void;
}

// Map group name keywords to images from /public
const GROUP_IMAGE_MAP: { keywords: string[]; src: string }[] = [
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
    keywords: ["flat", "house", "room", "home", "rent", "flatmate"],
    src: "/food-2.png",
  },
];

const FALLBACK_IMAGES = [
  "/travel-1.png",
  "/food-1.png",
  "/travel-2.png",
  "/food-2.png",
];

function getGroupImage(name: string, index: number): string {
  const lower = name.toLowerCase();
  for (const mapping of GROUP_IMAGE_MAP) {
    if (mapping.keywords.some((k) => lower.includes(k))) {
      return mapping.src;
    }
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

export function GroupsList({ groups, onGroupCreated }: GroupsListProps) {
  const formatCurrency = (amount: number) => {
    if (!Number.isFinite(amount) || amount === 0) return null;
    return `₹${(Math.abs(amount) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, index) => {
        const imgSrc = getGroupImage(group.name, index);
        const balanceStr =
          group._balance !== undefined ? formatCurrency(group._balance) : null;
        const isPositive = (group._balance ?? 0) >= 0;

        return (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            whileHover={{
              y: -3,
              transition: { type: "spring", stiffness: 400, damping: 28 },
            }}
            className="group rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
          >
            <Link
              href={`/dashboard/groups/${group.id}`}
              className="block h-full"
            >
              {/* Image */}
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={imgSrc}
                  alt={group.name}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
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
                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {group.description || "No description"}
                </p>

                {balanceStr && (
                  <div className="mt-2">
                    <span
                      className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {balanceStr}
                    </span>
                    <span
                      className={`text-xs ml-1 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {isPositive ? "You are owed" : "You owe"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(group.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-0.5 font-semibold text-primary hover:underline">
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}

      {/* Create new group card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: groups.length * 0.06 }}
        className="rounded-2xl border-2 border-dashed border-border bg-card/50 shadow-sm hover:shadow-md hover:border-primary/40 transition-all overflow-hidden flex flex-col items-center justify-center p-8 text-center min-h-[230px] gap-3 cursor-pointer group"
      >
        <div className="p-3.5 rounded-2xl bg-primary/8 group-hover:bg-primary/15 transition-colors">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">
            Create a new group
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Start tracking expenses with friends and family.
          </p>
        </div>
        <CreateGroupModal onGroupCreated={onGroupCreated} />
      </motion.div>
    </div>
  );
}
