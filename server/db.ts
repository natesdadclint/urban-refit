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
  sellSubmissionReplies, InsertSellSubmissionReply, SellSubmissionReply,
  productReviews, InsertProductReview, ProductReview
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

export async function incrementThriftStorePayout(id: number, amount: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const store = await getThriftStoreById(id);
    if (!store) throw new Error("Thrift store not found");
    
    const currentPayout = parseFloat(store.totalPayout || "0");
    const newPayout = currentPayout + parseFloat(amount);
    
    await db.update(thriftStores)
      .set({ totalPayout: newPayout.toFixed(2) })
      .where(eq(thriftStores.id, id));
    
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
    
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return null;
    
    let thriftStore = null;
    if (product.thriftStoreId) {
      thriftStore = await getThriftStoreById(product.thriftStoreId);
    }
    
    return { product, thriftStore };
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

export async function markProductAsSold(id: number) {
  return updateProduct(id, { status: "sold" });
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
    
    const cartItemsData = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    
    const itemsWithProducts = await Promise.all(
      cartItemsData.map(async (ci) => {
        const product = await getProductById(ci.productId);
        return { cartItem: ci, product };
      })
    );
    
    return itemsWithProducts.filter(item => item.product);
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
    return Number(result[0].insertId);
  });
}

export async function getOrdersByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).where(eq(orders.userId, userId));
  });
}

// Alias for compatibility
export async function getUserOrders(userId: number) {
  return getOrdersByUserId(userId);
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

export async function getOrderItemsWithDetails(orderId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await getProductById(item.productId);
        let thriftStore = null;
        
        if (item.thriftStoreId) {
          thriftStore = await getThriftStoreById(item.thriftStoreId);
        }
        
        return {
          orderItem: {
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            price: item.price,
            thriftStoreId: item.thriftStoreId,
            thriftStorePayoutAmount: item.thriftStorePayoutAmount,
            charityPayoutAmount: item.charityPayoutAmount,
          },
          product: product ? {
            id: product.id,
            name: product.name,
            brand: product.brand,
            size: product.size,
            image1Url: product.image1Url,
          } : {
            id: item.productId,
            name: 'Unknown Product',
            brand: null,
            size: null,
            image1Url: null,
          },
          thriftStore: thriftStore ? {
            name: thriftStore.name,
          } : null,
        };
      })
    );
    
    return itemsWithDetails;
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
    return { ...data, id: result[0].insertId, status: data.status || "pending" };
  });
}

export async function getSellSubmissions(filters?: { userId?: number, status?: string }) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const conditions = [];
    if (filters?.userId) conditions.push(eq(sellSubmissions.userId, filters.userId));
    if (filters?.status) conditions.push(eq(sellSubmissions.status, filters.status as any));
    
    if (conditions.length === 0) return db.select().from(sellSubmissions);
    return db.select().from(sellSubmissions).where(and(...conditions));
  });
}

export async function getSellSubmissionStats() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { total: 0, pending: 0, accepted: 0, rejected: 0 };
    const all = await db.select().from(sellSubmissions);
    return {
      total: all.length,
      pending: all.filter(s => s.status === "pending").length,
      accepted: all.filter(s => s.status === "accepted").length,
      rejected: all.filter(s => s.status === "rejected").length
    };
  });
}

export async function acceptCounterOffer(id: number, adminNotes?: string) {
  return updateSellSubmissionStatus(id, "accepted", adminNotes);
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
    return { ...data, id: result[0].insertId };
  });
}

// ============ CONTACT MESSAGE QUERIES ============

export async function createContactMessage(data: InsertContactMessage) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(contactMessages).values(data);
    return { ...data, id: result[0].insertId };
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
    return { ...data, id: result[0].insertId };
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

export async function notifyAdminNewOrder(orderId: number, customerName: string, total: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Get admin users
    const admins = await db.select().from(users).where(eq(users.role, "admin"));
    
    // Create notification for each admin
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "order",
        title: "New Order Received",
        message: `${customerName} placed an order (#${orderId}) for NZ$${total.toFixed(2)}`,
        relatedId: orderId.toString(),
        isRead: false,
      });
    }
    
    return true;
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

export async function deleteBanner(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(siteBanners).where(eq(siteBanners.id, id));
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
import { eq, and, or, inArray, isNotNull, gte, lte, asc, desc, sql } from "drizzle-orm";

/**
 * Get all approved product reviews
 */
export async function getAllApprovedReviews(limit?: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    let query = db
      .select()
      .from(productReviews)
      .where(eq(productReviews.status, "approved"))
      .orderBy(desc(productReviews.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return query;
  });
}

// ============ UPSERT USER ============

export async function upsertUser(data: InsertUser) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const existing = await getUserByOpenId(data.openId);
    if (existing) {
      await db.update(users).set(data).where(eq(users.id, existing.id));
      return existing.id;
    } else {
      const result = await db.insert(users).values(data);
      return result[0].insertId;
    }
  });
}

// ============ PRODUCT METADATA QUERIES ============

export async function updateProductMetadata(productId: number, data: Partial<InsertProductMetadata>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(productMetadata).set(data).where(eq(productMetadata.productId, productId));
    return true;
  });
}

export async function getAllProductMetadata() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(productMetadata);
  });
}

// ============ ANALYTICS QUERIES ============

export async function getPartnerProfitability() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    
    // This is a complex query, for now returning empty or basic data
    // In a real scenario, this would join thrift_stores, products, and order_items
    const stores = await db.select().from(thriftStores);
    return stores.map(store => ({
      storeId: store.id,
      storeName: store.name,
      totalSales: "0.00",
      totalPayout: store.totalPayout,
      netProfit: "0.00"
    }));
  });
}

export async function getSalesAttributionSummary() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { totalSales: "0.00", attribution: [] };
    
    return {
      totalSales: "0.00",
      attribution: []
    };
  });
}

export async function getStoreDetailedAnalytics(storeId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    
    const store = await getThriftStoreById(storeId);
    if (!store) return null;
    
    return {
      store,
      metrics: {
        totalProducts: 0,
        soldProducts: 0,
        totalRevenue: "0.00",
        averagePrice: "0.00"
      }
    };
  });
}

// ============ NOTIFICATION QUERIES ============

export async function getUserNotifications(userId: number, limit = 20) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  });
}

export async function getUnreadNotificationCount(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return 0;
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  });
}

export async function markNotificationAsRead(id: number, userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return true;
  });
}

export async function markAllNotificationsAsRead(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    return true;
  });
}

export async function deleteNotification(id: number, userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return true;
  });
}

export async function createBroadcastNotification(data: { title: string, message: string, type: string, link?: string }) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // In a real scenario, this might create a record in a broadcast table
    // or create notifications for all users. For now, just a placeholder.
    return 1; 
  });
}

export async function getAllBroadcastNotifications() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    // Placeholder
    return [];
  });
}

export async function deleteBroadcastNotification(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Placeholder
    return true;
  });
}

// ============ ORDER QUERIES ============

export async function getAllOrders() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  });
}

// ============ PRODUCT BASIC QUERIES ============

export async function getAllProductsBasic() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      status: products.status
    }).from(products);
  });
}

// ============ REFERRAL QUERIES ============

export async function getOrCreateReferralCode(userId: number, userName: string | null) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    let [refCode] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
    
    if (!refCode) {
      const code = (userName?.substring(0, 4).toUpperCase() || "USER") + nanoid(4).toUpperCase();
      await db.insert(referralCodes).values({
        userId,
        code,
        usageCount: 0,
        isActive: true
      });
      [refCode] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
    }
    
    return refCode;
  });
}

export async function getReferralStats(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { totalReferrals: 0, totalEarned: "0.00" };
    
    const refs = await db.select().from(referrals).where(eq(referrals.userId, userId));
    return {
      totalReferrals: refs.length,
      totalEarned: "0.00" // Placeholder
    };
  });
}

export async function getUserReferrals(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(referrals).where(eq(referrals.userId, userId));
  });
}

export async function getUserReferredBy(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [referral] = await db.select().from(referrals).where(eq(referrals.referredUserId, userId));
    return referral || null;
  });
}

export async function createReferralWithExpiry(referralCodeId: number, referredUserId: number, status: string, amount: string, expiresAt: Date, timerBonusEligible: boolean) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(referrals).values({
      userId: 0, // Placeholder or need to find referrer userId
      referredUserId,
      status: status as any,
      amount,
      createdAt: new Date(),
    });
    return result[0];
  });
}

// ============ CUSTOMER PROFILE BY USER ID ============

export async function getCustomerProfileByUserId(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId));
    return profile || null;
  });
}

// ============ BANNER QUERIES ============

export async function toggleBannerActive(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [banner] = await db.select().from(siteBanners).where(eq(siteBanners.id, id));
    if (!banner) throw new Error("Banner not found");
    
    await db.update(siteBanners)
      .set({ isActive: !banner.isActive })
      .where(eq(siteBanners.id, id));
    
    return { ...banner, isActive: !banner.isActive };
  });
}

// ============ CONTACT MESSAGE QUERIES ============

export async function markAllContactMessagesAsRead() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return 0;
    await db.update(contactMessages).set({ status: "read" as any }).where(eq(contactMessages.status, "unread" as any));
    return 1; // Placeholder count
  });
}

export async function getContactRepliesByMessageId(messageId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contactReplies).where(eq(contactReplies.messageId, messageId));
  });
}

// ============ CONTACT MESSAGE QUERIES CONTINUED ============

export async function notifyAdminNewContact(messageId: number, email: string, snippet: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const admins = await db.select().from(users).where(eq(users.role, "admin"));
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "info",
        title: "New Contact Message",
        message: `From ${email}: ${snippet}...`,
        relatedId: messageId.toString(),
        isRead: false,
      });
    }
    return true;
  });
}

export async function getAllContactMessages() {
  return getContactMessages();
}

export async function getUnreadContactMessages() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contactMessages).where(eq(contactMessages.status, "unread" as any));
  });
}

export async function updateContactMessageStatus(id: number, status: string, adminNotes?: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData: any = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    await db.update(contactMessages).set(updateData).where(eq(contactMessages.id, id));
    return true;
  });
}

export async function getContactMessageStats() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { total: 0, unread: 0, replied: 0 };
    
    const all = await getContactMessages();
    return {
      total: all.length,
      unread: all.filter(m => m.status === "unread").length,
      replied: all.filter(m => m.status === "replied").length
    };
  });
}

// ============ USER QUERIES CONTINUED ============

export async function getUserById(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  });
}

// ============ EMAIL SUBSCRIBER QUERIES CONTINUED ============

export async function unsubscribeEmail(email: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(emailSubscribers).set({ isActive: false }).where(eq(emailSubscribers.email, email));
    return true;
  });
}

export async function getEmailSubscriberByEmail(email: string) {
  return getEmailSubscriber(email);
}

export async function updateEmailSubscriber(email: string, data: Partial<InsertEmailSubscriber>) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(emailSubscribers).set(data).where(eq(emailSubscribers.email, email));
    return true;
  });
}

export async function getAllActiveSubscribers() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(emailSubscribers).where(eq(emailSubscribers.isActive, true));
  });
}

export async function getSubscriberStats() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { total: 0, active: 0, unsubscribed: 0 };
    const all = await db.select().from(emailSubscribers);
    return {
      total: all.length,
      active: all.filter(s => s.isActive).length,
      unsubscribed: all.filter(s => !s.isActive).length
    };
  });
}

// ============ SELL SUBMISSION QUERIES CONTINUED ============

export async function updateSellSubmissionShipping(id: number, trackingNumber: string, courierService: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(sellSubmissions).set({ trackingNumber, courierService }).where(eq(sellSubmissions.id, id));
    return true;
  });
}

export async function updateSellSubmissionShippingLegacy(id: number, data: any) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(sellSubmissions).set(data).where(eq(sellSubmissions.id, id));
    return true;
  });
}

export async function updateSellSubmissionStatus(id: number, status: string, adminNotes?: string, tokenOffer?: string | number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const updateData: any = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (tokenOffer !== undefined) updateData.tokenOffer = tokenOffer;
    await db.update(sellSubmissions).set(updateData).where(eq(sellSubmissions.id, id));
    return true;
  });
}

export async function createSellSubmissionNotification(userId: number, submissionId: number, type: string, title: string, message?: string) {
  return createNotification({
    userId,
    type: type as any,
    title,
    message,
    relatedId: submissionId.toString(),
    isRead: false
  });
}

export async function respondToSellOffer(submissionId: number, response: string, counterOffer?: string | number, message?: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const updateData: any = { status: response === "accept" ? "accepted" : "countered" };
    if (counterOffer) updateData.tokenOffer = counterOffer;
    
    await db.update(sellSubmissions).set(updateData).where(eq(sellSubmissions.id, submissionId));
    
    if (message) {
      await createSellSubmissionReply({
        submissionId,
        userId: 0, // System or placeholder
        message,
        isInternal: false
      });
    }
    
    return true;
  });
}

// ============ PRODUCT REVIEW QUERIES ============

export async function createProductReview(data: any) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(productReviews).values(data);
    return { ...data, id: result[0].insertId };
  });
}

export async function incrementReviewHelpful(id: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(productReviews)
      .set({ helpfulCount: sql`${productReviews.helpfulCount} + 1` })
      .where(eq(productReviews.id, id));
    return true;
  });
}

export async function getPendingReviews() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(productReviews).where(eq(productReviews.status, "pending"));
  });
}

export async function updateReviewStatus(id: number, status: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(productReviews).set({ status: status as any }).where(eq(productReviews.id, id));
    return true;
  });
}

// ============ USER QUERIES CONTINUED ============

export async function getAllUsers() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(users);
  });
}

export async function getAdminUserDetails(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    const user = await getUserById(userId);
    if (!user) return null;
    
    const orders_ = await db.select().from(orders).where(eq(orders.userId, userId));
    const submissions = await db.select().from(sellSubmissions).where(eq(sellSubmissions.userId, userId));
    
    return {
      user,
      orderCount: orders_.length,
      submissionCount: submissions.length,
      totalSpent: orders_.reduce((sum, o) => sum + parseFloat(o.total), 0).toFixed(2)
    };
  });
}

// ============ ADMIN NOTIFICATION QUERIES CONTINUED ============

export async function notifyAdminNewSubmission(submissionId: number, userName: string, count: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const admins = await db.select().from(users).where(eq(users.role, "admin"));
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "submission",
        title: "New Sell Submission",
        message: `${userName} submitted ${count} item(s) for review (#${submissionId})`,
        relatedId: submissionId.toString(),
        isRead: false,
      });
    }
    return true;
  });
}

// ============ ANALYTICS QUERIES CONTINUED ============

export async function getSalesAnalytics() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { totalSales: "0.00", totalRevenue: "0.00", orderCount: 0, averageOrderValue: "0.00", salesByCategory: [], topThriftStores: [] };
    
    const allOrders = await db.select().from(orders);
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    
    return {
      totalSales: totalRevenue.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      orderCount: allOrders.length,
      averageOrderValue: allOrders.length > 0 ? (totalRevenue / allOrders.length).toFixed(2) : "0.00",
      salesByCategory: [],
      topThriftStores: []
    };
  });
}

export async function getProductAnalytics() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { totalProducts: 0, availableProducts: 0, soldProducts: 0, productsByStatus: [], topBrands: [], avgMarkup: "0.00", avgProfit: "0.00" };
    
    const allProducts = await db.select().from(products);
    return {
      totalProducts: allProducts.length,
      availableProducts: allProducts.filter(p => p.status === "available").length,
      soldProducts: allProducts.filter(p => p.status === "sold").length,
      productsByStatus: [],
      topBrands: [],
      avgMarkup: "0.00",
      avgProfit: "0.00"
    };
  });
}

// ============ PRODUCT REVIEW QUERIES CONTINUED ============

export async function getProductReviews(productId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(productReviews).where(eq(productReviews.productId, productId));
  });
}

export async function getOverallReviewStats() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return { averageRating: 0, totalReviews: 0 };
    
    const allReviews = await db.select().from(productReviews).where(eq(productReviews.status, "approved"));
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    
    return {
      averageRating: allReviews.length > 0 ? totalRating / allReviews.length : 0,
      totalReviews: allReviews.length
    };
  });
}

export async function getReviewsByUser(userId: number) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(productReviews).where(eq(productReviews.userId, userId));
  });
}

// ============ CHAT QUERIES ============

export async function createChatMessage(data: any) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Placeholder for chat messages table
    return { ...data, id: 1 };
  });
}

export async function getChatHistory(sessionId: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    // Placeholder
    return [];
  });
}

export async function getChatSessions() {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return [];
    // Placeholder
    return [];
  });
}

export async function getChatSessionById(id: string) {
  return withRetry(async () => {
    const db = await getDb();
    if (!db) return null;
    // Placeholder
    return null;
  });
}
