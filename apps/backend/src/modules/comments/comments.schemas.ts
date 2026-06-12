import { z } from "zod";

export const createCommentSchema = z.object({
  expenseId: z.string().min(1, "Expense ID is required"),
  message: z.string().min(1, "Comment message cannot be empty"),
});
