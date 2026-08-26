-- Migration: Add ip_hash to coupon_reports and create unique index on (coupon_id, user_id)
-- Safe: Uses CONCURRENTLY and nullable column addition

ALTER TABLE coupon_reports ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Create unique index to prevent duplicate reports by the same user on the same coupon
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS coupon_reports_user_coupon_idx
  ON coupon_reports (coupon_id, user_id) WHERE user_id IS NOT NULL;
