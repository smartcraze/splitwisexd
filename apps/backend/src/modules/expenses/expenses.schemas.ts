import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  totalAmount: z
    .number()
    .int()
    .positive("Total amount must be a positive integer"),
  groupId: z.string().min(1, "Group ID is required"),
  paidByUserId: z.string().min(1, "Paid by user ID is required"),
  splitMethod: z.enum(["EQUAL", "UNEQUAL", "PERCENTAGE", "SHARES"]),
  participants: z
    .array(
      z.object({
        userId: z.string().min(1, "Participant user ID is required"),
        owedAmount: z.number().int().nonnegative().optional().nullable(),
        percentage: z.number().positive().optional().nullable(),
        shares: z.number().int().positive().optional().nullable(),
      }),
    )
    .min(1, "At least one participant is required"),
});
