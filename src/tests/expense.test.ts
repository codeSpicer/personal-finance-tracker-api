import { ExpenseService } from '../services/expense.service';
import { setupTestDb, cleanupTestDb } from './setup';
import { TransactionType } from '../generated/prisma';
import { describe, it } from 'node:test';

describe('Expense Service', () => {
  let userId: number;

  beforeAll(async () => {
    const { user } = await setupTestDb();
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it('should create an expense with auto-categorization', async () => {
    const expense = await ExpenseService.create({
      amount: 50,
      date: new Date(),
      notes: 'lunch at restaurant',
      tags: ['food', 'lunch'],
      userId
    });

    expect(expense).toBeDefined();
    expect(expense.category).toBe('Food');
    expect(expense.amount).toBe(50);
  });

  it('should update an expense', async () => {
    const expense = await ExpenseService.create({
      amount: 100,
      date: new Date(),
      category: 'Shopping',
      tags: ['clothes'],
      userId
    });

    const updated = await ExpenseService.update(expense.id, userId, {
      amount: 150,
      notes: 'Updated amount'
    });

    expect(updated.amount).toBe(150);
    expect(updated.notes).toBe('Updated amount');
  });

  it('should delete an expense', async () => {
    const expense = await ExpenseService.create({
      amount: 75,
      date: new Date(),
      category: 'Entertainment',
      tags: ['movies'],
      userId
    });

    const result = await ExpenseService.delete(expense.id, userId);
    expect(result.success).toBe(true);
  });

  it('should get monthly totals', async () => {
    await ExpenseService.create({
      amount: 100,
      date: new Date(),
      category: 'Food',
      tags: ['groceries'],
      userId
    });

    await ExpenseService.create({
      amount: 50,
      date: new Date(),
      category: 'Food',
      tags: ['restaurant'],
      userId
    });

    const totals = await ExpenseService.getMonthlyTotal(userId, new Date());
    expect(totals.total).toBe(150);
    expect(totals.byCategory['Food']).toBe(150);
  });
});