import { eq, and, desc, sql, inArray, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  thriftStores, InsertThriftStore, ThriftStore,
  products, InsertProduct, Product,
  cartItems, InsertCartItem,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem,
  payouts, InsertPayout,
  emailLogs, InsertEmailLog
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

export async function getAvailableProducts(category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (category && category !== "all") {
    return db.select().from(products)
      .where(and(eq(products.status, "available"), eq(products.category, category as any)))
      .orderBy(desc(products.createdAt));
  }
  return db.select().from(products)
    .where(eq(products.status, "available"))
    .orderBy(desc(products.createdAt));
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
