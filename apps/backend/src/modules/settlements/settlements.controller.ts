import type { Request, Response } from "express";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { io } from "../../lib/socket.ts";
import type { AuthRequest } from "../../middleware/auth.ts";
import { GroupsRepository } from "../groups/groups.repository.ts";
import { SettlementsRepository } from "./settlements.repository.ts";
import { createSettlementSchema } from "./settlements.schemas.ts";

export const createSettlement = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const parsed = createSettlementSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || "Invalid input data",
        400,
      );
    }

    const { groupId, paidToUserId, amount, note } = parsed.data;
    const paidByUserId = authReq.user.id;

    if (paidByUserId === paidToUserId) {
      throw new AppError("You cannot record a settlement to yourself.", 400);
    }

    const senderMembership = await GroupsRepository.findMembership(
      groupId,
      paidByUserId,
    );
    const receiverMembership = await GroupsRepository.findMembership(
      groupId,
      paidToUserId,
    );

    if (!senderMembership || !receiverMembership) {
      throw new AppError(
        "Both sender and receiver must be members of the group.",
        400,
      );
    }

    const settlement = await SettlementsRepository.createSettlement({
      groupId,
      paidByUserId,
      paidToUserId,
      amount,
      note,
    });

    if (io) {
      io.to(`group:${groupId}`).emit("balance_update", { groupId });
    }

    res
      .status(201)
      .json(
        ApiResponse.success("Settlement recorded successfully", settlement),
      );
  },
);

export const getSettlements = asyncHandler(
  async (req: Request, res: Response) => {
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

    const settlements =
      await SettlementsRepository.findGroupSettlements(groupId);
    res.json(
      ApiResponse.success("Settlements retrieved successfully", settlements),
    );
  },
);
