import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account/', '/search', '/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/account/', '/api/'],
      },
    ],
    sitemap: 'https://www.dealdhamal.in/sitemap.xml',
    host: 'https://www.dealdhamal.in',
  }
}
