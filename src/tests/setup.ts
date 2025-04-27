import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function setupTestDb() {
  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.transactionLedger.deleteMany({});
  await prisma.user.deleteMany({});

  // Create test user
  const password = await bcrypt.hash("test123", 10);
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password,
      role: "USER",
      isVerified: true,
    },
  });

  return { user };
}

export async function cleanupTestDb() {
  await prisma.auditLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.transactionLedger.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
}
