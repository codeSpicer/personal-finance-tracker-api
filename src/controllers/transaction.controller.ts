import { Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class TransactionController {
  static async reverseLastTransaction(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const result = await TransactionService.reverseLastTransaction(userId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async getTransactionHistory(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const transactions = await TransactionService.getTransactionHistory(
        userId
      );
      res.json(transactions);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
}
