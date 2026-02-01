'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface PageContent {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  sections?: Section[]
}

interface Section {
  id: string
  type: 'text' | 'list' | 'faq' | 'stats' | 'cta' | 'image' | 'cards'
  title?: string
  subtitle?: string
  content?: string
  items?: ListItem[] | FAQItem[] | StatItem[] | CardItem[]
  image?: string
  buttonText?: string
  buttonLink?: string
  bgColor?: 'white' | 'light' | 'dark' | 'primary'
}

interface ListItem {
  text: string
  icon?: string
}

interface FAQItem {
  question: string
  answer: string
}

interface StatItem {
  number: string
  label: string
}

interface CardItem {
  title: string
  description: string
  icon?: string
  image?: string
}

interface DynamicPageProps {
  slug: string
  defaultContent: PageContent
}

export default function DynamicPage({ slug, defaultContent }: DynamicPageProps) {
  const [content, setContent] = useState<PageContent>(defaultContent)
  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/pages/${slug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.content) {
            try {
              const parsed = JSON.parse(data.content)
              setContent({ ...defaultContent, ...parsed })
            } catch {
              // If JSON parsing fails, use default
            }
          }
          setIsPublished(data.isPublished)
        }
      } catch (error) {
        console.error('Failed to fetch page content:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug, defaultContent])

  if (loading) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isPublished) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">Coming Soon</h1>
          <p className="text-secondary-600 mb-8">This page is currently being updated.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  const getBgClass = (bgColor?: string) => {
    switch (bgColor) {
      case 'light': return 'bg-secondary-50'
      case 'dark': return 'bg-secondary-900 text-white'
      case 'primary': return 'bg-primary-600 text-white'
      default: return 'bg-white'
    }
  }

  return (
    <div className="min-h-screen pt-0 sm:pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-900 mb-4">
              {content.heroTitle}
            </h1>
            {content.heroSubtitle && (
              <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
                {content.heroSubtitle}
              </p>
            )}
          </motion.div>
          {content.heroImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto"
            >
              <Image src={content.heroImage} alt={content.heroTitle || ''} fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Dynamic Sections */}
      {content.sections?.map((section, index) => (
        <section key={section.id || index} className={`py-16 ${getBgClass(section.bgColor)}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Section Header */}
              {(section.title || section.subtitle) && (
                <div className={`mb-10 ${section.type === 'text' ? '' : 'text-center'}`}>
                  {section.title && (
                    <h2 className={`text-3xl font-heading font-bold mb-4 ${
                      section.bgColor === 'dark' || section.bgColor === 'primary' ? 'text-white' : 'text-secondary-900'
                    }`}>
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p className={`max-w-2xl ${section.type === 'text' ? '' : 'mx-auto'} ${
                      section.bgColor === 'dark' ? 'text-secondary-300' : 
                      section.bgColor === 'primary' ? 'text-primary-100' : 'text-secondary-600'
                    }`}>
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Text Section */}
              {section.type === 'text' && section.content && (
                <div 
                  className={`prose max-w-none ${
                    section.bgColor === 'dark' || section.bgColor === 'primary' ? 'prose-invert' : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }}
                />
              )}

              {/* List Section */}
              {section.type === 'list' && section.items && (
                <ul className="space-y-4 max-w-2xl">
                  {(section.items as ListItem[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary-600 mt-1">✓</span>
                      <span className={section.bgColor === 'dark' ? 'text-secondary-200' : 'text-secondary-700'}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* FAQ Section */}
              {section.type === 'faq' && section.items && (
                <div className="max-w-3xl mx-auto space-y-4">
                  {(section.items as FAQItem[]).map((item, i) => (
                    <details key={i} className="group bg-white rounded-xl border border-secondary-200 overflow-hidden">
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-secondary-900 hover:bg-secondary-50">
                        {item.question}
                        <span className="ml-4 text-primary-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-6 pb-6 text-secondary-600">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              {/* Stats Section */}
              {section.type === 'stats' && section.items && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {(section.items as StatItem[]).map((item, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-4xl md:text-5xl font-bold mb-2 ${
                        section.bgColor === 'dark' || section.bgColor === 'primary' ? 'text-white' : 'text-primary-600'
                      }`}>
                        {item.number}
                      </div>
                      <div className={
                        section.bgColor === 'dark' ? 'text-secondary-400' :
                        section.bgColor === 'primary' ? 'text-primary-200' : 'text-secondary-600'
                      }>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cards Section */}
              {section.type === 'cards' && section.items && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(section.items as CardItem[]).map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 hover:shadow-lg transition-shadow">
                      {item.image && (
                        <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                          <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-secondary-900 mb-3">{item.title}</h3>
                      <p className="text-secondary-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Section */}
              {section.type === 'cta' && (
                <div className="text-center">
                  {section.content && (
                    <p className={`text-lg mb-6 ${
                      section.bgColor === 'dark' ? 'text-secondary-300' : 'text-secondary-600'
                    }`}>
                      {section.content}
                    </p>
                  )}
                  {section.buttonText && (
                    <Link 
                      href={section.buttonLink || '/products'} 
                      className={`btn-primary inline-block ${
                        section.bgColor === 'primary' ? 'bg-white text-primary-600 hover:bg-secondary-100' : ''
                      }`}
                    >
                      {section.buttonText}
                    </Link>
                  )}
                </div>
              )}

              {/* Image Section */}
              {section.type === 'image' && section.image && (
                <div className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                  <Image src={section.image} alt={section.title || ''} fill sizes="(max-width: 768px) 100vw, 1024px" className="object-cover" />
                </div>
              )}
            </motion.div>
          </div>
        </section>
      ))}
    </div>
  )
}
