import { z } from 'zod'

export const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliate_url: z.string().url('Affiliate URL is required').min(1),
  affiliate_network: z.enum(['vcommission', 'admitad', 'cj', 'manual']).optional(),
  description: z.string().max(2000).optional(),
  category_id: z.number().int().positive().optional(),
  cashback_rate: z.string().optional(),
  is_featured: z.boolean(),
  logo_url: z.string().optional(),
})

export type StoreSchemaValues = z.infer<typeof storeSchema>
