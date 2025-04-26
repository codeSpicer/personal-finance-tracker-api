import { PrismaClient, UserRole } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    
  await prisma.auditLog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true
    }
  });

  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      role: UserRole.USER,
      isVerified: true
    }
  });

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