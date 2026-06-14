"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  XCircle,
  Info,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

interface CSVImportDialogProps {
  groupId: string;
  members: any[];
  existingExpenses: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedRow {
  index: number;
  originalDate: string;
  originalDescription: string;
  originalPaidBy: string;
  originalAmount: string;
  originalCurrency: string;
  originalSplitType: string;
  originalSplitWith: string;
  originalSplitDetails: string;
  originalNotes: string;

  // Resolved values
  date: Date;
  title: string;
  notes: string;
  amount: number; // in cents/paise
  isUSD: boolean;
  isSettlement: boolean;
  isRefund: boolean; // negative amount
  splitMethod: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES";
  
  // Mapped entities
  paidByUserId: string | null; // null if unmapped
  participants: {
    userId: string;
    owedAmount?: number | null;
    percentage?: number | null;
    shares?: number | null;
  }[];

  // Anomaly logs
  anomalies: {
    id: number;
    type: string;
    message: string;
    severity: "warning" | "error" | "info";
  }[];

  approved: boolean;
  skipped: boolean;
}

export function CSVImportDialog({
  groupId,
  members,
  existingExpenses,
  open,
  onOpenChange,
  onImportComplete,
}: CSVImportDialogProps) {
  const [step, setStep] = useState<"upload" | "review" | "importing" | "success">("upload");
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [usdRate, setUsdRate] = useState<number>(83);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawCSVText, setRawCSVText] = useState<string>("");

  // Normalization Helpers for UI overrides mapping
  const normalizeName = (name: string): string => {
    return name.trim().toLowerCase().replace(/\s+/g, "");
  };

  const findMemberByName = (name: string) => {
    const norm = normalizeName(name);
    return members.find(
      (m) =>
        normalizeName(m.user.name) === norm ||
        normalizeName(m.user.email.split("@")[0] || "") === norm
    );
  };

  // Re-run anomaly checks when USD rate changes or CSV updates
  useEffect(() => {
    if (rawCSVText) {
      setErrorMsg(null);
      api.parseCSV(groupId, rawCSVText, usdRate)
        .then((res) => {
          const parsed = res.map((r: any) => ({
            ...r,
            date: new Date(r.date),
          }));
          setParsedRows(parsed);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Failed to parse CSV on backend.");
          setStep("upload");
        });
    }
  }, [usdRate, rawCSVText, groupId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCSVFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCSVText(text);
      setStep("review");
    };
    reader.readAsText(file);
  };

  const handlePayerChange = (rowIndex: number, userId: string) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.index !== rowIndex) return row;
        
        // Remove the "Unknown Group Payer" anomaly if matched
        const cleanAnomalies = row.anomalies.filter((a) => a.id !== 12);
        
        return {
          ...row,
          paidByUserId: userId,
          anomalies: cleanAnomalies,
        };
      })
    );
  };

  const toggleApproved = (rowIndex: number) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.index !== rowIndex) return row;
        if (row.skipped) return row; // cannot approve skipped zero amount rows
        return { ...row, approved: !row.approved };
      })
    );
  };

  const toggleIsSettlement = (rowIndex: number) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.index !== rowIndex) return row;
        return { ...row, isSettlement: !row.isSettlement };
      })
    );
  };

  const handleImportSubmit = async () => {
    const approvedRows = parsedRows.filter((r) => r.approved && !r.skipped);
    const unmappedPayer = approvedRows.find((r) => !r.paidByUserId);
    
    if (unmappedPayer) {
      alert(`Row ${unmappedPayer.index + 1} ("${unmappedPayer.title}") does not have a mapped payer. Please select a group member.`);
      return;
    }

    setStep("importing");

    try {
      const expensesPayload: any[] = [];
      const settlementsPayload: any[] = [];

      for (const row of approvedRows) {
        const timestamp = row.date.toISOString();

        if (row.isSettlement) {
          // Anomaly 2: Settlement record
          let paidToUserId = "";
          if (row.participants.length > 0 && row.participants[0]) {
            paidToUserId = row.participants[0].userId;
          } else {
            const splitWithName = row.originalSplitWith.split(";")[0]?.trim();
            const member = findMemberByName(splitWithName || "");
            paidToUserId = member ? member.userId : members[0]?.userId || "";
          }

          if (row.paidByUserId === paidToUserId) {
            const otherMember = members.find((m) => m.userId !== row.paidByUserId);
            paidToUserId = otherMember ? otherMember.userId : paidToUserId;
          }

          settlementsPayload.push({
            paidByUserId: row.paidByUserId,
            paidToUserId,
            amount: row.amount,
            note: row.title + (row.notes ? ` - ${row.notes}` : ""),
            createdAt: timestamp,
          });
        } else if (row.isRefund) {
          // Anomaly 6: Refund record splits reversed
          const originalPayerId = row.paidByUserId!;
          
          for (const p of row.participants) {
            if (p.userId === originalPayerId) continue;

            expensesPayload.push({
              title: `${row.title} (Refund Share)`,
              description: row.notes || null,
              totalAmount: p.owedAmount || 0,
              splitMethod: "EQUAL",
              paidByUserId: p.userId,
              participants: [
                { userId: p.userId, owedAmount: 0 },
                { userId: originalPayerId, owedAmount: p.owedAmount || 0 },
              ],
              createdAt: timestamp,
            });
          }
        } else {
          // Standard Expense
          expensesPayload.push({
            title: row.title,
            description: row.notes || null,
            totalAmount: row.amount,
            splitMethod: row.splitMethod,
            paidByUserId: row.paidByUserId,
            participants: row.participants,
            createdAt: timestamp,
          });
        }
      }

      const res = await api.commitImport(groupId, {
        expenses: expensesPayload,
        settlements: settlementsPayload,
      });

      setImportResult(res);
      setStep("success");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to import CSV data.");
      setStep("review");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset wizard
    setStep("upload");
    setCSVFile(null);
    setParsedRows([]);
    setImportResult(null);
    setErrorMsg(null);
  };

  const getSeverityBadgeClass = (severity: string) => {
    if (severity === "error") return "bg-destructive/10 text-destructive border-destructive/20";
    if (severity === "warning") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl border border-border shadow-2xl bg-card text-card-foreground">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            Import Expenses from CSV
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Upload your `Expenses Export.csv` to run the anomaly engine, resolve data conflicts, and import them.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg border border-destructive/20 mt-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {step === "upload" && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="p-4 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">
                Click or drag your CSV file here to import
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Only CSV format exports containing dates, descriptions, payers, and amounts are supported.
              </p>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              {/* Configuration panel */}
              <div className="bg-muted/50 border border-border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary" />
                    USD Exchange Rate Configuration
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Customize the conversion rate used for any USD-denominated expenses in the CSV.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    1 USD =
                  </span>
                  <Input
                    type="number"
                    value={usdRate}
                    onChange={(e) => setUsdRate(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-24 bg-background border-border text-foreground text-center font-bold"
                  />
                  <span className="text-xs font-bold text-foreground">INR</span>
                </div>
              </div>

              {/* Parsed Rows List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                  Review & Approve Rows ({parsedRows.filter(r => r.approved && !r.skipped).length} of {parsedRows.filter(r => !r.skipped).length} approved)
                </h3>

                <div className="space-y-4">
                  {parsedRows.map((row) => {
                    const isDuplicate = row.anomalies.some((a) => a.id === 1);
                    return (
                      <div
                        key={row.index}
                        className={`border rounded-xl p-4 transition-all shadow-sm ${
                          row.skipped
                            ? "bg-muted/20 border-muted-foreground/15 opacity-60"
                            : row.approved
                            ? "bg-card border-border hover:border-primary/30"
                            : isDuplicate
                            ? "bg-amber-500/[0.03] border-amber-500/20"
                            : "bg-muted/10 border-border opacity-75"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox to Approve */}
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={row.approved && !row.skipped}
                              disabled={row.skipped}
                              onChange={() => toggleApproved(row.index)}
                              className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-foreground truncate max-w-[400px]">
                                  Row {row.index + 1}: {row.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {row.originalDate}
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-foreground">
                                    {row.isUSD ? `$${row.originalAmount} USD` : `₹${row.originalAmount} INR`}
                                  </span>
                                  {row.isUSD && (
                                    <>
                                      <ArrowRight className="h-3 w-3" />
                                      <span className="font-bold text-primary">
                                        ₹{Math.round(row.amount / 100)}
                                      </span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span className="capitalize">
                                    Split: {row.splitMethod.toLowerCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Payer Selector */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Payer:
                                </span>
                                {row.paidByUserId ? (
                                  <Badge variant="outline" className="font-bold bg-muted/40 border-border text-foreground">
                                    {members.find((m) => m.userId === row.paidByUserId)?.user.name}
                                  </Badge>
                                ) : (
                                  <Select
                                    onValueChange={(val) => handlePayerChange(row.index, val)}
                                  >
                                    <SelectTrigger className="h-8 w-36 bg-background border-destructive text-destructive focus:ring-destructive font-bold text-xs">
                                      <SelectValue placeholder="Map Payer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {members.map((m) => (
                                        <SelectItem key={m.userId} value={m.userId} className="text-xs">
                                          {m.user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>

                            {/* Anomaly Badges & Warnings */}
                            {row.anomalies.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                {row.anomalies.map((anom) => (
                                  <div
                                    key={anom.id}
                                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium flex items-start gap-1.5 ${getSeverityBadgeClass(
                                      anom.severity
                                    )}`}
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-bold mr-1">{anom.type}:</span>
                                      {anom.message}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Actions / Toggles */}
                            {!row.skipped && (
                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                {/* Toggle Settlement */}
                                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none font-medium">
                                  <input
                                    type="checkbox"
                                    checked={row.isSettlement}
                                    onChange={() => toggleIsSettlement(row.index)}
                                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                                  />
                                  Import as Settlement record instead of Expense
                                </label>
                              </div>
                            )}

                            {/* Participants Breakdown Preview */}
                            {!row.skipped && row.participants.length > 0 && (
                              <div className="mt-2 bg-muted/40 border border-border/60 p-2.5 rounded-lg text-xs space-y-1.5">
                                <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                                  {row.isSettlement ? "Settlement Transfer Details" : row.isRefund ? "Refund Breakdown Preview (Reversed)" : "Expense Split Breakdown"}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {row.isSettlement ? (
                                    <div className="col-span-4 flex items-center gap-2">
                                      <span className="font-semibold text-foreground">
                                        {members.find((m) => m.userId === row.paidByUserId)?.user.name || "Unknown"}
                                      </span>
                                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="font-semibold text-foreground">
                                        {members.find((m) => m.userId === (row.participants[0]?.userId || ""))?.user.name || 
                                         row.originalSplitWith.split(";")[0]}
                                      </span>
                                      <span className="ml-auto font-bold text-foreground">
                                        ₹{Math.round(row.amount / 100)}
                                      </span>
                                    </div>
                                  ) : row.isRefund ? (
                                    row.participants.map((p) => {
                                      if (p.userId === row.paidByUserId) return null;
                                      return (
                                        <div key={p.userId} className="flex justify-between border-b border-border/40 pb-0.5">
                                          <span className="text-muted-foreground truncate">
                                            {members.find((m) => m.userId === p.userId)?.user.name}:
                                          </span>
                                          <span className="font-semibold text-amber-500">
                                            -₹{((p.owedAmount || 0) / 100).toFixed(2)}
                                          </span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    row.participants.map((p) => (
                                      <div key={p.userId} className="flex justify-between border-b border-border/40 pb-0.5">
                                        <span className="text-muted-foreground truncate">
                                          {members.find((m) => m.userId === p.userId)?.user.name}:
                                        </span>
                                        <span className="font-bold text-foreground">
                                          ₹{((p.owedAmount || 0) / 100).toFixed(2)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Importing data...
              </p>
              <p className="text-xs text-muted-foreground">
                Persisting your approved expenses and settlements to the database.
              </p>
            </div>
          )}

          {step === "success" && importResult && (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Import Completed Successfully!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Successfully processed and recorded all selected CSV items.
              </p>
              <div className="bg-muted border border-border p-4 rounded-xl inline-grid grid-cols-2 gap-x-6 gap-y-1 text-sm font-bold">
                <span className="text-muted-foreground text-left">Expenses Imported:</span>
                <span className="text-foreground text-right">{importResult.expensesCount}</span>
                <span className="text-muted-foreground text-left">Settlements Recorded:</span>
                <span className="text-foreground text-right">{importResult.settlementsCount}</span>
              </div>
              <Button onClick={handleClose} className="mt-4">
                Done & Close
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex justify-between gap-2 shrink-0">
          {step === "review" && (
            <>
              <Button
                onClick={() => setStep("upload")}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                Back to Upload
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={parsedRows.filter((r) => r.approved && !r.skipped).length === 0}
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 ml-auto"
              >
                Import Approved ({parsedRows.filter((r) => r.approved && !r.skipped).length})
              </Button>
            </>
          )}
          {step === "upload" && (
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-border text-foreground hover:bg-muted ml-auto"
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
