# Simplified Size Guide Management System

## Overview
The Size Guide page is now managed through the **Admin Pages** system, making it simpler and more flexible. Admin can add as many sections as needed, including tables and images.

## How to Manage Size Guide

### 1. Access Admin Pages
- Go to: **Admin Dashboard → Pages**
- Or directly: `http://localhost:3000/admin/pages`

### 2. Setup/Edit Size Guide Page
- Click on **"Size Guide"** in the list
- Or click **"Setup Page"** if it's not created yet

### 3. Add Sections
You can add multiple sections with different types:

#### **Text Block**
- Simple text content
- Good for instructions or descriptions

#### **Table** (Perfect for Size Charts!)
- Create size chart tables
- Add/remove columns and rows dynamically
- **Fully responsive** - automatically scrollable on mobile/small screens
- Custom scrollbar styling for better UX
- Example: Size, Chest, Waist, Hip measurements

#### **Image** (Upload Size Chart Images!)
- Upload size chart images from your device
- Or paste image URL
- Perfect for visual size guides

#### **List**
- Bullet point lists
- Good for measurement tips

#### **FAQ**
- Question and answer format
- Collapsible sections

#### **Cards**
- Grid of information cards
- Good for different product categories

#### **CTA (Call to Action)**
- Button with link
- Good for "Contact Us" or "Shop Now"

### 4. Example Size Guide Setup

**Section 1: Text Block**
- Title: "How to Measure"
- Content: "Follow these steps to get accurate measurements..."

**Section 2: Table**
- Title: "Female Scrub Sizes"
- Headers: Size | Chest | Waist | Hip | Length
- Rows: Add your measurements

**Section 3: Image**
- Title: "Size Chart Visual Guide"
- Upload your size chart image

**Section 4: Table**
- Title: "Male Scrub Sizes"
- Headers: Size | Chest | Waist | Hip | Length
- Rows: Add your measurements

**Section 5: Table**
- Title: "Shoe Sizes"
- Headers: US Size | UK Size | EU Size | CM
- Rows: Add your size conversions

**Section 6: CTA**
- Content: "Still unsure about your size?"
- Button Text: "Contact Us"
- Button Link: "/contact"

### 5. Publish
- Toggle **"Published"** to make it live
- Click **"Save Page"**

## Benefits of New System

✅ **Simpler**: One place to manage all pages including Size Guide
✅ **Flexible**: Add unlimited sections in any order
✅ **Tables**: Built-in table creator for size charts
✅ **Images**: Easy image upload for visual guides
✅ **No Code**: No need to edit JSON or code
✅ **Reorderable**: Drag sections to reorder (coming soon)
✅ **Preview**: See exactly how it will look

## Migration from Old System

The old separate Size Guide admin page has been removed. All existing size guides should be recreated in the Pages system for consistency and easier management.

## Technical Details

- **Route**: `/size-guide`
- **Admin Management**: `/admin/pages`
- **Component**: Uses `DynamicPage` component
- **Storage**: Content stored as JSON in database
- **API**: `/api/admin/pages`

## Tips

1. **Use Tables for Size Charts**: The table section is perfect for traditional size charts
2. **Tables are Fully Responsive**: Don't worry about adding many columns - tables automatically become scrollable on mobile devices with a visible scrollbar
3. **Use Images for Visual Guides**: Upload actual size chart images for visual reference
4. **Combine Both**: Use tables for data and images for visual guides
5. **Add Text Sections**: Explain how to measure before showing charts
6. **End with CTA**: Add a contact button at the end for customer support
