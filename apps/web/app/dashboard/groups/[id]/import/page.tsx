"use client";

import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ImportWizard } from "@/components/features/import/import-wizard";
import { fetchApi } from "@/lib/api";

export default function ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = use(params);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const data = await fetchApi(`/groups/${groupId}`);
        setGroup(data);
      } catch (err: any) {
        console.error("Failed to load group details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGroup();
  }, [groupId]);

  if (loading || !group) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <Link
          href={`/dashboard/groups/${groupId}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <IconChevronLeft size={14} /> Back to Group
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Import Spreadsheet
        </h1>
        <p className="text-sm text-muted-foreground">
          Import historical expenses into the{" "}
          <span className="font-bold text-primary">{group.name}</span> ledger.
        </p>
      </div>

      <ImportWizard groupId={groupId} members={group.members} />
    </div>
  );
}
