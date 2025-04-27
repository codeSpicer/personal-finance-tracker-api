import { PrismaClient } from "../generated/prisma";
import { INotificationPayload } from "../types/user.types";
import cron from "node-cron";

const prisma = new PrismaClient();

export class NotificationService {
  static async checkOverspending(): Promise<INotificationPayload[]> {

    const budgets = await prisma.budget.findMany({
      include: {
        user: true,
      },
    });

    // related expenses by category
    const notifications: INotificationPayload[] = [];
    
    for (const budget of budgets) {
      // Get expenses budget category
      const expenses = await prisma.expense.findMany({
        where: {
          userId: budget.userId,
          category: budget.category,
          date: {
            gte: new Date(new Date().setDate(1)), 
          },
        },
      });

      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      if (totalSpent > budget.limit) {
        notifications.push({
          userId: budget.userId,
          type: "OVERSPEND",
          data: {
            category: budget.category,
            overspentAmount: totalSpent - budget.limit,
          },
          timestamp: new Date(),
        });
      }
    }

    return notifications;
}

  static async checkInactivity(): Promise<INotificationPayload[]> {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const inactiveUsers = await prisma.user.findMany({
      where: {
        expenses: {
          none: {
            date: {
              gte: fiveDaysAgo,
            },
          },
        },
      },
    });

    return inactiveUsers.map((user) => ({
      userId: user.id,
      type: "INACTIVITY",
      data: {
        daysInactive: 5,
      },
      timestamp: new Date(),
    }));
  }

  static async sendNotification(payload: INotificationPayload): Promise<void> {
    // Mock API call to notification service
    console.log("Sending notification:", JSON.stringify(payload, null, 2));
  }

  static initializeNotificationJobs(): void {
    cron.schedule("0 0 * * *", async () => {
      const overspentNotifications =
        await NotificationService.checkOverspending();
      for (const notification of overspentNotifications) {
        await NotificationService.sendNotification(notification);
      }
    });

    // Run inactivity check daily at 1 AM
    cron.schedule("0 1 * * *", async () => {
      const inactivityNotifications =
        await NotificationService.checkInactivity();
      for (const notification of inactivityNotifications) {
        await NotificationService.sendNotification(notification);
      }
    });
  }
}
