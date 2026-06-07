import { useState, useEffect } from 'react'

interface GlobalDiscount {
  isActive: boolean
  percentage: number
}

export function useGlobalDiscount() {
  const [discount, setDiscount] = useState<GlobalDiscount>({ isActive: false, percentage: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/global-discount')
      .then(res => res.json())
      .then(data => {
        setDiscount(data)
        setLoading(false)
      })
      .catch(() => {
        setDiscount({ isActive: false, percentage: 0 })
        setLoading(false)
      })
  }, [])

  /**
   * Calculate the final price based on global discount
   * @param originalPrice - The original product price
   * @param salePrice - The product's sale price (optional)
   * @returns The final price after applying global discount or sale price
   */
  const calculatePrice = (originalPrice: number, salePrice?: number | null): number => {
    if (discount.isActive) {
      // When global discount is active, ignore sale price
      return originalPrice * (1 - discount.percentage / 100)
    }
    // Use sale price if no global discount
    return salePrice || originalPrice
  }

  /**
   * Get the display discount percentage
   * Returns global discount percentage if active, otherwise calculates from sale price
   */
  const getDiscountPercentage = (originalPrice: number, salePrice?: number | null): number => {
    if (discount.isActive) {
      return discount.percentage
    }
    if (salePrice && salePrice < originalPrice) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    }
    return 0
  }

  return {
    discount,
    loading,
    calculatePrice,
    getDiscountPercentage,
    isGlobalDiscountActive: discount.isActive,
  }
}
