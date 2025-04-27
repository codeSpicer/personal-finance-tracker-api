import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/user-analytics", AnalyticsController.getUserAnalytics);

export default router;