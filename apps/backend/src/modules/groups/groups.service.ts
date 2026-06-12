import { prisma } from "@repo/db";

export interface UserBalance {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  netBalance: number;
}

export interface Debt {
  fromUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  amount: number;
}

export const getGroupBalancesService = async (groupId: string) => {
  // 1. Fetch group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
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

  const memberMap = new Map(members.map((m) => [m.userId, m.user]));

  // Initialize net balance for each member
  const netBalances: Record<string, number> = {};
  for (const member of members) {
    netBalances[member.userId] = 0;
  }

  // Initialize 2D map for debts: debts[debtor][creditor] = amount
  const debts: Record<string, Record<string, number>> = {};
  for (const m1 of members) {
    const userDebts: Record<string, number> = {};
    for (const m2 of members) {
      if (m1.userId !== m2.userId) {
        userDebts[m2.userId] = 0;
      }
    }
    debts[m1.userId] = userDebts;
  }

  // 2. Fetch expenses and participants
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      participants: true,
    },
  });

  for (const expense of expenses) {
    const payerId = expense.paidByUserId;
    const totalAmount = expense.totalAmount;

    // Add total paid to payer's net balance
    if (netBalances[payerId] !== undefined) {
      netBalances[payerId] += totalAmount;
    }

    // Subtract owed amounts from participants' net balances, and record debt
    for (const part of expense.participants) {
      const participantId = part.userId;
      const owedAmount = part.owedAmount;

      if (netBalances[participantId] !== undefined) {
        netBalances[participantId] -= owedAmount;
      }

      if (participantId !== payerId) {
        const participantDebts = debts[participantId];
        if (participantDebts && participantDebts[payerId] !== undefined) {
          participantDebts[payerId] += owedAmount;
        }
      }
    }
  }

  // 3. Fetch settlements
  const settlements = await prisma.settlement.findMany({
    where: { groupId, status: "COMPLETED" },
  });

  for (const settlement of settlements) {
    const senderId = settlement.paidByUserId;
    const receiverId = settlement.paidToUserId;
    const amount = settlement.amount;

    // Sender's net balance increases (they paid off debt or lent money)
    if (netBalances[senderId] !== undefined) {
      netBalances[senderId] += amount;
    }

    // Receiver's net balance decreases (they received money)
    if (netBalances[receiverId] !== undefined) {
      netBalances[receiverId] -= amount;
    }

    // Adjust debt: Sender owes Receiver less
    const senderDebts = debts[senderId];
    if (senderDebts && senderDebts[receiverId] !== undefined) {
      senderDebts[receiverId] -= amount;
    }
  }

  // 4. Construct user balance list
  const userBalances: UserBalance[] = members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    avatarUrl: m.user.avatarUrl,
    netBalance: netBalances[m.userId] || 0,
  }));

  // 5. Construct pairwise debts
  const outstandingDebts: Debt[] = [];
  const userIds = members.map((m) => m.userId);

  // Compute net pairwise debts
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const u1 = userIds[i];
      const u2 = userIds[j];
      if (!u1 || !u2) continue;

      const u1OwesU2 = debts[u1]?.[u2] || 0;
      const u2OwesU1 = debts[u2]?.[u1] || 0;

      const net = u1OwesU2 - u2OwesU1;

      if (net > 0) {
        const fromUser = memberMap.get(u1);
        const toUser = memberMap.get(u2);
        if (fromUser && toUser) {
          outstandingDebts.push({
            fromUser,
            toUser,
            amount: net,
          });
        }
      } else if (net < 0) {
        const fromUser = memberMap.get(u2);
        const toUser = memberMap.get(u1);
        if (fromUser && toUser) {
          outstandingDebts.push({
            fromUser,
            toUser,
            amount: -net,
          });
        }
      }
    }
  }

  return {
    balances: userBalances,
    debts: outstandingDebts,
  };
};

export const getUserSummaryService = async (userId: string) => {
  // Find all groups user belongs to
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });

  let totalBalance = 0;
  let youOwe = 0;
  let youAreOwed = 0;
  const groupSummaries: {
    groupId: string;
    groupName: string;
    netBalance: number;
    youOwe: number;
    youAreOwed: number;
  }[] = [];

  for (const membership of memberships) {
    const { balances, debts } = await getGroupBalancesService(
      membership.groupId,
    );
    const userBalance = balances.find((b) => b.userId === userId);
    const netBalance = userBalance ? userBalance.netBalance : 0;
    totalBalance += netBalance;

    // Calculate how much this user owes / is owed in this group
    let groupOwe = 0;
    let groupOwed = 0;

    for (const debt of debts) {
      if (debt.fromUser.id === userId) {
        groupOwe += debt.amount;
      }
      if (debt.toUser.id === userId) {
        groupOwed += debt.amount;
      }
    }

    youOwe += groupOwe;
    youAreOwed += groupOwed;

    const group = await prisma.group.findUnique({
      where: { id: membership.groupId },
      select: { id: true, name: true, description: true },
    });

    groupSummaries.push({
      groupId: membership.groupId,
      groupName: group?.name || "",
      netBalance,
      youOwe: groupOwe,
      youAreOwed: groupOwed,
    });
  }

  return {
    totalBalance,
    youOwe,
    youAreOwed,
    groups: groupSummaries,
  };
};
