export interface CsvRow {
  rowIdx: number;
  rawLine: string;
  date: string;
  description: string;
  cost: number;
  currency: string;
  paidBy: string;
  splits: Record<string, number>; // memberName -> owedAmount
  hasAnomalies: boolean;
}

export interface Anomaly {
  rowIdx: number;
  type: string;
  message: string;
  severity: "info" | "warning" | "error";
  suggestedAction: string;
  field: string;
}

export function parseCSV(
  csvText: string,
  activeMembers: string[],
): { rows: CsvRow[]; anomalies: Anomaly[] } {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2)
    return {
      rows: [],
      anomalies: [
        {
          rowIdx: 0,
          type: "EMPTY_FILE",
          message: "CSV file is empty or has no header.",
          severity: "error",
          suggestedAction: "Upload a valid CSV",
          field: "file",
        },
      ],
    };

  const headers = lines[0]!
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: CsvRow[] = [];
  const anomalies: Anomaly[] = [];

  // Determine helper columns
  const dateColIdx = headers.findIndex((h) => /date/i.test(h));
  const descColIdx = headers.findIndex(
    (h) => /desc/i.test(h) || /title/i.test(h),
  );
  const costColIdx = headers.findIndex(
    (h) => /cost/i.test(h) || /amount/i.test(h),
  );
  const payerColIdx = headers.findIndex(
    (h) => /paid/i.test(h) || /payer/i.test(h),
  );
  const currencyColIdx = headers.findIndex((h) => /curr/i.test(h));

  // Any header not matching helper headers is treated as a member
  const excludedIndices = [
    dateColIdx,
    descColIdx,
    costColIdx,
    payerColIdx,
    currencyColIdx,
  ];
  const memberCols = headers
    .map((h, idx) => ({ name: h, idx }))
    .filter(({ idx }) => !excludedIndices.includes(idx));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    // Very simple CSV splitting that handles comma-separated fields (we could improve this for quotes later if needed)
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    if (values.length < 3) continue;

    const rowIdx = i + 1; // 1-indexed Excel-like row number

    // Extract fields
    const rawDate = dateColIdx !== -1 ? values[dateColIdx] || "" : "";
    const rawDesc = descColIdx !== -1 ? values[descColIdx] || "" : "";
    const rawCost = costColIdx !== -1 ? values[costColIdx] || "" : "";
    const rawPayer = payerColIdx !== -1 ? values[payerColIdx] || "" : "";
    const rawCurrency =
      currencyColIdx !== -1 ? values[currencyColIdx] || "INR" : "INR";

    // 1. Date parsing
    let parsedDate = rawDate;
    let isDateInvalid = false;
    const dateObj = new Date(rawDate);
    if (Number.isNaN(dateObj.getTime())) {
      isDateInvalid = true;
      anomalies.push({
        rowIdx,
        type: "INVALID_DATE",
        message: `Row ${rowIdx}: Date '${rawDate}' is invalid or empty.`,
        severity: "error",
        suggestedAction: "Will auto-assign today's date",
        field: "date",
      });
      parsedDate = new Date().toISOString().split("T")[0]!;
    } else {
      parsedDate = dateObj.toISOString().split("T")[0]!;
    }

    // 2. Title checking
    if (!rawDesc) {
      anomalies.push({
        rowIdx,
        type: "EMPTY_TITLE",
        message: `Row ${rowIdx}: Expense title is empty.`,
        severity: "warning",
        suggestedAction: "Will auto-name 'Imported Expense'",
        field: "description",
      });
    }

    // 3. Currency and Cost anomalies
    let currency = rawCurrency.toUpperCase();
    let numericCost = Number.parseFloat(rawCost.replace(/[^\d.-]/g, ""));
    if (Number.isNaN(numericCost)) {
      numericCost = 0;
      anomalies.push({
        rowIdx,
        type: "ZERO_COST",
        message: `Row ${rowIdx}: Amount '${rawCost}' is invalid or empty.`,
        severity: "error",
        suggestedAction: "Please enter a valid amount or skip",
        field: "cost",
      });
    }

    if (numericCost < 0) {
      anomalies.push({
        rowIdx,
        type: "NEGATIVE_COST",
        message: `Row ${rowIdx}: Cost is negative (₹${numericCost}).`,
        severity: "warning",
        suggestedAction: "Convert to positive refund/expense",
        field: "cost",
      });
    }

    if (rawCost.startsWith("$") || currency === "USD") {
      currency = "USD";
      anomalies.push({
        rowIdx,
        type: "USD_CURRENCY",
        message: `Row ${rowIdx}: Spent in USD ($${numericCost}). Priya's request: do not treat $ as ₹.`,
        severity: "warning",
        suggestedAction: "Convert to INR at 1 USD = ₹83",
        field: "currency",
      });
    }

    // 4. Payer normalization
    let paidBy = rawPayer.trim();
    // Normalize spelling
    const matchMember = activeMembers.find(
      (m) => m.toLowerCase() === paidBy.toLowerCase(),
    );
    if (matchMember) {
      if (matchMember !== paidBy) {
        anomalies.push({
          rowIdx,
          type: "INCONSISTENT_NAME",
          message: `Row ${rowIdx}: Payer spelling '${paidBy}' normalized to '${matchMember}'.`,
          severity: "info",
          suggestedAction: "Auto-normalize",
          field: "paidBy",
        });
        paidBy = matchMember;
      }
    } else {
      anomalies.push({
        rowIdx,
        type: "UNKNOWN_PAYER",
        message: `Row ${rowIdx}: Payer '${paidBy}' is not a recognized group member.`,
        severity: "error",
        suggestedAction: "Select an active group member as payer",
        field: "paidBy",
      });
    }

    // 5. Splits extraction
    const splits: Record<string, number> = {};
    let sumSplits = 0;
    let hasSplits = false;

    for (const m of memberCols) {
      const colVal = values[m.idx];
      const mName = m.name.trim();
      const normMember =
        activeMembers.find((am) => am.toLowerCase() === mName.toLowerCase()) ||
        mName;

      if (colVal && colVal !== "0") {
        const val = Number.parseFloat(colVal);
        if (!Number.isNaN(val) && val > 0) {
          splits[normMember] = val;
          sumSplits += val;
          hasSplits = true;
        }
      }
    }

    // 6. Split/Join dates checking (Sam & Meera check)
    // Meera: left March 31, 2026
    // Sam: joined April 15, 2026
    if (!isDateInvalid) {
      const expenseTime = new Date(parsedDate).getTime();
      const meeraOutTime = new Date("2026-03-31").getTime();
      const samInTime = new Date("2026-04-15").getTime();

      // Check if Meera is involved after March
      const isMeeraInvolved =
        splits["Meera"] !== undefined || paidBy === "Meera";
      if (expenseTime > meeraOutTime && isMeeraInvolved) {
        anomalies.push({
          rowIdx,
          type: "MEERA_POST_LEAVE",
          message: `Row ${rowIdx}: Meera is involved in an expense dated ${parsedDate} after she moved out (end of March).`,
          severity: "warning",
          suggestedAction: "Exclude Meera and split among other active members",
          field: "splits",
        });
      }

      // Check if Sam is involved before mid-April
      const isSamInvolved = splits["Sam"] !== undefined || paidBy === "Sam";
      if (expenseTime < samInTime && isSamInvolved) {
        anomalies.push({
          rowIdx,
          type: "SAM_PRE_JOIN",
          message: `Row ${rowIdx}: Sam is involved in an expense dated ${parsedDate} before he moved in (mid-April).`,
          severity: "warning",
          suggestedAction: "Exclude Sam and split among other active members",
          field: "splits",
        });
      }
    }

    // 7. Settlement logged as expense checking
    const isSettlement = /settle|payback|paid back|sent money|payment/i.test(
      rawDesc,
    );
    if (isSettlement) {
      anomalies.push({
        rowIdx,
        type: "SETTLEMENT_ROW",
        message: `Row ${rowIdx}: Expense '${rawDesc}' appears to be a settlement payment.`,
        severity: "warning",
        suggestedAction:
          "Import as a Settlement transaction rather than an Expense",
        field: "description",
      });
    }

    // 8. Math split matching checking
    if (hasSplits && Math.abs(sumSplits - Math.abs(numericCost)) > 1) {
      anomalies.push({
        rowIdx,
        type: "MATH_MISMATCH",
        message: `Row ${rowIdx}: Sum of member shares (₹${sumSplits}) does not equal total cost (₹${numericCost}).`,
        severity: "warning",
        suggestedAction: "Recalculate splits equally or adjust rounding",
        field: "splits",
      });
    }

    // 9. All splits empty check
    if (!hasSplits && numericCost > 0) {
      // Default to equal split
      anomalies.push({
        rowIdx,
        type: "EQUAL_SPLIT_FALLBACK",
        message: `Row ${rowIdx}: No explicit splits logged. Falls back to Equal Split.`,
        severity: "info",
        suggestedAction: "Auto-split equally among participants",
        field: "splits",
      });
    }

    rows.push({
      rowIdx,
      rawLine: line,
      date: parsedDate,
      description: rawDesc || "Imported Expense",
      cost: numericCost,
      currency,
      paidBy,
      splits,
      hasAnomalies: false, // will be computed in UI
    });
  }

  // 10. Check for duplicate rows
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const r1 = rows[i]!;
      const r2 = rows[j]!;
      if (
        r1.description.toLowerCase() === r2.description.toLowerCase() &&
        r1.cost === r2.cost &&
        r1.date === r2.date &&
        r1.paidBy === r2.paidBy
      ) {
        anomalies.push({
          rowIdx: r2.rowIdx,
          type: "DUPLICATE_ROW",
          message: `Row ${r2.rowIdx} matches Row ${r1.rowIdx} exactly ('${r2.description}' for ₹${r2.cost} on ${r2.date}).`,
          severity: "warning",
          suggestedAction: "Skip importing this duplicate row",
          field: "row",
        });
      }
    }
  }

  return { rows, anomalies };
}
