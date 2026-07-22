import { eq, and, or, isNull, gt, desc, sql, count } from 'drizzle-orm';
import type { Database } from '../db';
import { coupons, stores, couponClicks, couponReports } from '../db/schema';
import type {
  CouponResponse,
  CouponCreateInput,
  CouponUpdateInput,
  PaginatedResponse,
  PaginationParams,
} from '../types';

/**
 * Coupon service — business logic for coupon operations.
 */
export class CouponService {
  constructor(private db: Database) {}

  /**
   * List coupons with filtering and pagination.
   * Excludes expired coupons, sorts by featured then used_count.
   */
  async listCoupons(params: {
    storeSlug?: string;
    categorySlug?: string;
    type?: 'code' | 'deal' | 'cashback';
    featured?: boolean;
    exclusive?: boolean;
    sort?: 'featured' | 'latest' | 'popular' | 'smart';
    diverse?: boolean;
    pagination: PaginationParams;
  }): Promise<PaginatedResponse<CouponResponse>> {
    const { storeSlug, categorySlug, type, featured, exclusive, sort, diverse, pagination } = params;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Build conditions for Drizzle ORM relations (unused, but kept for compatibility)
    const conditions = [
      or(gt(coupons.expires_at, new Date()), isNull(coupons.expires_at)),
    ];

    if (type) {
      conditions.push(eq(coupons.coupon_type, type));
    }

    if (featured !== undefined) {
      conditions.push(eq(coupons.is_featured, featured));
    }

    // Build sort/orderBy clause first
    let orderBy = sql`c.is_featured DESC, c.created_at DESC`;
    let outerOrderBy = sql`is_featured DESC, created_at DESC`;
    if (sort === 'latest') {
      orderBy = sql`c.created_at DESC`;
      outerOrderBy = sql`created_at DESC`;
    } else if (sort === 'popular') {
      orderBy = sql`c.used_count DESC`;
      outerOrderBy = sql`used_count DESC`;
    } else if (sort === 'featured') {
      orderBy = sql`c.is_featured DESC, c.created_at DESC`;
      outerOrderBy = sql`is_featured DESC, created_at DESC`;
    } else if (sort === 'smart') {
      orderBy = sql`(
        (c.used_count * 3) + 
        (c.success_rate * 2) + 
        (CASE WHEN c.code IS NOT NULL AND c.code != '' THEN 20 ELSE 0 END) +
        (CASE WHEN c.is_verified = true THEN 15 ELSE 0 END) +
        (CASE 
          WHEN c.expires_at IS NULL THEN 5
          WHEN c.expires_at > NOW() + INTERVAL '30 days' THEN 10
          ELSE 2 
        END)
      ) DESC, c.created_at DESC`;
      outerOrderBy = sql`smart_score DESC, created_at DESC`;
    }

    // Build select fields
    let selectClause = sql`
      SELECT
        c.id, c.store_id, c.title, c.description, c.code, c.coupon_type,
        c.discount_value, c.affiliate_url, c.source, c.is_verified, c.is_exclusive,
        c.is_featured, c.expires_at, c.starts_at, c.success_rate, c.used_count,
        c.created_at,
        s.name AS store_name, s.slug AS store_slug, s.logo_url AS store_logo_url,
        s.banner_url AS store_banner_url,
        (
          (c.used_count * 3) + 
          (c.success_rate * 2) + 
          (CASE WHEN c.code IS NOT NULL AND c.code != '' THEN 20 ELSE 0 END) +
          (CASE WHEN c.is_verified = true THEN 15 ELSE 0 END) +
          (CASE 
            WHEN c.expires_at IS NULL THEN 5
            WHEN c.expires_at > NOW() + INTERVAL '30 days' THEN 10
            ELSE 2 
          END)
        ) AS smart_score
    `;

    if (diverse) {
      selectClause = sql`
        ${selectClause},
        ROW_NUMBER() OVER (
          PARTITION BY c.store_id
          ORDER BY ${orderBy}
        ) as store_rank
      `;
    }

    // Build from tables clause
    let fromClause = sql`
      FROM coupons c
      JOIN stores s ON s.id = c.store_id
    `;
    if (categorySlug) {
      fromClause = sql`${fromClause} JOIN categories cat ON cat.id = s.category_id`;
    }

    // Build where conditions
    const whereParts: ReturnType<typeof sql>[] = [
      sql`(c.expires_at > NOW() OR c.expires_at IS NULL)`,
    ];

    if (storeSlug) {
      whereParts.push(sql`s.slug = ${storeSlug}`);
    }

    if (categorySlug) {
      whereParts.push(sql`cat.slug = ${categorySlug}`);
    }

    if (type) {
      whereParts.push(sql`c.coupon_type = ${type}`);
    }

    if (featured !== undefined) {
      whereParts.push(sql`c.is_featured = ${featured}`);
    }

    if (exclusive !== undefined) {
      whereParts.push(sql`c.is_exclusive = ${exclusive}`);
    }

    const whereClause = sql.join(whereParts, sql` AND `);

    // Final dynamic queries combining partitions if diverse is true
    let finalQuery;
    let finalCountQuery;

    if (diverse) {
      finalQuery = sql`
        SELECT * FROM (
          ${selectClause} ${fromClause} WHERE ${whereClause}
        ) ranked
        WHERE store_rank <= 2
        ORDER BY ${outerOrderBy}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      finalCountQuery = sql`
        SELECT COUNT(*)::int AS total FROM (
          ${selectClause} ${fromClause} WHERE ${whereClause}
        ) ranked
        WHERE store_rank <= 2
      `;
    } else {
      finalQuery = sql`
        ${selectClause} ${fromClause} WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      finalCountQuery = sql`
        SELECT COUNT(*)::int AS total
        ${fromClause} WHERE ${whereClause}
      `;
    }

    const [dataResult, countResult] = await Promise.all([
      this.db.execute(finalQuery),
      this.db.execute(finalCountQuery),
    ]);

    const total = (countResult.rows[0] as Record<string, unknown>)?.total as number || 0;
    const totalPages = Math.ceil(total / limit);

    const data = (dataResult.rows as Record<string, unknown>[]).map((row) =>
      this.mapRowToCouponResponse(row)
    );

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get a single coupon by ID with store info.
   */
  async getCouponById(id: string): Promise<CouponResponse | null> {
    const result = await this.db.execute(sql`
      SELECT
        c.id, c.store_id, c.title, c.description, c.code, c.coupon_type,
        c.discount_value, c.affiliate_url, c.source, c.is_verified, c.is_exclusive,
        c.is_featured, c.expires_at, c.starts_at, c.success_rate, c.used_count,
        c.created_at,
        s.id AS s_id, s.name AS store_name, s.slug AS store_slug,
        s.logo_url AS store_logo_url, s.banner_url AS store_banner_url,
        s.website_url AS store_website_url,
        s.affiliate_url AS store_affiliate_url, s.affiliate_network AS store_affiliate_network,
        s.description AS store_description, s.category_id AS store_category_id,
        s.is_featured AS store_is_featured, s.cashback_rate AS store_cashback_rate,
        s.created_at AS store_created_at
      FROM coupons c
      JOIN stores s ON s.id = c.store_id
      WHERE c.id = ${id}
    `);

    if (!result.rows.length) return null;

    const row = result.rows[0] as Record<string, unknown>;
    return this.mapRowToCouponResponse(row, true);
  }

  /**
   * Create a new coupon.
   */
  async createCoupon(input: CouponCreateInput): Promise<CouponResponse> {
    const [created] = await this.db
      .insert(coupons)
      .values({
        store_id: input.store_id,
        title: input.title,
        description: input.description ?? null,
        code: input.code ?? null,
        coupon_type: input.coupon_type,
        discount_value: input.discount_value,
        affiliate_url: input.affiliate_url,
        source: input.source ?? 'manual',
        external_id: input.external_id ?? null,
        is_verified: input.is_verified ?? false,
        is_exclusive: input.is_exclusive ?? false,
        is_featured: input.is_featured ?? false,
        starts_at: input.starts_at ? new Date(input.starts_at) : null,
        expires_at: input.expires_at ? new Date(input.expires_at) : null,
      })
      .returning();

    return this.getCouponById(created.id) as Promise<CouponResponse>;
  }

  /**
   * Update a coupon by ID.
   */
  async updateCoupon(id: string, input: CouponUpdateInput): Promise<CouponResponse | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.code !== undefined) updateData.code = input.code;
    if (input.coupon_type !== undefined) updateData.coupon_type = input.coupon_type;
    if (input.discount_value !== undefined) updateData.discount_value = input.discount_value;
    if (input.affiliate_url !== undefined) updateData.affiliate_url = input.affiliate_url;
    if (input.is_verified !== undefined) updateData.is_verified = input.is_verified;
    if (input.is_exclusive !== undefined) updateData.is_exclusive = input.is_exclusive;
    if (input.is_featured !== undefined) updateData.is_featured = input.is_featured;
    if (input.starts_at !== undefined) updateData.starts_at = new Date(input.starts_at);
    if (input.expires_at !== undefined) updateData.expires_at = new Date(input.expires_at);

    const [updated] = await this.db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();

    if (!updated) return null;
    return this.getCouponById(id);
  }

  /**
   * Soft delete a coupon by setting expires_at = now().
   */
  async softDeleteCoupon(id: string): Promise<boolean> {
    const [updated] = await this.db
      .update(coupons)
      .set({
        expires_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(coupons.id, id))
      .returning();

    return !!updated;
  }

  /**
   * Record a click on a coupon and increment used_count.
   * Returns the affiliate redirect URL.
   */
  async recordClick(
    couponId: string,
    userId: string | null,
    ipHash: string
  ): Promise<string | null> {
    const [coupon] = await this.db
      .select({ affiliate_url: coupons.affiliate_url })
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (!coupon) return null;

    // Record click and increment used_count in parallel
    await Promise.all([
      this.db.insert(couponClicks).values({
        coupon_id: couponId,
        user_id: userId,
        ip_hash: ipHash,
      }),
      this.db
        .update(coupons)
        .set({
          used_count: sql`${coupons.used_count} + 1`,
          updated_at: new Date(),
        })
        .where(eq(coupons.id, couponId)),
    ]);

    return coupon.affiliate_url;
  }

  /**
   * Record a user report on whether a coupon worked.
   * Recalculates and updates success_rate.
   */
  async recordReport(
    couponId: string,
    userId: string | null,
    worked: boolean
  ): Promise<boolean> {
    // Check if coupon exists
    const [coupon] = await this.db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (!coupon) return false;

    // Insert the report
    await this.db.insert(couponReports).values({
      coupon_id: couponId,
      user_id: userId,
      worked,
    });

    // Recalculate success rate
    const result = await this.db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE worked = true)::int AS successful
      FROM coupon_reports
      WHERE coupon_id = ${couponId}
    `);

    const row = result.rows[0] as Record<string, number>;
    const total = row.total || 0;
    const successful = row.successful || 0;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

    const updateData: Record<string, any> = { 
      success_rate: successRate, 
      updated_at: new Date() 
    };

    if (total >= 3 && successRate < 40) {
      updateData.expires_at = new Date(Date.now() - 1000);
    }

    await this.db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, couponId));

    return true;
  }

  /**
   * Map a raw database row to a CouponResponse.
   */
  private mapRowToCouponResponse(
    row: Record<string, unknown>,
    includeFullStore: boolean = false
  ): CouponResponse {
    const response: CouponResponse = {
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
    };

    if (includeFullStore && row.s_id) {
      response.store = {
        id: row.s_id as string,
        name: row.store_name as string,
        slug: row.store_slug as string,
        logo_url: (row.store_logo_url as string) || null,
        banner_url: (row.store_banner_url as string) || null,
        website_url: (row.store_website_url as string) || null,
        affiliate_url: (row.store_affiliate_url as string) || null,
        affiliate_network: (row.store_affiliate_network as string) || null,
        description: (row.store_description as string) || null,
        category_id: (row.store_category_id as number) || null,
        is_featured: (row.store_is_featured as boolean) || false,
        cashback_rate: (row.store_cashback_rate as string) || null,
        created_at: new Date(row.store_created_at as string).toISOString(),
      };
    } else if (row.store_name) {
      response.store = {
        id: row.store_id as string,
        name: row.store_name as string,
        slug: row.store_slug as string,
        logo_url: (row.store_logo_url as string) || null,
        banner_url: (row.store_banner_url as string) || null,
        website_url: null,
        affiliate_url: null,
        affiliate_network: null,
        description: null,
        category_id: null,
        is_featured: false,
        cashback_rate: null,
        created_at: '',
      };
    }

    return response;
  }
}

export function createCouponService(db: Database): CouponService {
  return new CouponService(db);
}
