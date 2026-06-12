import type { Server as HttpServer } from "node:http";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "./env.ts";

export let io: Server | null = null;

const JWT_SECRET = env.JWT_SECRET;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Authentication middleware for Socket.io connections
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: Access token is missing"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        name: string;
      };
      socket.data.user = decoded;
      next();
    } catch (_error) {
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `Socket client connected: ${socket.id} (user: ${socket.data.user?.id})`,
    );

    // Join group room to listen for live balance updates (verified membership check)
    socket.on("join_group", async (groupId: string) => {
      const userId = socket.data.user?.id;
      if (!userId) return;

      try {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

        if (membership) {
          socket.join(`group:${groupId}`);
          console.log(
            `Socket ${socket.id} joined group room: group:${groupId}`,
          );
        } else {
          console.warn(
            `Unauthorized join_group request by User ${userId} for Group ${groupId}`,
          );
        }
      } catch (error) {
        console.error(`Socket join_group error for Group ${groupId}:`, error);
      }
    });

    socket.on("leave_group", (groupId: string) => {
      socket.leave(`group:${groupId}`);
      console.log(`Socket ${socket.id} left group room: group:${groupId}`);
    });

    // Join expense room to listen for live comments (verified membership check)
    socket.on("join_expense", async (expenseId: string) => {
      const userId = socket.data.user?.id;
      if (!userId) return;

      try {
        const expense = await prisma.expense.findUnique({
          where: { id: expenseId },
          select: { groupId: true },
        });

        if (!expense) {
          console.warn(
            `Socket join_expense failed: Expense ${expenseId} does not exist`,
          );
          return;
        }

        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: expense.groupId,
              userId,
            },
          },
        });

        if (membership) {
          socket.join(`expense:${expenseId}`);
          console.log(
            `Socket ${socket.id} joined expense room: expense:${expenseId}`,
          );
        } else {
          console.warn(
            `Unauthorized join_expense request by User ${userId} for Expense ${expenseId}`,
          );
        }
      } catch (error) {
        console.error(
          `Socket join_expense error for Expense ${expenseId}:`,
          error,
        );
      }
    });

    socket.on("leave_expense", (expenseId: string) => {
      socket.leave(`expense:${expenseId}`);
      console.log(
        `Socket ${socket.id} left expense room: expense:${expenseId}`,
      );
    });

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};
