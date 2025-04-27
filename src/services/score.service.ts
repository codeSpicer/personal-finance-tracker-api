import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export class ScoreService {
  static async calculateUserScore(userId: number): Promise<{
    totalScore: number;
    breakdown: {
      budgetAdherence: number;
      usageFrequency: number;
      trackingDiscipline: number;
    };
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get budgets and expenses
    const [budgets, expenses] = await Promise.all([
      prisma.budget.findMany({ where: { userId } }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    // budget adherence
    let budgetScore = 30;
    if (budgets.length > 0) {
      const expensesByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      const overages = budgets.reduce((acc, budget) => {
        const spent = expensesByCategory[budget.category] || 0;
        if (spent > budget.limit) {
          acc += (spent - budget.limit) / budget.limit;
        }
        return acc;
      }, 0);

      budgetScore = Math.max(0, 30 - (overages * 10));
    }

    // usage frequency
    const uniqueDays = new Set(
      expenses.map((e) => e.date.toISOString().split("T")[0])
    ).size;
    const daysInMonth = endOfMonth.getDate();
    const frequencyScore = Math.min(30, (uniqueDays / daysInMonth) * 30);

    // tracking discipline
    const hasNotes = expenses.filter((e) => e.notes).length;
    const hasTags = expenses.filter((e) => e.tags.length > 0).length;
    const disciplineScore = Math.min(
      40,
      ((hasNotes + hasTags) / (expenses.length * 2)) * 40
    );

    const totalScore = budgetScore + frequencyScore + disciplineScore;

    return {
      totalScore: Math.round(totalScore),
      breakdown: {
        budgetAdherence: Math.round(budgetScore),
        usageFrequency: Math.round(frequencyScore),
        trackingDiscipline: Math.round(disciplineScore),
      },
    };
  }

  static async getUserAnalytics(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all necessary data
    const [budgets, expenses, score] = await Promise.all([
      prisma.budget.findMany({ where: { userId } }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      this.calculateUserScore(userId),
    ]);

    // Calculate budget utilization
    const budgetUtilization = budgets.map(budget => {
      const categoryExpenses = expenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        category: budget.category,
        limit: budget.limit,
        spent: categoryExpenses,
        remaining: budget.limit - categoryExpenses,
        percentageUsed: Math.round((categoryExpenses / budget.limit) * 100),
        status: this.getBudgetStatus(categoryExpenses, budget.limit),
      };
    });

    // Calculate uncategorized expenses
    const categoriesWithBudget = new Set(budgets.map(b => b.category));
    const uncategorizedExpenses = expenses
      .filter(e => !categoriesWithBudget.has(e.category))
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      month: startOfMonth.toISOString().slice(0, 7),
      score: score.totalScore,
      scoreBreakdown: score.breakdown,
      budgetUtilization,
      uncategorizedExpenses,
      summary: {
        totalBudget: budgets.reduce((sum, b) => sum + b.limit, 0),
        totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
        budgetedCategories: budgets.length,
        uncategorizedCategories: Object.keys(uncategorizedExpenses).length,
      },
    };
  }

  private static getBudgetStatus(spent: number, limit: number): string {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "EXCEEDED";
    if (percentage >= 80) return "WARNING";
    if (percentage >= 50) return "MODERATE";
    return "GOOD";
  }
}