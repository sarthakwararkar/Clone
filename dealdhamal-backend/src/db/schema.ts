import {
  pgTable,
  pgEnum,
  uuid,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── Custom Types ───────────────────────────────────────────────────────────

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

// ─── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const couponTypeEnum = pgEnum('coupon_type', ['code', 'deal', 'cashback']);

// ─── Users Table ────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  role: userRoleEnum('role').default('user').notNull(),
  provider: text('provider').default('email').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }),
});

export const googleUsers = pgTable('google_users', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firebase_uid: text('firebase_uid').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }),
});

export const normalUsers = pgTable('normal_users', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firebase_uid: text('firebase_uid').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }),
});

// ─── Categories Table ───────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  icon_url: text('icon_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Stores Table ───────────────────────────────────────────────────────────

export const stores = pgTable(
  'stores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo_url: text('logo_url'),
    banner_url: text('banner_url'),
    website_url: text('website_url'),
    affiliate_url: text('affiliate_url'),
    affiliate_network: text('affiliate_network'),
    description: text('description'),
    category_id: integer('category_id').references(() => categories.id),
    is_featured: boolean('is_featured').default(false).notNull(),
    cashback_rate: text('cashback_rate'),
    search_vector: tsvector('search_vector'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => ({
    search_vector_idx: index('stores_search_vector_idx').using('gin', table.search_vector),
  })
);

// ─── Coupons Table ──────────────────────────────────────────────────────────

export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    store_id: uuid('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    code: text('code'),
    coupon_type: couponTypeEnum('coupon_type').notNull(),
    discount_value: text('discount_value'),
    affiliate_url: text('affiliate_url').notNull(),
    source: text('source'),
    external_id: text('external_id'),
    is_verified: boolean('is_verified').default(false).notNull(),
    is_exclusive: boolean('is_exclusive').default(false).notNull(),
    is_featured: boolean('is_featured').default(false).notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }),
    starts_at: timestamp('starts_at', { withTimezone: true }),
    success_rate: integer('success_rate').default(0).notNull(),
    used_count: integer('used_count').default(0).notNull(),
    search_vector: tsvector('search_vector'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => ({
    search_vector_idx: index('coupons_search_vector_idx').using('gin', table.search_vector),
    store_id_idx: index('coupons_store_id_idx').on(table.store_id),
    expires_at_idx: index('coupons_expires_at_idx').on(table.expires_at),
    is_featured_idx: index('coupons_is_featured_idx').on(table.is_featured),
    store_id_title_unique: uniqueIndex('coupons_store_id_title_idx').on(table.store_id, table.title),
    external_id_source_unique: uniqueIndex('coupons_external_id_source_idx').on(table.external_id, table.source),
  })
);

// ─── Saved Coupons Table ────────────────────────────────────────────────────

export const savedCoupons = pgTable(
  'saved_coupons',
  {
    id: serial('id').primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    coupon_id: uuid('coupon_id')
      .notNull()
      .references(() => coupons.id, { onDelete: 'cascade' }),
    saved_at: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    user_coupon_idx: uniqueIndex('saved_coupons_user_coupon_idx').on(table.user_id, table.coupon_id),
  })
);

// ─── Coupon Clicks Table ────────────────────────────────────────────────────

export const couponClicks = pgTable('coupon_clicks', {
  id: serial('id').primaryKey(),
  coupon_id: uuid('coupon_id')
    .notNull()
    .references(() => coupons.id),
  user_id: uuid('user_id').references(() => users.id),
  ip_hash: text('ip_hash'),
  clicked_at: timestamp('clicked_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Coupon Reports Table ───────────────────────────────────────────────────

export const couponReports = pgTable('coupon_reports', {
  id: serial('id').primaryKey(),
  coupon_id: uuid('coupon_id')
    .notNull()
    .references(() => coupons.id),
  user_id: uuid('user_id').references(() => users.id),
  worked: boolean('worked').notNull(),
  reported_at: timestamp('reported_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Deal Alerts Table ──────────────────────────────────────────────────────

export const dealAlerts = pgTable('deal_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  store_id: uuid('store_id').references(() => stores.id),
  category_id: integer('category_id').references(() => categories.id),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Newsletter Subscribers Table ──────────────────────────────────────────

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── YouTube Commentators Table ──────────────────────────────────────────────

export const youtubeCommentators = pgTable('youtube_commentators', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  youtube_handle: text('youtube_handle'),
  avatar_url: text('avatar_url'),
  channel_url: text('channel_url'),
  comment_text: text('comment_text'),
  is_featured: boolean('is_featured').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const googleUsersRelations = relations(googleUsers, ({ one }) => ({
  user: one(users, {
    fields: [googleUsers.id],
    references: [users.id],
  }),
}));

export const normalUsersRelations = relations(normalUsers, ({ one }) => ({
  user: one(users, {
    fields: [normalUsers.id],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  googleProfile: one(googleUsers),
  normalProfile: one(normalUsers),
  savedCoupons: many(savedCoupons),
  couponClicks: many(couponClicks),
  couponReports: many(couponReports),
  dealAlerts: many(dealAlerts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  stores: many(stores),
  dealAlerts: many(dealAlerts),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  category: one(categories, {
    fields: [stores.category_id],
    references: [categories.id],
  }),
  coupons: many(coupons),
  dealAlerts: many(dealAlerts),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  store: one(stores, {
    fields: [coupons.store_id],
    references: [stores.id],
  }),
  savedCoupons: many(savedCoupons),
  clicks: many(couponClicks),
  reports: many(couponReports),
}));

export const savedCouponsRelations = relations(savedCoupons, ({ one }) => ({
  user: one(users, {
    fields: [savedCoupons.user_id],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [savedCoupons.coupon_id],
    references: [coupons.id],
  }),
}));

export const couponClicksRelations = relations(couponClicks, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponClicks.coupon_id],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponClicks.user_id],
    references: [users.id],
  }),
}));

export const couponReportsRelations = relations(couponReports, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponReports.coupon_id],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponReports.user_id],
    references: [users.id],
  }),
}));

export const dealAlertsRelations = relations(dealAlerts, ({ one }) => ({
  user: one(users, {
    fields: [dealAlerts.user_id],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [dealAlerts.store_id],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [dealAlerts.category_id],
    references: [categories.id],
  }),
}));
