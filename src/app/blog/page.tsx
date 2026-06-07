import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Calendar, User, ArrowRight } from 'lucide-react'

export const revalidate = 60

async function getBlogs() {
  try {
    return await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, image: true, author: true, tags: true, createdAt: true },
    })
  } catch { return [] }
}

export default async function BlogPage() {
  const blogs = await getBlogs()

  return (
    <div className="min-h-screen pt-[84px] sm:pt-[108px] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Heading */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-secondary-200" />
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 whitespace-nowrap">Blog</h1>
          <div className="flex-1 h-px bg-secondary-200" />
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 text-secondary-400">
            <p className="text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group bg-white border border-secondary-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative w-full aspect-[16/9] bg-secondary-100 overflow-hidden">
                  {blog.image ? (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-secondary-50">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-heading font-bold text-lg text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-sm text-secondary-500 line-clamp-2 mb-4">{blog.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-secondary-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {blog.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(blog.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
