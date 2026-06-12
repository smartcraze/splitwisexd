import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.ts";
import { getMe, login, register } from "./auth.controller.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

export default router;
