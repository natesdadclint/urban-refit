# Products Table Flow: Child to Backend Execution

## Overview

This document traces the complete flow of how the **products** child table (with **thriftStoreId** foreign key constraint) flows through the Urban Refit backend system, from user interaction to database execution.

---

## 1. Frontend Layer - User Interaction

### Location: `/client/src/pages/admin/ProductForm.tsx` or similar

The admin user initiates product creation through a form:

```typescript
// User fills out form with:
const formData = {
  name: "Nike Air Force 1 Low",
  brand: "Nike",
  category: "shoes",
  size: "US 10",
  condition: "like_new",
  originalCost: 45.00,
  markupPercentage: 120,
  thriftStoreId: 6,  // ← CRITICAL: Foreign key to parent table
  image1Url: "/products/nike-air-force-1.png",
  image2Url: "/products/nike-detail.jpg"
};
```

### Frontend Validation

```typescript
// Before sending to backend, frontend validates:
- name is not empty
- originalCost is positive
- markupPercentage is >= 0
- category is one of: ["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]
- condition is one of: ["like_new", "excellent", "good", "fair"]
- thriftStoreId is a valid number (optional but recommended)
```

### Frontend Sends tRPC Request

```typescript
// client/src/pages/admin/ProductForm.tsx
const createProduct = trpc.product.create.useMutation({
  onSuccess: (data) => {
    toast.success(`Product created with ID: ${data.id}`);
    queryClient.invalidateQueries(['product.list']);
  },
  onError: (error) => {
    toast.error(error.message);
  }
});

// User clicks "Create Product"
createProduct.mutate({
  name: "Nike Air Force 1 Low",
  brand: "Nike",
  category: "shoes",
  size: "US 10",
  condition: "like_new",
  originalCost: 45.00,
  markupPercentage: 120,
  thriftStoreId: 6,
  image1Url: "/products/nike-air-force-1.png",
  image2Url: "/products/nike-detail.jpg"
});
```

---

## 2. Network Layer - tRPC Request

### HTTP Request Details

```
POST /api/trpc/product.create
Content-Type: application/json
Authorization: Bearer <JWT_SESSION_COOKIE>

Body:
{
  "json": {
    "name": "Nike Air Force 1 Low",
    "brand": "Nike",
    "category": "shoes",
    "size": "US 10",
    "condition": "like_new",
    "originalCost": 45.00,
    "markupPercentage": 120,
    "thriftStoreId": 6,
    "image1Url": "/products/nike-air-force-1.png",
    "image2Url": "/products/nike-detail.jpg"
  }
}
```

### Request Routing

```
Browser → Vite Dev Server (port 3000)
         → Express Server
         → tRPC Router
         → /api/trpc endpoint handler
```

---

## 3. Backend Layer - tRPC Router

### Location: `server/routers.ts` (lines 146-172)

```typescript
// Step 1: Define the tRPC procedure
product: router({
  create: adminProcedure  // ← Requires admin role
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      brand: z.string().optional(),
      category: z.enum(["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]),
      size: z.string().optional(),
      condition: z.enum(["like_new", "excellent", "good", "fair"]),
      color: z.string().optional(),
      material: z.string().optional(),
      originalCost: z.number().positive(),
      markupPercentage: z.number().min(0),
      thriftStoreId: z.number().optional(),  // ← Foreign key field
      image1Url: z.string().optional(),
      image2Url: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Step 2: Validate input with Zod schema
      // - Ensures thriftStoreId is a number (if provided)
      // - Ensures all required fields are present
      
      // Step 3: Calculate pricing
      const pricing = calculatePricing(input.originalCost, input.markupPercentage);
      // pricing = {
      //   salePrice: "99.00",
      //   thriftStorePayoutAmount: "4.95"  // 5% of sale price
      // }
      
      // Step 4: Call database layer
      const id = await db.createProduct({
        ...input,
        originalCost: input.originalCost.toFixed(2),
        markupPercentage: input.markupPercentage.toFixed(2),
        salePrice: pricing.salePrice,
        thriftStorePayoutAmount: pricing.thriftStorePayoutAmount,
      });
      
      // Step 5: Return response
      return { id, success: true, ...pricing };
    }),
})
```

### Authentication & Authorization Check

```typescript
// adminProcedure enforces:
1. User must be authenticated (session cookie present)
2. User role must be "admin" (from users table)
3. If not admin → throw TRPCError { code: "FORBIDDEN" }

// From server/_core/trpc.ts:
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
```

### Input Validation

```typescript
// Zod schema validates each field:
- name: must be non-empty string
- category: must be one of 8 enum values
- condition: must be one of 4 enum values
- originalCost: must be positive number
- markupPercentage: must be >= 0
- thriftStoreId: must be number (optional)

// If validation fails → throw ZodError
// If thriftStoreId is provided but invalid → validation passes
// (Database will enforce foreign key constraint)
```

### Pricing Calculation

```typescript
// From routers.ts line 24-30:
function calculatePricing(originalCost: number, markupPercentage: number) {
  const salePrice = originalCost * (1 + markupPercentage / 100);
  const thriftStorePayoutAmount = salePrice * 0.05; // 5% to thrift store
  return {
    salePrice: salePrice.toFixed(2),
    thriftStorePayoutAmount: thriftStorePayoutAmount.toFixed(2),
  };
}

// Example:
// originalCost: 45.00
// markupPercentage: 120
// salePrice = 45 * (1 + 120/100) = 45 * 2.2 = 99.00
// thriftStorePayoutAmount = 99.00 * 0.05 = 4.95
```

---

## 4. Database Layer - Query Execution

### Location: `server/db.ts` (lines 162-167)

```typescript
// Step 1: Get database connection
export async function createProduct(product: InsertProduct) {
  const db = await getDb();  // ← Establishes MySQL connection
  if (!db) throw new Error("Database not available");
  
  // Step 2: Insert product record
  const result = await db.insert(products).values(product);
  
  // Step 3: Return inserted ID
  return result[0].insertId;
}
```

### Drizzle ORM Translation

```typescript
// Drizzle translates the TypeScript code to SQL:

// Input object:
{
  name: "Nike Air Force 1 Low",
  brand: "Nike",
  category: "shoes",
  size: "US 10",
  condition: "like_new",
  originalCost: "45.00",
  markupPercentage: "120.00",
  salePrice: "99.00",
  thriftStorePayoutAmount: "4.95",
  thriftStoreId: 6,
  image1Url: "/products/nike-air-force-1.png",
  image2Url: "/products/nike-detail.jpg",
  status: "available",  // default value
  createdAt: 2026-02-01T13:19:00Z,  // auto-generated
  updatedAt: 2026-02-01T13:19:00Z   // auto-generated
}

// Generated SQL:
INSERT INTO products (
  name, brand, category, size, condition, originalCost, markupPercentage,
  salePrice, thriftStorePayoutAmount, thriftStoreId, image1Url, image2Url,
  status, createdAt, updatedAt
) VALUES (
  'Nike Air Force 1 Low', 'Nike', 'shoes', 'US 10', 'like_new', '45.00', '120.00',
  '99.00', '4.95', 6, '/products/nike-air-force-1.png', '/products/nike-detail.jpg',
  'available', '2026-02-01 13:19:00', '2026-02-01 13:19:00'
)
```

---

## 5. Database Constraint Enforcement

### Foreign Key Constraint Check

```sql
-- MySQL enforces the constraint:
CONSTRAINT fk_products_thriftStoreId 
FOREIGN KEY (thriftStoreId) 
REFERENCES thrift_stores(id)

-- Before INSERT, MySQL checks:
1. Is thriftStoreId NULL? → ALLOWED (optional foreign key)
2. Does thriftStoreId = 6 exist in thrift_stores.id? → MUST CHECK
```

### Two Scenarios

#### Scenario A: Valid thriftStoreId (6 exists)

```sql
-- thrift_stores table contains:
id | name           | email
---|----------------|------------------
1  | Salvation Army | sa@example.com
2  | Red Cross      | rc@example.com
3  | Goodwill       | gw@example.com
4  | Vinnies        | vinnies@example.com
5  | St Vincent     | sv@example.com
6  | Local Thrift   | local@example.com  ← EXISTS

-- INSERT succeeds ✓
-- Product is created with thriftStoreId = 6
-- Link established to parent thrift store
```

#### Scenario B: Invalid thriftStoreId (99 doesn't exist)

```sql
-- thrift_stores table does NOT contain id = 99

-- MySQL Error:
ERROR 1452 (23000): Cannot add or update a child row: 
a foreign key constraint fails (
  `urban_refit`.`products`, 
  CONSTRAINT `fk_products_thriftStoreId` 
  FOREIGN KEY (`thriftStoreId`) 
  REFERENCES `thrift_stores` (`id`)
)

-- INSERT fails ✗
-- Product is NOT created
-- Error propagates back to backend
```

#### Scenario C: NULL thriftStoreId

```sql
-- thriftStoreId is optional (nullable)

-- INSERT succeeds ✓
-- Product is created with thriftStoreId = NULL
-- No thrift store association
-- Can be updated later with valid thriftStoreId
```

---

## 6. Error Handling & Response

### Success Path

```typescript
// Database returns insertId = 270001

// db.createProduct returns:
270001

// tRPC mutation returns:
{
  id: 270001,
  success: true,
  salePrice: "99.00",
  thriftStorePayoutAmount: "4.95"
}

// Frontend receives response:
{
  json: {
    result: {
      data: {
        id: 270001,
        success: true,
        salePrice: "99.00",
        thriftStorePayoutAmount: "4.95"
      }
    }
  }
}

// Toast notification:
"Product created with ID: 270001"
```

### Error Path - Foreign Key Violation

```typescript
// Database throws error:
ERROR 1452: Foreign key constraint fails

// Drizzle ORM catches error and throws:
new Error("Foreign key constraint fails...")

// db.createProduct throws:
throw new Error("Foreign key constraint fails...")

// tRPC mutation catches error:
catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message
  });
}

// Frontend receives error:
{
  json: {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Foreign key constraint fails..."
    }
  }
}

// Toast notification:
"Foreign key constraint fails..."
```

### Error Path - Invalid Input

```typescript
// Zod validation fails:
- originalCost = -10 (negative, not allowed)
- category = "invalid" (not in enum)

// Zod throws ZodError

// tRPC catches and formats:
{
  code: "BAD_REQUEST",
  message: "Invalid input",
  issues: [
    { path: ["originalCost"], message: "Must be positive" },
    { path: ["category"], message: "Invalid enum value" }
  ]
}

// Frontend receives error and displays:
"Invalid input: Must be positive"
```

---

## 7. Complete Request/Response Cycle

### Timeline

```
T0:    User clicks "Create Product" button
T1:    Frontend validates form data
T2:    Frontend sends tRPC request (POST /api/trpc/product.create)
T3:    Express server receives request
T4:    tRPC router matches endpoint
T5:    adminProcedure checks authentication & authorization
T6:    Zod schema validates input
T7:    calculatePricing() computes sale price & payout
T8:    db.createProduct() called
T9:    Drizzle ORM translates to SQL
T10:   MySQL connection executes INSERT
T11:   MySQL validates foreign key constraint
T12:   MySQL checks if thriftStoreId exists in thrift_stores
T13:   MySQL inserts row (if valid) or throws error
T14:   Drizzle ORM returns insertId or throws error
T15:   db.createProduct() returns insertId or throws
T16:   tRPC mutation returns response or error
T17:   Express sends HTTP response
T18:   Frontend receives response
T19:   Toast notification displayed
T20:   Query cache invalidated (if success)
T21:   UI updated with new product
```

**Total Time: ~100-500ms** (depending on network latency and database load)

---

## 8. Data Integrity Guarantees

### What the Foreign Key Constraint Ensures

| Guarantee | Mechanism |
|-----------|-----------|
| **Referential Integrity** | Cannot insert product with non-existent thriftStoreId |
| **Orphan Prevention** | Cannot create product without valid parent store |
| **Data Consistency** | Product always links to real thrift store (or NULL) |
| **Cascade Operations** | If thrift store deleted, can cascade delete products |
| **Query Optimization** | Can safely JOIN products with thrift_stores |

### What the Constraint Does NOT Ensure

| Scenario | Result |
|----------|--------|
| Thrift store becomes inactive | Product still linked (no automatic action) |
| Thrift store changes name | Product sees updated name (automatic via JOIN) |
| Product references wrong store | Constraint doesn't validate business logic |
| Duplicate product creation | No constraint prevents this |

---

## 9. Related Database Operations

### Querying Products with Thrift Store Info

```typescript
// From db.ts line 304-318:
export async function getProductWithThriftStore(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    product: products,
    thriftStore: thriftStores
  })
  .from(products)
  .leftJoin(thriftStores, eq(products.thriftStoreId, thriftStores.id))
  .where(eq(products.id, id))
  .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// Generated SQL:
SELECT 
  products.*,
  thrift_stores.*
FROM products
LEFT JOIN thrift_stores ON products.thriftStoreId = thrift_stores.id
WHERE products.id = 270001
LIMIT 1

// Returns:
{
  product: {
    id: 270001,
    name: "Nike Air Force 1 Low",
    thriftStoreId: 6,
    // ... other fields
  },
  thriftStore: {
    id: 6,
    name: "Local Thrift",
    email: "local@example.com",
    // ... other fields
  }
}
```

### Updating Product with New Thrift Store

```typescript
// Admin changes which thrift store sources this product
await db.updateProduct(270001, {
  thriftStoreId: 3  // Change from store 6 to store 3
});

// Generated SQL:
UPDATE products
SET thriftStoreId = 3, updatedAt = NOW()
WHERE id = 270001

// MySQL checks:
1. Does thriftStoreId = 3 exist in thrift_stores? → YES
2. Update succeeds ✓

// If store 3 didn't exist:
// ERROR 1452: Foreign key constraint fails
```

### Deleting Thrift Store (Cascade Behavior)

```typescript
// Admin deletes a thrift store
await db.deleteThriftStore(6);

// MySQL behavior depends on CASCADE setting:
// Option 1: RESTRICT (default)
// ERROR: Cannot delete thrift store with linked products

// Option 2: CASCADE
// DELETE thrift_stores WHERE id = 6
// DELETE products WHERE thriftStoreId = 6  ← Automatic!

// Option 3: SET NULL
// DELETE thrift_stores WHERE id = 6
// UPDATE products SET thriftStoreId = NULL WHERE thriftStoreId = 6
```

---

## 10. Debugging & Troubleshooting

### Common Issues

#### Issue: "Foreign key constraint fails"

```
Cause: thriftStoreId doesn't exist in thrift_stores table

Solution:
1. Check if thrift store exists:
   SELECT * FROM thrift_stores WHERE id = 6;

2. If not found, create it first:
   INSERT INTO thrift_stores (name, email) VALUES ('New Store', 'email@example.com');

3. Then create product with valid thriftStoreId
```

#### Issue: Product created but thriftStoreId is NULL

```
Cause: thriftStoreId was optional and not provided

Solution:
1. Check if thriftStoreId was intentionally NULL
2. If not, update product:
   UPDATE products SET thriftStoreId = 6 WHERE id = 270001;

3. Verify constraint allows NULL:
   SHOW CREATE TABLE products;
   (Look for "thriftStoreId: int" without "NOT NULL")
```

#### Issue: Cannot update product to new thriftStoreId

```
Cause: New thriftStoreId doesn't exist

Solution:
1. Verify new store exists:
   SELECT * FROM thrift_stores WHERE id = 99;

2. If not found, use valid store ID:
   UPDATE products SET thriftStoreId = 6 WHERE id = 270001;
```

### Verification Queries

```sql
-- Check all products with their thrift stores:
SELECT 
  p.id,
  p.name,
  p.thriftStoreId,
  ts.name as thriftStoreName
FROM products p
LEFT JOIN thrift_stores ts ON p.thriftStoreId = ts.id
ORDER BY p.createdAt DESC;

-- Find orphaned products (thriftStoreId doesn't exist):
SELECT p.*
FROM products p
LEFT JOIN thrift_stores ts ON p.thriftStoreId = ts.id
WHERE p.thriftStoreId IS NOT NULL AND ts.id IS NULL;

-- Count products per thrift store:
SELECT 
  ts.name,
  COUNT(p.id) as productCount
FROM thrift_stores ts
LEFT JOIN products p ON ts.id = p.thriftStoreId
GROUP BY ts.id
ORDER BY productCount DESC;
```

---

## Summary

The **products → thrift_stores** foreign key constraint ensures that every product either:

1. **Links to a valid thrift store** (thriftStoreId exists in thrift_stores table), or
2. **Has no thrift store** (thriftStoreId is NULL)

This constraint is enforced at the **database level** (MySQL), not the application level, ensuring data integrity even if the backend code has bugs. The constraint is checked during the INSERT operation (step T12 in the timeline), and the entire transaction fails if the constraint is violated.
