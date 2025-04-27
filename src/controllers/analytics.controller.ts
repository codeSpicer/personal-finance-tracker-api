import { Response } from "express";
import { ScoreService } from "../services/score.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class AnalyticsController {
  static async getUserAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const analytics = await ScoreService.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
}