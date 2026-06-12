import type { Request, Response } from "express";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { io } from "../../lib/socket.ts";
import type { AuthRequest } from "../../middleware/auth.ts";
import { ExpensesRepository } from "../expenses/expenses.repository.ts";
import { GroupsRepository } from "../groups/groups.repository.ts";
import { CommentsRepository } from "./comments.repository.ts";
import { createCommentSchema } from "./comments.schemas.ts";

export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("Not authenticated", 401);
    }

    const parsed = createCommentSchema.safeParse(authReq.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || "Invalid input data",
        400,
      );
    }

    const { expenseId, message } = parsed.data;
    const userId = authReq.user.id;

    const expense = await ExpensesRepository.findExpenseById(expenseId);
    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    const membership = await GroupsRepository.findMembership(
      expense.groupId,
      userId,
    );
    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this group.",
        403,
      );
    }

    const comment = await CommentsRepository.createComment(
      expenseId,
      userId,
      message,
    );

    if (io) {
      io.to(`expense:${expenseId}`).emit("new_comment", comment);
    }

    res
      .status(201)
      .json(ApiResponse.success("Comment added successfully", comment));
  },
);

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const { expenseId } = authReq.query;
  if (!expenseId || typeof expenseId !== "string") {
    throw new AppError("Expense ID is required", 400);
  }

  const userId = authReq.user.id;

  const expense = await ExpensesRepository.findExpenseById(expenseId);
  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  const membership = await GroupsRepository.findMembership(
    expense.groupId,
    userId,
  );
  if (!membership) {
    throw new AppError(
      "Access denied. You are not a member of this group.",
      403,
    );
  }

  const comments = await CommentsRepository.findExpenseComments(expenseId);
  res.json(ApiResponse.success("Comments retrieved successfully", comments));
});
