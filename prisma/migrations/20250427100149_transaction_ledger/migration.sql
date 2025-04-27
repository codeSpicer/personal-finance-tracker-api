-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "TransactionLedger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "expenseId" INTEGER,
    "transactionType" "TransactionType" NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),

    CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
