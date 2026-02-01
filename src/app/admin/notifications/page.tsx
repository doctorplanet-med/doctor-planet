'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  ShoppingBag,
  X,
  AlertTriangle,
  Check,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: string | null
  isRead: boolean
  createdAt: string
}

const typeIcons: Record<string, any> = {
  ORDER_PLACED: ShoppingBag,
  ORDER_CANCELLED: X,
  LOW_STOCK: AlertTriangle,
  DEFAULT: Bell,
}

const typeColors: Record<string, string> = {
  ORDER_PLACED: 'bg-green-100 text-green-600',
  ORDER_CANCELLED: 'bg-red-100 text-red-600',
  LOW_STOCK: 'bg-amber-100 text-amber-600',
  DEFAULT: 'bg-primary-100 text-primary-600',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/notifications?limit=100')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark notifications as read')
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      
      setNotifications(notifications.filter(n => n.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  // Delete all read notifications
  const deleteAllRead = async () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id)
    if (readIds.length === 0) {
      toast.error('No read notifications to delete')
      return
    }

    try {
      for (const id of readIds) {
        await fetch('/api/admin/notifications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: id }),
        })
      }
      
      setNotifications(notifications.filter(n => !n.isRead))
      toast.success(`Deleted ${readIds.length} notifications`)
    } catch (error) {
      toast.error('Failed to delete notifications')
    }
  }

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Get link for notification
  const getNotificationLink = (notification: Notification) => {
    if (notification.data) {
      try {
        const data = JSON.parse(notification.data)
        if (notification.type === 'ORDER_PLACED' && data.orderId) {
          return `/admin/orders`
        }
        if (notification.type === 'LOW_STOCK' && data.productId) {
          return `/admin/products/${data.productId}/edit`
        }
      } catch {}
    }
    return null
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
          <p className="text-secondary-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-secondary-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-secondary-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-secondary-400" />
            </div>
            <h3 className="font-semibold text-secondary-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-secondary-500">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'When something happens, you\'ll see it here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100">
            {filteredNotifications.map((notification, index) => {
              const Icon = typeIcons[notification.type] || typeIcons.DEFAULT
              const colorClass = typeColors[notification.type] || typeColors.DEFAULT
              const link = getNotificationLink(notification)
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 sm:p-6 hover:bg-secondary-50 transition-colors ${
                    !notification.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium text-secondary-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-primary-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-secondary-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm text-secondary-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {timeAgo(notification.createdAt)}
                            </span>
                            {link && (
                              <Link
                                href={link}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View details →
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 hover:bg-secondary-200 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-secondary-500" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-secondary-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {notifications.filter(n => n.isRead).length > 0 && (
          <div className="p-4 border-t border-secondary-100 bg-secondary-50 flex justify-center">
            <button
              onClick={deleteAllRead}
              className="text-sm text-secondary-500 hover:text-red-600 font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete all read notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
