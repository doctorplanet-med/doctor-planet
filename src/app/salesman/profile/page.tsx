'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  User, Mail, Phone, MapPin, CreditCard, Users, 
  Camera, Loader2, Calendar, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  address: string | null
  cnic: string | null
  gender: string | null
  granterName: string | null
  granterPhone: string | null
  createdAt: string
}

export default function SalesmanProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/salesman/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, or WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)')
      return
    }

    setUploading(true)
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      // First upload the image
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (!uploadRes.ok) {
        toast.error('Failed to upload image')
        return
      }

      const { url } = await uploadRes.json()

      // Then update the profile
      const updateRes = await fetch('/api/salesman/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      })

      if (updateRes.ok) {
        setProfile(prev => prev ? { ...prev, image: url } : null)
        // Update session
        await update({ image: url })
        toast.success('Profile picture updated!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">My Profile</h1>
        <p className="text-secondary-600">View your profile information</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center">
          <div className="relative inline-block">
            {profile.image ? (
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-14 h-14 text-primary-600" />
              </div>
            )}
            
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 bg-white text-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors border-2 border-primary-100"
              title="Change profile picture"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mt-4">{profile.name}</h2>
          <p className="text-primary-100">{profile.gender || 'N/A'}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-sm rounded-full">
            <Shield className="w-4 h-4 inline mr-1" />
            Salesman
          </span>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Email</p>
                  <p className="font-medium text-secondary-900">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Phone className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Phone</p>
                  <p className="font-medium text-secondary-900">{profile.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">CNIC</p>
                  <p className="font-medium text-secondary-900">{profile.cnic || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Joined</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Address</p>
              <p className="font-medium text-secondary-900">{profile.address || 'N/A'}</p>
            </div>
          </div>

          {/* Granter Info */}
          {(profile.granterName || profile.granterPhone) && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-4">
                Granter / Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Granter Name</p>
                    <p className="font-medium text-secondary-900">{profile.granterName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Granter Phone</p>
                    <p className="font-medium text-secondary-900">{profile.granterPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> You can only change your profile picture. 
              Contact your administrator to update other information.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
