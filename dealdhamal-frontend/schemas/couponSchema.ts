import { z } from 'zod'

export const couponSchema = z.object({
  store_id: z.string().uuid('Please select a store'),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(2000).optional(),
  coupon_type: z.enum(['code', 'deal', 'cashback']),
  code: z.string().max(100).optional(),
  discount_value: z.string().optional(),
  affiliate_url: z.string().url('Must be a valid URL'),
  expires_at: z.string().optional(),
  is_verified: z.boolean(),
  is_featured: z.boolean(),
  is_exclusive: z.boolean(),
})

export type CouponSchemaValues = z.infer<typeof couponSchema>
