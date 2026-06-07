'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  ChevronDown, LogOut, User, Home, Menu, Store, Clock, LayoutDashboard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SalesmanNavbarProps {
  onMenuClick?: () => void
}

export default function SalesmanNavbar({ onMenuClick }: SalesmanNavbarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const isOnPOS = pathname === '/salesman/pos'
  const isAdmin = session?.user?.role === 'ADMIN'

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary-900 border-b border-secondary-800 shadow-lg">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-secondary-800 rounded-lg"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Logo */}
          <Link href="/salesman" className="flex items-center gap-3">
            <Image src="/logos/logo.png" alt="Logo" width={40} height={40} />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-white">POS System</span>
              <span className="hidden md:inline text-xs text-secondary-400 ml-2">Doctor Planet</span>
            </div>
          </Link>
        </div>

        {/* Center - Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isOnPOS ? (
            <Link
              href="/salesman"
              className="flex items-center gap-2 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/salesman/pos"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Store className="w-5 h-5" />
              Open POS
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Current Time */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary-800 rounded-lg text-secondary-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Visit Store */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-secondary-300 hover:bg-secondary-800 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Store</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-secondary-800 rounded-lg transition-colors"
            >
              {session?.user?.image ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary-500">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center border-2 border-primary-500">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.[0] || 'U'}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-secondary-400">{isAdmin ? 'Administrator' : 'Salesman'}</p>
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
                  <div className="px-4 py-3 border-b border-secondary-200 bg-secondary-50">
                    <p className="font-medium text-secondary-900">{session?.user?.name}</p>
                    <p className="text-sm text-secondary-500">{session?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-primary-600 hover:bg-primary-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/salesman/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/salesman/sales-history"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                    >
                      <Clock className="w-4 h-4" />
                      Sales History
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

      {/* Overlay for dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}
