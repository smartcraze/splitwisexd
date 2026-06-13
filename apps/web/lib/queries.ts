import { prisma } from "@repo/db";
import { cacheLife, cacheTag } from "next/cache";

export async function getCachedGroups(userId: string) {
  "use cache";
  cacheTag(`user-groups-${userId}`);
  cacheLife("minutes");

  return prisma.group.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroupBalances(groupId: string) {
  "use cache";
  cacheTag(`group-balances-${groupId}`);
  cacheLife("minutes");

  const [members, expenses, settlements] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.expense.findMany({
      where: { groupId },
      include: { participants: true },
    }),
    prisma.settlement.findMany({
      where: { groupId, status: "COMPLETED" },
    }),
  ]);

  const memberMap = new Map(members.map((m) => [m.userId, m.user]));
  const netBalances: Record<string, number> = {};
  const debts: Record<string, Record<string, number>> = {};

  for (const m of members) {
    netBalances[m.userId] = 0;
    debts[m.userId] = {};
    for (const other of members) {
      if (m.userId !== other.userId) {
        debts[m.userId][other.userId] = 0;
      }
    }
  }

  for (const exp of expenses) {
    const payer = exp.paidByUserId;
    if (netBalances[payer] !== undefined) {
      netBalances[payer] += exp.totalAmount;
    }
    for (const part of exp.participants) {
      if (netBalances[part.userId] !== undefined) {
        netBalances[part.userId] -= part.owedAmount;
      }
      if (part.userId !== payer && debts[part.userId]?.[payer] !== undefined) {
        debts[part.userId][payer] += part.owedAmount;
      }
    }
  }

  for (const setl of settlements) {
    const from = setl.paidByUserId;
    const to = setl.paidToUserId;
    if (netBalances[from] !== undefined) netBalances[from] += setl.amount;
    if (netBalances[to] !== undefined) netBalances[to] -= setl.amount;
    if (debts[from]?.[to] !== undefined) debts[from][to] -= setl.amount;
  }

  const pairwiseDebts: any[] = [];
  const uids = members.map((m) => m.userId);
  for (let i = 0; i < uids.length; i++) {
    for (let j = i + 1; j < uids.length; j++) {
      const u1 = uids[i];
      const u2 = uids[j];
      if (!u1 || !u2) continue;
      const net = (debts[u1]?.[u2] || 0) - (debts[u2]?.[u1] || 0);
      if (net > 0 && memberMap.get(u1) && memberMap.get(u2)) {
        pairwiseDebts.push({ fromUser: memberMap.get(u1), toUser: memberMap.get(u2), amount: net });
      } else if (net < 0 && memberMap.get(u1) && memberMap.get(u2)) {
        pairwiseDebts.push({ fromUser: memberMap.get(u2), toUser: memberMap.get(u1), amount: -net });
      }
    }
  }

  return {
    balances: members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      netBalance: netBalances[m.userId] || 0,
    })),
    debts: pairwiseDebts,
  };
}

export async function getCachedUserSummary(userId: string) {
  "use cache";
  cacheTag(`user-summary-${userId}`);
  cacheLife("minutes");

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });

  let totalBalance = 0;
  let youOwe = 0;
  let youAreOwed = 0;
  const summaries: any[] = [];

  for (const m of memberships) {
    const { balances, debts } = await getGroupBalances(m.groupId);
    const net = balances.find((b) => b.userId === userId)?.netBalance || 0;
    totalBalance += net;

    let owe = 0;
    let owed = 0;
    for (const d of debts) {
      if (d.fromUser.id === userId) owe += d.amount;
      if (d.toUser.id === userId) owed += d.amount;
    }
    youOwe += owe;
    youAreOwed += owed;

    const gInfo = await prisma.group.findUnique({
      where: { id: m.groupId },
      select: { name: true },
    });

    summaries.push({
      groupId: m.groupId,
      groupName: gInfo?.name || "",
      netBalance: net,
      youOwe: owe,
      youAreOwed: owed,
    });
  }

  return { totalBalance, youOwe, youAreOwed, groups: summaries };
}

export async function getCachedExpenses(groupId: string) {
  "use cache";
  cacheTag(`group-expenses-${groupId}`);
  cacheLife("minutes");

  return prisma.expense.findMany({
    where: { groupId },
    include: {
      paidBy: { select: { name: true } },
      participants: { select: { userId: true, owedAmount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCachedSettlements(groupId: string) {
  "use cache";
  cacheTag(`group-settlements-${groupId}`);
  cacheLife("minutes");

  return prisma.settlement.findMany({
    where: { groupId, status: "COMPLETED" },
    include: {
      paidBy: { select: { name: true } },
      paidTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCachedComments(expenseId: string) {
  "use cache";
  cacheTag(`expense-comments-${expenseId}`);
  cacheLife("minutes");

  return prisma.expenseComment.findMany({
    where: { expenseId },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
