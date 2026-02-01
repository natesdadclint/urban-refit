# Urban Refit Database Update Order

## Overview

The Urban Refit database follows a dependency-based update order. Tables are organized by their relationships and foreign key constraints. Understanding this order is critical for maintaining data integrity and avoiding constraint violations.

## Core Foundation Tables (No Dependencies)

These tables are updated first as they have no foreign key dependencies:

1. **users** - Core authentication and user profiles
   - Stores user identity, authentication method, role (user/admin), contact info
   - No dependencies; foundation for all user-related operations

2. **thrift_stores** - Partner thrift store information
   - Stores partner store details, contact info, banking information
   - No dependencies; foundation for product sourcing

3. **charities** - Charity partner information
   - Stores charity details for token donation feature
   - No dependencies; foundation for charitable giving

4. **discount_tiers** - Quantity-based discount rules
   - Stores tiered discount percentages based on order quantity
   - No dependencies; used during checkout calculations

## Product Management Tables

These tables depend on foundation tables:

5. **products** - Individual garments for sale
   - Foreign key: `thriftStoreId` → thrift_stores.id
   - Stores product details, pricing, images, status
   - Must be created after thrift_stores

6. **product_metadata** - Extended product information
   - Foreign key: `productId` → products.id
   - Stores invoice numbers, style descriptions, image alt text
   - Must be created after products

7. **product_reviews** - Customer reviews for products
   - Foreign keys: `productId` → products.id, `userId` → users.id
   - Stores customer ratings and feedback
   - Must be created after products and users

## Shopping & Order Tables

These tables handle the purchase flow:

8. **cart_items** - Shopping cart contents
   - Foreign keys: `userId` → users.id, `productId` → products.id
   - Temporary storage for items user wants to purchase
   - Must be created after users and products

9. **orders** - Customer purchase records
   - Foreign key: `userId` → users.id
   - Stores order totals, status, shipping address
   - Must be created after users

10. **order_items** - Individual items in an order
    - Foreign keys: `orderId` → orders.id, `productId` → products.id
    - Links products to orders with pricing snapshot
    - Must be created after orders and products

11. **payouts** - Thrift store payments for sold items
    - Foreign keys: `thriftStoreId` → thrift_stores.id, `orderItemId` → order_items.id
    - Tracks 5% payout to thrift stores
    - Must be created after thrift_stores and order_items

## Customer Loyalty & Rewards Tables

These tables support the circular economy features:

12. **customer_profiles** - Enhanced user profiles
    - Foreign key: `userId` → users.id
    - Stores loyalty program info, preferences
    - Must be created after users

13. **token_transactions** - Token earning and spending
    - Foreign key: `userId` → users.id
    - Tracks token balance changes and history
    - Must be created after users

14. **charity_donations** - Token donations to charities
    - Foreign keys: `userId` → users.id, `charityId` → charities.id
    - Records charitable giving via tokens
    - Must be created after users and charities

15. **courier_returns** - Garment resale returns
    - Foreign keys: `userId` → users.id, `productId` → products.id
    - Tracks items returned for resale
    - Must be created after users and products

## Content & Communication Tables

These tables handle blog, messaging, and notifications:

16. **blog_posts** - Blog content
    - No foreign keys (standalone content)
    - Can be created anytime after foundation

17. **chat_messages** - AI chatbot conversations
    - Foreign key: `userId` → users.id (optional, for logged-in users)
    - Stores conversation history
    - Must be created after users

18. **contact_messages** - Customer inquiries
    - No foreign keys (standalone)
    - Can be created anytime

19. **contact_replies** - Admin responses to inquiries
    - Foreign key: `messageId` → contact_messages.id
    - Must be created after contact_messages

20. **sell_submissions** - Customer product submissions
    - Foreign key: `userId` → users.id (optional)
    - Stores items users want to sell to Urban Refit
    - Must be created after users

## Admin & System Tables

These tables support operational features:

21. **admin_notifications** - Alerts for admin actions
    - Foreign key: `userId` → users.id (optional, for admin receiving notification)
    - Tracks orders, submissions, messages
    - Must be created after users

22. **notifications** - User notification system
    - Foreign key: `userId` → users.id
    - Stores notification messages
    - Must be created after users

23. **notification_preferences** - User notification settings
    - Foreign key: `userId` → users.id
    - Controls which notifications user receives
    - Must be created after users

24. **email_subscribers** - Newsletter subscription list
    - No foreign keys (independent)
    - Can be created anytime

25. **email_logs** - Email delivery tracking
    - No foreign keys (logging table)
    - Can be created anytime

26. **image_validation_logs** - Image URL health checks
    - No foreign keys (monitoring table)
    - Can be created anytime

27. **broadcast_read_status** - Broadcast message tracking
    - Foreign key: `userId` → users.id
    - Tracks which users have read broadcasts
    - Must be created after users

## Update Sequence Summary

### Phase 1: Foundation (No Dependencies)
```
users → thrift_stores → charities → discount_tiers
```

### Phase 2: Products & Content
```
products → product_metadata → product_reviews
blog_posts → contact_messages → contact_replies
```

### Phase 3: Shopping & Orders
```
cart_items → orders → order_items → payouts
```

### Phase 4: Loyalty & Rewards
```
customer_profiles → token_transactions → charity_donations
courier_returns
```

### Phase 5: Communication & Admin
```
chat_messages → admin_notifications → notifications → notification_preferences
sell_submissions → email_subscribers → email_logs
image_validation_logs → broadcast_read_status
```

## Critical Dependencies

When updating the database, respect these critical relationships:

| Child Table | Parent Table | Constraint |
|---|---|---|
| products | thrift_stores | thriftStoreId |
| product_metadata | products | productId |
| product_reviews | products, users | productId, userId |
| cart_items | users, products | userId, productId |
| orders | users | userId |
| order_items | orders, products | orderId, productId |
| payouts | thrift_stores, order_items | thriftStoreId, orderItemId |
| customer_profiles | users | userId |
| token_transactions | users | userId |
| charity_donations | users, charities | userId, charityId |
| courier_returns | users, products | userId, productId |
| chat_messages | users | userId |
| sell_submissions | users | userId |
| notifications | users | userId |
| notification_preferences | users | userId |
| broadcast_read_status | users | userId |

## Data Flow During a Purchase

Understanding the typical data flow helps clarify the update order:

1. **User adds product to cart** → cart_items updated
2. **User proceeds to checkout** → orders created
3. **Order items recorded** → order_items created
4. **Payment processed** → order status updated to "paid"
5. **Product marked as sold** → products status updated to "sold"
6. **Payout calculated** → payouts created (5% of sale price)
7. **Tokens awarded** → token_transactions created (25% of sale price)
8. **Thrift store payout tracked** → thrift_stores totalPayout updated
9. **Order confirmation sent** → email_logs created

## Best Practices

1. **Always insert parent records before child records** - Never create a product_metadata record before the product exists
2. **Use transactions for multi-table updates** - Wrap related updates in a database transaction
3. **Validate foreign keys** - Ensure referenced IDs exist before inserting
4. **Update timestamps** - Let `updatedAt` auto-update via `onUpdateNow()`
5. **Cascade deletes carefully** - Deleting a thrift store should cascade to its products
6. **Backup before bulk updates** - Always backup before running migration scripts

## Migration Strategy

When adding new tables or modifying schema:

1. Use Drizzle migrations: `pnpm db:push`
2. Test on staging database first
3. Verify all foreign key relationships
4. Run data validation queries
5. Update this documentation
6. Commit changes with clear migration message

## Example: Adding a New Product

```javascript
// Step 1: Ensure thrift store exists
const thriftStore = await db.getThriftStoreById(storeId);
if (!thriftStore) throw new Error("Thrift store not found");

// Step 2: Create product (depends on thrift store)
const product = await db.createProduct({
  name: "Nike Air Force 1",
  thriftStoreId: storeId,
  // ... other fields
});

// Step 3: Add product metadata (depends on product)
await db.createProductMetadata({
  productId: product.id,
  invoiceNumber: "INV-001",
  // ... other fields
});

// Step 4: Product is now ready for sale
// - Can be added to cart
// - Can be reviewed by customers
// - Can be purchased
```

## Troubleshooting

**Error: Foreign key constraint fails**
- Check that parent record exists before inserting child
- Verify the parent ID is correct
- Ensure parent table is created before child

**Error: Duplicate entry**
- Check for unique constraints (e.g., user openId)
- Verify data doesn't already exist

**Error: Column not found**
- Run `pnpm db:push` to apply latest migrations
- Check schema.ts for table definitions

**Orphaned records**
- Use image_validation_logs to find broken image URLs
- Use queries to identify products without thrift stores
- Clean up with admin tools or SQL scripts
