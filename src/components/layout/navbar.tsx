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
  Grid3X3,
  Search,
  X,
  Menu,
  FolderOpen,
  Package,
  Loader2,
  ArrowRight,
  Ruler,
  Info,
  Home,
  ClipboardList,
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

interface SubCategory {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  subCategories?: SubCategory[]
}

interface NavbarProps {
  transparentOnHero?: boolean
}

const SCROLL_THRESHOLD = 80

export default function Navbar({ transparentOnHero: _transparentOnHero = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{
    products: { id: string; name: string; slug: string; category: { name: string; slug: string } }[]
    categories: { id: string; name: string; slug: string }[]
  }>({ products: [], categories: [] })
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { toggleCart } = useCartStore()
  const itemCount = useCartStore((state) =>
    state.items.length > 0 ? state.getItemCount() : 0
  )

  // Scroll (only for shadow)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60)
    } else {
      setSearchQuery('')
      setSuggestions({ products: [], categories: [] })
    }
  }, [isSearchOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen])

  // Search suggestions debounce
  useEffect(() => {
    const q = searchQuery.trim()
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
  }, [searchQuery])

  const handleSearch = (query?: string) => {
    const q = (query ?? searchQuery).trim()
    setIsSearchOpen(false)
    setIsDrawerOpen(false)
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`)
  }

  const closeDrawer = () => setIsDrawerOpen(false)

  const isAdmin = session?.user?.role === 'ADMIN'
  const isSalesman = session?.user?.role === 'SALESMAN'

  const headerBg = isScrolled ? 'bg-white shadow-md' : 'bg-white shadow-sm'

  return (
    <>
      <header className={`fixed top-7 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
        <nav className="max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-6">

          {/* ══════════════════════════════════════
              MOBILE TOP BAR  (< sm)
          ══════════════════════════════════════ */}
          <div className="flex sm:hidden items-center h-14 relative">

            {/* LEFT: Drawer + Search */}
            <div className="flex items-center gap-1 z-10">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 rounded-xl text-black hover:bg-secondary-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl text-black hover:bg-secondary-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* CENTER: Logo (absolute) */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
            >
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src="/logos/logo.png"
                  alt="Doctor Planet"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-base leading-none">
                <span className="text-primary-600">doctor</span>
                <span className="text-black">planet</span>
              </span>
            </Link>

            {/* RIGHT: User + Cart */}
            <div className="flex items-center gap-1 ml-auto z-10">
              {/* User */}
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-secondary-200 animate-pulse" />
              ) : session ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1.5 rounded-xl transition-colors hover:bg-secondary-100"
                  aria-label="Account"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={28}
                      height={28}
                      className="rounded-full ring-2 ring-primary-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-xl text-black hover:bg-secondary-100 transition-colors"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-xl text-black hover:bg-secondary-100 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════
              DESKTOP TOP BAR  (≥ sm)
          ══════════════════════════════════════ */}
          <div className="hidden sm:flex items-center justify-between h-20 relative">

            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center space-x-2.5 z-10 shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-11 h-11 shrink-0"
              >
                <Image
                  src="/logos/logo.png"
                  alt="Doctor Planet"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </motion.div>
              <span className="font-heading font-bold text-xl leading-none">
                <span className="text-primary-600">doctor</span>
                <span className="text-black">planet</span>
              </span>
            </Link>

            {/* CENTER: Category + static links */}
            <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 space-x-1">
              {categories.map((cat) => (
                <div key={cat.id} className="relative group/cat">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="relative flex items-center gap-0.5 px-4 py-2 rounded-lg font-medium text-black hover:text-primary-600 transition-colors duration-200 whitespace-nowrap"
                  >
                    {cat.name}
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <ChevronDown className="w-3.5 h-3.5 mt-0.5 opacity-50" />
                    )}
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 origin-left bg-primary-600 transition-[width] duration-300 ease-out group-hover/cat:w-full" aria-hidden />
                  </Link>

                  {/* Subcategory dropdown */}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden z-50 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-150 translate-y-1 group-hover/cat:translate-y-0">
                      <div className="py-1.5">
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="flex items-center px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          All {cat.name}
                        </Link>
                        <div className="border-t border-secondary-100 my-1" />
                        {cat.subCategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${cat.slug}&sub=${sub.slug}`}
                            className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {categories.length > 0 && (
                <span className="w-px h-5 mx-1 bg-secondary-200" />
              )}

              {[
                { href: '/size-guide', label: 'Size Guide' },
                { href: '/about', label: 'About Us' },
              ].map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative px-4 py-2 rounded-lg font-medium transition-colors duration-200 overflow-hidden whitespace-nowrap ${
                      isActive ? 'text-primary-600' : 'text-black hover:text-primary-600'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 origin-left transition-[width] duration-300 ease-out ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                      aria-hidden
                    />
                  </Link>
                )
              })}
            </div>

            {/* RIGHT: Search + Cart + User */}
            <div className="flex items-center gap-1 z-10">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full text-black hover:bg-secondary-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleCart}
                className="relative p-2.5 rounded-full text-black hover:bg-secondary-100 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-[11px] rounded-full flex items-center justify-center font-bold leading-none"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </motion.button>

              {status === 'loading' ? (
                <div className="w-9 h-9 rounded-full bg-secondary-200 animate-pulse ml-1" />
              ) : session ? (
                <div className="relative z-[100] ml-1">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8 ring-2 ring-primary-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="ml-2 btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════
            SEARCH OVERLAY  (all screens)
        ══════════════════════════════════════ */}
        <AnimatePresence>
          {isSearchOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                onClick={() => setIsSearchOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed top-7 left-0 right-0 z-[70] bg-white shadow-2xl"
              >
                <div className="max-w-2xl mx-auto px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search products, categories..."
                        className="w-full rounded-xl border border-secondary-200 bg-secondary-50 py-3 pl-12 pr-10 text-base text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
                        autoComplete="off"
                      />
                      {searchQuery.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-secondary-400 hover:bg-secondary-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleSearch()}
                      className="shrink-0 bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2.5 rounded-xl text-secondary-500 hover:bg-secondary-100 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {(suggestionsLoading || suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 pb-1"
                      >
                        {suggestionsLoading ? (
                          <div className="flex items-center gap-2 py-3 px-1 text-secondary-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {suggestions.categories.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => { setIsSearchOpen(false); router.push(`/products?category=${c.slug}`) }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                              >
                                <FolderOpen className="w-4 h-4 text-primary-500 shrink-0" />
                                <span className="font-medium">{c.name}</span>
                                <span className="text-xs text-secondary-400 ml-auto bg-secondary-100 px-2 py-0.5 rounded-full">Category</span>
                              </button>
                            ))}
                            {suggestions.products.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => { setIsSearchOpen(false); router.push(`/products/${p.slug}`) }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm hover:bg-secondary-50 transition-colors"
                              >
                                <Package className="w-4 h-4 text-secondary-400 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-medium text-secondary-900">{p.name}</span>
                                  {p.category && <span className="text-xs text-secondary-400 ml-2">{p.category.name}</span>}
                                </div>
                                <ArrowRight className="w-4 h-4 text-secondary-300 ml-auto shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                    {!suggestionsLoading && searchQuery.trim().length >= 2 &&
                      suggestions.products.length === 0 && suggestions.categories.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 py-3 px-1 text-sm text-secondary-400 flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        No results for &ldquo;{searchQuery}&rdquo;
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            LEFT DRAWER  (mobile only)
        ══════════════════════════════════════ */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="sm:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                onClick={closeDrawer}
                aria-hidden
              />

              {/* Drawer panel — slides from LEFT */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="sm:hidden fixed top-0 left-0 bottom-0 z-[70] w-[300px] flex flex-col bg-white shadow-2xl"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-secondary-100 shrink-0">
                  <Link href="/" onClick={closeDrawer} className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 shrink-0">
                      <Image src="/logos/logo.png" alt="Doctor Planet" fill sizes="32px" className="object-contain" />
                    </div>
                    <span className="font-heading font-bold text-base leading-none">
                      <span className="text-primary-600">doctor</span>
                      <span className="text-secondary-950">planet</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="p-2 rounded-full text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable content */}
                <nav className="flex-1 overflow-y-auto py-3">

                  {/* Pages */}
                  <div className="px-3 mb-2">
                    <Link
                      href="/"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        pathname === '/' ? 'bg-primary-50 text-primary-700' : 'text-secondary-800 hover:bg-secondary-50'
                      }`}
                    >
                      <Home className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                      Home
                    </Link>
                    <Link
                      href="/products"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        pathname === '/products' ? 'bg-primary-50 text-primary-700' : 'text-secondary-800 hover:bg-secondary-50'
                      }`}
                    >
                      <Grid3X3 className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                      All Products
                    </Link>
                  </div>

                  {/* Categories section */}
                  {categories.length > 0 && (
                    <div className="px-3 mb-2">
                      <p className="px-3 py-2 text-[11px] font-semibold text-secondary-400 uppercase tracking-wider">
                        Categories
                      </p>
                      <ul className="space-y-0.5">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <Link
                              href={`/products?category=${cat.slug}`}
                              onClick={closeDrawer}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors font-medium"
                            >
                              <FolderOpen className="w-4 h-4 shrink-0 text-secondary-400" />
                              {cat.name}
                            </Link>
                            {cat.subCategories && cat.subCategories.length > 0 && (
                              <ul className="pl-9 space-y-0.5 mb-1">
                                {cat.subCategories.map((sub) => (
                                  <li key={sub.id}>
                                    <Link
                                      href={`/products?category=${cat.slug}&sub=${sub.slug}`}
                                      onClick={closeDrawer}
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-secondary-500 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-secondary-300 shrink-0" />
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Other pages */}
                  <div className="px-3 border-t border-secondary-100 pt-3 mb-2">
                    <p className="px-3 py-2 text-[11px] font-semibold text-secondary-400 uppercase tracking-wider">
                      Pages
                    </p>
                    <Link
                      href="/size-guide"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        pathname === '/size-guide' ? 'bg-primary-50 text-primary-700' : 'text-secondary-800 hover:bg-secondary-50'
                      }`}
                    >
                      <Ruler className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                      Size Guide
                    </Link>
                    <Link
                      href="/about"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        pathname === '/about' ? 'bg-primary-50 text-primary-700' : 'text-secondary-800 hover:bg-secondary-50'
                      }`}
                    >
                      <Info className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                      About Us
                    </Link>
                  </div>

                  {/* Account */}
                  <div className="px-3 border-t border-secondary-100 pt-3">
                    <p className="px-3 py-2 text-[11px] font-semibold text-secondary-400 uppercase tracking-wider">
                      Account
                    </p>
                    {session ? (
                      <>
                        {/* User info */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-secondary-50 rounded-xl">
                          {session.user?.image ? (
                            <Image src={session.user.image} alt={session.user.name || 'User'} width={36} height={36} className="rounded-full shrink-0 ring-2 ring-primary-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                              {session.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">{session.user?.name}</p>
                            <p className="text-xs text-secondary-500 truncate">{session.user?.email}</p>
                          </div>
                        </div>

                        {(isAdmin || isSalesman) && (
                          <Link
                            href={isAdmin ? '/admin' : '/salesman'}
                            onClick={closeDrawer}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-secondary-800 hover:bg-secondary-50 font-medium transition-colors"
                          >
                            <LayoutDashboard className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                            {isAdmin ? 'Admin Dashboard' : 'Salesman Dashboard'}
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={closeDrawer}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-secondary-800 hover:bg-secondary-50 font-medium transition-colors"
                        >
                          <User className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={closeDrawer}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-secondary-800 hover:bg-secondary-50 font-medium transition-colors"
                        >
                          <ClipboardList className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                          My Orders
                        </Link>
                        <button
                          type="button"
                          onClick={() => { closeDrawer(); signOut() }}
                          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          <LogOut className="w-[18px] h-[18px] shrink-0" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={closeDrawer}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-secondary-800 hover:bg-secondary-50 font-medium transition-colors"
                      >
                        <User className="w-[18px] h-[18px] shrink-0 text-secondary-400" />
                        Sign In
                      </Link>
                    )}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            USER DROPDOWN  (desktop)
        ══════════════════════════════════════ */}
        <AnimatePresence>
          {isUserMenuOpen && session && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-4 sm:right-5 lg:right-6 top-[60px] sm:top-[88px] w-56 bg-white rounded-2xl shadow-xl border border-secondary-100 overflow-hidden z-[100]"
            >
              <div className="px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                <p className="font-semibold text-secondary-900 truncate text-sm">{session.user?.name}</p>
                <p className="text-xs text-secondary-500 truncate mt-0.5">{session.user?.email}</p>
              </div>
              <div className="py-1.5">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors">
                    <LayoutDashboard className="w-4 h-4 mr-3 text-secondary-400" />
                    Admin Dashboard
                  </Link>
                )}
                {isSalesman && (
                  <Link href="/salesman" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors">
                    <LayoutDashboard className="w-4 h-4 mr-3 text-secondary-400" />
                    Salesman Dashboard
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors">
                  <User className="w-4 h-4 mr-3 text-secondary-400" />
                  My Profile
                </Link>
                <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors">
                  <Package className="w-4 h-4 mr-3 text-secondary-400" />
                  My Orders
                </Link>
                <div className="border-t border-secondary-100 mt-1 pt-1">
                  <button
                    onClick={() => { setIsUserMenuOpen(false); signOut() }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile user dropdown (small screens) */}
        <AnimatePresence>
          {isUserMenuOpen && session && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="sm:hidden absolute right-3 top-[58px] w-52 bg-white rounded-2xl shadow-xl border border-secondary-100 overflow-hidden z-[100]"
            >
              <div className="px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                <p className="font-semibold text-secondary-900 truncate text-sm">{session.user?.name}</p>
                <p className="text-xs text-secondary-500 truncate mt-0.5">{session.user?.email}</p>
              </div>
              <div className="py-1.5">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50">
                    <LayoutDashboard className="w-4 h-4 mr-3 text-secondary-400" />
                    Admin
                  </Link>
                )}
                {isSalesman && (
                  <Link href="/salesman" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50">
                    <LayoutDashboard className="w-4 h-4 mr-3 text-secondary-400" />
                    Salesman
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50">
                  <User className="w-4 h-4 mr-3 text-secondary-400" />
                  My Profile
                </Link>
                <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50">
                  <Package className="w-4 h-4 mr-3 text-secondary-400" />
                  My Orders
                </Link>
                <div className="border-t border-secondary-100 mt-1 pt-1">
                  <button
                    onClick={() => { setIsUserMenuOpen(false); signOut() }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUserMenuOpen && (
          <div className="fixed inset-0 z-[60]" onClick={() => setIsUserMenuOpen(false)} />
        )}
      </header>
    </>
  )
}
