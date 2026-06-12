import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.ts";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "./expenses.controller.ts";

const router = Router();

router.use(authenticateToken);

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
