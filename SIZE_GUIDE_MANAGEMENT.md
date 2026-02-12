# Size Guide Management System

## Overview
A complete system for managing size guides with images on your Doctor Planet website.

## Features
✅ **Admin Panel** - Full CRUD operations for size guides
✅ **Image Upload** - Multiple images per size guide
✅ **Categories** - Organize by product type (Scrubs, Shoes, etc.)
✅ **Rich Content** - Support for tables, text, and custom content
✅ **Drag & Drop** - Reorder size guides
✅ **Active/Inactive** - Show/hide guides without deleting
✅ **Responsive** - Beautiful display on all devices

## Setup Instructions

### 1. Run Database Migration
```bash
# Add SizeGuide table to your Turso database
npx tsx scripts/add-size-guide-table.ts

# Regenerate Prisma client
npx prisma generate

# Restart your dev server
npm run dev
```

### 2. Access Admin Panel
Navigate to: `http://localhost:3000/admin/size-guides`

## How to Use

### Adding a New Size Guide

1. **Click "Add Size Guide"** button
2. **Fill in the form:**
   - **Title**: e.g., "Scrub Tops Size Chart"
   - **Description**: Brief description (optional)
   - **Category**: Select from dropdown
     - General
     - Scrub Tops
     - Scrub Pants
     - Shoes
     - Lab Coats
     - Accessories
   - **Images**: Upload multiple images
   - **Content**: Add your size chart data (see formats below)
   - **Order**: Display order (0 = first)
   - **Active**: Check to make visible

3. **Click "Create"**

### Content Formats

#### 1. Text Content
```json
{
  "type": "text",
  "text": "Your measurement instructions here.\n\nUse **bold** for emphasis."
}
```

#### 2. Size Table
```json
{
  "type": "table",
  "headers": ["Size", "Chest (inches)", "Length (inches)"],
  "rows": [
    ["XS", "32-34\"", "25\""],
    ["S", "35-37\"", "26\""],
    ["M", "38-40\"", "27\""],
    ["L", "41-43\"", "28\""],
    ["XL", "44-46\"", "29\""],
    ["2XL", "47-49\"", "30\""]
  ]
}
```

### Uploading Images

1. **Click "Upload Images"** in the form
2. **Select multiple images** (JPG, PNG, WebP)
3. **Images will upload automatically**
4. **Preview and remove** unwanted images
5. **Images display in a grid** on the public page

### Managing Existing Size Guides

#### Edit
- Click the **Edit (pencil)** icon
- Modify any fields
- Click "Update"

#### Show/Hide
- Click the **Eye icon** to toggle visibility
- Hidden guides won't appear on the public page

#### Delete
- Click the **Trash icon**
- Confirm deletion

#### Reorder
- Drag the **grip icon** (coming soon)
- Or change the **Order** number when editing

## Public Page

Users can view all active size guides at:
`https://yoursite.com/size-guide`

Features:
- Beautiful animated layout
- Image galleries for each guide
- Responsive size tables
- Contact CTA at bottom

## API Endpoints

### Public
- `GET /api/size-guides` - Get all active size guides

### Admin (requires authentication)
- `GET /api/admin/size-guides` - Get all size guides
- `POST /api/admin/size-guides` - Create new size guide
- `PUT /api/admin/size-guides/[id]` - Update size guide
- `DELETE /api/admin/size-guides/[id]` - Delete size guide

## Database Schema

```prisma
model SizeGuide {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String
  images      String   // JSON array
  content     String   // JSON content
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Tips & Best Practices

### Images
- **Recommended size**: 1200x800px or 16:9 ratio
- **Format**: JPG or PNG
- **File size**: Keep under 500KB for fast loading
- **Content**: Size charts, measurement diagrams, fit guides

### Categories
- Use consistent categories across guides
- Group related size information together
- Keep categories simple and clear

### Content
- Use tables for size charts
- Use text for measurement instructions
- Keep content concise and scannable
- Test on mobile devices

### Order
- Lower numbers appear first
- Use increments of 10 (10, 20, 30) for easy reordering
- Group by category using order numbers

## Troubleshooting

### Images not uploading?
- Check file size (max 10MB)
- Ensure `/public/uploads/` folder exists
- Check file permissions

### Size guide not showing?
- Verify "Active" is checked
- Check the order number
- Clear browser cache

### Table not formatting correctly?
- Validate JSON syntax
- Ensure all rows have same number of columns
- Check for special characters

## Example Use Cases

### 1. Scrub Tops with Measurement Diagram
- Upload: Front and back measurement diagram images
- Content: Size table with chest, length, sleeve measurements
- Category: "scrubs-tops"

### 2. Shoe Sizing with Fit Guide
- Upload: Foot measurement guide image
- Content: Conversion table (EU, US, UK sizes)
- Category: "shoes"

### 3. General Measurement Instructions
- Upload: How-to-measure illustration
- Content: Step-by-step text instructions
- Category: "general"

## Support

For issues or questions:
- Check this documentation
- Review the admin panel tooltips
- Contact your development team

---

**Last Updated**: February 2026
**Version**: 1.0.0
