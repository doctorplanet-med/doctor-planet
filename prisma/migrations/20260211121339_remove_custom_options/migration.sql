/*
  Warnings:

  - You are about to drop the column `customOptionValues` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `customOptions` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "size" TEXT,
    "color" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("color", "id", "orderId", "price", "productId", "quantity", "size") SELECT "color", "id", "orderId", "price", "productId", "quantity", "size" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "barcode" TEXT,
    "sku" TEXT,
    "company" TEXT,
    "description" TEXT NOT NULL,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "images" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sizes" TEXT,
    "colors" TEXT,
    "colorImages" TEXT,
    "colorSizeStock" TEXT,
    "sizeChartImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("barcode", "categoryId", "colorImages", "colorSizeStock", "colors", "company", "costPrice", "createdAt", "description", "featured", "id", "images", "isActive", "name", "price", "salePrice", "sizeChartImage", "sizes", "sku", "slug", "stock", "updatedAt") SELECT "barcode", "categoryId", "colorImages", "colorSizeStock", "colors", "company", "costPrice", "createdAt", "description", "featured", "id", "images", "isActive", "name", "price", "salePrice", "sizeChartImage", "sizes", "sku", "slug", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
