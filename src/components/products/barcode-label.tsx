'use client'

import { useRef, useState, useEffect } from 'react'
import { Printer, X, Hash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BarcodeLabelProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    barcode: string | null
    price: number
    salePrice?: number | null
    company?: string | null
    sizes?: string | null
    colors?: string | null
  }
  selectedSize?: string | null
  selectedColor?: string | null
}

export default function BarcodeLabel({ 
  isOpen, 
  onClose, 
  product,
  selectedSize: initialSize,
  selectedColor: initialColor 
}: BarcodeLabelProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSize || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(initialColor || null)
  const [includeCompany, setIncludeCompany] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [fontLoaded, setFontLoaded] = useState(false)

  // Parse sizes and colors - only if they have actual values
  const sizes = product.sizes ? JSON.parse(product.sizes) : []
  const colors = product.colors ? JSON.parse(product.colors) : []
  
  // Check if product has these attributes
  const hasColors = colors.length > 0
  const hasSizes = sizes.length > 0
  const hasCompany = !!product.company
  const hasOptions = hasColors || hasSizes || hasCompany

  // Check if barcode font is loaded
  useEffect(() => {
    const checkFont = async () => {
      try {
        await document.fonts.load("48px 'Libre Barcode 128'")
        setFontLoaded(true)
      } catch {
        // Set loaded anyway after a delay
        setTimeout(() => setFontLoaded(true), 1000)
      }
    }
    
    // Check immediately and also after a short delay
    checkFont()
    const timeout = setTimeout(() => setFontLoaded(true), 1500)
    
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(initialSize || (hasSizes ? sizes[0] : null))
      setSelectedColor(initialColor || (hasColors ? colors[0] : null))
      setIncludeCompany(hasCompany)
      setQuantity(1)
    }
  }, [isOpen, initialSize, initialColor, hasColors, hasSizes, hasCompany])

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open('', '_blank', 'width=400,height=400')
    if (!printWindow) {
      alert('Please allow popups for printing')
      return
    }

    // Generate multiple labels based on quantity
    const labelHtml = printRef.current.innerHTML
    const labelsArray = Array(quantity).fill(labelHtml).join('<div style="page-break-after: always;"></div>')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Label - ${product.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            @page { 
              size: 38mm 25mm;
              margin: 0;
            }
            
            html, body {
              width: 38mm;
              height: 25mm;
              font-family: Arial, sans-serif;
              font-size: 8pt;
            }
            
            .label {
              width: 38mm;
              height: 25mm;
              padding: 1mm 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              page-break-after: always;
              page-break-inside: avoid;
            }
            
            .barcode {
              font-family: 'Libre Barcode 128', cursive !important;
              font-size: 32pt !important;
              line-height: 1 !important;
              letter-spacing: 1px !important;
            }
            
            .barcode-number {
              font-family: 'Courier New', monospace;
              font-size: 6pt;
              margin-top: 0.5mm;
              letter-spacing: 1px;
            }
            
            .product-info {
              font-size: 5pt;
              color: #333;
              margin-top: 0.5mm;
              max-width: 36mm;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .price-line {
              font-size: 6pt;
              font-weight: bold;
              margin-top: 0.3mm;
              color: #000;
            }
            
            @media print {
              html, body {
                width: 38mm;
                height: 25mm;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .label {
                width: 38mm;
                height: 25mm;
              }
              .barcode { 
                font-family: 'Libre Barcode 128', cursive !important; 
              }
            }
          </style>
        </head>
        <body>
          ${labelsArray}
          <script>
            // Wait for font to load with timeout
            Promise.race([
              document.fonts.ready,
              new Promise(resolve => setTimeout(resolve, 2000))
            ]).then(function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); }
              }, 500);
            });
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const displayPrice = product.salePrice || product.price
  const barcode = product.barcode || 'NO-BARCODE'

  // Build info line - only include selected options
  const infoItems = [
    includeCompany && product.company ? product.company : null,
    selectedColor,
    selectedSize
  ].filter(Boolean)
  const infoLine = infoItems.length > 0 ? infoItems.join(' | ') : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-secondary-200 flex items-center justify-between bg-secondary-50">
              <h2 className="text-lg font-semibold text-secondary-900">Print Barcode Label</h2>
              <button onClick={onClose} className="p-2 hover:bg-secondary-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Label Options - Only show if product has attributes */}
              {hasOptions && (
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-3">Include on Label</p>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Color Selection */}
                    {hasColors && (
                      <div>
                        <label className="block text-xs text-secondary-500 mb-1">Color</label>
                        <select
                          value={selectedColor || ''}
                          onChange={(e) => setSelectedColor(e.target.value || null)}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="">None</option>
                          {colors.map((color: string) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Size Selection */}
                    {hasSizes && (
                      <div>
                        <label className="block text-xs text-secondary-500 mb-1">Size</label>
                        <select
                          value={selectedSize || ''}
                          onChange={(e) => setSelectedSize(e.target.value || null)}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="">None</option>
                          {sizes.map((size: string) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Company Toggle */}
                    {hasCompany && (
                      <div className={!hasColors && !hasSizes ? 'col-span-2' : ''}>
                        <label className="block text-xs text-secondary-500 mb-1">Company</label>
                        <label className="flex items-center gap-3 px-3 py-2 border border-secondary-300 rounded-lg cursor-pointer hover:bg-secondary-50">
                          <input
                            type="checkbox"
                            checked={includeCompany}
                            onChange={(e) => setIncludeCompany(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm">{product.company}</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Print Quantity */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Print Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-32 px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Preview */}
              <div>
                <p className="text-sm text-secondary-500 mb-3">Label Preview (38mm x 25mm)</p>
                
                <div className="flex justify-center bg-secondary-100 p-4 rounded-xl">
                  <div 
                    ref={printRef}
                    className="bg-white shadow-lg border border-secondary-300"
                    style={{ width: '152px', height: '100px' }}
                  >
                    <div className="label h-full flex flex-col items-center justify-center text-center p-1">
                      {/* Barcode */}
                      {fontLoaded ? (
                        <div 
                          className="barcode leading-none"
                          style={{ 
                            fontFamily: "'Libre Barcode 128', cursive",
                            fontSize: '32px',
                            letterSpacing: '1px',
                            lineHeight: 1
                          }}
                        >
                          {barcode}
                        </div>
                      ) : (
                        <div className="h-8 w-full bg-secondary-200 animate-pulse rounded" />
                      )}
                      
                      {/* Barcode Number */}
                      <div className="barcode-number font-mono text-[8px] mt-0.5 text-secondary-800 tracking-wider">
                        {barcode}
                      </div>
                      
                      {/* Product Info (small) */}
                      <div className="product-info text-[6px] text-secondary-600 mt-0.5 truncate max-w-full px-0.5 leading-tight">
                        {product.name}
                        {infoLine && ` • ${infoLine}`}
                      </div>
                      
                      {/* Price (small) */}
                      <div className="price-line text-[7px] font-bold mt-0.5 text-secondary-900">
                        PKR {displayPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Summary */}
              <div className="p-3 bg-secondary-50 rounded-lg text-xs text-secondary-600 space-y-1">
                <p><strong>Barcode:</strong> {barcode}</p>
                <p><strong>Product:</strong> {product.name}</p>
                {includeCompany && product.company && <p><strong>Company:</strong> {product.company}</p>}
                {selectedColor && <p><strong>Color:</strong> {selectedColor}</p>}
                {selectedSize && <p><strong>Size:</strong> {selectedSize}</p>}
                <p><strong>Labels to print:</strong> {quantity}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-secondary-200 bg-secondary-50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-secondary-300 rounded-xl font-semibold hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                disabled={!product.barcode}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print {quantity > 1 ? `${quantity} Labels` : 'Label'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
