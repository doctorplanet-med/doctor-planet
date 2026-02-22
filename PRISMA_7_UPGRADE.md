# Prisma 7 Upgrade Complete

## Summary
Successfully upgraded from Prisma 5.22.0 to Prisma 7.4.1.

## Changes Made

### 1. Package Updates
- `prisma`: 5.22.0 → 7.4.1
- `@prisma/client`: 5.22.0 → 7.4.1
- `@prisma/adapter-libsql`: 5.22.0 → 7.4.1
- `@libsql/client`: 0.4.3 → 0.8.1

### 2. New Dependencies
- `@prisma/adapter-better-sqlite3@7.4.1` - For local SQLite development
- `better-sqlite3@11.8.1` - SQLite driver for local development
- `@types/better-sqlite3@7.6.11` - TypeScript definitions

### 3. Schema Changes (`prisma/schema.prisma`)

**Before:**
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**After:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}
```

**Key Changes:**
- Removed `previewFeatures = ["driverAdapters"]` (now stable in Prisma 7)
- Removed `url` from datasource (now configured via adapters)

### 4. Prisma Client Configuration (`src/lib/prisma.ts`)

**Before:**
```typescript
import { createClient } from '@libsql/client'
const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const adapter = new PrismaLibSQL(libsql)
```

**After:**
```typescript
// For Turso (production)
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// For local SQLite (development)
const adapter = new PrismaBetterSqlite3({ url: dbPath })
```

**Key Changes:**
- Changed class name: `PrismaLibSQL` → `PrismaLibSql` (correct casing)
- Adapter now accepts config directly (no need for separate `createClient`)
- Added `PrismaBetterSqlite3` adapter for local development
- Local SQLite now requires an adapter (no longer uses built-in driver)

### 5. Next.js Configuration (`next.config.js`)

Added packages to `serverComponentsExternalPackages`:
- `@libsql/client`
- `@prisma/adapter-libsql`
- `better-sqlite3`
- `@prisma/adapter-better-sqlite3`

This prevents webpack from trying to bundle these server-only packages.

## Breaking Changes in Prisma 7

1. **Driver Adapters Required**: All databases (including SQLite) now require explicit driver adapters
2. **Schema URL Removed**: Database URLs moved from schema to runtime configuration
3. **Preview Features Stable**: `driverAdapters` is now stable and no longer a preview feature
4. **Class Name Changes**: Adapter class names use proper camelCase (e.g., `PrismaLibSql`)

## Migration Steps

If deploying to production (Vercel/Turso):
1. Ensure environment variables are set:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
2. No schema migration needed (schema structure unchanged)
3. Redeploy application

## Verification

Build completed successfully:
```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (64/64)
```

## References

- [Prisma 7 Upgrade Guide](https://pris.ly/d/major-version-upgrade)
- [Prisma Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Turso with Prisma](https://docs.turso.tech/sdk/ts/orm/prisma)

## Date
February 22, 2026
