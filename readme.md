# Personal Finance Tracker API

A backend system for tracking personal finances with user authentication, expense management, budgeting, and behavioral scoring.

## Features

- User authentication with JWT
- Expense tracking with categories
- Monthly budget management
- Behavioral scoring system
- Notification system
- Transaction ledger with reversal capability

## Technologies

- Node.js with Express
- Prisma ORM
- PostgreSQL
- JWT for authentication
- TypeScript

## Setup

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/finance-tracker-prisma.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. Run database migrations

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## API Documentation

[Add your Swagger/Postman documentation link here]

## commit messages

-feat: add new feature
-fix: bug fix
-docs: documentation changes
-style: code formatting
-refactor: code restructuring
-test: adding tests
-chore: maintenance tasks
