import { NotificationService } from '../services/notification.service';
import { ExpenseService } from '../services/expense.service';
import { BudgetService } from '../services/budget.service';
import { setupTestDb, cleanupTestDb } from './setup';

describe('Notification Service', () => {
  let userId: number;

  beforeAll(async () => {
    const { user } = await setupTestDb();
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it('should detect overspending', async () => {
    // Set up budget
    await BudgetService.setBudget({
      category: 'Food',
      limit: 100,
      userId
    });

    // Create expense exceeding budget
    await ExpenseService.create({
      amount: 150,
      date: new Date(),
      category: 'Food',
      tags: ['groceries'],
      userId
    });

    const notifications = await NotificationService.checkOverspending();
    const userNotification = notifications.find(n => n.userId === userId);

    expect(userNotification).toBeDefined();
    expect(userNotification?.type).toBe('OVERSPEND');
    expect(userNotification?.data.category).toBe('Food');
    expect(userNotification?.data.overspentAmount).toBe(50);
  });

  it('should detect user inactivity', async () => {
    const notifications = await NotificationService.checkInactivity();
    expect(Array.isArray(notifications)).toBe(true);
  });

  it('should send notification', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    await NotificationService.sendNotification({
      userId,
      type: 'INACTIVITY',
      data: {
        daysInactive: 5
      },
      timestamp: new Date()
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});