import { prisma } from "@repo/db";

export const CommentsRepository = {
  async createComment(expenseId: string, userId: string, message: string) {
    return prisma.expenseComment.create({
      data: {
        expenseId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  async findExpenseComments(expenseId: string) {
    return prisma.expenseComment.findMany({
      where: { expenseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },
};
