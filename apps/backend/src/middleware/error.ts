import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../lib/api-response.ts";
import { AppError } from "../lib/app-error.ts";

export const errorHandler = (
  // biome-ignore lint/suspicious/noExplicitAny: error object type is arbitrary at runtime
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  console.error("Unhandled Error:", err);

  res.status(statusCode).json(ApiResponse.error(message));
};
