import { z } from 'zod'

const isDirectImageUrl = (url: string | null | undefined) => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('google.com') && (parsed.pathname.includes('imgres') || parsed.pathname.includes('url'))) {
      return false;
    }
    const pathname = parsed.pathname.toLowerCase();
    const hasImageExtension = pathname.endsWith('.png') || 
                              pathname.endsWith('.jpg') || 
                              pathname.endsWith('.jpeg') || 
                              pathname.endsWith('.webp') || 
                              pathname.endsWith('.gif') || 
                              pathname.endsWith('.svg');
    const isCloudinary = parsed.hostname.includes('cloudinary.com');
    const isLogoCDN = parsed.hostname.includes('logos.hunter.io');
    const isUnsplash = parsed.hostname.includes('unsplash.com');
    const isWikimedia = parsed.hostname.includes('wikimedia.org');
    const isRelativeSvg = url.startsWith('/') && url.endsWith('.svg');
    
    return hasImageExtension || isCloudinary || isLogoCDN || isUnsplash || isWikimedia || isRelativeSvg;
  } catch {
    return false;
  }
};

const imageRefinement = (val: string | undefined | null) => {
  if (!val) return true;
  return isDirectImageUrl(val);
};

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
  logo_url: z.string().optional().refine(imageRefinement, {
    message: 'Logo must be a direct image URL (png, jpg, svg, webp) and cannot be a search engine redirect',
  }),
  banner_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).refine(imageRefinement, {
    message: 'Banner must be a direct image URL (png, jpg, svg, webp) and cannot be a search engine redirect',
  }),
})

export type StoreSchemaValues = z.infer<typeof storeSchema>
