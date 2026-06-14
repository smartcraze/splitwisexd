import type { Request, Response } from "express";
import { prisma } from "@repo/db";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { io } from "../../lib/socket.ts";
import { invalidateCache } from "../../lib/cache.ts";
import type { AuthRequest } from "../../middleware/auth.ts";
import { GroupsRepository } from "./groups.repository.ts";
import { addMemberSchema, createGroupSchema } from "./groups.schemas.ts";
import {
  getGroupBalancesService,
  getUserSummaryService,
} from "./groups.service.ts";

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const parsed = createGroupSchema.safeParse(authReq.body);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues[0]?.message || "Invalid input data",
      400,
    );
  }

  const { name, description, memberEmails } = parsed.data;
  const creatorId = authReq.user.id;

  const group = await GroupsRepository.createGroupWithCreator(
    name,
    description,
    creatorId,
  );

  const addedEmails = [authReq.user.email];
  const skippedEmails: string[] = [];
  const memberUserIds: string[] = [creatorId];

  if (memberEmails && memberEmails.length > 0) {
    for (const email of memberEmails) {
      if (email.toLowerCase() === authReq.user.email.toLowerCase()) continue;

      const user = await GroupsRepository.findUserByEmail(email);
      if (user) {
        try {
          await GroupsRepository.addMemberToGroup(group.id, user.id);
          addedEmails.push(email);
          memberUserIds.push(user.id);
        } catch (_e) {
          skippedEmails.push(email);
        }
      } else {
        skippedEmails.push(email);
      }
    }
  }

  // Invalidate cache for all group members
  const tagsToInvalidate = memberUserIds.flatMap((id) => [
    `user-groups-${id}`,
    `user-summary-${id}`,
  ]);
  invalidateCache(tagsToInvalidate);

  res.status(201).json(
    ApiResponse.success("Group created successfully", {
      group,
      addedEmails,
      skippedEmails,
    }),
  );
});

export const getGroups = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const memberships = await GroupsRepository.findUserMemberships(
    authReq.user.id,
  );
  const groups = memberships.map((m) => m.group);

  res.json(ApiResponse.success("Groups retrieved successfully", groups));
});

export const getGroupById = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const id = authReq.params.id as string;
    const membership = await GroupsRepository.findMembership(
      id,
      authReq.user.id,
    );
    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const group = await GroupsRepository.findGroupById(id);
    if (!group) {
      throw new AppError("Group not found", 404);
    }

    res.json(
      ApiResponse.success("Group details retrieved successfully", group),
    );
  },
);

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const groupId = authReq.params.id as string;
  const membership = await GroupsRepository.findMembership(
    groupId,
    authReq.user.id,
  );
  if (!membership) {
    throw new AppError(
      "Access denied. You are not a member of this group.",
      403,
    );
  }

  const parsed = addMemberSchema.safeParse(authReq.body);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues[0]?.message || "Invalid input data",
      400,
    );
  }

  const { email } = parsed.data;
  const userToAdd = await GroupsRepository.findUserByEmail(email);
  if (!userToAdd) {
    throw new AppError("User with this email does not exist", 404);
  }

  const existingMember = await GroupsRepository.findMembership(
    groupId,
    userToAdd.id,
  );
  if (existingMember) {
    throw new AppError("User is already a member of this group", 400);
  }

  const newMember = await GroupsRepository.addMemberToGroup(
    groupId,
    userToAdd.id,
  );

  // Invalidate cache for all members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberUserIds = members.map((m) => m.userId);
  const tagsToInvalidate = [
    `group-balances-${groupId}`,
    ...memberUserIds.flatMap((id) => [
      `user-groups-${id}`,
      `user-summary-${id}`,
    ]),
  ];
  invalidateCache(tagsToInvalidate);

  if (io) {
    io.to(`group:${groupId}`).emit("balance_update", { groupId });
  }

  res
    .status(201)
    .json(ApiResponse.success("Member added successfully", newMember));
});

export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const groupId = authReq.params.id as string;
    const targetUserId = authReq.params.userId as string;
    const membership = await GroupsRepository.findMembership(
      groupId,
      authReq.user.id,
    );
    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const requesterId = authReq.user.id;
    if (requesterId !== targetUserId && membership.role !== "ADMIN") {
      throw new AppError(
        "Access denied. Only group admins can remove other members.",
        403,
      );
    }

    const targetMember = await GroupsRepository.findMembership(
      groupId,
      targetUserId,
    );
    if (!targetMember) {
      throw new AppError("Member not found in this group", 404);
    }

    const balancesData = await getGroupBalancesService(groupId);
    const targetBalance = balancesData.balances.find(
      (b) => b.userId === targetUserId,
    );
    if (targetBalance && targetBalance.netBalance !== 0) {
      throw new AppError(
        "Member cannot be removed because they have an active non-zero balance in this group.",
        400,
      );
    }

    // Fetch members before removing to invalidate target user's caches as well
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberUserIds = Array.from(
      new Set([...members.map((m) => m.userId), targetUserId]),
    );

    await GroupsRepository.removeMemberFromGroup(groupId, targetUserId);

    const tagsToInvalidate = [
      `group-balances-${groupId}`,
      ...memberUserIds.flatMap((id) => [
        `user-groups-${id}`,
        `user-summary-${id}`,
      ]),
    ];
    invalidateCache(tagsToInvalidate);

    if (io) {
      io.to(`group:${groupId}`).emit("balance_update", { groupId });
    }

    res.json(ApiResponse.success("Member removed successfully", null));
  },
);

export const getBalances = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const groupId = authReq.params.id as string;
  const membership = await GroupsRepository.findMembership(
    groupId,
    authReq.user.id,
  );
  if (!membership) {
    throw new AppError(
      "Access denied. You are not a member of this group.",
      403,
    );
  }

  const result = await getGroupBalancesService(groupId);
  res.json(ApiResponse.success("Balances calculated successfully", result));
});

export const getUserSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const result = await getUserSummaryService(authReq.user.id);
    res.json(ApiResponse.success("User summary fetched successfully", result));
  },
);

export const importGroupData = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const groupId = authReq.params.id as string;
    const membership = await GroupsRepository.findMembership(
      groupId,
      authReq.user.id,
    );
    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const { expenses, settlements } = req.body;
    const creatorId = authReq.user.id;

    // Fetch group members to validate references
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberSet = new Set(groupMembers.map((m) => m.userId));

    // Validate referenced user IDs
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

    // Insert everything inside a transaction
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

      return { expensesCount: createdExpenses.length, settlementsCount: createdSettlements.length };
    });

    // Invalidate caches
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
  }
);

