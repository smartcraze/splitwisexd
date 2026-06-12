import { prisma } from "@repo/db";

export const GroupsRepository = {
  async findMembership(groupId: string, userId: string) {
    return prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  },

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async createGroupWithCreator(
    name: string,
    description: string | undefined,
    creatorId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name,
          description,
          createdById: creatorId,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: creatorId,
          role: "ADMIN",
        },
      });

      return group;
    });
  },

  async addMemberToGroup(groupId: string, userId: string, role = "MEMBER") {
    return prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role,
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

  async removeMemberFromGroup(groupId: string, userId: string) {
    return prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  },

  async findGroupById(id: string) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        members: {
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

  async findUserMemberships(userId: string) {
    return prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
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
        },
      },
    });
  },

  async countGroupMembersInList(groupId: string, userIds: string[]) {
    return prisma.groupMember.count({
      where: {
        groupId,
        userId: { in: userIds },
      },
    });
  },
};
