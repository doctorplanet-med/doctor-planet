'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  User,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  ChevronRight,
  HelpCircle,
  Truck,
  RefreshCcw,
  Ruler,
  LogOut,
  Edit3,
} from 'lucide-react'
import toast from 'react-hot-toast'

const professions = [
  'Doctor',
  'Nurse',
  'Pharmacist',
  'Student',
  'Medical Student',
  'Lab Technician',
  'Paramedic',
  'Healthcare Administrator',
  'Other Healthcare Professional',
  'Other',
]

const countries = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
]

const supportLinks = [
  { href: '/faq', label: 'FAQ', icon: HelpCircle, color: 'bg-blue-50 text-blue-600' },
  { href: '/shipping', label: 'Shipping Info', icon: Truck, color: 'bg-green-50 text-green-600' },
  { href: '/returns', label: 'Return & Exchange', icon: RefreshCcw, color: 'bg-orange-50 text-orange-600' },
  { href: '/size-guide', label: 'Size Guide', icon: Ruler, color: 'bg-purple-50 text-purple-600' },
]

interface ProfileData {
  name: string
  phone: string
  countryCode: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  profession: string
  workplace: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    phone: '',
    countryCode: '+1',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    profession: '',
    workplace: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/profile')
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              // Extract country code from phone if exists
              let countryCode = '+1'
              let phoneNumber = data.user.phone || ''
              
              for (const c of countries) {
                if (phoneNumber.startsWith(c.code)) {
                  countryCode = c.code
                  phoneNumber = phoneNumber.slice(c.code.length)
                  break
                }
              }
              
              setFormData({
                name: data.user.name || '',
                phone: phoneNumber,
                countryCode,
                address: data.user.address || '',
                city: data.user.city || '',
                state: data.user.state || '',
                postalCode: data.user.postalCode || '',
                country: data.user.country || 'United States',
                profession: data.user.profession || '',
                workplace: data.user.workplace || '',
              })
              setIsProfileComplete(data.user.isProfileComplete)
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err)
        } finally {
          setIsFetching(false)
        }
      }
    }
    
    if (session) {
      fetchProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (!formData.name || !formData.phone || !formData.address || 
        !formData.city || !formData.postalCode || !formData.country || !formData.profession) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: `${formData.countryCode}${formData.phone}`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setIsProfileComplete(true)
        setShowEditForm(false)
        // Update session
        await update({ name: formData.name })
        // Redirect to checkout if came from there
        const redirectUrl = searchParams.get('redirect')
        if (redirectUrl) {
          router.push(redirectUrl)
        }
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="spinner" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      {/* Mobile View - Profile Menu */}
      {!showEditForm && (
        <div className="sm:hidden min-h-screen pt-0 sm:pt-20 pb-20 bg-secondary-50">
          <div className="px-4 py-6">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-5 mb-4"
            >
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      fill
                      sizes="64px"
                      className="rounded-full object-cover border-2 border-primary-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                      {session.user?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-secondary-900 truncate">
                    {session.user?.name || 'User'}
                  </h2>
                  <p className="text-sm text-secondary-500 truncate">
                    {session.user?.email}
                  </p>
                  <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isProfileComplete 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isProfileComplete ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Profile Complete
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Incomplete
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
            >
              <button
                onClick={() => setShowEditForm(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors border-b border-secondary-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-secondary-900">My Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-secondary-400" />
              </button>

              <Link
                href="/orders"
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-secondary-900">My Orders</span>
                </div>
                <ChevronRight className="w-5 h-5 text-secondary-400" />
              </Link>
            </motion.div>

            {/* Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider px-1 mb-3">
                Support
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
                  >
                    <div className={`p-3 rounded-full ${link.color} mb-2`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-secondary-700">{link.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Mobile View - Edit Form */}
      {showEditForm && (
        <div className="sm:hidden min-h-screen pt-0 sm:pt-20 pb-20 bg-secondary-50">
          <div className="px-4 py-4">
            {/* Back Button */}
            <button
              onClick={() => setShowEditForm(false)}
              className="flex items-center gap-2 text-secondary-600 mb-4"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-bold text-secondary-900 mb-4">Edit Profile</h1>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Info */}
              <div className="bg-white rounded-xl p-4 space-y-3">
                <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Personal Information
                </h2>
                
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name *"
                  className="input-field text-sm"
                  required
                />

                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="input-field w-24 text-sm"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="Phone Number *"
                    className="input-field flex-1 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl p-4 space-y-3">
                <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  Delivery Address
                </h2>
                
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street Address *"
                  className="input-field text-sm"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City *"
                    className="input-field text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="input-field text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Postal Code *"
                    className="input-field text-sm"
                    required
                  />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="input-field text-sm"
                    required
                  >
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-white rounded-xl p-4 space-y-3">
                <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary-600" />
                  Professional Information
                </h2>
                
                <select
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  className="input-field text-sm"
                  required
                >
                  <option value="">Select Profession *</option>
                  {professions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={formData.workplace}
                  onChange={(e) => setFormData(prev => ({ ...prev, workplace: e.target.value }))}
                  placeholder="Workplace / Hospital"
                  className="input-field text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" />
                    Save Profile
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Desktop View */}
      <div className="hidden sm:block min-h-screen pt-0 sm:pt-20 pb-12 bg-secondary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Profile'}
                    fill
                    sizes="96px"
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {session.user?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-heading font-bold text-secondary-900">
                My Profile
              </h1>
              <p className="text-secondary-600 mt-2">
                {session.user?.email}
              </p>
              
              {/* Profile Status */}
              <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                isProfileComplete 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {isProfileComplete ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Profile Complete
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Please complete your profile to place orders
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. John Smith"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="input-field w-32"
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="1234567890"
                        className="input-field flex-1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Medical Plaza, Suite 100"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="NY"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="10001"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="input-field"
                      required
                    >
                      {countries.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold">Professional Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Profession <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select your profession</option>
                      {professions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Workplace / Hospital
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.workplace}
                        onChange={(e) => setFormData(prev => ({ ...prev, workplace: e.target.value }))}
                        placeholder="City General Hospital"
                        className="input-field pl-12"
                      />
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg py-4"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" />
                    Save Profile
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  )
}
