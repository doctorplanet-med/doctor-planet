'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { useGlobalDiscount } from '@/hooks/useGlobalDiscount'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: string
  category: {
    name: string
    slug: string
  }
  stock: number
}

interface ProductCardProps {
  product: Product
  index?: number
  /** When true, renders a smaller card for horizontal scroll strips (e.g. related products) */
  compact?: boolean
}

function parseImages(imagesJson: string): string[] {
  try {
    const parsed = JSON.parse(imagesJson)
    return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean)
  } catch {
    return []
  }
}

const LOW_STOCK_THRESHOLD = 5

export default function ProductCard({ product, index = 0, compact = false }: ProductCardProps) {
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const { addItem, setCartOpen } = useCartStore()
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { data: session } = useSession()
  const router = useRouter()
  const { calculatePrice, getDiscountPercentage, isGlobalDiscountActive } = useGlobalDiscount()

  const isLiked = isInWishlist(product.id)

  const images = parseImages(product.images)
  const mainImage = images[0] ?? ''
  const hoverImage = images[1] ?? ''

  const discount = getDiscountPercentage(product.price, product.salePrice)
  const finalPrice = calculatePrice(product.price, product.salePrice)
  const soldOut = product.stock === 0
  const lowStock = !soldOut && product.stock <= LOW_STOCK_THRESHOLD

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: isGlobalDiscountActive ? finalPrice : (product.salePrice || undefined),
      image: mainImage,
      quantity: 1,
    })

    toast.success(`${product.name} added to cart`)
    setCartOpen(true)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Please login to add to wishlist')
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    const wasLiked = isLiked
    if (wasLiked) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }

    setIsWishlistLoading(true)
    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.inWishlist) {
          addToWishlist(product.id)
          toast.success('Added to wishlist')
        } else {
          removeFromWishlist(product.id)
          toast.success('Removed from wishlist')
        }
      } else {
        if (wasLiked) {
          addToWishlist(product.id)
        } else {
          removeFromWishlist(product.id)
        }
        toast.error('Failed to update wishlist')
      }
    } catch (error) {
      if (wasLiked) {
        addToWishlist(product.id)
      } else {
        removeFromWishlist(product.id)
      }
      toast.error('Something went wrong')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const imageSizes = compact
    ? '(max-width: 640px) 44vw, 25vw'
    : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

  return (
    <article
      className={`group relative bg-white border border-secondary-200 overflow-hidden transition-shadow duration-200 hover:shadow-lg focus-within:shadow-lg ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] bg-secondary-100 overflow-hidden">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes={imageSizes}
                className={`object-cover transition-opacity duration-300 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
                priority={index < 2}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt=""
                  aria-hidden
                  fill
                  sizes={imageSizes}
                  className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-secondary-400" aria-hidden />
            </div>
          )}

          {/* Badges (top-left) */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {discount > 0 && !soldOut && (
              <span className={`rounded-md bg-accent-red text-white font-bold ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
                -{discount}%
              </span>
            )}
            {soldOut && (
              <span className={`rounded-md bg-secondary-950 text-white font-bold ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
                Sold out
              </span>
            )}
            {lowStock && (
              <span className={`rounded-md bg-amber-100 text-amber-900 font-semibold ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className={compact ? 'p-2 pr-12' : 'p-3 sm:p-4 pr-14 sm:pr-16'}>
          <p className={`font-semibold uppercase tracking-wide text-primary-700 ${compact ? 'text-[10px]' : 'text-[11px] sm:text-xs'}`}>
            {product.category.name}
          </p>
          <h3 className={`mt-0.5 font-bold text-secondary-950 line-clamp-2 leading-snug ${
            compact ? 'text-xs min-h-[2rem]' : 'text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.75rem]'
          }`}>
            {product.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span className={`font-extrabold ${discount > 0 ? 'text-accent-red' : 'text-secondary-950'} ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
              PKR {(discount > 0 ? finalPrice : product.price).toLocaleString()}
            </span>
            {discount > 0 && (
              <span className={`text-secondary-600 line-through ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
                {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist (top-right) — 44px touch target */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        disabled={isWishlistLoading}
        aria-label={isLiked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={isLiked}
        className={`absolute top-1 right-1 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600`}
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow transition-colors ${
          isLiked ? 'bg-primary-600 text-white' : 'bg-white/95 text-secondary-800 hover:bg-white'
        }`}>
          {isWishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden />
          )}
        </span>
      </button>

      {/* Add to cart — always visible (no hover required), 44px target */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={soldOut}
        aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
        className={`absolute flex h-11 w-11 items-center justify-center rounded-full bg-primary-700 text-white shadow-md transition-colors hover:bg-primary-800 active:scale-95 disabled:bg-secondary-300 disabled:text-secondary-700 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
          compact ? 'bottom-1.5 right-1.5' : 'bottom-2.5 right-2.5 sm:bottom-3 sm:right-3'
        }`}
      >
        <ShoppingCart className="w-5 h-5" aria-hidden />
      </button>
    </article>
  )
}
