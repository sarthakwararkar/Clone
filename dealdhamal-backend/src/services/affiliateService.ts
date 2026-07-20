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
      const response = await fetch(`https://tools.vcommission.com/api/coupons.php?apikey=${apiKey}`);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[vCommission] API returned ${response.status}: ${errText}`);
        return [];
      }

      const rawData = await response.json();
      const couponsList = Array.isArray(rawData) ? rawData : ((rawData as any).coupons || []);

      if (!couponsList || !Array.isArray(couponsList) || couponsList.length === 0) {
        console.log('[vCommission] No coupons found in response');
        return [];
      }

      console.log(`[vCommission] Received ${couponsList.length} coupons from API`);

      // Accept ALL coupons — let upsertCoupons handle store creation
      const mappedCoupons: CouponData[] = [];
      for (const item of couponsList) {
        const merchantName = item.merchant_name || item.offer_name || '';
        if (!merchantName) continue;
        const storeSlug = this.slugify(this.normalizeAffiliateName(merchantName));
        if (!storeSlug) continue;

        const couponId = item.coupon_id || item.promo_id || item.id || '';
        const title = item.coupon_title || item.title || 'Untitled Offer';
        const description = item.coupon_description || item.description || null;
        const code = item.coupon_code || item.code || item.promo_code || null;
        const type = item.coupon_type || item.type || '';
        const trackingUrl = item.tracking_url || item.url || '';
        const validTill = item.valid_till || item.end_date || item.expiry_date || null;

        mappedCoupons.push({
          title: title,
          description: description,
          code: code,
          coupon_type: this.resolveType(this.mapCouponType(type), code),
          discount_value: title,
          affiliate_url: trackingUrl,
          source: 'vcommission' as CouponSource,
          external_id: String(couponId),
          store_slug: storeSlug,
          store_name: merchantName,
          store_logo_url: item.merchant_logo || item.logo || undefined,
          store_website_url: item.merchant_website || item.homepage || undefined,
          starts_at: item.start_date ? new Date(item.start_date) : null,
          expires_at: validTill ? new Date(validTill) : null,
          is_exclusive: false,
        });
      }

      console.log(`[vCommission] Mapped ${mappedCoupons.length} coupons for upsert`);
      return mappedCoupons;
    } catch (error) {
      console.error('[vCommission] Sync error:', error);
      return [];
    }
  }

  /**
   * Sync coupons from Cuelinks API v2.
   * Cuelinks provides offers/coupons data for Indian advertisers.
   *
   * API Docs: https://cuelinks.docs.apiary.io/
   * Auth: custom `token` header (NOT Authorization: Bearer)
   * Endpoint: GET https://www.cuelinks.com/api/v2/offers.json
   */
  async syncCuelinks(apiKey: string): Promise<CouponData[]> {
    console.log('[AffiliateService] Syncing Cuelinks coupons...');

    const allOffers: CouponData[] = [];
    let page = 1;
    const perPage = 100; // Max allowed by CueLinks
    let hasMore = true;

    try {
      while (hasMore) {
        const url = `https://www.cuelinks.com/api/v2/offers.json?page=${page}&per_page=${perPage}&country_id=1`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Token token="${apiKey}"`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Cuelinks API returned ${response.status} on page ${page}`);
          // If first page fails, the key or endpoint is wrong
          if (page === 1) return [];
          break;
        }

        const data = (await response.json()) as {
          offers?: Array<{
            id: string | number;
            title: string;
            description?: string;
            coupon_code?: string | null;
            offer_type?: string;
            discount?: string;
            url?: string;
            tracking_url?: string;
            merchant_name?: string;
            campaign_name?: string;
            start_date?: string;
            end_date?: string;
            expiry_date?: string;
            categories?: string[];
            status?: string;
          }>;
          total_pages?: number;
          current_page?: number;
          total_count?: number;
        };

        const offers = data.offers || [];
        if (offers.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of offers) {
          const rawName = (item as any).campaign || item.merchant_name || item.campaign_name || '';
          const merchantName = this.normalizeAffiliateName(rawName);
          const storeSlug = this.slugify(merchantName);
          if (!storeSlug) continue;

          // Determine the best tracking URL
          const affiliateUrl = item.tracking_url || item.url || '';

          allOffers.push({
            title: item.title || 'Untitled Offer',
            description: item.description || null,
            code: item.coupon_code || null,
            coupon_type: this.mapCouponType((item as any).type || item.offer_type || (item.coupon_code ? 'coupon' : 'deal')),
            discount_value: item.discount || item.title || '',
            affiliate_url: affiliateUrl,
            source: 'cuelinks' as CouponSource,
            external_id: String(item.id),
            store_slug: storeSlug,
            store_name: rawName || undefined,
            store_logo_url: (item as any).image_url || undefined,
            store_website_url: item.url || undefined,
            starts_at: item.start_date ? new Date(item.start_date) : null,
            expires_at: (item.end_date || item.expiry_date)
              ? new Date(item.end_date || item.expiry_date!)
              : null,
            is_exclusive: false,
          });
        }

        // Check if there are more pages
        if (data.total_pages && page < data.total_pages) {
          page++;
        } else if (offers.length < perPage) {
          hasMore = false;
        } else {
          page++;
          // Safety limit: don't fetch more than 20 pages (2000 offers)
          if (page > 20) hasMore = false;
        }
      }

      console.log(`[Cuelinks] Fetched ${allOffers.length} total offers across ${page} page(s)`);
      return allOffers;
    } catch (error) {
      console.error('[Cuelinks] Sync error:', error);
      return [];
    }
  }

  /**
   * Convert a plain URL into a CueLinks tracked affiliate URL.
   * Uses the CueLinks Link API v2.
   *
   * Endpoint: GET https://www.cuelinks.com/api/v2/links?url={url}
   * Returns the tracked URL, or the original URL if conversion fails.
   */
  async convertToCuelinkUrl(apiKey: string, originalUrl: string): Promise<string> {
    try {
      const response = await fetch(
        `https://www.cuelinks.com/api/v2/links?url=${encodeURIComponent(originalUrl)}`,
        {
          headers: {
            'token': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`[Cuelinks] Link conversion failed (${response.status}) for: ${originalUrl}`);
        return originalUrl;
      }

      const data = (await response.json()) as {
        tracking_url?: string;
        url?: string;
        short_url?: string;
        error?: string;
      };

      // Return the best available tracked URL
      const trackedUrl = data.tracking_url || data.url || data.short_url;
      if (trackedUrl) {
        return trackedUrl;
      }

      return originalUrl;
    } catch (error) {
      console.warn('[Cuelinks] Link conversion error:', error);
      return originalUrl;
    }
  }

  /**
   * Sync coupons from Admitad API.
   * Fetches all approved program coupons including logo, banner, and tracking links.
   * Paginates through all results automatically.
   */
  async syncAdmitad(clientId: string, clientSecret: string): Promise<CouponData[]> {
    console.log('[AffiliateService] Syncing Admitad coupons...');

    try {
      // Step 1: Get OAuth token (credentials must be in POST body as urlencoded params)
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'coupons',
      });

      const tokenResponse = await fetch('https://api.admitad.com/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error(`[Admitad] Token request failed (${tokenResponse.status}): ${errText}`);
        return [];
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string };
      const token = tokenData.access_token;

      if (!token) {
        console.error('[Admitad] No access_token in response');
        return [];
      }

      console.log('[Admitad] OAuth token obtained, fetching coupons...');

      // Step 2: Paginate through all coupons
      const allCoupons: CouponData[] = [];
      let offset = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://api.admitad.com/coupons/?limit=${limit}&offset=${offset}&language=en`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Admitad] Coupons API failed (${response.status}): ${errText}`);
          break;
        }

        const data = (await response.json()) as {
          count?: number;
          results?: Array<{
            id: number;
            name: string;
            description: string;
            promocode: string | null;
            coupon_type: string;   // Admitad field name is actually "coupon_type" or "type"
            type?: string;
            discount: string;
            goto_link: string;       // Deep link (may be untracked)
            tracking_link?: string;  // Proper affiliate tracking link
            image?: string;          // Banner/creative image URL
            logo?: string;           // Campaign logo URL
            campaign: {
              id: number;
              name: string;
              description?: string;
              homepage?: string;    // Merchant website
              logo?: string;        // Campaign/merchant logo
              site_url?: string;    // Merchant site URL
            };
            date_start: string | null;
            date_end: string | null;
            exclusive: boolean;
          }>;
        };

        if (!data.results || data.results.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of data.results) {
          const campaignName = item.campaign?.name || '';
          const storeSlug = this.slugify(this.normalizeAffiliateName(campaignName));
          if (!storeSlug) continue;

          // Prefer tracking_link (properly tagged), fall back to goto_link
          const affiliateUrl = item.tracking_link || item.goto_link || '';

          // Collect store imagery — campaign.logo takes priority over item.logo
          const logoUrl = item.campaign?.logo || item.logo || null;
          const bannerUrl = item.image || null;
          const websiteUrl = item.campaign?.homepage || item.campaign?.site_url || null;

          // Determine coupon type from Admitad's type field
          const rawType = item.type || item.coupon_type || '';

          allCoupons.push({
            title: item.name || 'Untitled Offer',
            description: item.description || null,
            code: item.promocode || null,
            coupon_type: this.resolveType(this.mapCouponType(rawType), item.promocode ?? null),
            discount_value: item.discount || '',
            affiliate_url: affiliateUrl,
            source: 'admitad' as CouponSource,
            external_id: String(item.id),
            store_slug: storeSlug,
            store_name: campaignName,
            store_logo_url: logoUrl || undefined,
            store_banner_url: bannerUrl || undefined,
            store_website_url: websiteUrl || undefined,
            starts_at: item.date_start ? new Date(item.date_start) : null,
            expires_at: item.date_end ? new Date(item.date_end) : null,
            is_exclusive: item.exclusive || false,
          });
        }

        console.log(`[Admitad] Fetched page offset=${offset}, got ${data.results.length} coupons (total so far: ${allCoupons.length})`);

        // Check if there are more pages
        if (data.count && allCoupons.length >= data.count) {
          hasMore = false;
        } else if (data.results.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }

      console.log(`[Admitad] Total coupons fetched: ${allCoupons.length}`);
      return allCoupons;
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
   * Auto-creates stores when they don't exist (from affiliate network data).
   */
  async upsertCoupons(couponDataList: CouponData[]): Promise<{ inserted: number; updated: number; storesCreated: number }> {
    let inserted = 0;
    let updated = 0;
    let storesCreated = 0;

    // Group coupons by store_slug
    const byStore = new Map<string, CouponData[]>();
    for (const coupon of couponDataList) {
      const existing = byStore.get(coupon.store_slug) || [];
      existing.push(coupon);
      byStore.set(coupon.store_slug, existing);
    }

    for (const [storeSlug, storeCoupons] of byStore) {
      if (!storeSlug) continue;

      // Resolve store ID — find existing or auto-create
      let store: { id: string; isNew?: boolean } | undefined;
      const [foundStore] = await this.db
        .select({ id: stores.id })
        .from(stores)
        .where(eq(stores.slug, storeSlug))
        .limit(1);

      if (foundStore) {
        store = { id: foundStore.id, isNew: false };
      }

      if (!store) {
        // Auto-create the store from affiliate data
        const sampleCoupon = storeCoupons[0];
        const storeName = sampleCoupon.store_name || this.unslugify(storeSlug);

        // Prefer store metadata from affiliate data, fall back to deriving from affiliate URL
        let websiteUrl: string | null = sampleCoupon.store_website_url || null;
        if (!websiteUrl && sampleCoupon.affiliate_url) {
          try {
            const urlObj = new URL(sampleCoupon.affiliate_url);
            if (!urlObj.hostname.includes('cuelinks') && !urlObj.hostname.includes('clnk.in') && !urlObj.hostname.includes('admitad.com')) {
              websiteUrl = `https://${urlObj.hostname}`;
            }
          } catch { /* ignore invalid URLs */ }
        }

        try {
          const [newStore] = await this.db
            .insert(stores)
            .values({
              name: storeName,
              slug: storeSlug,
              logo_url: sampleCoupon.store_logo_url || null,
              banner_url: sampleCoupon.store_banner_url || null,
              website_url: websiteUrl,
              affiliate_url: sampleCoupon.affiliate_url || null,
              affiliate_network: sampleCoupon.source || 'admitad',
              description: `Coupons and deals for ${storeName}`,
            })
            .onConflictDoNothing()
            .returning();

          if (newStore) {
            store = { id: newStore.id, isNew: true };
            storesCreated++;
            console.log(`[AffiliateService] ✅ Auto-created store: ${storeName} (${storeSlug})`);
          } else {
            // Race condition: another process created it — fetch it
            const [existingStore] = await this.db
              .select({ id: stores.id })
              .from(stores)
              .where(eq(stores.slug, storeSlug))
              .limit(1);
            if (existingStore) {
              store = { id: existingStore.id, isNew: false };
            } else {
              console.log(`[AffiliateService] Store creation failed for slug: ${storeSlug}, skipping ${storeCoupons.length} coupons`);
              continue;
            }
          }
        } catch (error) {
          console.error(`[AffiliateService] Error creating store ${storeSlug}:`, error);
          continue;
        }
      } else {
        // Store already exists — update logo/banner/website if they are currently null
        // (only fill in gaps, never overwrite manually-set data)
        const sampleCoupon = storeCoupons[0];
        const [existingStoreData] = await this.db
          .select({ id: stores.id, logo_url: stores.logo_url, banner_url: stores.banner_url, website_url: stores.website_url })
          .from(stores)
          .where(eq(stores.slug, storeSlug))
          .limit(1);

        if (existingStoreData) {
          const updates: Record<string, string | null> = {};
          if (!existingStoreData.logo_url && sampleCoupon.store_logo_url) {
            updates['logo_url'] = sampleCoupon.store_logo_url;
          }
          if (!existingStoreData.banner_url && sampleCoupon.store_banner_url) {
            updates['banner_url'] = sampleCoupon.store_banner_url;
          }
          if (!existingStoreData.website_url && sampleCoupon.store_website_url) {
            updates['website_url'] = sampleCoupon.store_website_url;
          }
          if (Object.keys(updates).length > 0) {
            await this.db
              .update(stores)
              .set({ ...updates, updated_at: sql`NOW()` })
              .where(eq(stores.slug, storeSlug));
            console.log(`[AffiliateService] 🖼️  Updated store imagery for: ${storeSlug}`, Object.keys(updates));
          }
        }
      }

      // Upsert coupons for this store
      // Mark is_exclusive=true for any store that was auto-created (not manually curated),
      // so these deals appear in the Exclusive Deals section on the homepage.
      const isNewlyCreatedStore = (store as any).isNew === true;

      for (const couponData of storeCoupons) {
        // Content Quality Validation (Issue 5)
        const lowerTitle = (couponData.title || '').toLowerCase().trim();
        const lowerDesc = (couponData.description || '').toLowerCase().trim();

        // 1. Reject if headline is generic CTA text
        const ctaPatterns = ['get deal', 'get code', 'grab deal', 'click here', 'shop now', 'show code', 'reveal code', 'reveal', 'grab offer'];
        if (ctaPatterns.includes(lowerTitle)) {
          continue;
        }

        // 2. Reject if title is too short (less than 10 characters)
        if (lowerTitle.length < 10) {
          continue;
        }

        // 3. Reject if description matches generic placeholder text
        const fillerPatterns = [
          'signup now & visit the page best features',
          'visit the page to get this deal',
          'visit the page for details',
          'best features',
        ];
        const isFillerDesc = fillerPatterns.some(pat => lowerDesc.includes(pat));
        if (isFillerDesc) {
          continue;
        }

        // 4. Reject if description is too short (less than 10 chars) unless it's identical to title and title is good
        if (lowerDesc.length < 10 && lowerDesc !== lowerTitle) {
          continue;
        }

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
              // Mark as exclusive if the coupon itself is marked OR if this store was just auto-created
              is_exclusive: couponData.is_exclusive || isNewlyCreatedStore,
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

    console.log(`[AffiliateService] Upsert complete: ${inserted} inserted, ${updated} updated, ${storesCreated} new stores created`);
    return { inserted, updated, storesCreated };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Normalize a raw affiliate campaign/merchant name before slugifying.
   * Strips platform tags like [Web, App, CPS], country codes like IN/WW/US,
   * and extra whitespace so that:
   *   "Bewakoof [Web, App, CPS] IN" → "Bewakoof"
   *   "hidemyname vpn"              → "hidemyname vpn"
   *   "Asus [CPS] IN"               → "Asus"
   */
  private normalizeAffiliateName(name: string): string {
    return name
      .replace(/\[.*?\]/g, '')           // Remove anything in [brackets]
      .replace(/\b(IN|WW|US|UK|AU|GLOBAL|CPS|CPA|CPL)\b/gi, '') // Strip country/model codes
      .replace(/\s+/g, ' ')             // Collapse whitespace
      .trim();
  }

  private resolveType(
    mapped: 'code' | 'deal' | 'cashback',
    code: string | null | undefined
  ): 'code' | 'deal' | 'cashback' {
    // Cashback is never overridden by code presence
    if (mapped === 'cashback') return 'cashback';
    // A non-empty code string → classify as a coupon code
    if (code && code.trim().length > 0) return 'code';
    // No code → it's a deal
    return 'deal';
  }

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

  /**
   * Convert a slug back to a readable store name.
   * e.g., 'abe-books' → 'Abe Books'
   */
  private unslugify(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export function createAffiliateService(db: Database): AffiliateService {
  return new AffiliateService(db);
}
