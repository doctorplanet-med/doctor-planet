# Clear All POS Sales Data Feature

## Summary
Added a "Clear All Data" button on the Admin POS Sales page that allows administrators to permanently delete all POS sales records.

## Feature Location
**Page:** `/admin/pos` (Admin POS Sales page)

## What Was Added

### 1. Clear All Data Button
**Location:** Top right of the POS Sales page header

- Red button with trash icon
- Positioned next to the "Open POS" button
- Only visible to admin users

### 2. Confirmation Modal
A comprehensive safety modal that appears when the button is clicked:

**Features:**
- ⚠️ **Warning Badge** - Visual alert with danger colors
- **Detailed Warning Message** - Lists exactly what will be deleted:
  - Total number of POS sales transactions
  - All sale items and details
  - Sales history and revenue data
- **Important Note:** Clarifies that product stock will NOT be affected
- **Confirmation Input** - User must type `DELETE ALL` (exact match, case-sensitive)
- **Disabled Submit** - Button is disabled until correct text is entered
- **Loading State** - Shows spinner and "Clearing..." text during deletion
- **Cannot Close During Operation** - Modal cannot be closed while data is being cleared

### 3. API Endpoint
**Route:** `/api/admin/pos/clear-all`
**Method:** `DELETE`

**Security:**
- Requires authentication
- Requires ADMIN role
- Returns 401 if user is not admin

**Process:**
1. Deletes all `POSSaleItem` records first (due to foreign key constraints)
2. Deletes all `POSSale` records
3. Logs the action with admin email and count
4. Returns success message with deleted count

## How It Works

### Step-by-Step Flow:

1. **Admin clicks "Clear All Data" button**
   - Confirmation modal appears

2. **Admin reviews warning**
   - See total sales count that will be deleted
   - Read what data will be permanently removed
   - Note that stock won't be affected

3. **Admin types "DELETE ALL"**
   - Must match exactly (case-sensitive)
   - Submit button remains disabled until correct

4. **Admin clicks "Clear All Data" in modal**
   - Loading state appears
   - API call is made to delete all data
   - Modal cannot be closed during this process

5. **Data is cleared**
   - Success toast notification appears
   - Modal closes automatically
   - Sales list becomes empty
   - Stats reset to zero
   - Page updates to show no sales

## Safety Features

### Multiple Confirmation Steps:
1. ✅ **Red button** - Visual warning with trash icon
2. ✅ **Warning modal** - Shows exact consequences
3. ✅ **Text confirmation** - Must type "DELETE ALL"
4. ✅ **Disabled button** - Can't submit without correct text
5. ✅ **Admin-only** - Only users with ADMIN role can access
6. ✅ **Audit log** - Action is logged in console with admin email

### What's Protected:
- ❌ **Data is NOT deleted:**
  - Product information and stock levels
  - Product images and details
  - Categories
  - User accounts
  - Shop information
  - Udhar transactions
  - Online orders

- ✅ **Data IS deleted:**
  - All POS sale records
  - All POS sale items
  - Sales history
  - Receipt numbers

## UI Components

### Button Styling:
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
  <Trash2 className="w-5 h-5" />
  Clear All Data
</button>
```

### Modal Design:
- Clean white background
- Red accent colors for danger
- Warning icon with red background
- Code-style text for confirmation phrase
- Responsive layout (max-width: 28rem)
- Smooth animations (fade and scale)
- Backdrop blur effect

## Technical Details

### State Management:
```typescript
const [showClearModal, setShowClearModal] = useState(false)
const [confirmText, setConfirmText] = useState('')
const [isClearingData, setIsClearingData] = useState(false)
```

### API Request:
```typescript
const res = await fetch('/api/admin/pos/clear-all', {
  method: 'DELETE',
})
```

### Database Operations:
```typescript
// Delete sale items first (foreign key constraint)
await prisma.pOSSaleItem.deleteMany({})

// Then delete sales
await prisma.pOSSale.deleteMany({})
```

## Use Cases

### When to Use:
- Testing environment cleanup
- End of fiscal year data archival
- Database maintenance
- Starting fresh after migration
- Removing old test data

### When NOT to Use:
- During active sales periods
- Without proper backup
- If you need the data for reports
- If you only want to delete specific sales (use individual delete instead)

## Files Modified/Created

1. ✅ **Created:** `src/app/api/admin/pos/clear-all/route.ts`
   - DELETE endpoint for clearing all POS sales

2. ✅ **Modified:** `src/app/admin/pos/page.tsx`
   - Added "Clear All Data" button
   - Added confirmation modal
   - Added `handleClearAllData()` function
   - Added state management for clear operation

## Status: ✅ COMPLETE

The "Clear All Data" feature is now live on the Admin POS Sales page with comprehensive safety measures and confirmation steps.
