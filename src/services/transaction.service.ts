import { PrismaClient, TransactionType } from "../generated/prisma";

const prisma = new PrismaClient();

export class TransactionService {
  static async logTransaction(data: {
    userId: number;
    expenseId?: number;
    transactionType: TransactionType;
    oldData?: any;
    newData?: any;
  }) {
    return prisma.transactionLedger.create({
      data: {
        userId: data.userId,
        expenseId: data.expenseId,
        transactionType: data.transactionType,
        oldData: data.oldData ? JSON.stringify(data.oldData) : undefined,
        newData: data.newData ? JSON.stringify(data.newData) : undefined,
      },
    });
  }

  static async getLastTransaction(userId: number) {
    return prisma.transactionLedger.findFirst({
      where: {
        userId,
        isReversed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async reverseLastTransaction(userId: number) {
    // Start a transaction to ensure data consistency
    return prisma.$transaction(async (tx) => {
      // Get the last non-reversed transaction
      const lastTransaction = await tx.transactionLedger.findFirst({
        where: {
          userId,
          isReversed: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!lastTransaction) {
        throw new Error("No transaction found to reverse");
      }

      // Mark the transaction as reversed
      await tx.transactionLedger.update({
        where: { id: lastTransaction.id },
        data: {
          isReversed: true,
          reversedAt: new Date(),
        },
      });


      if (lastTransaction.transactionType === "CREATE") {
        if (lastTransaction.expenseId) {
          await tx.expense.delete({
            where: { id: lastTransaction.expenseId },
          });
        }
      } else if (lastTransaction.transactionType === "UPDATE") {
        if (lastTransaction.expenseId && lastTransaction.oldData) {
          const oldData = JSON.parse(lastTransaction.oldData as string);
          await tx.expense.update({
            where: { id: lastTransaction.expenseId },
            data: oldData,
          });
        }
      } else if (lastTransaction.transactionType === "DELETE") {
        if (lastTransaction.oldData) {
          const oldData = JSON.parse(lastTransaction.oldData as string);
          await tx.expense.create({
            data: {
              ...oldData,
              userId,
            },
          });
        }
      }

      // Log the reversal operation
      await tx.transactionLedger.create({
        data: {
          userId,
          expenseId: lastTransaction.expenseId,
          transactionType: lastTransaction.transactionType,

          oldData: lastTransaction.oldData
            ? JSON.stringify(lastTransaction.oldData)
            : undefined,
          newData: lastTransaction.newData
            ? JSON.stringify(lastTransaction.newData)
            : undefined,
          isReversed: true,
        },
      });

      return { success: true, reversed: lastTransaction };
    });
  }

  static async getTransactionHistory(userId: number) {
    return prisma.transactionLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
