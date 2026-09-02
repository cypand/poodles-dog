import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profile', '/my-listings', '/inquiries'],
    },
    sitemap: 'https://poodles.dog/sitemap.xml',
  }
}
