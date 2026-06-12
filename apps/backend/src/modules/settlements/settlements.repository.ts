import { prisma } from "@repo/db";

export const SettlementsRepository = {
  async createSettlement(data: {
    groupId: string;
    paidByUserId: string;
    paidToUserId: string;
    amount: number;
    note?: string | null;
  }) {
    return prisma.settlement.create({
      data: {
        ...data,
        status: "COMPLETED",
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        paidTo: {
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

  async findGroupSettlements(groupId: string) {
    return prisma.settlement.findMany({
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
        paidTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
