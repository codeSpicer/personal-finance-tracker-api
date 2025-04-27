# 💰 Personal Finance Tracker API

![Node.js](https://img.shields.io/badge/Node.js-18-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-purple)

A secure backend system for personal finance management with budgeting analytics and behavioral scoring.

## Features

- User authentication with JWT
- Expense tracking with categories
- Monthly budget management
- Behavioral scoring system
- Notification system
- Transaction ledger with reversal capability
- OTP-based email verification
- Role-based access control (User/Admin)
- Audit logging for security events

## Technologies

- Node.js with Express
- Prisma ORM
- PostgreSQL
- JWT for authentication
- TypeScript

## Setup

### Prerequisites

- Docker Desktop
- Node.js 18+
- PostgreSQL 15

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/finance-tracker-prisma.git
   cd finance-tracker-prisma
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

   Start PostgreSQL container

   ```bash
   docker-compose up -d postgres
   ```

   Run db setup (generate, migrate, seed)

   ```bash
   npm run db:setup
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Run prisma studio to see database data
   ```bash
   npm run db:studio
   ```

## Project Structure

```bash
/
├── prisma/           # Database schema and migrations
├── src/              # Application source code
│   ├── controllers/  # Route handlers
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   └── app.ts        # Main application entry
├── docker/           # Docker configurations
└── .env.example      # Environment template
```

# Development

```
npm run dev # Start development server with nodemon
npm run start # Start production server
npm run build # Build TypeScript to JavaScript
```

<!-- ## API Documentation -->

<!-- [Add your Swagger/Postman documentation link here] -->

## commit messages

```
-feat: add new feature
-fix: bug fix
-docs: documentation changes
-style: code formatting
-refactor: code restructuring
-test: adding tests
-chore: maintenance tasks
```
