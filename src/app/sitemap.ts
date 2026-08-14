import type { MetadataRoute } from 'next'
import { connectDB, Class } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://edulms.com'

  // Static URLs
  const staticUrls = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/class`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ] as MetadataRoute.Sitemap

  // Dynamic URLs from classes in the database
  try {
    await connectDB()
    const classes = await Class.find({ isActive: true }).select('slug').lean()
    
    const classUrls = classes.map((cls) => ({
      url: `${baseUrl}/class/${cls.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) as MetadataRoute.Sitemap

    return [...staticUrls, ...classUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticUrls
  }
}
