import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class ExpenseController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const expense = await ExpenseService.create({
        ...req.body,
        userId,
      });

      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const expense = await ExpenseService.update(
        parseInt(req.params.id),
        userId,
        req.body
      );

      res.json(expense);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await ExpenseService.delete(parseInt(req.params.id), userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const expenses = await ExpenseService.getAll(userId, req.query);
      res.json(expenses);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  static async getMonthlyTotal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const month = req.query.month
        ? new Date(req.query.month as string)
        : new Date();
      const totals = await ExpenseService.getMonthlyTotal(userId, month);
      res.json(totals);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
}
