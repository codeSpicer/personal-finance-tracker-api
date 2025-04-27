import { BudgetService } from '../services/budget.service';
import { setupTestDb, cleanupTestDb } from './setup';

describe('Budget Service', () => {
  let userId: number;

  beforeAll(async () => {
    const { user } = await setupTestDb();
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it('should set a new budget', async () => {
    const budget = await BudgetService.setBudget({
      category: 'Food',
      limit: 500,
      userId
    });

    expect(budget).toBeDefined();
    expect(budget.category).toBe('Food');
    expect(budget.limit).toBe(500);
  });

  it('should not allow duplicate budgets for same category', async () => {
    await BudgetService.setBudget({
      category: 'Transportation',
      limit: 200,
      userId
    });

    await expect(
      BudgetService.setBudget({
        category: 'Transportation',
        limit: 300,
        userId
      })
    ).rejects.toThrow('Budget already exists for category Transportation');
  });

  it('should update budget limit', async () => {
    const budget = await BudgetService.setBudget({
      category: 'Entertainment',
      limit: 300,
      userId
    });

    const updated = await BudgetService.updateBudget(budget.id, userId, {
      limit: 400
    });

    expect(updated.limit).toBe(400);
  });

  it('should get all budgets for user', async () => {
    const budgets = await BudgetService.getBudgets(userId);
    expect(budgets.length).toBeGreaterThan(0);
  });
});