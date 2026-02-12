# 📏 How to Add Multiple Size Guides with Images

## Quick Start Guide

### Step 1: Setup Database
Run these commands in your terminal:

```bash
# Add SizeGuide table to database
npx tsx scripts/add-size-guide-table.ts

# Regenerate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

### Step 2: Access Admin Panel
Go to: `http://localhost:3000/admin/size-guides`

---

## 📝 Adding Size Guides (Step by Step)

### Example 1: Female Scrub Tops

1. **Click "Add Size Guide"**

2. **Fill in the form:**
   - **Title**: `Female Scrub Tops Size Chart`
   - **Description**: `Find your perfect fit for women's scrub tops`
   - **Category**: Select `Female Scrub Tops`

3. **Upload Images:**
   - Click "Upload Images"
   - Select measurement diagram images (front view, back view, how to measure, etc.)
   - You can upload multiple images

4. **Add Content** (Click "Template: Scrub Size Table" button):
   ```json
   {
     "type": "table",
     "headers": ["Size", "Chest (inches)", "Waist (inches)", "Length (inches)", "Shoulder (inches)"],
     "rows": [
       ["XS", "32-34", "26-28", "24", "14"],
       ["S", "35-37", "29-31", "25", "15"],
       ["M", "38-40", "32-34", "26", "16"],
       ["L", "41-43", "35-37", "27", "17"],
       ["XL", "44-46", "38-40", "28", "18"],
       ["2XL", "47-49", "41-43", "29", "19"]
     ]
   }
   ```

5. **Set Order**: `10` (displays first)

6. **Click "Create"**

---

### Example 2: Male Scrub Tops

1. **Click "Add Size Guide"** again

2. **Fill in:**
   - **Title**: `Male Scrub Tops Size Chart`
   - **Description**: `Find your perfect fit for men's scrub tops`
   - **Category**: Select `Male Scrub Tops`

3. **Upload Images:**
   - Upload male-specific measurement diagrams

4. **Add Content:**
   ```json
   {
     "type": "table",
     "headers": ["Size", "Chest (inches)", "Waist (inches)", "Length (inches)", "Shoulder (inches)"],
     "rows": [
       ["S", "36-38", "30-32", "27", "16"],
       ["M", "39-41", "33-35", "28", "17"],
       ["L", "42-44", "36-38", "29", "18"],
       ["XL", "45-47", "39-41", "30", "19"],
       ["2XL", "48-50", "42-44", "31", "20"],
       ["3XL", "51-53", "45-47", "32", "21"]
     ]
   }
   ```

5. **Set Order**: `20`

6. **Click "Create"**

---

### Example 3: Female Shoes

1. **Click "Add Size Guide"**

2. **Fill in:**
   - **Title**: `Female Shoe Size Chart`
   - **Description**: `Women's medical shoe sizing guide`
   - **Category**: Select `Female Shoes`

3. **Upload Images:**
   - Upload foot measurement guide image
   - Upload width guide image

4. **Add Content** (Click "Template: Shoe Size Table"):
   ```json
   {
     "type": "table",
     "headers": ["EU Size", "UK Size", "US Size", "Foot Length (cm)"],
     "rows": [
       ["36", "3.5", "5.5", "22.5"],
       ["37", "4", "6", "23"],
       ["38", "5", "7", "23.5"],
       ["39", "5.5", "7.5", "24"],
       ["40", "6.5", "8.5", "24.5"],
       ["41", "7", "9", "25"]
     ]
   }
   ```

5. **Set Order**: `30`

6. **Click "Create"**

---

### Example 4: Male Shoes

1. **Click "Add Size Guide"**

2. **Fill in:**
   - **Title**: `Male Shoe Size Chart`
   - **Description**: `Men's medical shoe sizing guide`
   - **Category**: Select `Male Shoes`

3. **Upload Images:**
   - Upload male foot measurement guide

4. **Add Content:**
   ```json
   {
     "type": "table",
     "headers": ["EU Size", "UK Size", "US Size", "Foot Length (cm)"],
     "rows": [
       ["40", "6.5", "7.5", "25"],
       ["41", "7.5", "8.5", "25.5"],
       ["42", "8", "9", "26"],
       ["43", "9", "10", "26.5"],
       ["44", "9.5", "10.5", "27"],
       ["45", "10.5", "11.5", "27.5"],
       ["46", "11", "12", "28"]
     ]
   }
   ```

5. **Set Order**: `40`

6. **Click "Create"**

---

### Example 5: How to Measure (General Instructions)

1. **Click "Add Size Guide"**

2. **Fill in:**
   - **Title**: `How to Take Measurements`
   - **Description**: `Step-by-step guide for accurate measurements`
   - **Category**: Select `General / How to Measure`

3. **Upload Images:**
   - Upload measurement technique images
   - Upload body measurement points diagram

4. **Add Content** (Click "Template: Text Instructions"):
   ```json
   {
     "type": "text",
     "text": "For the most accurate fit, follow these steps:\n\n**CHEST**: Measure around the fullest part of your chest, keeping the tape horizontal and parallel to the floor.\n\n**WAIST**: Measure around your natural waistline (typically the narrowest part of your torso), keeping the tape comfortably loose.\n\n**HIPS**: Measure around the fullest part of your hips and buttocks.\n\n**INSEAM**: Measure from the crotch seam to the bottom of your ankle.\n\n**SHOULDER**: Measure from the edge of one shoulder to the other across your back.\n\n**SLEEVE**: Measure from the center back of your neck, over your shoulder, down to your wrist.\n\n💡 TIP: If you're between sizes, we recommend sizing up for a more comfortable fit during long shifts."
   }
   ```

5. **Set Order**: `1` (displays first)

6. **Click "Create"**

---

## 🎨 Image Guidelines

### Best Practices:
- **Size**: 1200x800px or 16:9 ratio recommended
- **Format**: JPG, PNG, or WebP
- **File Size**: Under 5MB per image
- **Content Ideas**:
  - Measurement diagrams with arrows
  - Body measurement points illustration
  - How-to-measure step-by-step photos
  - Size comparison charts
  - Fit guide illustrations

### Example Images to Upload:
1. **General Measurement Guide**: Full body diagram showing where to measure
2. **Scrub Tops**: Front and back view with measurement points
3. **Scrub Pants**: Side view showing inseam, waist, hip measurements
4. **Shoes**: Foot measurement guide with ruler
5. **Fit Examples**: Photos showing proper vs improper fit

---

## 📊 Content Format Examples

### 1. Size Table (Most Common)
```json
{
  "type": "table",
  "headers": ["Size", "Chest", "Waist", "Length"],
  "rows": [
    ["S", "34-36\"", "28-30\"", "26\""],
    ["M", "38-40\"", "32-34\"", "27\""],
    ["L", "42-44\"", "36-38\"", "28\""]
  ]
}
```

### 2. Text Instructions
```json
{
  "type": "text",
  "text": "Your instructions here.\n\nUse **bold** for emphasis.\n\nAdd multiple paragraphs."
}
```

### 3. Complex Size Table
```json
{
  "type": "table",
  "headers": ["Size", "Chest", "Waist", "Hip", "Inseam", "Shoulder", "Sleeve"],
  "rows": [
    ["XS", "32-34", "26-28", "34-36", "29", "14", "31"],
    ["S", "35-37", "29-31", "37-39", "30", "15", "32"],
    ["M", "38-40", "32-34", "40-42", "31", "16", "33"]
  ]
}
```

---

## 🎯 Complete Example Setup

Here's how to set up a complete size guide system:

### 1. General Instructions (Order: 1)
- **Category**: General
- **Images**: Upload measurement technique photos
- **Content**: Text format with step-by-step instructions

### 2. Female Scrub Tops (Order: 10)
- **Category**: Female Scrub Tops
- **Images**: Female measurement diagrams
- **Content**: Size table with chest, waist, length, shoulder

### 3. Male Scrub Tops (Order: 20)
- **Category**: Male Scrub Tops
- **Images**: Male measurement diagrams
- **Content**: Size table with measurements

### 4. Female Scrub Pants (Order: 30)
- **Category**: Female Scrub Pants
- **Images**: Pants measurement guide
- **Content**: Size table with waist, hip, inseam

### 5. Male Scrub Pants (Order: 40)
- **Category**: Male Scrub Pants
- **Images**: Male pants guide
- **Content**: Size table

### 6. Female Shoes (Order: 50)
- **Category**: Female Shoes
- **Images**: Foot measurement guide
- **Content**: EU/UK/US conversion table

### 7. Male Shoes (Order: 60)
- **Category**: Male Shoes
- **Images**: Male shoe guide
- **Content**: Size conversion table

---

## 🔧 Managing Existing Guides

### Edit a Guide
1. Click the **Edit (pencil)** icon
2. Modify any fields
3. Add/remove images
4. Update content
5. Click "Update"

### Show/Hide a Guide
- Click the **Eye icon** to toggle visibility
- Hidden guides won't appear on the public page

### Delete a Guide
- Click the **Trash icon**
- Confirm deletion

### Reorder Guides
- Change the **Order** number when editing
- Lower numbers appear first (1, 10, 20, 30...)

---

## 🌟 Pro Tips

1. **Use Clear Titles**: "Female Scrub Tops" instead of just "Tops"
2. **Add Descriptions**: Help users know which guide to check
3. **Upload Multiple Images**: Show different angles and measurement points
4. **Use Consistent Units**: Stick to inches or cm throughout
5. **Test on Mobile**: Preview the public page on mobile devices
6. **Order Logically**: General info first, then specific categories
7. **Keep Tables Simple**: Don't add too many columns (max 5-6)

---

## 📱 Public Display

All active size guides will appear on:
`http://localhost:3000/size-guide`

Features:
- ✨ Beautiful animated layout
- 📸 Image galleries for each guide
- 📊 Responsive size tables
- 📱 Mobile-friendly
- 🎨 Gradient backgrounds
- 💫 Smooth animations

---

## ❓ Troubleshooting

### Images not uploading?
- Check file size (must be under 5MB)
- Use supported formats (JPG, PNG, WebP, GIF)
- Check browser console (F12) for errors
- Ensure you're logged in as ADMIN

### Table not displaying correctly?
- Validate JSON syntax (use a JSON validator)
- Ensure all rows have the same number of columns as headers
- Check for missing quotes or commas

### Guide not showing on public page?
- Verify "Active" checkbox is checked
- Check the order number
- Refresh the page

---

## 🎓 Quick Reference

### Available Categories:
- General / How to Measure
- Female Scrub Tops
- Male Scrub Tops
- Female Scrub Pants
- Male Scrub Pants
- Female Shoes
- Male Shoes
- Unisex Shoes
- Lab Coats
- Accessories
- Gloves
- Caps / Head Covers

### Content Types:
- **table**: For size charts
- **text**: For instructions and descriptions

### Order Numbers (Suggested):
- 1-9: General instructions
- 10-29: Female scrubs
- 30-49: Male scrubs
- 50-69: Shoes
- 70-89: Lab coats
- 90+: Accessories

---

**Need Help?** Check the browser console (F12) for detailed error messages!
