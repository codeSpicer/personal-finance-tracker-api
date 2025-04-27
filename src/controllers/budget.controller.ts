import { Response } from "express";
import { BudgetService } from "../services/budget.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class BudgetController {
  static async setBudget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budget = await BudgetService.setBudget({
        ...req.body,
        userId,
      });

      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async updateBudget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budget = await BudgetService.updateBudget(
        parseInt(req.params.id),
        userId,
        req.body
      );

      res.json(budget);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async getBudgets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const budgets = await BudgetService.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
}
