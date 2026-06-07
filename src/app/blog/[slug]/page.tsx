import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Calendar, User, ArrowLeft } from 'lucide-react'

export const revalidate = 60

interface Props { params: { slug: string } }

async function getBlog(slug: string) {
  try {
    return await prisma.blog.findUnique({ where: { slug } })
  } catch { return null }
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await getBlog(params.slug)
  if (!blog || !blog.isPublished) notFound()

  return (
    <div className="min-h-screen pt-[84px] sm:pt-[108px] bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-secondary-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Cover image */}
        {blog.image && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-secondary-100">
            <Image src={blog.image} alt={blog.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" priority />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-secondary-400 mb-4">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {blog.author}</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(blog.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-secondary-900 leading-tight mb-4">
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-lg text-secondary-600 mb-8 leading-relaxed">{blog.excerpt}</p>
        )}

        <hr className="border-secondary-100 mb-8" />

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-secondary-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-secondary-100">
            {blog.tags.split(',').map(tag => (
              <span key={tag} className="text-xs bg-secondary-100 text-secondary-600 px-3 py-1 rounded-full">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline">
            <ArrowLeft className="w-4 h-4" /> All Blog Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
