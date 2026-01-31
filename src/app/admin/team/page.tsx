'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, X, Upload, 
  User, Award, Linkedin, Instagram, Facebook, Mail, Phone
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string | null
  isFounder: boolean
  order: number
  isActive: boolean
  email: string | null
  phone: string | null
  linkedin: string | null
  instagram: string | null
  facebook: string | null
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    isFounder: false,
    isActive: true,
    email: '',
    phone: '',
    linkedin: '',
    instagram: '',
    facebook: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/team')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      toast.error('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingMember
        ? `/api/admin/team/${editingMember.id}`
        : '/api/admin/team'

      const res = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingMember ? 'Member updated!' : 'Member added!')
        setShowModal(false)
        resetForm()
        fetchMembers()
      } else {
        toast.error('Failed to save member')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Member deleted!')
        fetchMembers()
      }
    } catch (error) {
      toast.error('Failed to delete member')
    }
  }

  const toggleActive = async (member: TeamMember) => {
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, isActive: !member.isActive }),
      })
      if (res.ok) {
        toast.success(member.isActive ? 'Member hidden' : 'Member visible')
        fetchMembers()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image || '',
      isFounder: member.isFounder,
      isActive: member.isActive,
      email: member.email || '',
      phone: member.phone || '',
      linkedin: member.linkedin || '',
      instagram: member.instagram || '',
      facebook: member.facebook || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingMember(null)
    setFormData({
      name: '',
      role: '',
      bio: '',
      image: '',
      isFounder: false,
      isActive: true,
      email: '',
      phone: '',
      linkedin: '',
      instagram: '',
      facebook: '',
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })
      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        toast.success('Image uploaded!')
      }
    } catch (error) {
      toast.error('Upload failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Team Members</h1>
          <p className="text-secondary-600">Manage founders and team displayed on About Us page</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Team Grid */}
      {members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <User className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No team members yet</h3>
          <p className="text-secondary-600 mb-4">Add your team to display on the About Us page</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border overflow-hidden ${
                !member.isActive ? 'opacity-60 border-secondary-200' : 'border-secondary-200'
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-20 h-20 text-primary-300" />
                  </div>
                )}
                {member.isFounder && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Founder
                  </div>
                )}
                {!member.isActive && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    Hidden
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-secondary-900 text-lg">{member.name}</h3>
                <p className="text-primary-600 font-medium text-sm mb-2">{member.role}</p>
                <p className="text-secondary-600 text-sm line-clamp-3">{member.bio}</p>

                {/* Social Links */}
                <div className="flex gap-2 mt-3">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-secondary-500 hover:text-secondary-600">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="text-green-600 hover:text-green-700">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" className="text-blue-600 hover:text-blue-700">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" className="text-pink-600 hover:text-pink-700">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {member.facebook && (
                    <a href={member.facebook} target="_blank" className="text-blue-700 hover:text-blue-800">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-secondary-100">
                  <button
                    onClick={() => toggleActive(member)}
                    className={`p-2 rounded-lg transition-colors ${
                      member.isActive ? 'text-green-600 hover:bg-green-50' : 'text-secondary-400 hover:bg-secondary-50'
                    }`}
                  >
                    {member.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-xl font-bold text-secondary-900">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    {formData.image ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden">
                        <Image src={formData.image} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center">
                        <User className="w-10 h-10 text-secondary-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg cursor-pointer hover:bg-secondary-200">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Or paste image URL"
                        className="mt-2 w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Huzaifa Shah"
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Role/Title *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                    placeholder="Software Engineer & Founder"
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bio *</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    required
                    rows={3}
                    placeholder="Write about this team member..."
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Founder Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isFounder: !prev.isFounder }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isFounder ? 'bg-yellow-500' : 'bg-secondary-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isFounder ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="text-sm text-secondary-700 flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    Mark as Founder/Partner
                  </span>
                </div>

                {/* Contact & Social Links */}
                <div className="space-y-3 pt-4 border-t border-secondary-200">
                  <label className="block text-sm font-medium text-secondary-700">Contact & Social Links (Optional)</label>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-secondary-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number (e.g., +92 300 1234567)"
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="LinkedIn URL"
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="Instagram URL"
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Facebook className="w-5 h-5 text-blue-700" />
                    <input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="Facebook URL"
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-primary-600' : 'bg-secondary-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="text-sm text-secondary-700">
                    {formData.isActive ? 'Visible on website' : 'Hidden'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingMember ? 'Update' : 'Add'} Member
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
