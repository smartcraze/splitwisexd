import type { Request, Response } from "express";
import { prisma } from "@repo/db";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { io } from "../../lib/socket.ts";
import { invalidateCache } from "../../lib/cache.ts";
import type { AuthRequest } from "../../middleware/auth.ts";
import { GroupsRepository } from "../groups/groups.repository.ts";
import { ExpensesRepository } from "./expenses.repository.ts";
import { createExpenseSchema } from "./expenses.schemas.ts";

interface InputParticipant {
  userId: string;
  owedAmount?: number | null;
  percentage?: number | null;
  shares?: number | null;
}

interface CalculatedParticipant {
  userId: string;
  owedAmount: number;
  percentage: number | null;
  shares: number | null;
}

const calculateSplits = (
  totalAmount: number,
  splitMethod: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES",
  participants: InputParticipant[],
): CalculatedParticipant[] => {
  const count = participants.length;
  if (count === 0) {
    throw new AppError("At least one participant is required", 400);
  }

  const result: CalculatedParticipant[] = [];

  if (splitMethod === "EQUAL") {
    const baseAmount = Math.floor(totalAmount / count);
    const remainder = totalAmount % count;

    for (let i = 0; i < count; i++) {
      const p = participants[i];
      if (!p) continue;
      result.push({
        userId: p.userId,
        owedAmount: baseAmount + (i < remainder ? 1 : 0),
        percentage: null,
        shares: null,
      });
    }
  } else if (splitMethod === "UNEQUAL") {
    let sumOwed = 0;
    for (const p of participants) {
      if (p.owedAmount === undefined || p.owedAmount === null) {
        throw new AppError(
          `Owed amount is required for participant ${p.userId} in UNEQUAL split`,
          400,
        );
      }
      sumOwed += p.owedAmount;
      result.push({
        userId: p.userId,
        owedAmount: p.owedAmount,
        percentage: null,
        shares: null,
      });
    }

    if (sumOwed !== totalAmount) {
      throw new AppError(
        `Sum of owed amounts (${sumOwed}) must equal the total amount (${totalAmount})`,
        400,
      );
    }
  } else if (splitMethod === "PERCENTAGE") {
    let sumPercentage = 0;
    for (const p of participants) {
      if (p.percentage === undefined || p.percentage === null) {
        throw new AppError(
          `Percentage is required for participant ${p.userId} in PERCENTAGE split`,
          400,
        );
      }
      sumPercentage += p.percentage;
    }

    if (Math.abs(sumPercentage - 100) > 0.01) {
      throw new AppError(
        `Sum of percentages (${sumPercentage}%) must equal 100%`,
        400,
      );
    }

    let allocatedAmount = 0;
    for (let i = 0; i < count; i++) {
      const p = participants[i];
      if (!p) continue;
      const pct = p.percentage ?? 0;
      const owed = Math.floor((pct / 100) * totalAmount);
      allocatedAmount += owed;
      result.push({
        userId: p.userId,
        owedAmount: owed,
        percentage: pct,
        shares: null,
      });
    }

    const remainder = totalAmount - allocatedAmount;
    if (remainder !== 0 && result[0]) {
      result[0].owedAmount += remainder;
    }
  } else if (splitMethod === "SHARES") {
    let totalShares = 0;
    for (const p of participants) {
      if (p.shares === undefined || p.shares === null) {
        throw new AppError(
          `Shares are required for participant ${p.userId} in SHARES split`,
          400,
        );
      }
      totalShares += p.shares;
    }

    if (totalShares <= 0) {
      throw new AppError("Total shares must be greater than zero", 400);
    }

    let allocatedAmount = 0;
    for (let i = 0; i < count; i++) {
      const p = participants[i];
      if (!p) continue;
      const sh = p.shares ?? 1;
      const owed = Math.floor((sh / totalShares) * totalAmount);
      allocatedAmount += owed;
      result.push({
        userId: p.userId,
        owedAmount: owed,
        percentage: null,
        shares: sh,
      });
    }

    const remainder = totalAmount - allocatedAmount;
    if (remainder !== 0 && result[0]) {
      result[0].owedAmount += remainder;
    }
  }

  return result;
};

export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const parsed = createExpenseSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || "Invalid input data",
        400,
      );
    }

    const {
      title,
      description,
      totalAmount,
      groupId,
      paidByUserId,
      splitMethod,
      participants,
    } = parsed.data;
    const creatorId = authReq.user.id;

    const requesterMembership = await GroupsRepository.findMembership(
      groupId,
      creatorId,
    );
    if (!requesterMembership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const uniqueUserIds = Array.from(
      new Set([paidByUserId, ...participants.map((p) => p.userId)]),
    );
    const memberCounts = await GroupsRepository.countGroupMembersInList(
      groupId,
      uniqueUserIds,
    );
    if (memberCounts !== uniqueUserIds.length) {
      throw new AppError(
        "One or more participants are not members of the group.",
        400,
      );
    }

    const calculatedParticipants = calculateSplits(
      totalAmount,
      splitMethod,
      participants,
    );

    const expense = await ExpensesRepository.createExpense(
      {
        title,
        description,
        totalAmount,
        splitMethod,
        groupId,
        paidByUserId,
        createdById: creatorId,
      },
      calculatedParticipants,
    );

    // Invalidate Next.js cache
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberUserIds = members.map((m) => m.userId);
    const tagsToInvalidate = [
      `group-expenses-${groupId}`,
      `group-balances-${groupId}`,
      ...memberUserIds.flatMap((id) => [`user-summary-${id}`]),
    ];
    invalidateCache(tagsToInvalidate);

    if (io) {
      io.to(`group:${groupId}`).emit("balance_update", { groupId });
    }

    res
      .status(201)
      .json(ApiResponse.success("Expense created successfully", expense));
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const id = authReq.params.id as string;
    const requesterId = authReq.user.id;

    const existingExpense = await ExpensesRepository.findExpenseById(id);
    if (!existingExpense) {
      throw new AppError("Expense not found", 404);
    }

    const requesterMembership = await GroupsRepository.findMembership(
      existingExpense.groupId,
      requesterId,
    );
    if (!requesterMembership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const parsed = createExpenseSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || "Invalid input data",
        400,
      );
    }

    const {
      title,
      description,
      totalAmount,
      groupId,
      paidByUserId,
      splitMethod,
      participants,
    } = parsed.data;

    if (groupId !== existingExpense.groupId) {
      throw new AppError("Cannot change the group of an existing expense", 400);
    }

    const uniqueUserIds = Array.from(
      new Set([paidByUserId, ...participants.map((p) => p.userId)]),
    );
    const memberCounts = await GroupsRepository.countGroupMembersInList(
      groupId,
      uniqueUserIds,
    );
    if (memberCounts !== uniqueUserIds.length) {
      throw new AppError(
        "One or more participants are not members of the group.",
        400,
      );
    }

    const calculatedParticipants = calculateSplits(
      totalAmount,
      splitMethod,
      participants,
    );

    const expense = await ExpensesRepository.updateExpense(
      id,
      {
        title,
        description,
        totalAmount,
        splitMethod,
        paidByUserId,
      },
      calculatedParticipants,
    );

    // Invalidate Next.js cache
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberUserIds = members.map((m) => m.userId);
    const tagsToInvalidate = [
      `expense-${id}`,
      `group-expenses-${groupId}`,
      `group-balances-${groupId}`,
      ...memberUserIds.flatMap((id) => [`user-summary-${id}`]),
    ];
    invalidateCache(tagsToInvalidate);

    if (io) {
      io.to(`group:${groupId}`).emit("balance_update", { groupId });
    }

    res.json(ApiResponse.success("Expense updated successfully", expense));
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const id = authReq.params.id as string;
    const requesterId = authReq.user.id;

    const existingExpense = await ExpensesRepository.findExpenseById(id);
    if (!existingExpense) {
      throw new AppError("Expense not found", 404);
    }

    const requesterMembership = await GroupsRepository.findMembership(
      existingExpense.groupId,
      requesterId,
    );
    if (!requesterMembership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const groupId = existingExpense.groupId;
    await ExpensesRepository.deleteExpense(id);

    // Invalidate Next.js cache
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberUserIds = members.map((m) => m.userId);
    const tagsToInvalidate = [
      `group-expenses-${groupId}`,
      `group-balances-${groupId}`,
      ...memberUserIds.flatMap((id) => [`user-summary-${id}`]),
    ];
    invalidateCache(tagsToInvalidate);

    if (io) {
      io.to(`group:${groupId}`).emit("balance_update", {
        groupId,
      });
    }

    res.json(ApiResponse.success("Expense deleted successfully", null));
  },
);

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const { groupId } = authReq.query;
  if (!groupId || typeof groupId !== "string") {
    throw new AppError("Group ID is required", 400);
  }

  const requesterId = authReq.user.id;

  const membership = await GroupsRepository.findMembership(
    groupId,
    requesterId,
  );
  if (!membership) {
    throw new AppError(
      "Access denied. You are not a member of this group.",
      403,
    );
  }

  const expenses = await ExpensesRepository.findGroupExpenses(groupId);
  res.json(ApiResponse.success("Expenses retrieved successfully", expenses));
});

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const id = authReq.params.id as string;
    const requesterId = authReq.user.id;

    const expense = await ExpensesRepository.findExpenseById(id);
    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    const membership = await GroupsRepository.findMembership(
      expense.groupId,
      requesterId,
    );
    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    res.json(ApiResponse.success("Expense retrieved successfully", expense));
  },
);
