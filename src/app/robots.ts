import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth', '/favorites', '/settings/', '/services/new', '/services/*/edit'],
    },
    sitemap: 'https://www.needlinkapp.com/sitemap.xml',
  }
}
