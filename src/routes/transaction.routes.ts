import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/reverse-last", TransactionController.reverseLastTransaction);
router.get("/history", TransactionController.getTransactionHistory);

export default router;