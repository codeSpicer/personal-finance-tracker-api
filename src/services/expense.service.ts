import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const categoryRules = [
  {
    pattern: /restaurant|breakfast|lunch|brunch|snacks|coffee|food|dining/i,
    category: "Food",
  },
  { pattern: /cab|bus|fuel|petrol|uber|ola|taxi/i, category: "Transportation" },
  { pattern: /amazon|flipkart|shopping|store/i, category: "Shopping" },
];

export class ExpenseService {
  static autoCategorize(notes: string): string {
    const matchedRule = categoryRules.find((rule) => rule.pattern.test(notes));
    return matchedRule?.category || "Uncategorized";
  }

  static async create(data: {
    amount: number;
    date: Date;
    category?: string;
    tags: string[];
    notes?: string;
    userId: number;
  }) {
    const category =
      data.category ||
      (data.notes ? this.autoCategorize(data.notes) : "Uncategorized");

    return prisma.expense.create({
      data: {
        ...data,
        category,
      },
    });
  }

  static async update(
    id: number,
    userId: number,
    data: {
      amount?: number;
      date?: Date;
      category?: string;
      tags?: string[];
      notes?: string;
    }
  ) {
    // Verify ownership
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new Error("Expense not found or unauthorized");
    }

    if (data.notes && !data.category) {
      data.category = this.autoCategorize(data.notes);
    }

    return prisma.expense.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number, userId: number) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new Error("Expense not found or unauthorized");
    }

    return prisma.expense.delete({
      where: { id },
    });
  }

  static async getAll(
    userId: number,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      tags?: string[];
    }
  ) {
    return prisma.expense.findMany({
      where: {
        userId,
        ...(filters?.startDate && {
          date: { gte: filters.startDate },
        }),
        ...(filters?.endDate && {
          date: { lte: filters.endDate },
        }),
        ...(filters?.category && {
          category: filters.category,
        }),
        ...(filters?.tags && {
          tags: { hasEvery: filters.tags },
        }),
      },
      orderBy: { date: "desc" },
    });
  }

  static async getMonthlyTotal(userId: number, month: Date) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    return expenses.reduce(
      (acc, curr) => {
        acc.total += curr.amount;
        acc.byCategory[curr.category] =
          (acc.byCategory[curr.category] || 0) + curr.amount;
        return acc;
      },
      { total: 0, byCategory: {} as Record<string, number> }
    );
  }
}
