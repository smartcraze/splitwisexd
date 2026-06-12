import type { Request, Response } from "express";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { io } from "../../lib/socket.ts";
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

  if (memberEmails && memberEmails.length > 0) {
    for (const email of memberEmails) {
      if (email.toLowerCase() === authReq.user.email.toLowerCase()) continue;

      const user = await GroupsRepository.findUserByEmail(email);
      if (user) {
        try {
          await GroupsRepository.addMemberToGroup(group.id, user.id);
          addedEmails.push(email);
        } catch (_e) {
          skippedEmails.push(email);
        }
      } else {
        skippedEmails.push(email);
      }
    }
  }

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

    await GroupsRepository.removeMemberFromGroup(groupId, targetUserId);

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
