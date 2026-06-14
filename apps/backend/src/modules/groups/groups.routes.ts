import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.ts";
import {
  addMember,
  createGroup,
  getBalances,
  getGroupById,
  getGroups,
  getUserSummary,
  importGroupData,
  removeMember,
} from "./groups.controller.ts";

const router = Router();

router.use(authenticateToken);

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/summary", getUserSummary);
router.get("/:id", getGroupById);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.get("/:id/balances", getBalances);
router.post("/:id/import", importGroupData);

export default router;

