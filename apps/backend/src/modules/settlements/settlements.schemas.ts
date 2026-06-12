import { z } from "zod";

export const createSettlementSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  paidToUserId: z.string().min(1, "Paid to user ID is required"),
  amount: z.number().int().positive("Amount must be a positive integer"),
  note: z.string().optional().nullable(),
});
