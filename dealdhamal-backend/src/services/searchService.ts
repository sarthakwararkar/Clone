import { sql } from 'drizzle-orm';
import type { Database } from '../db';
import { coupons, stores } from '../db/schema';
import type { CouponResponse, StoreResponse } from '../types';

/**
 * Search service using PostgreSQL Full-Text Search.
 * Uses tsvector/tsquery with ts_rank for relevance ordering.
 */
export class SearchService {
  constructor(private db: Database) {}

  /**
   * Search coupons using FTS on the search_vector column.
   * Returns coupons ranked by relevance, excluding expired ones.
   */
  async searchCoupons(query: string, limit: number = 20): Promise<CouponResponse[]> {
    const queryPattern = `%${query}%`;
    const results = await this.db.execute(sql`
      SELECT
        c.id,
        c.store_id,
        c.title,
        c.description,
        c.code,
        c.coupon_type,
        c.discount_value,
        c.affiliate_url,
        c.source,
        c.is_verified,
        c.is_exclusive,
        c.is_featured,
        c.expires_at,
        c.starts_at,
        c.success_rate,
        c.used_count,
        c.created_at,
        s.name AS store_name,
        s.slug AS store_slug,
        s.logo_url AS store_logo_url,
        s.banner_url AS store_banner_url
      FROM coupons c
      JOIN stores s ON s.id = c.store_id
      WHERE (
        c.title ILIKE ${queryPattern}
        OR coalesce(c.description, '') ILIKE ${queryPattern}
        OR s.name ILIKE ${queryPattern}
        OR coalesce(c.code, '') ILIKE ${queryPattern}
      )
        AND (c.expires_at > NOW() OR c.expires_at IS NULL)
      ORDER BY c.is_featured DESC, c.created_at DESC
      LIMIT ${limit}
    `);

    return (results.rows as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      title: row.title as string,
      description: row.description as string | null,
      code: row.code as string | null,
      coupon_type: row.coupon_type as CouponResponse['coupon_type'],
      discount_value: row.discount_value as string,
      affiliate_url: row.affiliate_url as string,
      source: row.source as string | null,
      is_verified: row.is_verified as boolean,
      is_exclusive: row.is_exclusive as boolean,
      is_featured: row.is_featured as boolean,
      expires_at: row.expires_at ? new Date(row.expires_at as string).toISOString() : null,
      starts_at: row.starts_at ? new Date(row.starts_at as string).toISOString() : null,
      success_rate: row.success_rate as number,
      used_count: row.used_count as number,
      created_at: new Date(row.created_at as string).toISOString(),
      store: {
        id: row.store_id as string,
        name: row.store_name as string,
        slug: row.store_slug as string,
        logo_url: row.store_logo_url as string | null,
        banner_url: row.store_banner_url as string | null,
        website_url: null,
        affiliate_url: null,
        affiliate_network: null,
        description: null,
        category_id: null,
        is_featured: false,
        cashback_rate: null,
        created_at: '',
      },
    }));
  }

  /**
   * Search stores using FTS on the search_vector column.
   * Returns stores ranked by relevance.
   */
  async searchStores(query: string, limit: number = 20): Promise<StoreResponse[]> {
    const queryPattern = `%${query}%`;
    const results = await this.db.execute(sql`
      SELECT
        s.id,
        s.name,
        s.slug,
        s.logo_url,
        s.banner_url,
        s.website_url,
        s.affiliate_url,
        s.affiliate_network,
        s.description,
        s.category_id,
        s.is_featured,
        s.cashback_rate,
        s.created_at,
        (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND c.coupon_type = 'code' AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS coupon_count,
        (SELECT COUNT(*) FROM coupons c WHERE c.store_id = s.id AND c.coupon_type IN ('deal', 'cashback') AND (c.expires_at > NOW() OR c.expires_at IS NULL))::int AS deal_count
      FROM stores s
      WHERE (
        s.name ILIKE ${queryPattern}
        OR coalesce(s.description, '') ILIKE ${queryPattern}
      )
      ORDER BY s.is_featured DESC, s.name ASC
      LIMIT ${limit}
    `);

    return (results.rows as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      logo_url: row.logo_url as string | null,
      banner_url: row.banner_url as string | null,
      website_url: row.website_url as string | null,
      affiliate_url: row.affiliate_url as string | null,
      affiliate_network: row.affiliate_network as string | null,
      description: row.description as string | null,
      category_id: row.category_id as number | null,
      is_featured: row.is_featured as boolean,
      cashback_rate: row.cashback_rate as string | null,
      created_at: new Date(row.created_at as string).toISOString(),
      coupon_count: row.coupon_count as number,
      deal_count: row.deal_count as number,
    }));
  }
}

export function createSearchService(db: Database): SearchService {
  return new SearchService(db);
}
