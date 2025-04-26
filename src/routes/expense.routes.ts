import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", ExpenseController.create);
router.put("/:id", ExpenseController.update);
router.delete("/:id", ExpenseController.delete);
router.get("/", ExpenseController.getAll);
router.get("/monthly-total", ExpenseController.getMonthlyTotal);

export default router;
