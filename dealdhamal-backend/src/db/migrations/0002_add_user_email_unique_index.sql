-- Migration: Add unique index on users.email (case-insensitive) to prevent duplicate accounts
-- Safe: Uses CONCURRENTLY so it doesn't lock the table in production

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_email_lower_unique
  ON users (LOWER(email));
