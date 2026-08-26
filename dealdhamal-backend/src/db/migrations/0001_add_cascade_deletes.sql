-- Migration: Add CASCADE/SET NULL to coupon_clicks and coupon_reports FK constraints
-- Safe: only modifies FK constraints, no data loss

-- coupon_clicks: cascade on coupon delete, set null on user delete
ALTER TABLE coupon_clicks DROP CONSTRAINT IF EXISTS coupon_clicks_coupon_id_coupons_id_fk;
ALTER TABLE coupon_clicks ADD CONSTRAINT coupon_clicks_coupon_id_coupons_id_fk
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE;

ALTER TABLE coupon_clicks DROP CONSTRAINT IF EXISTS coupon_clicks_user_id_users_id_fk;
ALTER TABLE coupon_clicks ADD CONSTRAINT coupon_clicks_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- coupon_reports: cascade on coupon delete, set null on user delete
ALTER TABLE coupon_reports DROP CONSTRAINT IF EXISTS coupon_reports_coupon_id_coupons_id_fk;
ALTER TABLE coupon_reports ADD CONSTRAINT coupon_reports_coupon_id_coupons_id_fk
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE;

ALTER TABLE coupon_reports DROP CONSTRAINT IF EXISTS coupon_reports_user_id_users_id_fk;
ALTER TABLE coupon_reports ADD CONSTRAINT coupon_reports_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
