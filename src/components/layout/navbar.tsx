'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  LayoutDashboard,
  ChevronDown,
  Home,
  Grid3X3,
  Heart
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/products?category=medical-clothes', label: 'Clothes' },
  { href: '/products?category=medical-shoes', label: 'Shoes' },
  { href: '/products?category=medical-equipment', label: 'Equipment' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = useCartStore((state) => state.items.length > 0 ? state.getItemCount() : 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAdmin = session?.user?.role === 'ADMIN'
  const isSalesman = session?.user?.role === 'SALESMAN'

  return (
    <>
      {/* Top Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg'
            : 'bg-white/95 backdrop-blur-md'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-9 h-9 sm:w-12 sm:h-12"
              >
                <Image
                  src="/logos/logo.png"
                  alt="Doctor Planet"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </motion.div>
              <span className="font-heading font-bold text-base sm:text-xl">
                <span className="text-primary-600">doctor</span>
                <span className="text-secondary-950">planet</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions - Desktop */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-secondary-100 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-secondary-700" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu - Desktop */}
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-secondary-200 animate-pulse" />
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm">
                        {session.user?.name?.[0] || 'U'}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-secondary-500" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-secondary-100">
                          <p className="font-medium text-secondary-900 truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-sm text-secondary-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>

                        <div className="py-2">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </Link>
                          )}
                          {isSalesman && (
                            <Link
                              href="/salesman"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-3" />
                              Salesman Dashboard
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4 mr-3" />
                            My Orders
                          </Link>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              signOut()
                            }}
                            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile: Only show logo - other actions in bottom nav */}
            <div className="sm:hidden" />
          </div>
        </nav>

        {/* Overlay for user menu */}
        {isUserMenuOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-secondary-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-14 px-1">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
              pathname === '/' ? 'text-primary-600' : 'text-secondary-500'
            }`}
          >
            <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[9px] mt-0.5 font-medium">Home</span>
          </Link>

          {/* Shop */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
              pathname.startsWith('/products') ? 'text-primary-600' : 'text-secondary-500'
            }`}
          >
            <Grid3X3 className={`w-5 h-5 ${pathname.startsWith('/products') ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[9px] mt-0.5 font-medium">Shop</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
              pathname === '/wishlist' ? 'text-primary-600' : 'text-secondary-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${pathname === '/wishlist' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[9px] mt-0.5 font-medium">Wishlist</span>
          </Link>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="flex flex-col items-center justify-center flex-1 py-1.5 text-secondary-500 relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-600 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 font-medium">Cart</span>
          </button>

          {/* Profile/Login */}
          {session ? (
            <Link
              href="/profile"
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                pathname === '/profile' ? 'text-primary-600' : 'text-secondary-500'
              }`}
            >
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={20}
                  height={20}
                  className="rounded-full w-5 h-5"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                  {session.user?.name?.[0] || 'U'}
                </div>
              )}
              <span className="text-[9px] mt-0.5 font-medium">Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                pathname === '/login' ? 'text-primary-600' : 'text-secondary-500'
              }`}
            >
              <User className={`w-5 h-5 ${pathname === '/login' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[9px] mt-0.5 font-medium">Login</span>
            </Link>
          )}
        </div>
        
        {/* Safe area for iPhone notch */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="lg:hidden h-14" />
    </>
  )
}
