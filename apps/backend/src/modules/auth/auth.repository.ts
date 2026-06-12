import { prisma } from "@repo/db";

export const AuthRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    avatarUrl?: string | null;
  }) {
    return prisma.user.create({
      data,
    });
  },
};
