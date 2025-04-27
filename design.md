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

[Place ERD diagram here]

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