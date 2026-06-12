import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-key-splitwise-xd-2026";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authReq = req as AuthRequest;
  const authHeader = authReq.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };
    authReq.user = decoded;
    next();
  } catch (_error) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
};
