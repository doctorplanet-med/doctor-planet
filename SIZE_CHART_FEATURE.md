# Size Chart Image Feature

## Overview
Added an optional size chart image feature for products. Admins can upload a size chart image when creating or editing products, and customers can view this chart on the product detail page to help them choose the right size.

## Database Schema
The `Product` model already had the `sizeChartImage` field:
```prisma
model Product {
  // ... other fields
  sizeChartImage String?  // Optional URL to size chart image
  // ... other fields
}
```

## Implementation Details

### Admin Side

#### 1. Add Product Page (`src/app/admin/products/new/page.tsx`)
**Changes:**
- Added state for size chart image:
  ```typescript
  const [sizeChartImage, setSizeChartImage] = useState<string>('')
  const [isUploadingSizeChart, setIsUploadingSizeChart] = useState(false)
  ```

- Added upload handler:
  ```typescript
  const handleSizeChartUpload = async (file: File | null) => {
    // Validates file type (JPG, PNG, WebP)
    // Validates file size (max 5MB)
    // Uploads to Firebase Storage under 'size-charts' folder
    // Updates state with the uploaded URL
  }
  
  const removeSizeChart = () => {
    // Clears the size chart image
  }
  ```

- Added UI section with drag-and-drop upload area
- Displays uploaded image with remove button
- Included in form submission

#### 2. Edit Product Page (`src/app/admin/products/[id]/edit/page.tsx`)
**Changes:**
- Updated existing size chart section to match new page's UI
- Improved preview with full-size image display
- Added remove button functionality
- Better upload area with loading state

**Features:**
- Drag-and-drop or click to upload
- Real-time preview of uploaded image
- Remove button with confirmation
- Validation for file type and size
- Loading state during upload

### User Side

#### Product Detail Page (`src/components/products/product-detail.tsx`)
**Changes:**
- Added "View Size Chart" button next to the Size label (only shown if size chart exists)
- Uses existing modal implementation for displaying the size chart
- Modal shows full-size chart image with zoom capability

**Features:**
- Icon-based button for quick access
- Responsive modal overlay
- Full-screen size chart display
- Click outside to close
- Mobile-friendly

## User Flow

### Admin Flow:
1. Admin goes to Add/Edit Product page
2. Scrolls to "Size Chart (Optional)" section
3. Clicks upload area or drags image file
4. System validates and uploads to Firebase
5. Preview shown with option to remove
6. Saves with product when form is submitted

### Customer Flow:
1. Customer views product detail page
2. If product has sizes and a size chart, sees "View Size Chart" button
3. Clicks button to open modal
4. Views full-size chart in modal overlay
5. Clicks outside or close button to dismiss

## File Locations

### Modified Files:
1. `src/app/admin/products/new/page.tsx` - Add product page
2. `src/app/admin/products/[id]/edit/page.tsx` - Edit product page
3. `src/components/products/product-detail.tsx` - Product detail component

### Firebase Storage:
- Size charts uploaded to: `size-charts/` folder
- Format: `size-charts/[timestamp]-[filename]`

## Benefits

1. **Better Customer Experience**: Customers can easily reference size charts when making purchase decisions
2. **Reduced Returns**: Clear sizing information helps customers choose correct sizes
3. **Flexible Management**: Admins can upload, preview, and remove size charts easily
4. **Optional Feature**: Only shown when relevant (product has sizes + chart uploaded)
5. **Mobile Optimized**: Works seamlessly on all screen sizes

## Technical Notes

- Uses Firebase Storage for image hosting
- File validation: JPG, PNG, WebP formats
- Max file size: 5MB
- Lazy loading on modal open
- Responsive image display with proper aspect ratio
- Click-outside-to-close functionality
- Smooth animations with Framer Motion

## Future Enhancements (Optional)

1. Multiple size charts per product (e.g., different measurement systems)
2. PDF support for detailed size guides
3. Interactive size calculator
4. Size recommendation based on customer measurements
5. Bulk upload for multiple products
