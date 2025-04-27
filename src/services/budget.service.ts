import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export class BudgetService {
  static async setBudget(data: {
    category: string;
    limit: number;
    userId: number;
  }) {
    // Check if budget already exists for this category
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: data.userId,
        category: data.category,
      },
    });

    if (existingBudget) {
      throw new Error(`Budget already exists for category ${data.category}`);
    }

    return prisma.budget.create({
      data,
    });
  }

  static async updateBudget(
    id: number,
    userId: number,
    data: {
      limit: number;
    }
  ) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new Error("Budget not found or unauthorized");
    }

    return prisma.budget.update({
      where: { id },
      data: {
        limit: data.limit,
      },
    });
  }

  static async getBudgets(userId: number) {
    return prisma.budget.findMany({
      where: { userId },
    });
  }
}