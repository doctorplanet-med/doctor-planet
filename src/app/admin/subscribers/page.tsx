'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Trash2, Download, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Subscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: string
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/subscribers')
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data)
      }
    } catch (error) {
      toast.error('Failed to fetch subscribers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return

    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Subscriber deleted')
        fetchSubscribers()
      } else {
        toast.error('Failed to delete subscriber')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const exportToCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.isActive)
    const csv = [
      'Email,Subscribed Date',
      ...activeSubscribers.map(s => 
        `${s.email},${new Date(s.createdAt).toLocaleDateString()}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Subscribers exported!')
  }

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = subscribers.filter(s => s.isActive).length

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
          <h1 className="text-2xl font-bold text-secondary-900">Newsletter Subscribers</h1>
          <p className="text-secondary-600">Manage your newsletter subscriber list</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={activeCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-secondary-900">{subscribers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Active Subscribers</p>
              <p className="text-2xl font-bold text-secondary-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Mail className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">This Month</p>
              <p className="text-2xl font-bold text-secondary-900">
                {subscribers.filter(s => {
                  const subDate = new Date(s.createdAt)
                  const now = new Date()
                  return subDate.getMonth() === now.getMonth() && 
                         subDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full pl-12 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Subscribers List */}
      {filteredSubscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <Mail className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {search ? 'No subscribers found' : 'No subscribers yet'}
          </h3>
          <p className="text-secondary-600">
            {search ? 'Try a different search term' : 'Subscribers will appear here when users sign up'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-700">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-700">Subscribed</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredSubscribers.map((subscriber, index) => (
                <motion.tr
                  key={subscriber.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-secondary-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-secondary-900">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscriber.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
