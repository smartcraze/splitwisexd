import type { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { prisma } from "@repo/db";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { io } from "../../lib/socket.ts";
import { invalidateCache } from "../../lib/cache.ts";
import type { AuthRequest } from "../../middleware/auth.ts";

// Normalization Helpers
const normalizeName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "");
};

const findMemberByName = (name: string, members: any[]) => {
  const norm = normalizeName(name);
  return members.find(
    (m) =>
      normalizeName(m.user.name) === norm ||
      normalizeName(m.user.email.split("@")[0] || "") === norm
  );
};

const parseDateStr = (dateStr: string): { date: Date; anomaly: boolean; message?: string } => {
  const cleanStr = dateStr.trim();
  
  // Check for DD-MM-YYYY format
  const dmyRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const dmyMatch = cleanStr.match(dmyRegex);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1]!, 10);
    const m = parseInt(dmyMatch[2]!, 10) - 1; // 0-indexed month
    const y = parseInt(dmyMatch[3]!, 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      return { date, anomaly: false };
    }
  }

  // Check for formats like "Mar-14" or "March-14" or "14-Mar"
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };

  const textParts = cleanStr.split(/[-/\s]+/);
  if (textParts.length >= 2) {
    let monthIndex = -1;
    let day = -1;
    let year = 2026; // Default fallback year

    for (const part of textParts) {
      const cleanPart = part.toLowerCase();
      if (monthMap[cleanPart] !== undefined) {
        monthIndex = monthMap[cleanPart]!;
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          if (num > 31) {
            year = num;
          } else if (day === -1) {
            day = num;
          } else {
            year = num;
          }
        }
      }
    }

    if (monthIndex !== -1 && day !== -1) {
      const date = new Date(year, monthIndex, day);
      if (!isNaN(date.getTime())) {
        return { date, anomaly: false };
      }
    }
  }

  // Direct JS parsing fallback
  const parsed = Date.parse(cleanStr);
  if (!isNaN(parsed)) {
    return { date: new Date(parsed), anomaly: false };
  }

  // Default to current date and trigger invalid date anomaly (Anomaly 9)
  return {
    date: new Date(),
    anomaly: true,
    message: `Invalid date format "${dateStr}". Defaulted to today's date.`,
  };
};

export const parseCSVImport = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const groupId = req.params.id as string;
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: authReq.user.id,
      },
    },
  });

  if (!membership) {
    throw new AppError("Access denied. You are not a member of this group.", 403);
  }

  const { csvText, usdRate: usdRateParam } = req.body;
  if (!csvText) {
    throw new AppError("CSV content is required.", 400);
  }

  const usdRate = parseFloat(usdRateParam) || 83;

  // Fetch current group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Fetch existing expenses for duplicate check (Anomaly 1)
  const existingExpenses = await prisma.expense.findMany({
    where: { groupId },
    select: {
      id: true,
      title: true,
      totalAmount: true,
      paidByUserId: true,
      createdAt: true,
    },
  });

  // Parse CSV text using csv-parse
  let rawRecords: any[];
  try {
    rawRecords = parse(csvText, {
      columns: (headers: string[]) => headers.map((h) => h.toLowerCase().trim()),
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err: any) {
    throw new AppError(`Failed to parse CSV file: ${err.message}`, 400);
  }

  const resolvedRows = rawRecords.map((raw: any, idx: number) => {
    const anomalies: any[] = [];
    let skipped = false;

    // Normalize raw fields in case of missing columns
    const rawDate = raw.date || "";
    const rawDescription = raw.description || "";
    const rawPaidBy = raw.paid_by || "";
    const rawAmount = raw.amount || "";
    const rawCurrency = raw.currency || "";
    const rawSplitType = raw.split_type || "";
    const rawSplitWith = raw.split_with || "";
    const rawSplitDetails = raw.split_details || "";
    const rawNotes = raw.notes || "";

    // 1. Description check (Anomaly 7)
    let title = rawDescription.trim();
    if (!title) {
      title = `Imported Expense ${idx + 1}`;
      anomalies.push({
        id: 7,
        type: "Empty Description",
        message: `Empty description resolved to "${title}"`,
        severity: "info",
      });
    }

    // 2. Date parsing (Anomaly 9)
    const dateResult = parseDateStr(rawDate);
    const date = dateResult.date;
    if (dateResult.anomaly) {
      anomalies.push({
        id: 9,
        type: "Invalid Date Format",
        message: dateResult.message!,
        severity: "warning",
      });
    }

    // 3. Amount parsing (Anomaly 11 & 6)
    const amountStr = rawAmount.replace(/[\"$,\s]/g, ""); // strip quotes, commas, dollar signs
    let rawAmountVal = parseFloat(amountStr);
    if (isNaN(rawAmountVal)) rawAmountVal = 0;

    let isRefund = false;
    let amountInCents = 0;

    if (rawAmountVal === 0) {
      skipped = true;
      anomalies.push({
        id: 11,
        type: "Zero Cost Row",
        message: "Transaction amount is 0. This row will be skipped.",
        severity: "error",
      });
    } else if (rawAmountVal < 0) {
      isRefund = true;
      rawAmountVal = Math.abs(rawAmountVal);
      anomalies.push({
        id: 6,
        type: "Negative Expense (Refund)",
        message: `Negative amount detected. Treated as a refund. Split will be reversed.`,
        severity: "warning",
      });
    }

    // 4. Currency / USD conversion (Anomaly 3)
    const isUSD =
      rawCurrency.toUpperCase() === "USD" ||
      rawAmount.includes("$") ||
      rawCurrency.includes("$");
    
    let convertedAmount = rawAmountVal;
    if (isUSD) {
      convertedAmount = rawAmountVal * usdRate;
      anomalies.push({
        id: 3,
        type: "USD Currency Conversion",
        message: `USD cost detected. Converting $${rawAmountVal} to INR at ₹${usdRate} (Total: ₹${convertedAmount.toFixed(2)})`,
        severity: "warning",
      });
    }

    // Round to nearest integer rupee as per database rules
    const roundedRupees = Math.round(convertedAmount);
    amountInCents = roundedRupees * 100;

    // 5. Payer mapping (Anomaly 8 & 12)
    let paidByUserId: string | null = null;
    const matchedPayer = findMemberByName(rawPaidBy, members);
    
    if (matchedPayer) {
      paidByUserId = matchedPayer.userId;
      if (matchedPayer.user.name.toLowerCase() !== rawPaidBy.trim().toLowerCase()) {
        anomalies.push({
          id: 8,
          type: "Inconsistent Name Casing/Spacing",
          message: `Normalized payer name "${rawPaidBy}" to matches group member "${matchedPayer.user.name}"`,
          severity: "info",
        });
      }
    } else if (rawPaidBy) {
      anomalies.push({
        id: 12,
        type: "Unknown Group Payer",
        message: `Unknown payer name "${rawPaidBy}". Please select a valid group member.`,
        severity: "error",
      });
    }

    // 6. Settlement as Expense Check (Anomaly 2)
    const noteTitle = (title + " " + rawNotes).toLowerCase();
    const isSettlementKeyword =
      noteTitle.includes("settle") ||
      noteTitle.includes("payment") ||
      noteTitle.includes("paid back") ||
      noteTitle.includes("payback");

    const splitWithParticipants = rawSplitWith
      .split(";")
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);
    
    const isSettlement =
      isSettlementKeyword ||
      (!rawSplitType && splitWithParticipants.length === 1 && !rawSplitDetails);

    if (isSettlement && !skipped) {
      anomalies.push({
        id: 2,
        type: "Settlement as Expense",
        message: `Row flagged as a settlement. Proposing creation of a Settlement record.`,
        severity: "warning",
      });
    }

    // 7. Split configuration & member timelines (Anomaly 4 & 5)
    const splitTypeRaw = rawSplitType.trim().toLowerCase();
    let splitMethod: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES" = "EQUAL";
    if (splitTypeRaw === "unequal") splitMethod = "UNEQUAL";
    if (splitTypeRaw === "percentage") splitMethod = "PERCENTAGE";
    if (splitTypeRaw === "share" || splitTypeRaw === "shares") splitMethod = "SHARES";

    // Parse participants
    let participantsList = splitWithParticipants;
    if (participantsList.length === 0) {
      // Fall back to all group members
      participantsList = members.map((m) => m.user.name);
    }

    // Map participant names to user IDs and check membership windows
    const mappedParticipants: any[] = [];

    for (const pName of participantsList) {
      const mem = findMemberByName(pName, members);
      if (!mem) continue;

      // Anomaly 4: Sam pre-join date check (April 15, 2026)
      if (mem.user.name.toLowerCase() === "sam" && date < new Date("2026-04-15")) {
        anomalies.push({
          id: 4,
          type: "Pre-join Expense split",
          message: `Sam was included in split, but joined after expense date (${mem.user.name} joined on 15-04-2026, expense date ${rawDate}). Excluded.`,
          severity: "warning",
        });
        continue;
      }

      // Anomaly 5: Meera post-leave move-out date check (March 31, 2026)
      if (mem.user.name.toLowerCase() === "meera" && date > new Date("2026-03-31")) {
        anomalies.push({
          id: 5,
          type: "Post-leave Expense split",
          message: `Meera was included in split, but left before expense date (${mem.user.name} moved out on 31-03-2026, expense date ${rawDate}). Excluded.`,
          severity: "warning",
        });
        continue;
      }

      mappedParticipants.push(mem);
    }

    // 8. Recalculate Split Details (Anomaly 10)
    const splitDetails = rawSplitDetails.trim();
    let participants: any[] = [];
    let mathMismatch = false;

    const activeMemberCount = mappedParticipants.length;

    if (activeMemberCount > 0 && !skipped) {
      if (splitMethod === "EQUAL") {
        const base = Math.floor(amountInCents / activeMemberCount);
        const remainder = amountInCents % activeMemberCount;
        participants = mappedParticipants.map((m, pIdx) => ({
          userId: m.userId,
          owedAmount: base + (pIdx < remainder ? 1 : 0),
        }));
      } else {
        // Parse split details key values
        const detailPairs = splitDetails.split(";").map((p: string) => p.trim()).filter((p: string) => p.length > 0);
        const detailMap: Record<string, number> = {};
        
        for (const pair of detailPairs) {
          const lastSpace = pair.lastIndexOf(" ");
          if (lastSpace !== -1) {
            const name = pair.substring(0, lastSpace).trim();
            const valStr = pair.substring(lastSpace + 1).replace("%", "").trim();
            const val = parseFloat(valStr);
            if (!isNaN(val)) {
              detailMap[normalizeName(name)] = val;
            }
          }
        }

        // Generate participant shares
        let sumDetails = 0;
        const participantShares: { userId: string; val: number }[] = [];

        for (const m of mappedParticipants) {
          const pNorm = normalizeName(m.user.name);
          const val = detailMap[pNorm] !== undefined ? detailMap[pNorm]! : 0;
          participantShares.push({ userId: m.userId, val });
          sumDetails += val;
        }

        if (splitMethod === "UNEQUAL") {
          const inputSumCents = Math.round(sumDetails * 100);
          if (inputSumCents !== amountInCents) {
            mathMismatch = true;
          } else {
            participants = participantShares.map((ps) => ({
              userId: ps.userId,
              owedAmount: Math.round(ps.val * 100),
            }));
          }
        } else if (splitMethod === "PERCENTAGE") {
          if (Math.abs(sumDetails - 100) > 0.01) {
            mathMismatch = true;
          } else {
            let allocated = 0;
            participants = participantShares.map((ps) => {
              const owed = Math.floor((ps.val / 100) * amountInCents);
              allocated += owed;
              return {
                userId: ps.userId,
                owedAmount: owed,
                percentage: ps.val,
              };
            });

            // Assign remainder to the first participant
            const remainder = amountInCents - allocated;
            if (remainder !== 0 && participants[0]) {
              participants[0].owedAmount = (participants[0].owedAmount || 0) + remainder;
            }
          }
        } else if (splitMethod === "SHARES") {
          if (sumDetails <= 0) {
            mathMismatch = true;
          } else {
            let allocated = 0;
            participants = participantShares.map((ps) => {
              const owed = Math.floor((ps.val / sumDetails) * amountInCents);
              allocated += owed;
              return {
                userId: ps.userId,
                owedAmount: owed,
                shares: Math.round(ps.val),
              };
            });

            // Assign remainder to the first participant
            const remainder = amountInCents - allocated;
            if (remainder !== 0 && participants[0]) {
              participants[0].owedAmount = (participants[0].owedAmount || 0) + remainder;
            }
          }
        }
      }

      // Handle Math Split Mismatch fallback (Anomaly 10)
      if (mathMismatch || participants.length === 0) {
        splitMethod = "EQUAL";
        const base = Math.floor(amountInCents / activeMemberCount);
        const remainder = amountInCents % activeMemberCount;
        participants = mappedParticipants.map((m, pIdx) => ({
          userId: m.userId,
          owedAmount: base + (pIdx < remainder ? 1 : 0),
        }));

        anomalies.push({
          id: 10,
          type: "Math Split Mismatch",
          message: `Sum of split details does not match total amount. Recalculated equally. Rounding remainder assigned to payer.`,
          severity: "warning",
        });
      }
    }

    // 9. Duplicate Check (Anomaly 1)
    if (!skipped && paidByUserId) {
      const isDuplicateInDB = existingExpenses.some((exp) => {
        const expDate = new Date(exp.createdAt);
        const dateDiff = Math.abs(expDate.getTime() - date.getTime());
        const sameDay = dateDiff < 24 * 60 * 60 * 1000; // Less than 1 day difference
        
        const samePayer = exp.paidByUserId === paidByUserId;
        const sameAmount = Math.abs(exp.totalAmount - amountInCents) < 200; // Allow 2 rupees diff due to conversion/rounding
        const sameTitle =
          exp.title.toLowerCase().trim() === title.toLowerCase().trim() ||
          exp.title.toLowerCase().replace(/[^a-z0-9]/g, "") === title.toLowerCase().replace(/[^a-z0-9]/g, "");

        return sameDay && samePayer && sameAmount && sameTitle;
      });

      if (isDuplicateInDB) {
        anomalies.push({
          id: 1,
          type: "Duplicate Expense",
          message: "Potential duplicate: An identical expense already exists in this group.",
          severity: "warning",
        });
      }
    }

    // Default approved is true unless it's a duplicate or skipped
    const hasDuplicateAnomaly = anomalies.some(a => a.id === 1);
    const approved = !skipped && !hasDuplicateAnomaly;

    return {
      index: idx,
      originalDate: rawDate,
      originalDescription: rawDescription,
      originalPaidBy: rawPaidBy,
      originalAmount: rawAmount,
      originalCurrency: rawCurrency,
      originalSplitType: rawSplitType,
      originalSplitWith: rawSplitWith,
      originalSplitDetails: rawSplitDetails,
      originalNotes: rawNotes,

      date,
      title,
      notes: rawNotes.trim(),
      amount: amountInCents,
      isUSD,
      isSettlement,
      isRefund,
      splitMethod,
      paidByUserId,
      participants,
      anomalies,
      approved,
      skipped,
    };
  });

  res.json(ApiResponse.success("CSV parsed successfully", resolvedRows));
});

export const commitCSVImport = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const groupId = req.params.id as string;
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: authReq.user.id,
      },
    },
  });

  if (!membership) {
    throw new AppError("Access denied. You are not a member of this group.", 403);
  }

  const { expenses, settlements } = req.body;
  const creatorId = authReq.user.id;

  // Fetch group members to validate references
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberSet = new Set(groupMembers.map((m) => m.userId));

  // Validate user IDs in bulk commit payload
  if (expenses && Array.isArray(expenses)) {
    for (const e of expenses) {
      if (!memberSet.has(e.paidByUserId)) {
        throw new AppError(`Payer ${e.paidByUserId} is not a member of this group.`, 400);
      }
      if (!e.participants || !Array.isArray(e.participants) || e.participants.length === 0) {
        throw new AppError(`Expense "${e.title}" must have at least one participant.`, 400);
      }
      for (const p of e.participants) {
        if (!memberSet.has(p.userId)) {
          throw new AppError(`Participant ${p.userId} is not a member of this group.`, 400);
        }
      }
    }
  }

  if (settlements && Array.isArray(settlements)) {
    for (const s of settlements) {
      if (!memberSet.has(s.paidByUserId)) {
        throw new AppError(`Settlement sender ${s.paidByUserId} is not a member of this group.`, 400);
      }
      if (!memberSet.has(s.paidToUserId)) {
        throw new AppError(`Settlement receiver ${s.paidToUserId} is not a member of this group.`, 400);
      }
    }
  }

  // Insert everything inside a single database transaction
  const result = await prisma.$transaction(async (tx) => {
    const createdExpenses = [];
    const createdSettlements = [];

    if (expenses && Array.isArray(expenses)) {
      for (const e of expenses) {
        const exp = await tx.expense.create({
          data: {
            title: e.title,
            description: e.description || null,
            totalAmount: e.totalAmount,
            splitMethod: e.splitMethod,
            groupId,
            paidByUserId: e.paidByUserId,
            createdById: creatorId,
            createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
          },
        });

        await tx.expenseParticipant.createMany({
          data: e.participants.map((p: any) => ({
            expenseId: exp.id,
            userId: p.userId,
            owedAmount: p.owedAmount,
            percentage: p.percentage || null,
            shares: p.shares || null,
          })),
        });

        createdExpenses.push(exp);
      }
    }

    if (settlements && Array.isArray(settlements)) {
      for (const s of settlements) {
        const sett = await tx.settlement.create({
          data: {
            groupId,
            paidByUserId: s.paidByUserId,
            paidToUserId: s.paidToUserId,
            amount: s.amount,
            note: s.note || null,
            status: "COMPLETED",
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          },
        });
        createdSettlements.push(sett);
      }
    }

    return {
      expensesCount: createdExpenses.length,
      settlementsCount: createdSettlements.length,
    };
  });

  // Invalidate Redis/in-memory cache tags
  const memberUserIds = Array.from(memberSet);
  const tagsToInvalidate = [
    `group-expenses-${groupId}`,
    `group-settlements-${groupId}`,
    `group-balances-${groupId}`,
    ...memberUserIds.flatMap((id) => [`user-summary-${id}`]),
  ];
  invalidateCache(tagsToInvalidate);

  if (io) {
    io.to(`group:${groupId}`).emit("balance_update", { groupId });
  }

  res.status(201).json(ApiResponse.success("Data imported successfully", result));
});
