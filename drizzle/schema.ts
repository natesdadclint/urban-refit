import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  shippingAddress: text("shippingAddress"),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Thrift stores - partner stores that source garments
 */
export const thriftStores = mysqlTable("thrift_stores", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  bankName: varchar("bankName", { length: 255 }),
  bankAccount: varchar("bankAccount", { length: 100 }),
  bankRouting: varchar("bankRouting", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  totalPayout: decimal("totalPayout", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ThriftStore = typeof thriftStores.$inferSelect;
export type InsertThriftStore = typeof thriftStores.$inferInsert;

/**
 * Products - individual garments for sale
 * Each item is unique (one-of-one) in secondhand retail
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 100 }),
  category: mysqlEnum("category", ["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]).default("other").notNull(),
  size: varchar("size", { length: 20 }),
  condition: mysqlEnum("condition", ["like_new", "excellent", "good", "fair"]).default("good").notNull(),
  color: varchar("color", { length: 50 }),
  material: varchar("material", { length: 100 }),
  
  // Pricing structure
  originalCost: decimal("originalCost", { precision: 10, scale: 2 }).notNull(),
  markupPercentage: decimal("markupPercentage", { precision: 5, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
  thriftStorePayoutAmount: decimal("thriftStorePayoutAmount", { precision: 10, scale: 2 }).notNull(), // 10% of sale price
  
  // Dual images for different viewpoints
  image1Url: text("image1Url"),
  image2Url: text("image2Url"),
  
  // Relationships
  thriftStoreId: int("thriftStoreId"),
  
  // Status tracking
  status: mysqlEnum("status", ["available", "reserved", "sold", "archived"]).default("available").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  soldAt: timestamp("soldAt"),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Shopping cart items
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders - customer purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  
  // Totals
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  // Shipping info
  shippingName: varchar("shippingName", { length: 255 }),
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 100 }),
  shippingState: varchar("shippingState", { length: 100 }),
  shippingZip: varchar("shippingZip", { length: 20 }),
  shippingCountry: varchar("shippingCountry", { length: 100 }),
  shippingPhone: varchar("shippingPhone", { length: 20 }),
  
  // Payment
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  paidAt: timestamp("paidAt"),
  
  // Customer email for notifications
  customerEmail: varchar("customerEmail", { length: 320 }),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - individual products in an order
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  
  // Snapshot of price at time of purchase
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  
  // Thrift store payout tracking (10% of sale price)
  thriftStoreId: int("thriftStoreId").notNull(),
  thriftStorePayoutAmount: decimal("thriftStorePayoutAmount", { precision: 10, scale: 2 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Payouts - tracking payments to thrift stores
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  thriftStoreId: int("thriftStoreId").notNull(),
  
  // Amount details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "processing", "paid", "failed"]).default("pending").notNull(),
  
  // Payment details
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentReference: varchar("paymentReference", { length: 255 }),
  
  // Period covered
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  
  notes: text("notes"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * Email logs - tracking sent notifications
 */
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["order_confirmation", "shipping_notification", "payout_notification", "welcome", "other"]).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  relatedOrderId: int("relatedOrderId"),
  relatedPayoutId: int("relatedPayoutId"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
