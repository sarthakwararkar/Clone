-- ============================================================================
-- Full-Text Search Trigger Functions for CouponDunia
-- Run this migration manually against your Neon database after drizzle-kit push
-- ============================================================================

-- ─── Stores: Auto-update search_vector on INSERT/UPDATE ─────────────────────

CREATE OR REPLACE FUNCTION stores_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stores_search_vector_trigger ON stores;
CREATE TRIGGER stores_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description
  ON stores
  FOR EACH ROW
  EXECUTE FUNCTION stores_search_vector_update();

-- Backfill existing stores
UPDATE stores SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- ─── Coupons: Auto-update search_vector on INSERT/UPDATE ────────────────────

CREATE OR REPLACE FUNCTION coupons_search_vector_update() RETURNS trigger AS $$
DECLARE
  store_name TEXT;
BEGIN
  SELECT name INTO store_name FROM stores WHERE id = NEW.store_id;
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(store_name, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coupons_search_vector_trigger ON coupons;
CREATE TRIGGER coupons_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description, store_id
  ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION coupons_search_vector_update();

-- Backfill existing coupons
UPDATE coupons SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(
    (SELECT name FROM stores WHERE stores.id = coupons.store_id), ''
  )), 'C');
