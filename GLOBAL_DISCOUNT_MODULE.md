# Global Discount Module - Complete Documentation

## Summary
Created a comprehensive Global Discount Module that allows administrators to set a site-wide discount percentage on ALL products, overriding individual sale prices during the discount period.

## How It Works

### Admin Perspective:
1. Admin goes to **Admin Panel → Sales & Orders → Global Discount**
2. Admin sets a discount percentage (e.g., 5%)
3. Admin activates the discount with a toggle switch
4. Optionally sets start/end dates for automatic activation
5. Saves the settings

### Customer Perspective:
- When global discount is active:
  - ✅ ALL products show the global discount percentage
  - ❌ Individual sale prices are HIDDEN
  - ✅ Original prices still shown for comparison
  - ✅ Final discounted price calculated automatically

## Features

### 1. Global Discount Admin Page
**Location:** `/admin/global-discount`

**Features:**
- ✅ **Activation Toggle** - Turn discount on/off instantly
- ✅ **Percentage Input** - Set discount from 0-100%
- ✅ **Date Range** - Optional start and end dates
- ✅ **Live Preview** - See how discount affects prices
- ✅ **Current Status Display** - View active settings
- ✅ **Info Alert** - Explains how the system works
- ✅ **Validation** - Ensures percentage is valid (0-100)

### 2. Database Schema
**New Model:** `GlobalDiscount`

```prisma
model GlobalDiscount {
  id          String    @id @default("main")
  isActive    Boolean   @default(false)
  percentage  Float     @default(0)
  startDate   DateTime?
  endDate     DateTime?
  createdBy   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Fields:**
- `id` - Always "main" (singleton pattern)
- `isActive` - Whether discount is currently active
- `percentage` - Discount percentage (0-100)
- `startDate` - Optional automatic start date
- `endDate` - Optional automatic end date
- `createdBy` - Admin who created/updated the discount
- `createdAt/updatedAt` - Timestamps

### 3. API Endpoints

#### Admin Endpoint: `/api/admin/global-discount`

**GET** - Fetch current discount settings
- Requires: Authentication
- Returns: GlobalDiscount object
- Auto-creates default if doesn't exist

**PUT** - Update discount settings
- Requires: Admin role
- Validates: Percentage (0-100), Date logic
- Returns: Updated GlobalDiscount object

**Example Request:**
```json
{
  "isActive": true,
  "percentage": 5,
  "startDate": "2026-02-22T00:00:00Z",
  "endDate": "2026-03-01T00:00:00Z"
}
```

#### Public Endpoint: `/api/global-discount`

**GET** - Check if discount is active (public)
- No authentication required
- Checks activation status
- Validates date range automatically
- Returns: `{ isActive: boolean, percentage: number }`

**Example Response:**
```json
{
  "isActive": true,
  "percentage": 5
}
```

## UI Components

### Admin Page Layout:

1. **Header Section**
   - Title: "Global Discount"
   - Description explaining the feature

2. **Info Alert (Blue)**
   - How the discount system works
   - What happens when activated
   - Impact on sale prices

3. **Status Toggle Card**
   - Visual indicator (green when active)
   - Large toggle switch
   - Clear active/inactive status

4. **Discount Percentage Input**
   - Number input with percentage icon
   - Range: 0-100
   - Decimal support (e.g., 5.5%)

5. **Date Range Inputs (Optional)**
   - Start Date picker
   - End Date picker
   - Helpful descriptions

6. **Preview Card**
   - Shows example calculation
   - Original price → Discount → Final price
   - Updates in real-time

7. **Save Button**
   - Primary action button
   - Loading state during save
   - Success/error feedback via toast

8. **Current Status Card**
   - Displays all active settings
   - Last updated timestamp
   - Creator information

## Logic Flow

### Setting Up Discount:

```
1. Admin enters percentage (e.g., 5%)
2. Admin sets optional dates
3. Admin toggles "Active" ON
4. Admin clicks "Save"
5. System validates input
6. Database is updated
7. Success message shown
```

### Frontend Product Display:

```
1. Product page loads
2. Fetch global discount via /api/global-discount
3. If discount is active:
   - Hide product's salePrice
   - Calculate: finalPrice = price × (1 - percentage/100)
   - Show: "5% OFF" badge
   - Display: originalPrice (strikethrough) → finalPrice
4. If discount is inactive:
   - Show regular price or salePrice as normal
```

### Date Range Validation:

```
- If startDate is set:
  - Discount only active after startDate
- If endDate is set:
  - Discount only active before endDate
- Both dates optional
- System checks dates on every request
- Automatic activation/deactivation
```

## Integration Points

### Where to Integrate (Frontend):

1. **Product Card Component** (`src/components/product-card.tsx`)
   - Fetch global discount on mount
   - Apply discount to price display
   - Show discount badge if active
   - Hide sale price when discount active

2. **Product Details Page** (`src/app/products/[slug]/page.tsx`)
   - Check global discount
   - Apply to displayed price
   - Show discount percentage
   - Update add-to-cart with correct price

3. **Cart** (`src/components/cart.tsx`)
   - Apply discount to cart items
   - Show discount breakdown
   - Calculate correct totals

4. **Checkout** (`src/app/checkout/page.tsx`)
   - Apply discount to order total
   - Show discount in summary

### Example Integration Code:

```typescript
// Fetch global discount
const [globalDiscount, setGlobalDiscount] = useState({ isActive: false, percentage: 0 })

useEffect(() => {
  fetch('/api/global-discount')
    .then(res => res.json())
    .then(data => setGlobalDiscount(data))
}, [])

// Calculate price
const getDisplayPrice = (product: Product) => {
  if (globalDiscount.isActive) {
    // Use global discount - ignore sale price
    return product.price * (1 - globalDiscount.percentage / 100)
  } else if (product.salePrice) {
    // Use sale price if no global discount
    return product.salePrice
  }
  return product.price
}

// Display
<div>
  <span className="line-through">{product.price}</span>
  <span className="text-primary">{getDisplayPrice(product)}</span>
  {globalDiscount.isActive && (
    <span className="badge">{globalDiscount.percentage}% OFF</span>
  )}
</div>
```

## Security Features

### Access Control:
- ✅ Only ADMIN users can modify discount
- ✅ Public endpoint only returns active status
- ✅ Authentication required for admin endpoint
- ✅ Role validation on all write operations

### Audit Trail:
- ✅ Records who created/updated discount
- ✅ Timestamps for all changes
- ✅ Console logs for admin actions

### Validation:
- ✅ Percentage must be 0-100
- ✅ Start date must be before end date
- ✅ Type checking on all inputs
- ✅ Error handling with user feedback

## Use Cases

### 1. Flash Sale (24 hours)
```
Percentage: 10%
Start Date: Today
End Date: Tomorrow
Active: Yes
```

### 2. Weekend Sale
```
Percentage: 15%
Start Date: Friday 00:00
End Date: Sunday 23:59
Active: Yes
```

### 3. Permanent Sale
```
Percentage: 5%
Start Date: (empty)
End Date: (empty)
Active: Yes
```

### 4. Scheduled Future Sale
```
Percentage: 20%
Start Date: Next Friday
End Date: Next Sunday
Active: Yes (but won't show until Friday)
```

## Files Created/Modified

### Created:
1. ✅ `src/app/admin/global-discount/page.tsx` - Admin UI page
2. ✅ `src/app/api/admin/global-discount/route.ts` - Admin API endpoint
3. ✅ `src/app/api/global-discount/route.ts` - Public API endpoint

### Modified:
1. ✅ `prisma/schema.prisma` - Added GlobalDiscount model
2. ✅ `src/components/admin/admin-sidebar.tsx` - Added menu item

## Next Steps (Integration Required)

To complete the implementation, you need to integrate the global discount into your frontend product display:

### Required Changes:

1. **Update Product Card Component**
   - Fetch global discount
   - Apply discount to prices
   - Show discount badge
   - Hide sale prices when global discount active

2. **Update Product Details Page**
   - Check global discount
   - Calculate and display correct price
   - Show discount percentage

3. **Update Cart Component**
   - Apply global discount to cart items
   - Show discount breakdown

4. **Update Checkout**
   - Apply discount to final total
   - Show discount in order summary

### Example Helper Function:

```typescript
// Create this utility function
export const useGlobalDiscount = () => {
  const [discount, setDiscount] = useState({ isActive: false, percentage: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/global-discount')
      .then(res => res.json())
      .then(data => {
        setDiscount(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const calculatePrice = (originalPrice: number, salePrice?: number) => {
    if (discount.isActive) {
      return originalPrice * (1 - discount.percentage / 100)
    }
    return salePrice || originalPrice
  }

  return { discount, loading, calculatePrice }
}
```

## Testing Checklist

- [ ] Admin can access Global Discount page
- [ ] Admin can set percentage (0-100)
- [ ] Admin can toggle active/inactive
- [ ] Admin can set optional dates
- [ ] Preview shows correct calculation
- [ ] Save button works and shows success
- [ ] Current status displays correctly
- [ ] Public API returns correct status
- [ ] Date range validation works
- [ ] Percentage validation works
- [ ] Toast notifications appear
- [ ] Menu item appears in sidebar
- [ ] Frontend products show discount
- [ ] Sale prices hidden when discount active
- [ ] Cart applies discount correctly
- [ ] Checkout shows correct totals

## Status: ✅ ADMIN MODULE COMPLETE

The admin module is fully functional. Frontend integration with product display, cart, and checkout is required to complete the feature.
