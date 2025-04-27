-- Core Tables
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ExpenseCategory" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Main Transaction Tables
CREATE TABLE "Expense" (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  tags TEXT[],
  user_id INTEGER REFERENCES "User"(id),
  category_id INTEGER REFERENCES "ExpenseCategory"(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE "Budget" (
  id SERIAL PRIMARY KEY,
  monthly_limit DECIMAL(10,2) NOT NULL,
  user_id INTEGER REFERENCES "User"(id),
  category_id INTEGER REFERENCES "ExpenseCategory"(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit System
CREATE TYPE "UserAction" AS ENUM (
  'LOGIN', 
  'SIGNUP', 
  'LOGOUT',
  'PASSWORD_CHANGE',
  'LOGIN_FAILED'
);

CREATE TABLE "AuditLog" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "User"(id),
  action "UserAction" NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Ledger
CREATE TYPE "TransactionAction" AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'REVERSAL'
);

CREATE TABLE "Transaction" (
  id SERIAL PRIMARY KEY,
  action "TransactionAction" NOT NULL,
  expense_id INTEGER REFERENCES "Expense"(id),
  user_id INTEGER REFERENCES "User"(id),
  data_snapshot JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Reversal" (
  id SERIAL PRIMARY KEY,
  original_tx_id INTEGER REFERENCES "Transaction"(id) UNIQUE,
  reversed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_expense_user ON "Expense"(user_id);
CREATE INDEX idx_transaction_user ON "Transaction"(user_id);
CREATE INDEX idx_auditlog_user ON "AuditLog"(user_id);