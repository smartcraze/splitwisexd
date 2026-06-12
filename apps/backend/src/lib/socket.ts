import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

export let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join group room to listen for live balance updates
    socket.on("join_group", (groupId: string) => {
      socket.join(`group:${groupId}`);
      console.log(`Socket ${socket.id} joined group room: group:${groupId}`);
    });

    socket.on("leave_group", (groupId: string) => {
      socket.leave(`group:${groupId}`);
      console.log(`Socket ${socket.id} left group room: group:${groupId}`);
    });

    // Join expense room to listen for live comment notifications
    socket.on("join_expense", (expenseId: string) => {
      socket.join(`expense:${expenseId}`);
      console.log(
        `Socket ${socket.id} joined expense room: expense:${expenseId}`,
      );
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
