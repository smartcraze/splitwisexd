import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.ts";
import { createComment, getComments } from "./comments.controller.ts";

const router = Router();

router.use(authenticateToken);

router.post("/", createComment);
router.get("/", getComments);

export default router;
