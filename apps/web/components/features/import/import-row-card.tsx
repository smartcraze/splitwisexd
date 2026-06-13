"use client";

import { Input } from "@/components/ui/input";
import type { Anomaly, CsvRow } from "@/lib/csv-parser";

interface Member {
  userId: string;
  user: { id: string; name: string };
}

interface ImportRowCardProps {
  row: CsvRow;
  rowAnomalies: Anomaly[];
  members: Member[];
  isSelected: boolean;
  onToggleSelect: () => void;
  isSettlement: boolean;
  onToggleSettlement: () => void;
  onConvertCurrency: (rate: number) => void;
  onExcludeUser: (userName: string) => void;
}

export function ImportRowCard({
  row,
  rowAnomalies,
  members,
  isSelected,
  onToggleSelect,
  isSettlement,
  onToggleSettlement,
  onConvertCurrency,
  onExcludeUser,
}: ImportRowCardProps) {
  const getBadgeColor = (severity: string) => {
    if (severity === "error")
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    if (severity === "warning")
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-sky-500/10 text-sky-500 border-sky-500/20";
  };

  return (
    <div
      className={`p-4 border rounded-xl bg-card space-y-3 transition-colors ${isSelected ? "border-primary/50" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <div>
            <h5 className="text-sm font-bold text-foreground">
              {row.description}
            </h5>
            <p className="text-[10px] text-muted-foreground font-mono">
              Line {row.rowIdx} &bull; {row.date} &bull; Paid by {row.paidBy}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-primary">
            {row.currency === "USD" ? "$" : "₹"}
            {row.cost.toLocaleString()}
          </span>
        </div>
      </div>

      {rowAnomalies.length > 0 && (
        <div className="space-y-1.5 pl-7">
          {rowAnomalies.map((anom, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[9px] font-bold py-0.5 px-2 uppercase border rounded-full ${getBadgeColor(anom.severity)}`}
              >
                {anom.type}
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                {anom.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Actions */}
      <div className="pl-7 pt-1 flex flex-wrap gap-3 text-xs">
        {rowAnomalies.some((a) => a.type === "USD_CURRENCY") && (
          <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-lg border border-border">
            <span className="text-[10px] font-medium">
              USD conversion rate:
            </span>
            <Input
              type="number"
              defaultValue="83"
              onChange={(e) =>
                onConvertCurrency(Number.parseFloat(e.target.value) || 83)
              }
              className="w-16 h-6 text-xs p-1"
            />
          </div>
        )}

        {rowAnomalies.some((a) => a.type === "SAM_PRE_JOIN") && (
          <label className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) onExcludeUser("Sam");
              }}
              className="h-3.5 w-3.5 rounded border-border text-primary accent-primary cursor-pointer"
            />
            <span className="text-[10px] font-medium">
              Exclude Sam from split
            </span>
          </label>
        )}

        {rowAnomalies.some((a) => a.type === "MEERA_POST_LEAVE") && (
          <label className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) onExcludeUser("Meera");
              }}
              className="h-3.5 w-3.5 rounded border-border text-primary accent-primary cursor-pointer"
            />
            <span className="text-[10px] font-medium">
              Exclude Meera from split
            </span>
          </label>
        )}

        {rowAnomalies.some((a) => a.type === "SETTLEMENT_ROW") && (
          <label className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-lg border border-border cursor-pointer">
            <input
              type="checkbox"
              checked={isSettlement}
              onChange={onToggleSettlement}
              className="h-3.5 w-3.5 rounded border-border text-primary accent-primary cursor-pointer"
            />
            <span className="text-[10px] font-medium">
              Import as settlement payment
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
