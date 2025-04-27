import { ScoreService } from '../services/score.service';
import { ExpenseService } from '../services/expense.service';
import { BudgetService } from '../services/budget.service';
import { setupTestDb, cleanupTestDb } from './setup';

describe('Score Service', () => {
  let userId: number;

  beforeAll(async () => {
    const { user } = await setupTestDb();
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it('should calculate user score with all components', async () => {
    // Set up budget
    await BudgetService.setBudget({
      category: 'Food',
      limit: 500,
      userId
    });

    // Create expenses with good tracking discipline
    await ExpenseService.create({
      amount: 200,
      date: new Date(),
      category: 'Food',
      tags: ['groceries'],
      notes: 'Weekly groceries',
      userId
    });

    await ExpenseService.create({
      amount: 100,
      date: new Date(),
      category: 'Food',
      tags: ['restaurant'],
      notes: 'Dinner out',
      userId
    });

    const score = await ScoreService.calculateUserScore(userId);

    expect(score.totalScore).toBeDefined();
    expect(score.breakdown.budgetAdherence).toBeDefined();
    expect(score.breakdown.usageFrequency).toBeDefined();
    expect(score.breakdown.trackingDiscipline).toBeDefined();
  });

  it('should provide detailed user analytics', async () => {
    const analytics = await ScoreService.getUserAnalytics(userId);

    expect(analytics.month).toBeDefined();
    expect(analytics.score).toBeDefined();
    expect(analytics.budgetUtilization).toBeDefined();
    expect(analytics.summary).toBeDefined();
  });
});