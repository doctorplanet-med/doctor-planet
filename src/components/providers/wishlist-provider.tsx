'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/store/wishlist-store'

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { fetchWishlist, clearWishlist, isLoaded } = useWishlistStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user && !isLoaded) {
      // User is logged in, fetch their wishlist
      fetchWishlist()
    } else if (status === 'unauthenticated') {
      // User logged out, clear wishlist
      clearWishlist()
    }
  }, [status, session, fetchWishlist, clearWishlist, isLoaded])

  return <>{children}</>
}
