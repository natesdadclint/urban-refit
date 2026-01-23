import { eq, and, desc, asc, sql, inArray, gte, lte, isNotNull } from "drizzle-orm";
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
  emailSubscribers, InsertEmailSubscriber, EmailSubscriber
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

// ============ USER OPERATIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ THRIFT STORE OPERATIONS ============
export async function createThriftStore(store: InsertThriftStore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(thriftStores).values(store);
  return result[0].insertId;
}

export async function updateThriftStore(id: number, store: Partial<InsertThriftStore>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(thriftStores).set(store).where(eq(thriftStores.id, id));
}

export async function getThriftStoreById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(thriftStores).where(eq(thriftStores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllThriftStores(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(thriftStores).where(eq(thriftStores.isActive, true)).orderBy(desc(thriftStores.createdAt));
  }
  return db.select().from(thriftStores).orderBy(desc(thriftStores.createdAt));
}

export async function incrementThriftStorePayout(id: number, amount: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(thriftStores)
    .set({ totalPayout: sql`${thriftStores.totalPayout} + ${amount}` })
    .where(eq(thriftStores.id, id));
}

// ============ PRODUCT OPERATIONS ============
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result[0].insertId;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

export interface ProductFilters {
  category?: string;
  size?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
}

export async function getAvailableProducts(filters?: ProductFilters) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [eq(products.status, "available")];
  
  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(products.category, filters.category as any));
  }
  
  if (filters?.size) {
    conditions.push(eq(products.size, filters.size));
  }
  
  if (filters?.brand) {
    conditions.push(eq(products.brand, filters.brand));
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

export async function getPriceRange() {
  const db = await getDb();
  if (!db) return { min: 0, max: 1000 };
  
  const result = await db.select({
    minPrice: sql<string>`MIN(CAST(${products.salePrice} AS DECIMAL(10,2)))`,
    maxPrice: sql<string>`MAX(CAST(${products.salePrice} AS DECIMAL(10,2)))`
  })
    .from(products)
    .where(eq(products.status, "available"));
  
  return {
    min: parseFloat(result[0]?.minPrice || '0'),
    max: parseFloat(result[0]?.maxPrice || '1000')
  };
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function markProductAsSold(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products)
    .set({ status: "sold", soldAt: new Date() })
    .where(eq(products.id, id));
}

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

// ============ CART OPERATIONS ============
export async function addToCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already in cart
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length > 0) return existing[0].id;
  
  const result = await db.insert(cartItems).values({ userId, productId });
  return result[0].insertId;
}

export async function removeFromCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const items = await db.select({
    cartItem: cartItems,
    product: products
  })
  .from(cartItems)
  .innerJoin(products, eq(cartItems.productId, products.id))
  .where(eq(cartItems.userId, userId))
  .orderBy(desc(cartItems.createdAt));
  
  return items;
}

export async function getCartItemCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
  return result[0]?.count ?? 0;
}

// ============ ORDER OPERATIONS ============
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result[0].insertId;
}

export async function updateOrder(id: number, order: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(order).where(eq(orders.id, id));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

// ============ ORDER ITEM OPERATIONS ============
export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(item);
  return result[0].insertId;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const items = await db.select({
    orderItem: orderItems,
    product: products,
    thriftStore: thriftStores
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .leftJoin(thriftStores, eq(orderItems.thriftStoreId, thriftStores.id))
  .where(eq(orderItems.orderId, orderId));
  
  return items;
}

// ============ PAYOUT OPERATIONS ============
export async function createPayout(payout: InsertPayout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payouts).values(payout);
  return result[0].insertId;
}

export async function updatePayout(id: number, payout: Partial<InsertPayout>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payouts).set(payout).where(eq(payouts.id, id));
}

export async function getPayoutsByThriftStore(thriftStoreId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payouts)
    .where(eq(payouts.thriftStoreId, thriftStoreId))
    .orderBy(desc(payouts.createdAt));
}

export async function getAllPayouts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payouts).orderBy(desc(payouts.createdAt));
}

export async function getPendingPayoutsByThriftStore(thriftStoreId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payouts)
    .where(and(eq(payouts.thriftStoreId, thriftStoreId), eq(payouts.status, "pending")))
    .orderBy(desc(payouts.createdAt));
}

// ============ EMAIL LOG OPERATIONS ============
export async function createEmailLog(log: InsertEmailLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailLogs).values(log);
  return result[0].insertId;
}

export async function updateEmailLog(id: number, log: Partial<InsertEmailLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailLogs).set(log).where(eq(emailLogs.id, id));
}

// ============ ANALYTICS HELPERS ============
export async function getSalesAnalytics(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return null;
  
  // Total sales
  const salesResult = await db.select({
    totalSales: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    orderCount: sql<number>`COUNT(*)`,
  })
  .from(orders)
  .where(eq(orders.status, "paid"));
  
  // Sales by category
  const categoryResult = await db.select({
    category: products.category,
    count: sql<number>`COUNT(*)`,
    revenue: sql<number>`COALESCE(SUM(${orderItems.price}), 0)`,
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .innerJoin(orders, eq(orderItems.orderId, orders.id))
  .where(eq(orders.status, "paid"))
  .groupBy(products.category);
  
  // Top thrift stores
  const thriftStoreResult = await db.select({
    thriftStoreId: thriftStores.id,
    name: thriftStores.name,
    totalPayout: thriftStores.totalPayout,
    productCount: sql<number>`COUNT(DISTINCT ${products.id})`,
  })
  .from(thriftStores)
  .leftJoin(products, eq(products.thriftStoreId, thriftStores.id))
  .groupBy(thriftStores.id, thriftStores.name, thriftStores.totalPayout)
  .orderBy(desc(thriftStores.totalPayout))
  .limit(10);
  
  return {
    totalSales: salesResult[0]?.totalSales ?? 0,
    orderCount: salesResult[0]?.orderCount ?? 0,
    salesByCategory: categoryResult,
    topThriftStores: thriftStoreResult,
  };
}

export async function getProductAnalytics() {
  const db = await getDb();
  if (!db) return null;
  
  // Product counts by status
  const statusResult = await db.select({
    status: products.status,
    count: sql<number>`COUNT(*)`,
  })
  .from(products)
  .groupBy(products.status);
  
  // Best selling brands
  const brandResult = await db.select({
    brand: products.brand,
    soldCount: sql<number>`COUNT(*)`,
    revenue: sql<number>`COALESCE(SUM(${products.salePrice}), 0)`,
  })
  .from(products)
  .where(eq(products.status, "sold"))
  .groupBy(products.brand)
  .orderBy(desc(sql`COUNT(*)`))
  .limit(10);
  
  // Average markup
  const markupResult = await db.select({
    avgMarkup: sql<number>`AVG(${products.markupPercentage})`,
    avgProfit: sql<number>`AVG(${products.salePrice} - ${products.originalCost})`,
  })
  .from(products)
  .where(eq(products.status, "sold"));
  
  return {
    productsByStatus: statusResult,
    topBrands: brandResult,
    avgMarkup: markupResult[0]?.avgMarkup ?? 0,
    avgProfit: markupResult[0]?.avgProfit ?? 0,
  };
}


// ============ CUSTOMER PROFILE OPERATIONS ============
export async function createCustomerProfile(profile: InsertCustomerProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerProfiles).values(profile);
  return result[0].insertId;
}

export async function updateCustomerProfile(userId: number, profile: Partial<InsertCustomerProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customerProfiles).set(profile).where(eq(customerProfiles.userId, userId));
}

export async function getCustomerProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateCustomerProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let profile = await getCustomerProfileByUserId(userId);
  if (!profile) {
    await db.insert(customerProfiles).values({ userId });
    profile = await getCustomerProfileByUserId(userId);
  }
  return profile;
}

export async function updateTokenBalance(userId: number, amount: string, operation: 'add' | 'subtract') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (operation === 'add') {
    await db.update(customerProfiles)
      .set({ 
        tokenBalance: sql`${customerProfiles.tokenBalance} + ${amount}`,
        totalTokensEarned: sql`${customerProfiles.totalTokensEarned} + ${amount}`
      })
      .where(eq(customerProfiles.userId, userId));
  } else {
    await db.update(customerProfiles)
      .set({ 
        tokenBalance: sql`${customerProfiles.tokenBalance} - ${amount}`,
        totalTokensSpent: sql`${customerProfiles.totalTokensSpent} + ${amount}`
      })
      .where(eq(customerProfiles.userId, userId));
  }
}

export async function updateTokensDonated(userId: number, amount: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(customerProfiles)
    .set({ 
      tokenBalance: sql`${customerProfiles.tokenBalance} - ${amount}`,
      totalTokensDonated: sql`${customerProfiles.totalTokensDonated} + ${amount}`
    })
    .where(eq(customerProfiles.userId, userId));
}

export async function updateSpendLimit(userId: number, amount: string, operation: 'add' | 'subtract') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (operation === 'add') {
    await db.update(customerProfiles)
      .set({ spendLimit: sql`${customerProfiles.spendLimit} + ${amount}` })
      .where(eq(customerProfiles.userId, userId));
  } else {
    await db.update(customerProfiles)
      .set({ spendLimit: sql`${customerProfiles.spendLimit} - ${amount}` })
      .where(eq(customerProfiles.userId, userId));
  }
}

// ============ CHARITY OPERATIONS ============
export async function createCharity(charity: InsertCharity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(charities).values(charity);
  return result[0].insertId;
}

export async function updateCharity(id: number, charity: Partial<InsertCharity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(charities).set(charity).where(eq(charities.id, id));
}

export async function getCharityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(charities).where(eq(charities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCharities(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(charities).where(eq(charities.isActive, true)).orderBy(charities.name);
  }
  return db.select().from(charities).orderBy(charities.name);
}

export async function incrementCharityDonations(id: number, amount: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(charities)
    .set({ totalDonationsReceived: sql`${charities.totalDonationsReceived} + ${amount}` })
    .where(eq(charities.id, id));
}

// ============ COURIER RETURN OPERATIONS ============
export async function createCourierReturn(courierReturn: InsertCourierReturn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courierReturns).values(courierReturn);
  return result[0].insertId;
}

export async function updateCourierReturn(id: number, courierReturn: Partial<InsertCourierReturn>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courierReturns).set(courierReturn).where(eq(courierReturns.id, id));
}

export async function getCourierReturnById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courierReturns).where(eq(courierReturns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserCourierReturns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courierReturns)
    .where(eq(courierReturns.userId, userId))
    .orderBy(desc(courierReturns.createdAt));
}

export async function getAllCourierReturns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courierReturns).orderBy(desc(courierReturns.createdAt));
}

export async function getCourierReturnsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courierReturns)
    .where(eq(courierReturns.status, status as any))
    .orderBy(desc(courierReturns.createdAt));
}

// ============ TOKEN TRANSACTION OPERATIONS ============
export async function createTokenTransaction(transaction: InsertTokenTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tokenTransactions).values(transaction);
  return result[0].insertId;
}

export async function getUserTokenTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(desc(tokenTransactions.createdAt))
    .limit(limit);
}

// ============ CHARITY DONATION OPERATIONS ============
export async function createCharityDonation(donation: InsertCharityDonation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(charityDonations).values(donation);
  return result[0].insertId;
}

export async function getUserCharityDonations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    donation: charityDonations,
    charity: charities
  })
  .from(charityDonations)
  .innerJoin(charities, eq(charityDonations.charityId, charities.id))
  .where(eq(charityDonations.userId, userId))
  .orderBy(desc(charityDonations.createdAt));
}

// ============ DISCOUNT TIER OPERATIONS ============
export async function createDiscountTier(tier: InsertDiscountTier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(discountTiers).values(tier);
  return result[0].insertId;
}

export async function updateDiscountTier(id: number, tier: Partial<InsertDiscountTier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(discountTiers).set(tier).where(eq(discountTiers.id, id));
}

export async function getActiveDiscountTiers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discountTiers)
    .where(eq(discountTiers.isActive, true))
    .orderBy(discountTiers.minItems);
}

export async function getDiscountTierForItemCount(itemCount: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(discountTiers)
    .where(and(
      eq(discountTiers.isActive, true),
      lte(discountTiers.minItems, itemCount)
    ))
    .orderBy(desc(discountTiers.minItems))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDiscountTiers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discountTiers).orderBy(discountTiers.minItems);
}

// ============ LOYALTY ANALYTICS ============
export async function getLoyaltyAnalytics() {
  const db = await getDb();
  if (!db) return null;
  
  // Total tokens in circulation
  const tokenStats = await db.select({
    totalEarned: sql<number>`COALESCE(SUM(${customerProfiles.totalTokensEarned}), 0)`,
    totalSpent: sql<number>`COALESCE(SUM(${customerProfiles.totalTokensSpent}), 0)`,
    totalDonated: sql<number>`COALESCE(SUM(${customerProfiles.totalTokensDonated}), 0)`,
    totalBalance: sql<number>`COALESCE(SUM(${customerProfiles.tokenBalance}), 0)`,
    memberCount: sql<number>`COUNT(*)`,
  })
  .from(customerProfiles);
  
  // Courier returns stats
  const returnStats = await db.select({
    totalReturns: sql<number>`COUNT(*)`,
    pendingReturns: sql<number>`SUM(CASE WHEN ${courierReturns.status} = 'pending_review' THEN 1 ELSE 0 END)`,
    completedReturns: sql<number>`SUM(CASE WHEN ${courierReturns.status} = 'completed' THEN 1 ELSE 0 END)`,
    tokensAwarded: sql<number>`COALESCE(SUM(${courierReturns.tokensAwarded}), 0)`,
  })
  .from(courierReturns);
  
  // Charity donation stats
  const charityStats = await db.select({
    totalDonations: sql<number>`COUNT(*)`,
    totalTokensDonated: sql<number>`COALESCE(SUM(${charityDonations.tokenAmount}), 0)`,
    totalDollarValue: sql<number>`COALESCE(SUM(${charityDonations.dollarValue}), 0)`,
  })
  .from(charityDonations);
  
  return {
    tokens: tokenStats[0],
    returns: returnStats[0],
    charityDonations: charityStats[0],
  };
}


// ============ BLOG POST OPERATIONS ============
import { blogPosts, InsertBlogPost, BlogPost, chatMessages, InsertChatMessage, ChatMessage, productReviews, InsertProductReview, ProductReview } from "../drizzle/schema";

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values(post);
  return result[0].insertId;
}

export async function updateBlogPost(id: number, post: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(post).where(eq(blogPosts.id, id));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  return results[0] || null;
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return results[0] || null;
}

export async function getPublishedBlogPosts(category?: string, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
  
  if (category) {
    query = db.select().from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, category as any)))
      .orderBy(desc(blogPosts.publishedAt));
  }
  
  const results = await query;
  return limit ? results.slice(0, limit) : results;
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function incrementBlogViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, id));
}

export async function incrementBlogLikeCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(blogPosts)
    .set({ likeCount: sql`${blogPosts.likeCount} + 1` })
    .where(eq(blogPosts.id, id));
}

// ============ CHAT MESSAGE OPERATIONS ============
export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(message);
  return result[0].insertId;
}

export async function getChatHistory(sessionId: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}


// ============ CHATBOT PRODUCT SEARCH ============
export async function searchProductsForChat(query: string, size?: string, category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [eq(products.status, "available")];
  
  // Add size filter if provided
  if (size) {
    conditions.push(eq(products.size, size));
  }
  
  // Add category filter if provided
  if (category && category !== "all") {
    conditions.push(eq(products.category, category as any));
  }
  
  // Get all available products matching filters
  const allProducts = await db.select().from(products)
    .where(and(...conditions));
  
  // Filter by search query (name or brand)
  const queryLower = query.toLowerCase();
  const matchingProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(queryLower) ||
    (p.brand && p.brand.toLowerCase().includes(queryLower)) ||
    (p.description && p.description.toLowerCase().includes(queryLower))
  );
  
  return matchingProducts;
}

export async function getProductSummaryForChat() {
  const db = await getDb();
  if (!db) return null;
  
  // Get all available products with key info
  const availableProducts = await db.select({
    id: products.id,
    name: products.name,
    brand: products.brand,
    size: products.size,
    category: products.category,
    salePrice: products.salePrice,
    condition: products.condition,
  }).from(products).where(eq(products.status, "available"));
  
  return availableProducts;
}


// ============ PRODUCT REVIEW OPERATIONS ============
export async function createProductReview(review: InsertProductReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productReviews).values(review);
  return result[0].insertId;
}

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews)
    .where(and(
      eq(productReviews.productId, productId),
      eq(productReviews.status, "approved")
    ))
    .orderBy(desc(productReviews.createdAt));
}

export async function getAllApprovedReviews(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    review: productReviews,
    product: products,
    user: users,
  })
  .from(productReviews)
  .innerJoin(products, eq(productReviews.productId, products.id))
  .innerJoin(users, eq(productReviews.userId, users.id))
  .where(eq(productReviews.status, "approved"))
  .orderBy(desc(productReviews.createdAt));
  
  return limit ? results.slice(0, limit) : results;
}

export async function getReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    review: productReviews,
    product: products,
  })
  .from(productReviews)
  .innerJoin(products, eq(productReviews.productId, products.id))
  .where(eq(productReviews.userId, userId))
  .orderBy(desc(productReviews.createdAt));
}

export async function updateReviewStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productReviews).set({ status }).where(eq(productReviews.id, id));
}

export async function incrementReviewHelpful(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(productReviews)
    .set({ helpfulCount: sql`${productReviews.helpfulCount} + 1` })
    .where(eq(productReviews.id, id));
}

export async function getAverageRatingForProduct(productId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    avgRating: sql<number>`AVG(${productReviews.rating})`,
    totalReviews: sql<number>`COUNT(*)`,
  })
  .from(productReviews)
  .where(and(
    eq(productReviews.productId, productId),
    eq(productReviews.status, "approved")
  ));
  return result[0];
}

export async function getOverallReviewStats() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    avgRating: sql<number>`AVG(${productReviews.rating})`,
    totalReviews: sql<number>`COUNT(*)`,
    fiveStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 5 THEN 1 ELSE 0 END)`,
    fourStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 4 THEN 1 ELSE 0 END)`,
    threeStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 3 THEN 1 ELSE 0 END)`,
    twoStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 2 THEN 1 ELSE 0 END)`,
    oneStarCount: sql<number>`SUM(CASE WHEN ${productReviews.rating} = 1 THEN 1 ELSE 0 END)`,
  })
  .from(productReviews)
  .where(eq(productReviews.status, "approved"));
  return result[0];
}

export async function getPendingReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    review: productReviews,
    product: products,
    user: users,
  })
  .from(productReviews)
  .innerJoin(products, eq(productReviews.productId, products.id))
  .innerJoin(users, eq(productReviews.userId, users.id))
  .where(eq(productReviews.status, "pending"))
  .orderBy(desc(productReviews.createdAt));
}


// ============ SELL SUBMISSIONS OPERATIONS ============
export async function createSellSubmission(submission: InsertSellSubmission): Promise<SellSubmission | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(sellSubmissions).values(submission);
    const [created] = await db.select().from(sellSubmissions)
      .where(eq(sellSubmissions.email, submission.email))
      .orderBy(desc(sellSubmissions.createdAt))
      .limit(1);
    return created || null;
  } catch (error) {
    console.error("[Database] Failed to create sell submission:", error);
    return null;
  }
}

export async function getSellSubmissions(options?: { 
  status?: string; 
  userId?: number;
  limit?: number;
}): Promise<SellSubmission[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(sellSubmissions);
    
    const conditions = [];
    if (options?.status) {
      conditions.push(eq(sellSubmissions.status, options.status as any));
    }
    if (options?.userId) {
      conditions.push(eq(sellSubmissions.userId, options.userId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query
      .orderBy(desc(sellSubmissions.createdAt))
      .limit(options?.limit || 50);
  } catch (error) {
    console.error("[Database] Failed to get sell submissions:", error);
    return [];
  }
}

export async function getSellSubmissionById(id: number): Promise<SellSubmission | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [submission] = await db.select().from(sellSubmissions)
      .where(eq(sellSubmissions.id, id))
      .limit(1);
    return submission || null;
  } catch (error) {
    console.error("[Database] Failed to get sell submission:", error);
    return null;
  }
}

export async function updateSellSubmissionStatus(
  id: number, 
  status: string, 
  adminNotes?: string,
  offerAmount?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: any = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (offerAmount !== undefined) updateData.offerAmount = offerAmount;
    
    await db.update(sellSubmissions)
      .set(updateData)
      .where(eq(sellSubmissions.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update sell submission status:", error);
    return false;
  }
}

export async function getSellSubmissionStats(): Promise<{
  total: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
  completed: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0, completed: 0 };

  try {
    const [stats] = await db.select({
      total: sql<number>`COUNT(*)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
      reviewing: sql<number>`SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END)`,
      accepted: sql<number>`SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END)`,
      rejected: sql<number>`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    }).from(sellSubmissions);
    
    return {
      total: Number(stats.total) || 0,
      pending: Number(stats.pending) || 0,
      reviewing: Number(stats.reviewing) || 0,
      accepted: Number(stats.accepted) || 0,
      rejected: Number(stats.rejected) || 0,
      completed: Number(stats.completed) || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get sell submission stats:", error);
    return { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0, completed: 0 };
  }
}


// ============ PRODUCT METADATA OPERATIONS ============

export async function createProductMetadata(data: InsertProductMetadata) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productMetadata).values(data);
  return result[0].insertId;
}

export async function getProductMetadata(productId: number): Promise<ProductMetadata | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const results = await db.select().from(productMetadata).where(eq(productMetadata.productId, productId)).limit(1);
  return results[0];
}

export async function updateProductMetadata(productId: number, data: Partial<InsertProductMetadata>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productMetadata).set(data).where(eq(productMetadata.productId, productId));
}

export async function bulkCreateProductMetadata(items: InsertProductMetadata[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return [];
  const result = await db.insert(productMetadata).values(items);
  return result;
}


// ============ EMAIL SUBSCRIBER OPERATIONS ============

export async function createEmailSubscriber(subscriber: InsertEmailSubscriber): Promise<EmailSubscriber | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(emailSubscribers).values(subscriber);
    const [created] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, subscriber.email));
    return created || null;
  } catch (error: any) {
    // Handle duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return null;
    }
    throw error;
  }
}

export async function getEmailSubscriberByEmail(email: string): Promise<EmailSubscriber | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [subscriber] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
  return subscriber || null;
}

export async function updateEmailSubscriber(email: string, data: Partial<InsertEmailSubscriber>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(emailSubscribers).set(data).where(eq(emailSubscribers.email, email));
}

export async function unsubscribeEmail(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(emailSubscribers)
    .set({ isActive: false, unsubscribedAt: new Date() })
    .where(eq(emailSubscribers.email, email));
  
  return true;
}

export async function getAllActiveSubscribers(): Promise<EmailSubscriber[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(emailSubscribers).where(eq(emailSubscribers.isActive, true)).orderBy(desc(emailSubscribers.createdAt));
}

export async function getSubscribersBySource(source: string): Promise<EmailSubscriber[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(emailSubscribers)
    .where(and(eq(emailSubscribers.source, source as any), eq(emailSubscribers.isActive, true)))
    .orderBy(desc(emailSubscribers.createdAt));
}

export async function getSubscriberStats(): Promise<{
  total: number;
  active: number;
  bySource: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const all = await db.select().from(emailSubscribers);
  
  const stats = {
    total: all.length,
    active: all.filter(s => s.isActive).length,
    bySource: {} as Record<string, number>
  };
  
  for (const sub of all) {
    stats.bySource[sub.source] = (stats.bySource[sub.source] || 0) + 1;
  }
  
  return stats;
}


// ============ SALES ATTRIBUTION & PARTNER PROFITABILITY ============

export interface PartnerProfitabilityData {
  thriftStoreId: number;
  storeName: string;
  city: string | null;
  // Inventory metrics
  totalProductsSourced: number;
  productsSold: number;
  productsAvailable: number;
  sellThroughRate: number; // percentage
  // Financial metrics
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number; // percentage
  avgMarkup: number;
  // Payout metrics
  totalPayouts: number;
  pendingPayouts: number;
  // Performance metrics
  avgDaysToSell: number | null;
  topCategory: string | null;
  topBrand: string | null;
}

export async function getPartnerProfitability(): Promise<PartnerProfitabilityData[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all thrift stores with their product and sales data
  const storeData = await db.select({
    thriftStoreId: thriftStores.id,
    storeName: thriftStores.name,
    city: thriftStores.city,
    totalPayout: thriftStores.totalPayout,
  })
  .from(thriftStores)
  .where(eq(thriftStores.isActive, true));

  const results: PartnerProfitabilityData[] = [];

  for (const store of storeData) {
    // Get product metrics for this store
    const productMetrics = await db.select({
      totalProducts: sql<number>`COUNT(*)`,
      soldProducts: sql<number>`SUM(CASE WHEN ${products.status} = 'sold' THEN 1 ELSE 0 END)`,
      availableProducts: sql<number>`SUM(CASE WHEN ${products.status} = 'available' THEN 1 ELSE 0 END)`,
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${products.status} = 'sold' THEN ${products.salePrice} ELSE 0 END), 0)`,
      totalCost: sql<number>`COALESCE(SUM(CASE WHEN ${products.status} = 'sold' THEN ${products.originalCost} ELSE 0 END), 0)`,
      avgMarkup: sql<number>`AVG(${products.markupPercentage})`,
    })
    .from(products)
    .where(eq(products.thriftStoreId, store.thriftStoreId));

    // Get top category for this store (sold items only)
    const topCategoryResult = await db.select({
      category: products.category,
      count: sql<number>`COUNT(*)`,
    })
    .from(products)
    .where(and(
      eq(products.thriftStoreId, store.thriftStoreId),
      eq(products.status, "sold")
    ))
    .groupBy(products.category)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(1);

    // Get top brand for this store (sold items only)
    const topBrandResult = await db.select({
      brand: products.brand,
      count: sql<number>`COUNT(*)`,
    })
    .from(products)
    .where(and(
      eq(products.thriftStoreId, store.thriftStoreId),
      eq(products.status, "sold")
    ))
    .groupBy(products.brand)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(1);

    // Get pending payouts for this store
    const pendingPayoutsResult = await db.select({
      pendingAmount: sql<number>`COALESCE(SUM(${payouts.amount}), 0)`,
    })
    .from(payouts)
    .where(and(
      eq(payouts.thriftStoreId, store.thriftStoreId),
      eq(payouts.status, "pending")
    ));

    // Calculate average days to sell
    const avgDaysResult = await db.select({
      avgDays: sql<number>`AVG(DATEDIFF(${products.soldAt}, ${products.createdAt}))`,
    })
    .from(products)
    .where(and(
      eq(products.thriftStoreId, store.thriftStoreId),
      eq(products.status, "sold"),
      sql`${products.soldAt} IS NOT NULL`
    ));

    const metrics = productMetrics[0];
    const totalProducts = Number(metrics?.totalProducts) || 0;
    const soldProducts = Number(metrics?.soldProducts) || 0;
    const availableProducts = Number(metrics?.availableProducts) || 0;
    const totalRevenue = Number(metrics?.totalRevenue) || 0;
    const totalCost = Number(metrics?.totalCost) || 0;
    const grossProfit = totalRevenue - totalCost;

    results.push({
      thriftStoreId: store.thriftStoreId,
      storeName: store.storeName,
      city: store.city,
      totalProductsSourced: totalProducts,
      productsSold: soldProducts,
      productsAvailable: availableProducts,
      sellThroughRate: totalProducts > 0 ? (soldProducts / totalProducts) * 100 : 0,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      avgMarkup: Number(metrics?.avgMarkup) || 0,
      totalPayouts: Number(store.totalPayout) || 0,
      pendingPayouts: Number(pendingPayoutsResult[0]?.pendingAmount) || 0,
      avgDaysToSell: avgDaysResult[0]?.avgDays ? Number(avgDaysResult[0].avgDays) : null,
      topCategory: topCategoryResult[0]?.category || null,
      topBrand: topBrandResult[0]?.brand || null,
    });
  }

  // Sort by gross profit descending
  return results.sort((a, b) => b.grossProfit - a.grossProfit);
}

export interface SalesAttributionSummary {
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  overallProfitMargin: number;
  totalItemsSold: number;
  avgRevenuePerItem: number;
  avgProfitPerItem: number;
  topPerformingStores: Array<{
    storeId: number;
    storeName: string;
    grossProfit: number;
    itemsSold: number;
  }>;
  bottomPerformingStores: Array<{
    storeId: number;
    storeName: string;
    grossProfit: number;
    itemsSold: number;
  }>;
  profitByCategory: Array<{
    category: string;
    revenue: number;
    cost: number;
    profit: number;
    itemsSold: number;
  }>;
}

export async function getSalesAttributionSummary(): Promise<SalesAttributionSummary | null> {
  const db = await getDb();
  if (!db) return null;

  // Overall metrics from sold products
  const overallMetrics = await db.select({
    totalRevenue: sql<number>`COALESCE(SUM(${products.salePrice}), 0)`,
    totalCost: sql<number>`COALESCE(SUM(${products.originalCost}), 0)`,
    totalItemsSold: sql<number>`COUNT(*)`,
  })
  .from(products)
  .where(eq(products.status, "sold"));

  const totalRevenue = Number(overallMetrics[0]?.totalRevenue) || 0;
  const totalCost = Number(overallMetrics[0]?.totalCost) || 0;
  const totalItemsSold = Number(overallMetrics[0]?.totalItemsSold) || 0;
  const totalGrossProfit = totalRevenue - totalCost;

  // Profit by category
  const categoryMetrics = await db.select({
    category: products.category,
    revenue: sql<number>`COALESCE(SUM(${products.salePrice}), 0)`,
    cost: sql<number>`COALESCE(SUM(${products.originalCost}), 0)`,
    itemsSold: sql<number>`COUNT(*)`,
  })
  .from(products)
  .where(eq(products.status, "sold"))
  .groupBy(products.category)
  .orderBy(desc(sql`SUM(${products.salePrice}) - SUM(${products.originalCost})`));

  // Top and bottom performing stores
  const storePerformance = await db.select({
    storeId: thriftStores.id,
    storeName: thriftStores.name,
    grossProfit: sql<number>`COALESCE(SUM(${products.salePrice} - ${products.originalCost}), 0)`,
    itemsSold: sql<number>`COUNT(*)`,
  })
  .from(products)
  .innerJoin(thriftStores, eq(products.thriftStoreId, thriftStores.id))
  .where(eq(products.status, "sold"))
  .groupBy(thriftStores.id, thriftStores.name)
  .orderBy(desc(sql`SUM(${products.salePrice} - ${products.originalCost})`));

  const topPerformingStores = storePerformance.slice(0, 5).map(s => ({
    storeId: s.storeId,
    storeName: s.storeName,
    grossProfit: Number(s.grossProfit),
    itemsSold: Number(s.itemsSold),
  }));

  const bottomPerformingStores = storePerformance.slice(-5).reverse().map(s => ({
    storeId: s.storeId,
    storeName: s.storeName,
    grossProfit: Number(s.grossProfit),
    itemsSold: Number(s.itemsSold),
  }));

  return {
    totalRevenue,
    totalCost,
    totalGrossProfit,
    overallProfitMargin: totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0,
    totalItemsSold,
    avgRevenuePerItem: totalItemsSold > 0 ? totalRevenue / totalItemsSold : 0,
    avgProfitPerItem: totalItemsSold > 0 ? totalGrossProfit / totalItemsSold : 0,
    topPerformingStores,
    bottomPerformingStores,
    profitByCategory: categoryMetrics.map(c => ({
      category: c.category,
      revenue: Number(c.revenue),
      cost: Number(c.cost),
      profit: Number(c.revenue) - Number(c.cost),
      itemsSold: Number(c.itemsSold),
    })),
  };
}

export interface StoreDetailedAnalytics {
  store: ThriftStore;
  monthlyPerformance: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    itemsSold: number;
  }>;
  topSellingProducts: Array<{
    productId: number;
    name: string;
    brand: string | null;
    salePrice: number;
    profit: number;
    soldAt: Date | null;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    revenue: number;
    profit: number;
  }>;
}

export async function getStoreDetailedAnalytics(thriftStoreId: number): Promise<StoreDetailedAnalytics | null> {
  const db = await getDb();
  if (!db) return null;

  // Get store details
  const storeResult = await db.select().from(thriftStores).where(eq(thriftStores.id, thriftStoreId)).limit(1);
  if (storeResult.length === 0) return null;

  const store = storeResult[0];

  // Monthly performance (last 12 months)
  // Use raw SQL to avoid GROUP BY issues with MySQL's only_full_group_by mode
  const monthlyPerformanceRaw = await db.execute(sql`
    SELECT 
      DATE_FORMAT(soldAt, '%Y-%m') as month,
      COALESCE(SUM(salePrice), 0) as revenue,
      COALESCE(SUM(originalCost), 0) as cost,
      COUNT(*) as itemsSold
    FROM products
    WHERE thriftStoreId = ${thriftStoreId}
      AND status = 'sold'
      AND soldAt IS NOT NULL
      AND soldAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(soldAt, '%Y-%m')
    ORDER BY month
  `);
  const monthlyPerformance = ((monthlyPerformanceRaw as unknown as any[][])[0] || []) as any[];

  // Top selling products
  const topProducts = await db.select({
    productId: products.id,
    name: products.name,
    brand: products.brand,
    salePrice: products.salePrice,
    originalCost: products.originalCost,
    soldAt: products.soldAt,
  })
  .from(products)
  .where(and(
    eq(products.thriftStoreId, thriftStoreId),
    eq(products.status, "sold")
  ))
  .orderBy(desc(sql`${products.salePrice} - ${products.originalCost}`))
  .limit(10);

  // Category breakdown
  const categoryBreakdown = await db.select({
    category: products.category,
    count: sql<number>`COUNT(*)`,
    revenue: sql<number>`COALESCE(SUM(${products.salePrice}), 0)`,
    cost: sql<number>`COALESCE(SUM(${products.originalCost}), 0)`,
  })
  .from(products)
  .where(and(
    eq(products.thriftStoreId, thriftStoreId),
    eq(products.status, "sold")
  ))
  .groupBy(products.category)
  .orderBy(desc(sql`SUM(${products.salePrice})`));

  return {
    store,
    monthlyPerformance: monthlyPerformance.map(m => ({
      month: m.month,
      revenue: Number(m.revenue),
      cost: Number(m.cost),
      profit: Number(m.revenue) - Number(m.cost),
      itemsSold: Number(m.itemsSold),
    })),
    topSellingProducts: topProducts.map(p => ({
      productId: p.productId,
      name: p.name,
      brand: p.brand,
      salePrice: Number(p.salePrice),
      profit: Number(p.salePrice) - Number(p.originalCost),
      soldAt: p.soldAt,
    })),
    categoryBreakdown: categoryBreakdown.map(c => ({
      category: c.category,
      count: Number(c.count),
      revenue: Number(c.revenue),
      profit: Number(c.revenue) - Number(c.cost),
    })),
  };
}
