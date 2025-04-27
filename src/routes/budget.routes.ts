import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", BudgetController.setBudget);
router.put("/:id", BudgetController.updateBudget);
router.get("/", BudgetController.getBudgets);

export default router;
