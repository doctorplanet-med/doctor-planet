# Returned Sales Fix - Revenue Calculation

## Issue
Returned sales were still being counted in revenue calculations on both Admin and Salesman dashboards, causing inflated revenue numbers.

## Root Cause
The database queries for POS sales revenue were not filtering out sales where `isReturned = true`. This meant that even when a sale was marked as returned, it was still counted in:
- Total Revenue (All time)
- Today's Revenue
- This Month's Revenue
- Recent Sales list

## Fix Applied

### Admin Dashboard (`src/app/admin/page.tsx`)
Updated 4 Prisma queries to exclude returned sales:

1. **Total POS Revenue (All time)**
   ```typescript
   prisma.pOSSale.aggregate({
     where: { isReturned: false },  // ✅ Added filter
     _sum: { total: true }
   })
   ```

2. **Today's POS Revenue**
   ```typescript
   prisma.pOSSale.aggregate({
     where: { 
       createdAt: { gte: todayStart },
       isReturned: false  // ✅ Added filter
     },
     _sum: { total: true },
     _count: true
   })
   ```

3. **This Month's POS Revenue**
   ```typescript
   prisma.pOSSale.aggregate({
     where: { 
       createdAt: { gte: monthStart },
       isReturned: false  // ✅ Added filter
     },
     _sum: { total: true },
     _count: true
   })
   ```

4. **Recent POS Sales (for display)**
   ```typescript
   prisma.pOSSale.findMany({
     where: { isReturned: false },  // ✅ Added filter
     take: 5,
     orderBy: { createdAt: 'desc' },
     include: { ... }
   })
   ```

### Salesman Dashboard (`src/app/salesman/page.tsx`)
Updated the frontend filtering logic to exclude returned sales:

```typescript
// Add POS sales (exclude returned sales)
if (salesRes.ok) {
  const salesData = await salesRes.json()
  allRevenue = allRevenue.concat(
    salesData.sales
      .filter((s: any) => !s.isReturned)  // ✅ Added filter
      .map((s: any) => ({
        amount: s.total,
        createdAt: s.createdAt,
        type: 'POS'
      }))
  )
}
```

## Impact
Now when a sale is returned:
- ✅ It will **not** be counted in any revenue calculations
- ✅ Total Revenue will accurately reflect only completed sales
- ✅ Today's, Week's, and Month's revenue will be correct
- ✅ Recent sales list will only show non-returned sales

## Database Schema Context
The `POSSale` model has an `isReturned` boolean field:
```prisma
model POSSale {
  // ... other fields
  isReturned      Boolean   @default(false)
  returnReason    String?
  returnedAt      DateTime?
  returnedBy      String?
}
```

When a sale is returned, these fields are updated, and now the revenue calculations properly respect this flag.

## Testing Recommendations
1. Create a test POS sale
2. Check that it appears in revenue
3. Mark the sale as returned
4. Verify it no longer appears in revenue calculations
5. Check that dashboards update correctly

## Files Modified
- ✅ `src/app/admin/page.tsx` - Admin dashboard revenue queries
- ✅ `src/app/salesman/page.tsx` - Salesman dashboard revenue filtering

## Status: ✅ FIXED
Revenue calculations now correctly exclude returned sales across all dashboards.
