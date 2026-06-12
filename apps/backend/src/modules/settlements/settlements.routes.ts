import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.ts";
import { createSettlement, getSettlements } from "./settlements.controller.ts";

const router = Router();

router.use(authenticateToken);

router.post("/", createSettlement);
router.get("/", getSettlements);

export default router;
