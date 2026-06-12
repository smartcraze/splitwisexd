import type { SplitMethod } from "@repo/db";
import { prisma } from "@repo/db";

interface CalculatedParticipant {
  userId: string;
  owedAmount: number;
  percentage: number | null;
  shares: number | null;
}

export const ExpensesRepository = {
  async findExpenseById(id: string) {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        participants: {
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
        },
      },
    });
  },

  async deleteExpense(id: string) {
    return prisma.expense.delete({
      where: { id },
    });
  },

  async findGroupExpenses(groupId: string) {
    return prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        participants: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async createExpense(
    data: {
      title: string;
      description: string | null | undefined;
      totalAmount: number;
      splitMethod: SplitMethod;
      groupId: string;
      paidByUserId: string;
      createdById: string;
    },
    calculatedParticipants: CalculatedParticipant[],
  ) {
    return prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data,
      });

      await tx.expenseParticipant.createMany({
        data: calculatedParticipants.map((p) => ({
          expenseId: exp.id,
          userId: p.userId,
          owedAmount: p.owedAmount,
          percentage: p.percentage,
          shares: p.shares,
        })),
      });

      return tx.expense.findUnique({
        where: { id: exp.id },
        include: {
          participants: {
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
          },
          paidBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
    });
  },

  async updateExpense(
    id: string,
    data: {
      title: string;
      description: string | null | undefined;
      totalAmount: number;
      splitMethod: SplitMethod;
      paidByUserId: string;
    },
    calculatedParticipants: CalculatedParticipant[],
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.expenseParticipant.deleteMany({
        where: { expenseId: id },
      });

      await tx.expense.update({
        where: { id },
        data,
      });

      await tx.expenseParticipant.createMany({
        data: calculatedParticipants.map((p) => ({
          expenseId: id,
          userId: p.userId,
          owedAmount: p.owedAmount,
          percentage: p.percentage,
          shares: p.shares,
        })),
      });

      return tx.expense.findUnique({
        where: { id },
        include: {
          participants: {
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
          },
          paidBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
    });
  },
};
