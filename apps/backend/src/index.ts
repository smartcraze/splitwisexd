import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import "dotenv/config";

import { initSocket } from "./lib/socket.ts";
import { errorHandler } from "./middleware/error.ts";
import authRouter from "./modules/auth/auth.routes.ts";
import commentsRouter from "./modules/comments/comments.routes.ts";
import expensesRouter from "./modules/expenses/expenses.routes.ts";
import groupsRouter from "./modules/groups/groups.routes.ts";
import settlementsRouter from "./modules/settlements/settlements.routes.ts";

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

// Enable CORS and JSON parser
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/settlements", settlementsRouter);
app.use("/api/comments", commentsRouter);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// Global error handling middleware (must be registered after all route handlers)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
