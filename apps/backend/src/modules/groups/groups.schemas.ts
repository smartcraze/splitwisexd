import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters long"),
  description: z.string().optional(),
  memberEmails: z
    .array(z.string().email("Invalid email address"))
    .optional()
    .default([]),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});
