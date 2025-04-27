# Personal Finance Tracker API - System Design Document

## 1. Architecture Overview

The Personal Finance Tracker API follows a layered architecture pattern with clear separation of concerns. The system is built using Node.js with TypeScript, utilizing Express.js for the web framework and Prisma as the ORM layer.

### 1.1 Architectural Layers

1. **API Layer (Controllers)**

   - Handles HTTP requests and responses
   - Input validation and sanitization
   - Route definitions and endpoint mapping
   - Error handling and response formatting

2. **Service Layer**

   - Contains core business logic
   - Transaction management
   - Data processing and transformations
   - Business rule enforcement

3. **Data Access Layer (Prisma)**
   - Database operations
   - Data model definitions
   - Query building and execution
   - Data persistence

### 1.2 Project Structure

    ```bash
    /
    ├── prisma/           # Database schema and migrations
    ├── src/
    │   ├── controllers/  # Route handlers and request processing
    │   ├── services/    # Business logic implementation
    │   ├── middleware/  # Request middleware (auth, validation)
    │   ├── generated   # prisma client
    │   ├── config/     # Application configuration
    │   └── types/      # TypeScript type definitions
    ├── docker/          # Docker configurations
    ```

## 2. Core Components

### 2.1 Authentication & Authorization

- JWT-based authentication system
- Role-based access control (User/Admin)
- OTP verification for enhanced security
- Audit logging for security events

### 2.2 Service Layer Components

1. **User Service**

   - User registration and authentication
   - Profile management
   - Admin role management
   - OTP generation and verification

2. **Budget Service**

   - Budget creation and management
   - Category-wise budget allocation
   - Budget limit enforcement
   - Budget utilization tracking

3. **Expense Service**

   - Expense tracking and categorization
   - Transaction management
   - Expense analytics and reporting

4. **Score Service**
   - User behavior scoring
   - Budget adherence tracking
   - Usage frequency analysis
   - Financial discipline metrics

## 3. Database Schema Design

### 3.1 Entity Relationship Diagram

![Untitled](https://github.com/user-attachments/assets/0afddf1a-3303-4f58-bc63-685244cfbb60)

### 3.2 Core Entities

1. **User**

   - Primary entity for user management
   - Stores authentication and profile data
   - Links to expenses, budgets, and audit logs

2. **Expense**

   - Tracks individual financial transactions
   - Categorized for better organization
   - Supports tagging and notes for detailed tracking

3. **Budget**

   - Defines spending limits by category
   - Linked to user for personalized budgeting
   - Used for budget adherence scoring

4. **AuditLog**

   - Security event tracking
   - Records user actions for compliance
   - Stores metadata like IP address and user agent

5. **TransactionLedger**

   - Maintains a record of all data modifications
   - Enables transaction reversal functionality
   - Stores both old and new states for comparison

### 3.3 Database Relationships

1. User to Expense : One-to-Many

   - A user can have multiple expenses
   - Each expense belongs to exactly one user

2. User to Budget : One-to-Many

   - A user can set multiple category budgets
   - Each budget belongs to exactly one user

3. User to AuditLog : One-to-Many

   - A user has multiple audit log entries
   - Each audit log entry is associated with one user

4. User to TransactionLedger : One-to-Many
   - A user has multiple transaction records
   - Each transaction record belongs to one user

### 3.4 Indexing Strategy

- Primary keys on all ID fields
- Foreign key indexes for all relationship fields
- Index on User.email for fast lookup during authentication
- Composite indexes on frequently queried combinations:
  - (userId, category) on Expense table
  - (userId, date) on Expense table for date range queries
  - (userId, transactionType) on TransactionLedger

# Personal Finance Tracker API Design

## 4. Scoring System

The Personal Finance Tracker includes a comprehensive scoring system to help users track their financial discipline and progress. The scoring system evaluates users based on three key metrics:

### 4.1 Score Components

The total score (out of 100) is calculated based on the following components:

1. **Budget Adherence (30 points)**

   - Measures how well users stay within their defined budgets
   - Starting with a maximum of 30 points
   - Points are deducted based on budget overages
   - For each category where spending exceeds the budget, points are reduced proportionally to the overage amount
   - Formula: `30 - (sum of (spent - limit) / limit * 10)`
   - A perfect score requires staying within all budget limits

2. **Usage Frequency (30 points)**

   - Measures how regularly the user tracks expenses
   - Based on the number of unique days in the month with recorded expenses
   - Formula: `(uniqueDays / daysInMonth) * 30`
   - Maximum of 30 points for daily tracking
   - Encourages consistent expense tracking throughout the month

3. **Tracking Discipline (40 points)**
   - Measures the quality and detail of expense tracking
   - Based on the use of notes and tags for expenses
   - Formula: `((expenses with notes + expenses with tags) / (total expenses * 2)) * 40`
   - Maximum of 40 points when all expenses have both notes and tags
   - Encourages detailed expense documentation

### 4.2 Score Calculation

The system calculates scores on a monthly basis, considering:

- All expenses within the current month
- All budgets set by the user
- Activity patterns throughout the month

### 4.3 Score Interpretation

- **90-100**: Excellent financial discipline
- **70-89**: Good financial habits with room for improvement
- **50-69**: Average financial management
- **Below 50**: Needs significant improvement in financial tracking and discipline

### 4.4 Implementation Details

The scoring system is implemented in the `ScoreService` class, which provides:

- `calculateUserScore()`: Calculates the raw score and breakdown
- `getUserAnalytics()`: Provides comprehensive analytics including score, budget utilization, and spending summary

The score is recalculated in real-time whenever the user views their analytics, ensuring the most up-to-date evaluation of their financial habits.
