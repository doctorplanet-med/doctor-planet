'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, ChevronDown, LogOut, User, Settings, 
  Home, Search, Menu, ShoppingBag, Mail, UserPlus,
  CheckCheck, Trash2, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: string | null
  isRead: boolean
  createdAt: string
}

interface AdminNavbarProps {
  onMenuClick?: () => void
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications?limit=20')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
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
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
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
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(notifications.filter(n => n.id !== notificationId))
      if (notification && !notification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Handle notification click - navigate to relevant page
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    setShowNotifications(false)

    const data = notification.data ? JSON.parse(notification.data) : {}

    switch (notification.type) {
      case 'ORDER_PLACED':
        router.push(`/admin/orders`)
        break
      case 'CONTACT_MESSAGE':
        router.push('/admin/messages')
        break
      case 'NEW_SUBSCRIBER':
        router.push('/admin/subscribers')
        break
      default:
        // Stay on current page
        break
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return <ShoppingBag className="w-5 h-5 text-green-600" />
      case 'CONTACT_MESSAGE':
        return <Mail className="w-5 h-5 text-blue-600" />
      case 'NEW_SUBSCRIBER':
        return <UserPlus className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-secondary-600" />
    }
  }

  // Get background color based on notification type
  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return 'bg-green-50'
      case 'CONTACT_MESSAGE':
        return 'bg-blue-50'
      case 'NEW_SUBSCRIBER':
        return 'bg-purple-50'
      default:
        return 'bg-secondary-50'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-secondary-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-secondary-600" />
          </button>

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logos/logo.png" alt="Logo" width={40} height={40} />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-secondary-900">Admin Panel</span>
              <span className="hidden md:inline text-xs text-secondary-500 ml-2">Doctor Planet</span>
            </div>
          </Link>
        </div>

        {/* Center - Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Visit Store */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Visit Store</span>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-secondary-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-secondary-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-secondary-200 bg-secondary-50 flex items-center justify-between">
                    <h3 className="font-semibold text-secondary-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-secondary-500">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No notifications yet</p>
                        <p className="text-xs text-secondary-400 mt-1">
                          You'll see orders, messages & subscribers here
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 transition-colors ${
                            !notification.isRead ? 'bg-primary-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-secondary-900' : 'font-medium text-secondary-700'}`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => deleteNotification(notification.id, e)}
                                  className="p-1 hover:bg-secondary-200 rounded text-secondary-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-secondary-500 truncate mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-secondary-400 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-secondary-200 bg-secondary-50">
                      <Link
                        href="/admin/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              {session?.user?.image ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Admin'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.[0] || 'A'}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-900">{session?.user?.name}</p>
                <p className="text-xs text-secondary-500">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-400 hidden md:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-secondary-200 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-secondary-200">
                    <p className="font-medium text-secondary-900">{session?.user?.name}</p>
                    <p className="text-sm text-secondary-500">{session?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Overlay for dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}
