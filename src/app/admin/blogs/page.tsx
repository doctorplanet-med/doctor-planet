'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, X, Loader2, Eye, EyeOff, Upload, FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import RichTextEditor from '@/components/admin/rich-text-editor'
import Image from 'next/image'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  image: string | null
  author: string
  isPublished: boolean
  tags: string | null
  createdAt: string
}

const emptyForm = { title: '', slug: '', excerpt: '', content: '', image: '', author: 'Doctor Planet', isPublished: false, tags: '' }

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/blogs')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBlogs(data) })
      .finally(() => setIsLoading(false))
  }, [])

  const openCreate = () => { setEditingBlog(null); setForm({ ...emptyForm }); setShowModal(true) }

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      image: blog.image || '',
      author: blog.author,
      isPublished: blog.isPublished,
      tags: blog.tags || '',
    })
    setShowModal(true)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'blogs')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      setForm(f => ({ ...f, image: url }))
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug || !form.content) { toast.error('Title, slug and content are required'); return }
    setSaving(true)
    try {
      const url = editingBlog ? `/api/admin/blogs/${editingBlog.id}` : '/api/admin/blogs'
      const method = editingBlog ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags: form.tags || null, excerpt: form.excerpt || null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const saved = await res.json()
      if (editingBlog) {
        setBlogs(b => b.map(bl => bl.id === saved.id ? saved : bl))
        toast.success('Blog updated!')
      } else {
        setBlogs(b => [saved, ...b])
        toast.success('Blog created!')
      }
      setShowModal(false)
    } catch (e: any) { toast.error(e.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return
    const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
    if (res.ok) { setBlogs(b => b.filter(bl => bl.id !== id)); toast.success('Deleted') }
    else toast.error('Failed to delete')
  }

  const togglePublish = async (blog: Blog) => {
    const res = await fetch(`/api/admin/blogs/${blog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...blog, isPublished: !blog.isPublished }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBlogs(b => b.map(bl => bl.id === updated.id ? updated : bl))
      toast.success(updated.isPublished ? 'Published!' : 'Unpublished')
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900">Blog Posts</h1>
          <p className="text-secondary-600 mt-1">{blogs.length} posts · {blogs.filter(b => b.isPublished).length} published</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Post
        </button>
      </div>

      {/* Blog list */}
      {blogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-500">No blog posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden flex items-start gap-4 p-4"
            >
              {/* Cover image */}
              <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-secondary-100 shrink-0">
                {blog.image ? (
                  <Image src={blog.image} alt={blog.title} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><FileText className="w-8 h-8 text-secondary-300" /></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-600'}`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-semibold text-secondary-900 truncate">{blog.title}</h3>
                {blog.excerpt && <p className="text-sm text-secondary-500 truncate mt-0.5">{blog.excerpt}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-secondary-400">
                  <span>{blog.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(blog)}
                  className={`p-2 rounded-lg transition-colors ${blog.isPublished ? 'text-green-600 hover:bg-green-50' : 'text-secondary-400 hover:bg-secondary-100'}`}
                  title={blog.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {blog.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(blog)} className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(blog.id)} className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-4"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
                <h3 className="text-xl font-heading font-semibold">{editingBlog ? 'Edit Blog Post' : 'New Blog Post'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Cover image */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Cover Image</label>
                  <div className="flex gap-3 items-start">
                    {form.image && (
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-secondary-100 shrink-0">
                        <Image src={form.image} alt="" fill sizes="96px" className="object-cover" />
                        <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))} className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="url"
                        value={form.image}
                        onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                        placeholder="https://... or upload below"
                        className="input-field mb-2"
                      />
                      <label className="cursor-pointer flex items-center gap-2 text-sm text-secondary-600 hover:text-primary-600">
                        <Upload className="w-4 h-4" />
                        {uploading ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span> : 'Upload image'}
                        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editingBlog ? f.slug : generateSlug(e.target.value) }))}
                    placeholder="Blog post title"
                    className="input-field"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className="input-field"
                    required
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    className="input-field"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Excerpt (short description)</label>
                  <textarea
                    value={form.excerpt}
                    onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                    placeholder="Brief summary shown in blog list..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Content *</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={v => setForm(f => ({ ...f, content: v }))}
                    placeholder="Write your blog content here..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="scrubs, medical, Pakistan"
                    className="input-field"
                  />
                </div>

                {/* Published */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                    className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-secondary-700 font-medium">Publish immediately</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingBlog ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
