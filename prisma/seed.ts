import { PrismaClient, UserRole } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.budget.deleteMany({});

  await prisma.transactionLedger.deleteMany({});

  await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true
    }
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      role: UserRole.USER,
      isVerified: true
    }
  });

  // Create test user for scoring
  const testUserPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'userscore@test.com',
      password: testUserPassword,
      role: UserRole.USER,
      isVerified: true
    }
  });

  // Create budgets for test user
  const testUserBudgets = await prisma.budget.createMany({
    data: [
      {
        category: 'Food',
        limit: 500.00,
        userId: testUser.id
      },
      {
        category: 'Transportation',
        limit: 200.00,
        userId: testUser.id
      },
      {
        category: 'Entertainment',
        limit: 300.00,
        userId: testUser.id
      }
    ]
  });

  // Create expenses for test user (mix of good and bad budget adherence)
  const testUserExpenses = await prisma.expense.createMany({
    data: [
      // Food expenses (within budget)
      {
        amount: 25.00,
        category: 'Food',
        date: new Date(),
        userId: testUser.id,
        notes: 'Lunch at restaurant',
        tags: ['lunch', 'work']
      },
      {
        amount: 150.00,
        category: 'Food',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        userId: testUser.id,
        notes: 'Grocery shopping',
        tags: ['groceries', 'monthly']
      },
      // Transportation (over budget)
      {
        amount: 180.00,
        category: 'Transportation',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        userId: testUser.id,
        notes: 'Uber rides',
        tags: ['uber', 'work']
      },
      // Entertainment (mixed tracking discipline)
      {
        amount: 50.00,
        category: 'Entertainment',
        date: new Date(),
        userId: testUser.id,
        notes: 'Movie night',
        tags: ['movies', 'weekend']
      },
      {
        amount: 100.00,
        category: 'Entertainment',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        userId: testUser.id,
        // No notes or tags for testing discipline score
      }
    ]
  });

  // Create some sample expenses for the regular user
  const expenses = await prisma.expense.createMany({
    data: [
      {
        amount: 50.00,
        category: 'Food',
        date: new Date(),
        userId: user.id
      },
      {
        amount: 100.00,
        category: 'Transportation',
        date: new Date(),
        userId: user.id
      }
    ]
  });

  // Create some sample budgets for the regular user
  const budgets = await prisma.budget.createMany({
    data: [
      {
        category: 'Food',
        limit: 500.00,
        userId: user.id
      },
      {
        category: 'Transportation',
        limit: 200.00,
        userId: user.id
      }
    ]
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });