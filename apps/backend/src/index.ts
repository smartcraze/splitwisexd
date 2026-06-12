import { createServer } from "node:http";
import cors from "cors";
import express from "express";

import { env } from "./lib/env.ts";
import { initSocket } from "./lib/socket.ts";
import { errorHandler } from "./middleware/error.ts";
import authRouter from "./modules/auth/auth.routes.ts";
import commentsRouter from "./modules/comments/comments.routes.ts";
import expensesRouter from "./modules/expenses/expenses.routes.ts";
import groupsRouter from "./modules/groups/groups.routes.ts";
import settlementsRouter from "./modules/settlements/settlements.routes.ts";

const app = express();
const server = createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/expenses", expensesRouter);
app.use("/api/v1/settlements", settlementsRouter);
app.use("/api/v1/comments", commentsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
