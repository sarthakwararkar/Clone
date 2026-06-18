import { eq, and, sql } from 'drizzle-orm';
import type { Database } from '../db';
import { coupons, stores } from '../db/schema';
import type { CouponData, CouponSource } from '../types';

/**
 * Affiliate service — fetches coupons from external affiliate networks
 * and upserts them into the database.
 *
 * Each sync function is a stub with the correct interface.
 * Fill in with real API logic when you have API keys.
 */
export class AffiliateService {
  constructor(private db: Database) {}

  /**
   * Sync coupons from vCommission API.
   * vCommission provides a JSON API for Indian affiliate programs.
   */
  /**
   * Sync coupons from vCommission API.
   * vCommission provides a JSON API for Indian affiliate programs.
   */
  async syncVCommission(apiKey: string): Promise<CouponData[]> {
    console.log('[AffiliateService] Syncing vCommission coupons...');

    try {
      const response = await fetch('https://api.vcommission.com/api/coupons', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`vCommission API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as {
        coupons?: Array<{
          coupon_id: string | number;
          coupon_title: string;
          coupon_code: string | null;
          coupon_type: string;
          valid_till: string | null;
          tracking_url: string;
          merchant_name: string;
          coupon_description?: string;
        }>;
      };

      if (!data.coupons || !Array.isArray(data.coupons)) {
        console.log('[vCommission] No coupons found in response');
        return [];
      }

      const dbStores = await this.db.select({ slug: stores.slug }).from(stores);
      const storeSlugs = new Set(dbStores.map(s => s.slug));

      const mappedCoupons: CouponData[] = [];
      for (const item of data.coupons) {
        const storeSlug = this.slugify(item.merchant_name || '');
        if (storeSlugs.has(storeSlug)) {
          mappedCoupons.push({
            title: item.coupon_title || 'Untitled Offer',
            description: item.coupon_description || null,
            code: item.coupon_code || null,
            coupon_type: this.mapCouponType(item.coupon_type),
            discount_value: item.coupon_title || '',
            affiliate_url: item.tracking_url || '',
            source: 'vcommission' as CouponSource,
            external_id: String(item.coupon_id),
            store_slug: storeSlug,
            starts_at: null,
            expires_at: item.valid_till ? new Date(item.valid_till) : null,
            is_exclusive: false,
          });
        }
      }

      return mappedCoupons;
    } catch (error) {
      console.error('[vCommission] Sync error:', error);
      return [];
    }
  }

  /**
   * Sync coupons from Cuelinks API.
   * Cuelinks provides coupons and deals data for Indian advertisers.
   */
  async syncCuelinks(apiKey: string): Promise<CouponData[]> {
    console.log('[AffiliateService] Syncing Cuelinks coupons...');

    try {
      const response = await fetch('https://api.cuelinks.com/v1/coupons', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Cuelinks API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as {
        coupons?: Array<{
          coupon_id: string | number;
          coupon_title: string;
          coupon_code: string | null;
          coupon_type: string;
          valid_till: string | null;
          tracking_url: string;
          merchant_name: string;
          coupon_description?: string;
        }>;
      };

      if (!data.coupons || !Array.isArray(data.coupons)) {
        console.log('[Cuelinks] No coupons found in response');
        return [];
      }

      const dbStores = await this.db.select({ slug: stores.slug }).from(stores);
      const storeSlugs = new Set(dbStores.map(s => s.slug));

      const mappedCoupons: CouponData[] = [];
      for (const item of data.coupons) {
        const storeSlug = this.slugify(item.merchant_name || '');
        if (storeSlugs.has(storeSlug)) {
          mappedCoupons.push({
            title: item.coupon_title || 'Untitled Offer',
            description: item.coupon_description || null,
            code: item.coupon_code || null,
            coupon_type: this.mapCouponType(item.coupon_type),
            discount_value: item.coupon_title || '',
            affiliate_url: item.tracking_url || '',
            source: 'cuelinks' as CouponSource,
            external_id: String(item.coupon_id),
            store_slug: storeSlug,
            starts_at: null,
            expires_at: item.valid_till ? new Date(item.valid_till) : null,
            is_exclusive: false,
          });
        }
      }

      return mappedCoupons;
    } catch (error) {
      console.error('[Cuelinks] Sync error:', error);
      return [];
    }
  }

  /**
   * Sync coupons from Admitad XML feed.
   * Admitad provides coupon data via XML/RSS feeds.
   */
  async syncAdmitad(clientId: string, clientSecret: string): Promise<CouponData[]> {
    console.log('[AffiliateService] Syncing Admitad coupons...');

    try {
      // Step 1: Get OAuth token
      const tokenResponse = await fetch('https://api.admitad.com/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: 'grant_type=client_credentials&scope=coupons',
      });

      if (!tokenResponse.ok) {
        console.error(`Admitad token request returned ${tokenResponse.status}`);
        return [];
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string };

      // Step 2: Fetch coupons
      const response = await fetch(
        'https://api.admitad.com/coupons/?limit=500&language=en',
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`Admitad API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as {
        results?: Array<{
          id: number;
          name: string;
          description: string;
          promocode: string;
          type: string;
          discount: string;
          goto_link: string;
          campaign: { name: string };
          date_start: string;
          date_end: string;
          exclusive: boolean;
        }>;
      };

      if (!data.results || !Array.isArray(data.results)) {
        console.log('[Admitad] No coupons found in response');
        return [];
      }

      return data.results.map((item) => ({
        title: item.name || 'Untitled Offer',
        description: item.description || null,
        code: item.promocode || null,
        coupon_type: this.mapCouponType(item.type),
        discount_value: item.discount || '',
        affiliate_url: item.goto_link || '',
        source: 'admitad' as CouponSource,
        external_id: String(item.id),
        store_slug: this.slugify(item.campaign?.name || ''),
        starts_at: item.date_start ? new Date(item.date_start) : null,
        expires_at: item.date_end ? new Date(item.date_end) : null,
        is_exclusive: item.exclusive || false,
      }));
    } catch (error) {
      console.error('[Admitad] Sync error:', error);
      return [];
    }
  }

  /**
   * Sync coupons from CJ Affiliate coupon RSS feed.
   */
  async syncCJAffiliate(apiKey: string): Promise<CouponData[]> {
    console.log('[AffiliateService] Syncing CJ Affiliate coupons...');

    try {
      const response = await fetch(
        `https://link-search.api.cj.com/v2/link-search?website-id=coupondunia&link-type=Coupon&records-per-page=100`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`CJ API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as {
        links?: Array<{
          'link-id': number;
          'link-name': string;
          description: string;
          'coupon-code': string;
          'link-type': string;
          'sale-commission': string;
          'click-url': string;
          'advertiser-name': string;
          'promotion-start-date': string;
          'promotion-end-date': string;
        }>;
      };

      if (!data.links || !Array.isArray(data.links)) {
        console.log('[CJ] No coupons found in response');
        return [];
      }

      return data.links.map((item) => ({
        title: item['link-name'] || 'Untitled Offer',
        description: item.description || null,
        code: item['coupon-code'] || null,
        coupon_type: item['coupon-code'] ? ('code' as const) : ('deal' as const),
        discount_value: item['sale-commission'] || '',
        affiliate_url: item['click-url'] || '',
        source: 'cj' as CouponSource,
        external_id: String(item['link-id']),
        store_slug: this.slugify(item['advertiser-name'] || ''),
        starts_at: item['promotion-start-date']
          ? new Date(item['promotion-start-date'])
          : null,
        expires_at: item['promotion-end-date']
          ? new Date(item['promotion-end-date'])
          : null,
        is_exclusive: false,
      }));
    } catch (error) {
      console.error('[CJ] Sync error:', error);
      return [];
    }
  }

  /**
   * Upsert coupons into the database.
   * Uses Drizzle's onConflictDoUpdate to upsert by external_id + source.
   * First resolves store_slug → store_id, creating stores if needed.
   */
  async upsertCoupons(couponDataList: CouponData[]): Promise<{ inserted: number; updated: number }> {
    let inserted = 0;
    let updated = 0;

    // Group coupons by store_slug
    const byStore = new Map<string, CouponData[]>();
    for (const coupon of couponDataList) {
      const existing = byStore.get(coupon.store_slug) || [];
      existing.push(coupon);
      byStore.set(coupon.store_slug, existing);
    }

    for (const [storeSlug, storeCoupons] of byStore) {
      if (!storeSlug) continue;

      // Resolve store ID (find or skip — don't auto-create stores)
      const [store] = await this.db
        .select({ id: stores.id })
        .from(stores)
        .where(eq(stores.slug, storeSlug))
        .limit(1);

      if (!store) {
        console.log(`[AffiliateService] Store not found for slug: ${storeSlug}, skipping ${storeCoupons.length} coupons`);
        continue;
      }

      // Upsert coupons for this store
      for (const couponData of storeCoupons) {
        try {
          const result = await this.db
            .insert(coupons)
            .values({
              store_id: store.id,
              title: couponData.title,
              description: couponData.description,
              code: couponData.code,
              coupon_type: couponData.coupon_type,
              discount_value: couponData.discount_value,
              affiliate_url: couponData.affiliate_url,
              source: couponData.source,
              external_id: couponData.external_id,
              is_exclusive: couponData.is_exclusive,
              starts_at: couponData.starts_at,
              expires_at: couponData.expires_at,
            })
            .onConflictDoUpdate({
              target: [coupons.external_id, coupons.source],
              set: {
                title: sql`EXCLUDED.title`,
                description: sql`EXCLUDED.description`,
                code: sql`EXCLUDED.code`,
                coupon_type: sql`EXCLUDED.coupon_type`,
                discount_value: sql`EXCLUDED.discount_value`,
                affiliate_url: sql`EXCLUDED.affiliate_url`,
                is_exclusive: sql`EXCLUDED.is_exclusive`,
                starts_at: sql`EXCLUDED.starts_at`,
                expires_at: sql`EXCLUDED.expires_at`,
                updated_at: sql`NOW()`,
              },
            })
            .returning();

          if (result.length > 0) {
            // Check if it was an insert or update by comparing created_at with updated_at
            const record = result[0];
            if (record.updated_at && record.created_at < record.updated_at) {
              updated++;
            } else {
              inserted++;
            }
          }
        } catch (error) {
          console.error(`[AffiliateService] Error upserting coupon: ${couponData.external_id}`, error);
        }
      }
    }

    console.log(`[AffiliateService] Upsert complete: ${inserted} inserted, ${updated} updated`);
    return { inserted, updated };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapCouponType(type: string): 'code' | 'deal' | 'cashback' {
    const normalized = type?.toLowerCase() || '';
    if (normalized.includes('code') || normalized.includes('coupon') || normalized.includes('promo')) {
      return 'code';
    }
    if (normalized.includes('cashback') || normalized.includes('cash back')) {
      return 'cashback';
    }
    return 'deal';
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
  }
}

export function createAffiliateService(db: Database): AffiliateService {
  return new AffiliateService(db);
}
