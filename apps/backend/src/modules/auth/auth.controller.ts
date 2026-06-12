import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../../lib/api-response.ts";
import { AppError } from "../../lib/app-error.ts";
import { asyncHandler } from "../../lib/async-handler.ts";
import { JWT_EXPIRES_IN } from "../../lib/constant.ts";
import { env } from "../../lib/env.ts";
import type { AuthRequest } from "../../middleware/auth.ts";
import { AuthRepository } from "./auth.repository.ts";
import { loginSchema, registerSchema } from "./auth.schemas.ts";

const JWT_SECRET = env.JWT_SECRET;

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues[0]?.message || "Invalid input data",
      400,
    );
  }

  const { email, password, name, avatarUrl } = parsed.data;

  // Check if user already exists
  const existingUser = await AuthRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await AuthRepository.createUser({
    email,
    name,
    passwordHash,
    avatarUrl,
  });

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  res.status(201).json(
    ApiResponse.success("User registered successfully", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    }),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues[0]?.message || "Invalid email or password",
      400,
    );
  }

  const { email, password } = parsed.data;

  // Find user
  const user = await AuthRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  res.json(
    ApiResponse.success("Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    }),
  );
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await AuthRepository.findById(authReq.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json(ApiResponse.success("User profile fetched successfully", user));
});
