"use client";

import { IconSparkles, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/api";
import { type Anomaly, type CsvRow, parseCSV } from "@/lib/csv-parser";
import {
  ImportReportDialog,
  type ImportReportSummary,
} from "./import-report-dialog";
import { ImportRowCard } from "./import-row-card";

interface Member {
  userId: string;
  user: { id: string; name: string };
}

interface ImportWizardProps {
  groupId: string;
  members: Member[];
}

export function ImportWizard({ groupId, members }: ImportWizardProps) {
  const router = useRouter();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [isSettlement, setIsSettlement] = useState<Record<number, boolean>>({});
  const [usdRates, setUsdRates] = useState<Record<number, number>>({});
  const [excludedUsers, setExcludedUsers] = useState<Record<number, string[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ImportReportSummary | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const memberNames = members.map((m) => m.user.name);
      const { rows: parsedRows, anomalies: parsedAnoms } = parseCSV(
        text,
        memberNames,
      );
      setRows(parsedRows);
      setAnomalies(parsedAnoms);

      // Default selection states: exclude exact duplicates from import by default
      const initialSel: Record<number, boolean> = {};
      const initialSettlements: Record<number, boolean> = {};
      for (const r of parsedRows) {
        const hasDuplicate = parsedAnoms.some(
          (a) => a.rowIdx === r.rowIdx && a.type === "DUPLICATE_ROW",
        );
        initialSel[r.rowIdx] = !hasDuplicate;

        const isSett = parsedAnoms.some(
          (a) => a.rowIdx === r.rowIdx && a.type === "SETTLEMENT_ROW",
        );
        initialSettlements[r.rowIdx] = isSett;
      }
      setSelected(initialSel);
      setIsSettlement(initialSettlements);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const activeRows = rows.filter((r) => selected[r.rowIdx]);
    if (activeRows.length === 0)
      return toast.error("No rows selected for import");

    setLoading(true);
    let importedExpenses = 0;
    let importedSettlements = 0;

    for (const row of activeRows) {
      try {
        let cost = row.cost;
        if (row.currency === "USD") {
          const rate = usdRates[row.rowIdx] || 83;
          cost = Math.round(row.cost * rate);
        } else {
          cost = Math.round(cost);
        }

        const excluded = excludedUsers[row.rowIdx] || [];
        const activeParticipants = members.filter(
          (m) => !excluded.includes(m.user.name),
        );
        const payer =
          members.find(
            (m) => m.user.name.toLowerCase() === row.paidBy.toLowerCase(),
          ) || members[0]!;

        if (isSettlement[row.rowIdx]) {
          const recipient =
            activeParticipants.find((m) => m.userId !== payer.userId) ||
            members[1] ||
            members[0]!;
          await fetchApi("/settlements", {
            method: "POST",
            body: JSON.stringify({
              groupId,
              paidToUserId: recipient.userId,
              amount: Math.abs(cost),
              note: row.description,
            }),
          });
          importedSettlements++;
        } else {
          const splits = activeParticipants.map((p) => ({
            userId: p.userId,
            owedAmount: undefined,
          }));

          await fetchApi("/expenses", {
            method: "POST",
            body: JSON.stringify({
              title: row.description,
              description: "CSV Ingestion",
              totalAmount: Math.abs(cost),
              groupId,
              paidByUserId: payer.userId,
              splitMethod: "EQUAL",
              participants: splits,
            }),
          });
          importedExpenses++;
        }
      } catch (err: any) {
        console.error(`Failed importing Row ${row.rowIdx}:`, err);
      }
    }

    const reportSummary: ImportReportSummary = {
      parsedRows: rows.length,
      importedExpenses,
      importedSettlements,
      skippedRows: rows.length - (importedExpenses + importedSettlements),
      anomaliesResolved: Array.from(new Set(anomalies.map((a) => a.type))).map(
        (t) => ({
          type: t,
          count: anomalies.filter((a) => a.type === t).length,
        }),
      ),
    };

    setReport(reportSummary);
    setReportOpen(true);
    setLoading(false);
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle>Import Expense Log</CardTitle>
        <CardDescription>
          Upload expenses_export.csv to bulk-ingest historical flatmate
          expenses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rows.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IconUpload size={24} />
            </div>
            <h4 className="font-bold text-sm">Select CSV File</h4>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <Button
              asChild
              className="bg-primary text-primary-foreground font-bold cursor-pointer"
            >
              <label htmlFor="csv-file-input">Choose File</label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 border border-border p-3.5 rounded-xl text-xs">
              <div>
                Parsed <span className="font-bold">{rows.length}</span> rows
                &bull; Identified{" "}
                <span className="font-bold text-amber-500">
                  {anomalies.length}
                </span>{" "}
                anomalies.
              </div>
              <Button
                onClick={handleImport}
                disabled={loading}
                className="bg-primary text-primary-foreground font-bold h-8 cursor-pointer flex items-center gap-1"
              >
                <IconSparkles size={14} />{" "}
                {loading ? "Ingesting..." : "Run Import"}
              </Button>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {rows.map((row) => (
                <ImportRowCard
                  key={row.rowIdx}
                  row={row}
                  rowAnomalies={anomalies.filter(
                    (a) => a.rowIdx === row.rowIdx,
                  )}
                  members={members}
                  isSelected={selected[row.rowIdx] || false}
                  onToggleSelect={() =>
                    setSelected({
                      ...selected,
                      [row.rowIdx]: !selected[row.rowIdx],
                    })
                  }
                  isSettlement={isSettlement[row.rowIdx] || false}
                  onToggleSettlement={() =>
                    setIsSettlement({
                      ...isSettlement,
                      [row.rowIdx]: !isSettlement[row.rowIdx],
                    })
                  }
                  onConvertCurrency={(rate) =>
                    setUsdRates({ ...usdRates, [row.rowIdx]: rate })
                  }
                  onExcludeUser={(uname) => {
                    const currentExclusions = excludedUsers[row.rowIdx] || [];
                    setExcludedUsers({
                      ...excludedUsers,
                      [row.rowIdx]: [...currentExclusions, uname],
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <ImportReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        report={report}
        onClose={() => router.push(`/dashboard/groups/${groupId}`)}
      />
    </Card>
  );
}
