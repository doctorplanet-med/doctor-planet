'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  LayoutDashboard,
  ChevronDown,
  Home,
  Grid3X3,
  Heart,
  Search,
  X,
  FolderOpen,
  Package,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/products?category=medical-clothes', label: 'Clothes' },
  { href: '/products?category=medical-shoes', label: 'Shoes' },
  { href: '/products?category=medical-equipment', label: 'Equipment' },
]

interface NavbarProps {
  transparentOnHero?: boolean
}

const SCROLL_THRESHOLD = 80 // Only switch to solid navbar after user scrolls this far

export default function Navbar({ transparentOnHero = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ products: { id: string; name: string; slug: string; category: { name: string; slug: string } }[]; categories: { id: string; name: string; slug: string }[] }>({ products: [], categories: [] })
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = useCartStore((state) => state.items.length > 0 ? state.getItemCount() : 0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (transparentOnHero) {
        // On hero: only go solid when scroll position is past threshold (set by scroll events only; no initial read so no white bar at 1023px and below)
        if (y > SCROLL_THRESHOLD) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      } else {
        setIsScrolled(y > SCROLL_THRESHOLD)
      }
    }
    if (!transparentOnHero) {
      handleScroll()
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [transparentOnHero])

  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileSearchInputRef.current?.focus()
    } else {
      setMobileSearchQuery('')
      setSuggestions({ products: [], categories: [] })
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    const q = mobileSearchQuery.trim()
    if (q.length < 2) {
      setSuggestions({ products: [], categories: [] })
      return
    }
    const t = setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setSuggestions({ products: data.products || [], categories: data.categories || [] })
      } catch {
        setSuggestions({ products: [], categories: [] })
      } finally {
        setSuggestionsLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [mobileSearchQuery])

  const handleMobileSearch = (query?: string) => {
    const q = (query ?? mobileSearchQuery).trim()
    setIsMobileSearchOpen(false)
    if (q) {
      router.push(`/products?search=${encodeURIComponent(q)}`)
    }
  }

  const handleSuggestionClick = (href: string) => {
    setIsMobileSearchOpen(false)
    router.push(href)
  }

  const isAdmin = session?.user?.role === 'ADMIN'
  const isSalesman = session?.user?.role === 'SALESMAN'

  // Transparent on hero when at top (all screen sizes). Use original (dark) logo so it's always visible.
  const isTransparent = transparentOnHero && !isScrolled
  const headerBg = isTransparent
    ? '!bg-transparent'
    : isScrolled
      ? 'bg-white shadow-lg'
      : 'bg-white/95 backdrop-blur-md'
  // Nav links & actions: white when transparent, dark when solid. Logo: always original (dark) for visibility.
  const textVariant = isTransparent ? 'light' : 'dark'

  return (
    <>
      {/* Top Header - on small screen always rounded bottom + inset. Transparent at top, solid when scrolled. */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 max-sm:rounded-b-2xl max-sm:left-2 max-sm:right-2 ${headerBg}`}
        style={isTransparent ? { backgroundColor: 'transparent', boxShadow: 'none' } : undefined}
      >
        <nav className="max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-6 relative">
          <div className="relative flex items-center justify-between h-14 sm:h-20">
            {/* Logo - hide on mobile when search bar is open */}
            <Link
              href="/"
              className={`flex items-center space-x-2 z-10 shrink-0 ${isMobileSearchOpen ? 'max-sm:hidden' : ''}`}
            >
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

            {/* Desktop Navigation - centered when transparent, else left of actions */}
            <div className={`hidden lg:flex items-center ${isTransparent ? 'absolute left-1/2 -translate-x-1/2 space-x-1' : 'space-x-1'}`}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative px-4 py-2 rounded-lg font-medium transition-colors duration-200 overflow-hidden ${
                      textVariant === 'light'
                        ? isActive
                          ? 'text-white'
                          : 'text-white/90 hover:text-white'
                        : isActive
                          ? 'text-primary-600'
                          : 'text-secondary-700 hover:text-primary-600'
                    }`}
                  >
                    {link.label}
                    {/* Hover line: moves left to right once, quickly */}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 w-0 origin-left transition-[width] duration-300 ease-out group-hover:w-full ${
                        textVariant === 'light' ? 'bg-white' : 'bg-primary-600'
                      }`}
                      aria-hidden
                    />
                  </Link>
                )
              })}
            </div>

            {/* Right Side Actions - Desktop */}
            <div className="hidden sm:flex items-center space-x-4 z-10">
              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCart}
                className="relative p-2 rounded-full transition-colors"
              >
                <ShoppingCart className={`w-6 h-6 ${textVariant === 'light' ? 'text-white' : 'text-secondary-700'}`} />
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
                <div className="relative z-[100]">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg transition-colors relative z-[100]"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8 ring-2 ring-white/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm">
                        {session.user?.name?.[0] || 'U'}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 ${textVariant === 'light' ? 'text-white/80' : 'text-secondary-500'}`} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${textVariant === 'light' ? 'text-white border border-white/40' : 'btn-primary'}`}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile: search icon (hidden when search bar is open); click opens search bar */}
            <div className={`sm:hidden flex items-center z-10 shrink-0 ${isMobileSearchOpen ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className={`p-2 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${textVariant === 'light' ? 'bg-white text-secondary-800 hover:bg-secondary-100' : 'text-secondary-700 hover:bg-secondary-100'}`}
                aria-label="Search"
              >
                <Search className="w-5 h-5 shrink-0" />
              </button>
            </div>
          </div>

          {/* Mobile: full-screen search overlay with polished UI */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="sm:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                  onClick={() => setIsMobileSearchOpen(false)}
                  aria-hidden
                />
                {/* Search panel: slides in from right with scale */}
                <motion.div
                  initial={{ opacity: 0, x: '24%', scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: '24%', scale: 0.96 }}
                  transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="sm:hidden fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[100%] flex flex-col bg-white shadow-2xl"
                  style={{ borderRadius: 0 }}
                >
                  {/* Search header bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-secondary-100 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="p-2 -ml-1 rounded-full text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                      <input
                        ref={mobileSearchInputRef}
                        type="search"
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMobileSearch()}
                        placeholder="Search"
                        className="w-full rounded-xl border border-secondary-200 bg-secondary-50/80 py-2.5 pl-10 pr-4 text-[15px] text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
                        autoComplete="off"
                      />
                      {mobileSearchQuery.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setMobileSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-secondary-400 hover:text-secondary-600 hover:bg-secondary-200/80"
                          aria-label="Clear"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMobileSearch()}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-primary-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all"
                    >
                      <span>Search</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Suggestions */}
                  <div ref={suggestionsRef} className="flex-1 overflow-auto min-h-0">
                    {suggestionsLoading && (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                        <p className="text-sm text-secondary-500">Searching...</p>
                      </div>
                    )}
                    {!suggestionsLoading && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.06 }}
                        className="py-3 px-4"
                      >
                        {suggestions.categories.length > 0 && (
                          <section className="mb-4">
                            <div className="flex items-center gap-2 px-2 mb-2">
                              <FolderOpen className="w-4 h-4 text-primary-500" />
                              <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Categories</h3>
                            </div>
                            <ul className="space-y-0.5">
                              {suggestions.categories.map((c, i) => (
                                <motion.li
                                  key={c.id}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.03 * i }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleSuggestionClick(`/products?category=${c.slug}`)}
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-secondary-800 hover:bg-secondary-50 active:bg-secondary-100 transition-colors group"
                                  >
                                    <span className="font-medium">{c.name}</span>
                                    <ArrowRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                  </button>
                                </motion.li>
                              ))}
                            </ul>
                          </section>
                        )}
                        {suggestions.products.length > 0 && (
                          <section>
                            <div className="flex items-center gap-2 px-2 mb-2">
                              <Package className="w-4 h-4 text-primary-500" />
                              <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Items</h3>
                            </div>
                            <ul className="space-y-0.5">
                              {suggestions.products.map((p, i) => (
                                <motion.li
                                  key={p.id}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.03 * (suggestions.categories.length + i) }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleSuggestionClick(`/products/${p.slug}`)}
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-secondary-50 active:bg-secondary-100 transition-colors group"
                                  >
                                    <div className="min-w-0">
                                      <span className="block text-sm font-medium text-secondary-900 truncate">{p.name}</span>
                                      {p.category && (
                                        <span className="block text-xs text-secondary-500 mt-0.5">{p.category.name}</span>
                                      )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                  </button>
                                </motion.li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </motion.div>
                    )}
                    {!suggestionsLoading && mobileSearchQuery.trim().length >= 2 && suggestions.products.length === 0 && suggestions.categories.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                          <Search className="w-7 h-7 text-secondary-400" />
                        </div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">No results found</p>
                        <p className="text-sm text-secondary-500">Try different keywords or search for something else.</p>
                        <button
                          type="button"
                          onClick={() => handleMobileSearch()}
                          className="mt-4 rounded-xl bg-primary-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-700"
                        >
                          Search anyway
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>

        {/* User dropdown menu - rendered outside nav to avoid clipping */}
        <AnimatePresence>
          {isUserMenuOpen && session && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-4 sm:right-5 lg:right-6 top-[60px] sm:top-[88px] w-56 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden z-[100]"
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

        {/* Overlay for user menu */}
        {isUserMenuOpen && (
          <div
            className="fixed inset-0 z-[60]"
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
            <span className="text-[9px] mt-0.5 font-medium">Products</span>
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
    </>
  )
}
