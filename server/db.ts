import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  thriftStores, InsertThriftStore, ThriftStore,
  products, InsertProduct, Product,
  cartItems, InsertCartItem,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem,
  payouts, InsertPayout,
  emailLogs, InsertEmailLog,
  customerProfiles, InsertCustomerProfile, CustomerProfile,
  charities, InsertCharity, Charity,
  courierReturns, InsertCourierReturn, CourierReturn,
  tokenTransactions, InsertTokenTransaction, TokenTransaction,
  charityDonations, InsertCharityDonation, CharityDonation,
  discountTiers, InsertDiscountTier, DiscountTier,
  sellSubmissions, InsertSellSubmission, SellSubmission,
  productMetadata, InsertProductMetadata, ProductMetadata,
  emailSubscribers, InsertEmailSubscriber, EmailSubscriber,
  contactMessages, InsertContactMessage, ContactMessage,
  contactReplies, InsertContactReply, ContactReply,
  notifications, InsertNotification, Notification,
  broadcastReadStatus, InsertBroadcastReadStatus, BroadcastReadStatus,
  notificationPreferences, InsertNotificationPreference, NotificationPreference,
  imageValidationLogs, InsertImageValidationLog, ImageValidationLog,
  adminNotifications, InsertAdminNotification, AdminNotification,
  referralCodes, InsertReferralCode, ReferralCode,
  referrals, InsertReferral, Referral,
  siteBanners, InsertSiteBanner, SiteBanner,
  sellSubmissionReplies, InsertSellSubmissionReply, SellSubmissionReply
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Reset the database connection (e.g. after ECONNRESET).
 */
export function resetDb() {
  _db = null;
}

/**
 * Retry logic for transient database errors
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 100
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error;
      if (error?.code === "ECONNRESET" || error?.code === "PROTOCOL_CONNECTION_LOST") {
        resetDb();
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Retry failed");
}

// ============ USER QUERIES ============

export async function getUserByOpenId(openId: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [user] = await db.select().from(users).where(eq(users.openId, openId));
    return user || null;
  });
}

export async function createUser(data: InsertUser) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(users).values(data);
    return result[0];
  });
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(users).set(data).where(eq(users.id, id));
    return true;
  });
}

// ============ THRIFT STORE QUERIES ============

export async function getAllThriftStores(activeOnly = true) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    if (activeOnly) {
      return db.select().from(thriftStores).where(eq(thriftStores.isActive, true));
    }
    return db.select().from(thriftStores);
  });
}

export async function getThriftStoreById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [store] = await db.select().from(thriftStores).where(eq(thriftStores.id, id));
    return store || null;
  });
}

export async function createThriftStore(data: InsertThriftStore) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(thriftStores).values(data);
    return result[0];
  });
}

export async function updateThriftStore(id: number, data: Partial<InsertThriftStore>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(thriftStores).set(data).where(eq(thriftStores.id, id));
    return true;
  });
}

// ============ PRODUCT QUERIES ============

export async function getAllProducts() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(products);
  });
}

export async function getProductById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || null;
  });
}

export async function getProductWithThriftStore(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;

    const [row] = await db
      .select({
        ...getTableColumns(products),
        thriftStore: getTableColumns(thriftStores),
      })
      .from(products)
      .leftJoin(thriftStores, eq(products.thriftStoreId, thriftStores.id))
      .where(eq(products.id, id));

    if (!row) return null;
    return row;
  });
}

export async function createProduct(data: InsertProduct) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(products).values(data);
    return result[0];
  });
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(products).set(data).where(eq(products.id, id));
    return true;
  });
}

interface ProductFilters {
  category?: string;
  size?: string;
  brand?: string;
  condition?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
}

export async function getAvailableProducts(filters?: ProductFilters) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const conditions: any[] = [eq(products.status, "available")];
    
    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(products.category, filters.category as any));
    }
    
    if (filters?.size) {
      const sizes = filters.size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizes.length === 1) {
        conditions.push(eq(products.size, sizes[0]));
      } else if (sizes.length > 1) {
        conditions.push(inArray(products.size, sizes));
      }
    }
    
    if (filters?.brand) {
      const brands = filters.brand.split(',').map(b => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        conditions.push(eq(products.brand, brands[0]));
      } else if (brands.length > 1) {
        conditions.push(inArray(products.brand, brands));
      }
    }
    
    if (filters?.condition) {
      const conditions_ = filters.condition.split(',').map(c => c.trim()).filter(Boolean);
      if (conditions_.length === 1) {
        conditions.push(eq(products.condition, conditions_[0] as any));
      } else if (conditions_.length > 1) {
        conditions.push(inArray(products.condition, conditions_ as any));
      }
    }
    
    if (filters?.color) {
      const colors = filters.color.split(',').map(c => c.trim()).filter(Boolean);
      if (colors.length === 1) {
        conditions.push(eq(products.color, colors[0]));
      } else if (colors.length > 1) {
        conditions.push(inArray(products.color, colors));
      }
    }
    
    if (filters?.minPrice !== undefined) {
      conditions.push(gte(products.salePrice, filters.minPrice.toString()));
    }
    
    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(products.salePrice, filters.maxPrice.toString()));
    }
    
    // Determine sort order
    let orderByClause;
    switch (filters?.sortBy) {
      case 'price_asc':
        orderByClause = asc(products.salePrice);
        break;
      case 'price_desc':
        orderByClause = desc(products.salePrice);
        break;
      case 'name':
        orderByClause = asc(products.name);
        break;
      case 'newest':
      default:
        orderByClause = desc(products.createdAt);
    }
    
    return db.select().from(products)
      .where(and(...conditions))
      .orderBy(orderByClause);
  });
}

export async function getDistinctBrands() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.selectDistinct({ brand: products.brand })
    .from(products)
    .where(and(eq(products.status, "available"), isNotNull(products.brand)));
  
  return result.map(r => r.brand).filter(Boolean) as string[];
}

export async function getDistinctSizes() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.selectDistinct({ size: products.size })
    .from(products)
    .where(and(eq(products.status, "available"), isNotNull(products.size)));
  
  return result.map(r => r.size).filter(Boolean) as string[];
}

export async function getDistinctConditions() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.selectDistinct({ condition: products.condition })
    .from(products)
    .where(eq(products.status, "available"));
  
  return result.map(r => r.condition).filter(Boolean) as string[];
}

export async function getDistinctColors() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.selectDistinct({ color: products.color })
    .from(products)
    .where(and(eq(products.status, "available"), isNotNull(products.color)));
  
  return result.map(r => r.color).filter(Boolean) as string[];
}

export async function getPriceRange() {
  const db = await getDb();
  if (!db) return { min: 0, max: 500 };
  
  const result = await db.select({
    min: sql<number>`MIN(CAST(${products.salePrice} AS DECIMAL(10, 2)))`,
    max: sql<number>`MAX(CAST(${products.salePrice} AS DECIMAL(10, 2)))`
  }).from(products).where(eq(products.status, "available"));
  
  const [row] = result;
  return {
    min: Math.floor(Number(row?.min || 0)),
    max: Math.ceil(Number(row?.max || 500))
  };
}

/**
 * Get price comparison data by condition for a specific brand
 */
export async function getPriceComparisonByCondition(brand: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const result = await db.select({
      condition: products.condition,
      avgPrice: sql<number>`AVG(CAST(${products.salePrice} AS DECIMAL(10, 2)))`,
      minPrice: sql<number>`MIN(CAST(${products.salePrice} AS DECIMAL(10, 2)))`,
      maxPrice: sql<number>`MAX(CAST(${products.salePrice} AS DECIMAL(10, 2)))`,
      count: sql<number>`COUNT(*)`
    }).from(products)
      .where(and(
        eq(products.status, "available"),
        eq(products.brand, brand)
      ))
      .groupBy(products.condition);
    
    return result.map(r => ({
      condition: r.condition,
      avgPrice: Number(r.avgPrice || 0).toFixed(2),
      minPrice: Number(r.minPrice || 0).toFixed(2),
      maxPrice: Number(r.maxPrice || 0).toFixed(2),
      count: Number(r.count || 0)
    }));
  });
}

// ============ CART QUERIES ============

export async function getCartItems(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        cartItem: getTableColumns(cartItems),
        product: getTableColumns(products),
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  });
}

export async function addToCart(userId: number, productId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Check if product already in cart
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const result = await db.insert(cartItems).values({ userId, productId });
    return result[0];
  });
}

export async function removeFromCart(userId: number, productId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db.delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    
    return true;
  });
}

export async function clearCart(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  });
}

export async function getCartCount(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return 0;
    
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
    
    return Number(result[0]?.count || 0);
  });
}

// ============ ORDER QUERIES ============

export async function createOrder(data: InsertOrder) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(orders).values(data);
    return result[0];
  });
}

export async function getOrdersByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).where(eq(orders.userId, userId));
  });
}

export async function getOrderById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || null;
  });
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(orders).set(data).where(eq(orders.id, id));
    return true;
  });
}

export async function createOrderItem(data: InsertOrderItem) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(orderItems).values(data);
    return result[0];
  });
}

export async function getOrderItems(orderId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  });
}

export async function getAllOrders() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders);
  });
}

/**
 * Count order items for a user across delivered/shipped/paid orders in a single
 * aggregation query, avoiding the N+1 pattern of fetching each order's items
 * individually.
 */
export async function countUserOrderItems(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return 0;

    const [row] = await db
      .select({ count: sql<number>`COUNT(${orderItems.id})` })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          inArray(orders.status, ["delivered", "shipped", "paid"])
        )
      );

    return Number(row?.count || 0);
  });
}

/**
 * Count all order items across delivered/shipped/paid orders site-wide in a
 * single aggregation query, avoiding the N+1 pattern.
 */
export async function countAllOrderItems() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return 0;

    const [row] = await db
      .select({ count: sql<number>`COUNT(${orderItems.id})` })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(inArray(orders.status, ["delivered", "shipped", "paid"]));

    return Number(row?.count || 0);
  });
}

/**
 * Return the set of product IDs that a user has purchased in delivered or
 * shipped orders.  Uses a single JOIN query instead of the N+1 pattern of
 * fetching orders then fetching each order's items one by one.
 */
export async function getPurchasedProductIds(userId: number): Promise<Set<number>> {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return new Set<number>();

    const rows = await db
      .select({ productId: orderItems.productId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          inArray(orders.status, ["shipped", "delivered"])
        )
      );

    return new Set(rows.map((r) => r.productId));
  });
}

// ============ PAYOUT QUERIES ============

export async function createPayout(data: InsertPayout) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(payouts).values(data);
    return result[0];
  });
}

export async function getPayoutsByThriftStoreId(thriftStoreId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(payouts).where(eq(payouts.thriftStoreId, thriftStoreId));
  });
}

// ============ EMAIL LOG QUERIES ============

export async function createEmailLog(data: InsertEmailLog) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(emailLogs).values(data);
    return result[0];
  });
}

// ============ CUSTOMER PROFILE QUERIES ============

export async function getOrCreateCustomerProfile(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    let [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId));
    
    if (!profile) {
      const result = await db.insert(customerProfiles).values({ userId });
      [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId));
    }
    
    return profile;
  });
}

export async function updateCustomerProfile(userId: number, data: Partial<InsertCustomerProfile>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(customerProfiles).set(data).where(eq(customerProfiles.userId, userId));
    return true;
  });
}

// ============ CHARITY QUERIES ============

export async function getAllCharities() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(charities);
  });
}

export async function getCharityById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [charity] = await db.select().from(charities).where(eq(charities.id, id));
    return charity || null;
  });
}

export async function createCharity(data: InsertCharity) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(charities).values(data);
    return result[0];
  });
}

// ============ COURIER RETURN QUERIES ============

export async function createCourierReturn(data: InsertCourierReturn) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(courierReturns).values(data);
    return result[0];
  });
}

export async function getCourierReturnsByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(courierReturns).where(eq(courierReturns.userId, userId));
  });
}

// ============ TOKEN TRANSACTION QUERIES ============

export async function createTokenTransaction(data: InsertTokenTransaction) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(tokenTransactions).values(data);
    return result[0];
  });
}

export async function getTokenTransactionsByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(tokenTransactions).where(eq(tokenTransactions.userId, userId));
  });
}

// ============ CHARITY DONATION QUERIES ============

export async function createCharityDonation(data: InsertCharityDonation) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(charityDonations).values(data);
    return result[0];
  });
}

export async function getCharityDonationsByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(charityDonations).where(eq(charityDonations.userId, userId));
  });
}

// ============ DISCOUNT TIER QUERIES ============

export async function getAllDiscountTiers() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(discountTiers);
  });
}

export async function getDiscountTierById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [tier] = await db.select().from(discountTiers).where(eq(discountTiers.id, id));
    return tier || null;
  });
}

// ============ SELL SUBMISSION QUERIES ============

export async function createSellSubmission(data: InsertSellSubmission) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(sellSubmissions).values(data);
    return result[0];
  });
}

export async function getSellSubmissionsByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(sellSubmissions).where(eq(sellSubmissions.userId, userId));
  });
}

export async function getSellSubmissionById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [submission] = await db.select().from(sellSubmissions).where(eq(sellSubmissions.id, id));
    return submission || null;
  });
}

export async function updateSellSubmission(id: number, data: Partial<InsertSellSubmission>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(sellSubmissions).set(data).where(eq(sellSubmissions.id, id));
    return true;
  });
}

// ============ PRODUCT METADATA QUERIES ============

export async function getProductMetadata(productId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [metadata] = await db.select().from(productMetadata).where(eq(productMetadata.productId, productId));
    return metadata || null;
  });
}

export async function createProductMetadata(data: InsertProductMetadata) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(productMetadata).values(data);
    return result[0];
  });
}

// ============ EMAIL SUBSCRIBER QUERIES ============

export async function getEmailSubscriber(email: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [subscriber] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
    return subscriber || null;
  });
}

export async function createEmailSubscriber(data: InsertEmailSubscriber) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(emailSubscribers).values(data);
    return result[0];
  });
}

// ============ CONTACT MESSAGE QUERIES ============

export async function createContactMessage(data: InsertContactMessage) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(contactMessages).values(data);
    return result[0];
  });
}

export async function getContactMessages() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contactMessages);
  });
}

export async function getContactMessageById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message || null;
  });
}

export async function createContactReply(data: InsertContactReply) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(contactReplies).values(data);
    return result[0];
  });
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(data: InsertNotification) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(notifications).values(data);
    return result[0];
  });
}

export async function getNotificationsByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  });
}

// ============ BROADCAST READ STATUS QUERIES ============

export async function createBroadcastReadStatus(data: InsertBroadcastReadStatus) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(broadcastReadStatus).values(data);
    return result[0];
  });
}

// ============ NOTIFICATION PREFERENCE QUERIES ============

export async function getNotificationPreferences(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return prefs || null;
  });
}

export async function createNotificationPreferences(data: InsertNotificationPreference) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(notificationPreferences).values(data);
    return result[0];
  });
}

export async function updateNotificationPreferences(userId: number, data: Partial<InsertNotificationPreference>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(notificationPreferences).set(data).where(eq(notificationPreferences.userId, userId));
    return true;
  });
}

// ============ IMAGE VALIDATION LOG QUERIES ============

export async function createImageValidationLog(data: InsertImageValidationLog) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(imageValidationLogs).values(data);
    return result[0];
  });
}

// ============ ADMIN NOTIFICATION QUERIES ============

export async function createAdminNotification(data: InsertAdminNotification) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(adminNotifications).values(data);
    return result[0];
  });
}

export async function getAdminNotifications() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(adminNotifications);
  });
}

// ============ REFERRAL CODE QUERIES ============

export async function createReferralCode(data: InsertReferralCode) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(referralCodes).values(data);
    return result[0];
  });
}

export async function getReferralCodeByCode(code: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [refCode] = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
    return refCode || null;
  });
}

// ============ REFERRAL QUERIES ============

export async function createReferral(data: InsertReferral) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(referrals).values(data);
    return result[0];
  });
}

export async function getReferralsByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(referrals).where(eq(referrals.userId, userId));
  });
}

// ============ SITE BANNER QUERIES ============

export async function getActiveBanners() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(siteBanners).where(eq(siteBanners.isActive, true));
  });
}

export async function getAllBanners() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(siteBanners);
  });
}

export async function createBanner(data: InsertSiteBanner) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(siteBanners).values(data);
    return result[0];
  });
}

export async function updateBanner(id: number, data: Partial<InsertSiteBanner>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(siteBanners).set(data).where(eq(siteBanners.id, id));
    return true;
  });
}

// ============ SELL SUBMISSION REPLY QUERIES ============

export async function createSellSubmissionReply(data: InsertSellSubmissionReply) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(sellSubmissionReplies).values(data);
    return result[0];
  });
}

export async function getSellSubmissionReplies(submissionId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(sellSubmissionReplies).where(eq(sellSubmissionReplies.submissionId, submissionId));
  });
}

// Import drizzle operators
import { eq, and, or, inArray, isNotNull, gte, lte, asc, desc, sql, getTableColumns } from "drizzle-orm";
