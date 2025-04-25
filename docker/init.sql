-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for roles
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'REVERSAL');