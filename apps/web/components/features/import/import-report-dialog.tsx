"use client";

import {
  IconCircleCheck,
  IconCircleX,
  IconListDetails,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ImportReportSummary {
  parsedRows: number;
  importedExpenses: number;
  importedSettlements: number;
  skippedRows: number;
  anomaliesResolved: { type: string; count: number }[];
}

interface ImportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ImportReportSummary | null;
  onClose: () => void;
}

export function ImportReportDialog({
  open,
  onOpenChange,
  report,
  onClose,
}: ImportReportDialogProps) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto mb-2">
            <IconCircleCheck size={28} />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Import Completed
          </DialogTitle>
          <DialogDescription className="text-center">
            Spreadsheet data successfully parsed and ingested.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-muted/20 border border-border rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Imported Expenses
              </span>
              <span className="text-lg font-extrabold text-primary">
                {report.importedExpenses}
              </span>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Imported Payments
              </span>
              <span className="text-lg font-extrabold text-primary">
                {report.importedSettlements}
              </span>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-xl col-span-2">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Skipped / Deleted Rows
              </span>
              <span className="text-lg font-extrabold text-rose-500">
                {report.skippedRows}
              </span>
            </div>
          </div>

          {report.anomaliesResolved.length > 0 && (
            <div className="space-y-1.5 border border-border rounded-xl p-3 bg-card">
              <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px] flex items-center gap-1">
                <IconListDetails size={12} /> Resolved CSV Anomalies
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {report.anomaliesResolved.map((anom, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 border-b border-border/40 last:border-b-0"
                  >
                    <span className="font-medium text-foreground">
                      {anom.type}
                    </span>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Cleared: {anom.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
          >
            Close & Go to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
