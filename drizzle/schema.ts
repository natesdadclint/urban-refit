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
  charityPayoutAmount: decimal("charityPayoutAmount", { precision: 10, scale: 2 }).default("0.00").notNull(), // 10% of sale price to charity
  
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
  gstAmount: decimal("gstAmount", { precision: 10, scale: 2 }).default("0.00").notNull(), // 15% GST
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
  
  // Thrift store payout tracking (10% of sale price) - nullable for products without store association
  thriftStoreId: int("thriftStoreId"),
  thriftStorePayoutAmount: decimal("thriftStorePayoutAmount", { precision: 10, scale: 2 }),
  // Charity payout tracking (10% of sale price)
  charityPayoutAmount: decimal("charityPayoutAmount", { precision: 10, scale: 2 }),
  
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


/**
 * Customer profiles - extended user data for marketing and rewards
 */
export const customerProfiles = mysqlTable("customer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Marketing data
  dateOfBirth: timestamp("dateOfBirth"),
  gender: varchar("gender", { length: 50 }),
  preferredCategories: text("preferredCategories"), // JSON array of preferred categories
  preferredSizes: text("preferredSizes"), // JSON array of preferred sizes
  preferredBrands: text("preferredBrands"), // JSON array of preferred brands
  
  // Communication preferences
  emailMarketing: boolean("emailMarketing").default(true).notNull(),
  smsMarketing: boolean("smsMarketing").default(false).notNull(),
  
  // Token/Rewards balance
  tokenBalance: decimal("tokenBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalTokensEarned: decimal("totalTokensEarned", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalTokensSpent: decimal("totalTokensSpent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalTokensDonated: decimal("totalTokensDonated", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Spend limit (can be topped up with tokens)
  spendLimit: decimal("spendLimit", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Membership tier based on activity
  membershipTier: mysqlEnum("membershipTier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  
  // Weekly login reward tracking
  lastWeeklyReward: timestamp("lastWeeklyReward"),
  
  // Anti-abuse tracking
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }), // Browser fingerprint hash
  lastKnownIp: varchar("lastKnownIp", { length: 45 }), // IPv4 or IPv6
  weeklyRewardClaimCount: int("weeklyRewardClaimCount").default(0).notNull(), // Total weekly rewards claimed
  suspiciousActivityFlag: boolean("suspiciousActivityFlag").default(false).notNull(), // Flagged for review
  suspiciousActivityReason: text("suspiciousActivityReason"), // Reason for flag
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;

/**
 * Charities - organizations that can receive token donations
 */
export const charities = mysqlTable("charities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  website: varchar("website", { length: 500 }),
  logoUrl: text("logoUrl"),
  category: varchar("category", { length: 100 }), // e.g., "environment", "social", "health"
  isActive: boolean("isActive").default(true).notNull(),
  totalDonationsReceived: decimal("totalDonationsReceived", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Charity = typeof charities.$inferSelect;
export type InsertCharity = typeof charities.$inferInsert;

/**
 * Courier returns - garments returned by customers for resale
 */
export const courierReturns = mysqlTable("courier_returns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Original order/product info (if purchased from Urban Refit)
  originalOrderId: int("originalOrderId"),
  originalProductId: int("originalProductId"),
  
  // Return item details
  itemName: varchar("itemName", { length: 255 }).notNull(),
  itemBrand: varchar("brand", { length: 100 }),
  itemCategory: mysqlEnum("itemCategory", ["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]).default("other").notNull(),
  itemSize: varchar("itemSize", { length: 20 }),
  itemCondition: mysqlEnum("itemCondition", ["like_new", "excellent", "good", "fair"]).default("good").notNull(),
  itemDescription: text("itemDescription"),
  
  // Images uploaded by customer
  image1Url: text("image1Url"),
  image2Url: text("image2Url"),
  
  // Courier tracking
  courierService: varchar("courierService", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  shippingLabelUrl: text("shippingLabelUrl"),
  
  // Status workflow
  status: mysqlEnum("status", ["pending_review", "approved", "label_sent", "in_transit", "received", "inspected", "listed", "rejected", "completed"]).default("pending_review").notNull(),
  
  // Token reward (25% of estimated resale value)
  estimatedResaleValue: decimal("estimatedResaleValue", { precision: 10, scale: 2 }),
  tokensAwarded: decimal("tokensAwarded", { precision: 10, scale: 2 }),
  tokensAwardedAt: timestamp("tokensAwardedAt"),
  
  // Admin notes
  inspectionNotes: text("inspectionNotes"),
  rejectionReason: text("rejectionReason"),
  
  // Resulting product (if listed for sale)
  resultingProductId: int("resultingProductId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourierReturn = typeof courierReturns.$inferSelect;
export type InsertCourierReturn = typeof courierReturns.$inferInsert;

/**
 * Token transactions - all token movements (earn, spend, donate)
 */
export const tokenTransactions = mysqlTable("token_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Transaction type
  type: mysqlEnum("type", ["earned_return", "earned_purchase", "earned_weekly_login", "earned_referral_bonus", "earned_referral_reward", "spent_discount", "spent_spend_limit", "donated_charity"]).notNull(),
  
  // Amount (positive for earned, negative for spent/donated)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Balance after transaction
  balanceAfter: decimal("balanceAfter", { precision: 10, scale: 2 }).notNull(),
  
  // Related entities
  relatedOrderId: int("relatedOrderId"),
  relatedCourierReturnId: int("relatedCourierReturnId"),
  relatedCharityId: int("relatedCharityId"),
  
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * Charity donations - token donations to charities
 */
export const charityDonations = mysqlTable("charity_donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  charityId: int("charityId").notNull(),
  
  // Token amount donated
  tokenAmount: decimal("tokenAmount", { precision: 10, scale: 2 }).notNull(),
  
  // Equivalent dollar value (for reporting)
  dollarValue: decimal("dollarValue", { precision: 10, scale: 2 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "transferred"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharityDonation = typeof charityDonations.$inferSelect;
export type InsertCharityDonation = typeof charityDonations.$inferInsert;

/**
 * Discount tiers - tiered discounts based on order quantity
 */
export const discountTiers = mysqlTable("discount_tiers", {
  id: int("id").autoincrement().primaryKey(),
  minItems: int("minItems").notNull(),
  maxItems: int("maxItems"),
  discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).notNull(),
  bonusTokensPercentage: decimal("bonusTokensPercentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiscountTier = typeof discountTiers.$inferSelect;
export type InsertDiscountTier = typeof discountTiers.$inferInsert;


/**
 * Blog posts - content for the blog section
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  
  // Featured image
  featuredImageUrl: text("featuredImageUrl"),
  
  // Categorization
  category: mysqlEnum("category", ["style_tips", "sustainability", "brand_spotlight", "behind_the_scenes", "community", "trends"]).default("style_tips").notNull(),
  tags: text("tags"), // JSON array of tags
  
  // Author info
  authorId: int("authorId"),
  authorName: varchar("authorName", { length: 255 }),
  
  // Engagement metrics
  viewCount: int("viewCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  
  // Publishing
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  
  // Reading time estimate (in minutes)
  readingTime: int("readingTime").default(5).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Chat messages - conversation history for helpdesk bot
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  userId: int("userId"), // null for anonymous users
  
  // Message content
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  
  // Metadata
  metadata: text("metadata"), // JSON for any additional data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;


/**
 * Product reviews - customer reviews and ratings
 */
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  
  // Review content
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  content: text("content"),
  
  // Fit feedback for clothing
  fitFeedback: mysqlEnum("fitFeedback", ["runs_small", "true_to_size", "runs_large"]),
  
  // Verification
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false).notNull(),
  
  // Moderation
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
  // Helpful votes
  helpfulCount: int("helpfulCount").default(0).notNull(),
  
  // Review images (optional)
  imageUrl: text("imageUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;


/**
 * Sell submissions - customers submitting items to sell back to Urban Refit
 */
export const sellSubmissions = mysqlTable("sell_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null for guest submissions
  
  // Contact information
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  
  // Item details
  brand: varchar("brand", { length: 255 }).notNull(),
  itemType: mysqlEnum("itemType", ["tops", "bottoms", "outerwear", "shoes", "accessories"]).notNull(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  condition: mysqlEnum("condition", ["like_new", "excellent", "good", "fair"]).notNull(),
  description: text("description"),
  
  // Token Request (customers request tokens, not cash)
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }), // Original retail price for reference
  requestedTokens: int("requestedTokens"), // Number of tokens customer is requesting
  
  // Images (up to 4)
  image1Url: text("image1Url"),
  image2Url: text("image2Url"),
  image3Url: text("image3Url"),
  image4Url: text("image4Url"),
  
  // Submission status
  status: mysqlEnum("status", ["pending", "reviewing", "offer_made", "offer_accepted", "offer_rejected", "counter_offered", "accepted", "rejected", "completed"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  tokenOffer: int("tokenOffer"), // Admin's token offer to customer
  
  // Customer response to offer
  customerResponse: mysqlEnum("customerResponse", ["pending", "accepted", "rejected", "counter"]),
  counterTokenOffer: int("counterTokenOffer"), // Customer's counter offer in tokens
  customerNotes: text("customerNotes"),
  offerSentAt: timestamp("offerSentAt"),
  customerRespondedAt: timestamp("customerRespondedAt"),
  
  // Final agreed tokens
  finalTokens: int("finalTokens"), // Final agreed token amount
  
  // Shipping information
  shippingLabelUrl: text("shippingLabelUrl"),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  courierService: varchar("courierService", { length: 100 }),
  labelSentAt: timestamp("labelSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SellSubmission = typeof sellSubmissions.$inferSelect;
export type InsertSellSubmission = typeof sellSubmissions.$inferInsert;

/**
 * Product Metadata - Detailed product information for customers
 * Stored separately from core product data to keep metadata organized
 */
export const productMetadata = mysqlTable("product_metadata", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().unique(),
  
  // Invoice and sourcing information
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  thriftStoreName: varchar("thriftStoreName", { length: 255 }),
  
  // Detailed product information
  styleDescription: text("styleDescription"), // Detailed style description
  materialDescription: text("materialDescription"), // Material composition and care
  customInformation: text("customInformation"), // Custom fields/notes
  
  // Image metadata
  image1Alt: varchar("image1Alt", { length: 255 }), // Alt text for image 1
  image2Alt: varchar("image2Alt", { length: 255 }), // Alt text for image 2
  image3Url: text("image3Url"), // Additional image
  image3Alt: varchar("image3Alt", { length: 255 }),
  image4Url: text("image4Url"), // Additional image
  image4Alt: varchar("image4Alt", { length: 255 }),
  
  // Customer-facing details
  careInstructions: text("careInstructions"), // How to care for the item
  sizeGuide: text("sizeGuide"), // Size fitting details
  productHighlights: text("productHighlights"), // Key selling points (JSON array)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductMetadata = typeof productMetadata.$inferSelect;
export type InsertProductMetadata = typeof productMetadata.$inferInsert;


/**
 * Email subscribers - newsletter and marketing email collection
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  
  // Source of subscription
  source: mysqlEnum("source", ["newsletter", "join_page", "contact", "checkout", "footer"]).default("newsletter").notNull(),
  
  // Subscription preferences
  newArrivals: boolean("newArrivals").default(true).notNull(),
  exclusiveOffers: boolean("exclusiveOffers").default(true).notNull(),
  sustainabilityNews: boolean("sustainabilityNews").default(false).notNull(),
  partnerUpdates: boolean("partnerUpdates").default(false).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  
  // Tracking
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;


/**
 * Contact messages - messages from the FAQ contact form
 */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Sender information
  email: varchar("email", { length: 320 }).notNull(),
  userId: int("userId"), // null for anonymous users
  
  // Message content
  message: text("message").notNull(),
  
  // Newsletter opt-in
  subscribedToNewsletter: boolean("subscribedToNewsletter").default(false).notNull(),
  
  // Status tracking
  status: mysqlEnum("status", ["unread", "read", "replied", "archived"]).default("unread").notNull(),
  
  // Admin notes
  adminNotes: text("adminNotes"),
  repliedAt: timestamp("repliedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Contact replies - replies sent to contact form messages
 */
export const contactReplies = mysqlTable("contact_replies", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reference to original message
  contactMessageId: int("contactMessageId").notNull(),
  
  // Reply content
  subject: varchar("subject", { length: 500 }).notNull(),
  content: text("content").notNull(),
  
  // Sender info (admin who sent)
  sentByUserId: int("sentByUserId"),
  sentByName: varchar("sentByName", { length: 255 }),
  
  // Email delivery status
  emailSent: boolean("emailSent").default(false).notNull(),
  emailMessageId: varchar("emailMessageId", { length: 255 }),
  emailError: text("emailError"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactReply = typeof contactReplies.$inferSelect;
export type InsertContactReply = typeof contactReplies.$inferInsert;


/**
 * User notifications - in-app notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Target user (null for broadcast to all users)
  userId: int("userId"),
  
  // Notification content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Notification type for styling/icons
  type: mysqlEnum("type", ["info", "success", "warning", "order", "submission", "tokens", "promo"]).default("info").notNull(),
  
  // Link to navigate when clicked
  link: varchar("link", { length: 500 }),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  
  // For broadcast notifications
  isBroadcast: boolean("isBroadcast").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Broadcast read status - tracks which users have read broadcast notifications
 */
export const broadcastReadStatus = mysqlTable("broadcast_read_status", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId").notNull(),
  userId: int("userId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type BroadcastReadStatus = typeof broadcastReadStatus.$inferSelect;
export type InsertBroadcastReadStatus = typeof broadcastReadStatus.$inferInsert;


/**
 * Notification preferences - user preferences for notification types
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Order-related notifications
  orderUpdates: boolean("orderUpdates").default(true).notNull(), // Order confirmation, shipping, delivery
  
  // Token/Rewards notifications
  tokenRewards: boolean("tokenRewards").default(true).notNull(), // Token earned, weekly rewards
  
  // Promotional notifications
  promotions: boolean("promotions").default(true).notNull(), // Sales, discounts, new arrivals
  
  // Submission notifications (for sellers)
  sellSubmissions: boolean("sellSubmissions").default(true).notNull(), // Sell submission status updates
  
  // System notifications
  systemUpdates: boolean("systemUpdates").default(true).notNull(), // Account updates, policy changes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;


/**
 * Image validation logs - tracks image URL validity checks over time
 */
export const imageValidationLogs = mysqlTable("image_validation_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Validation run metadata
  validationRunId: varchar("validationRunId", { length: 50 }).notNull(), // UUID for grouping checks in same run
  
  // Asset reference (polymorphic)
  assetType: mysqlEnum("assetType", ["product", "blog", "category"]).notNull(),
  assetId: int("assetId").notNull(), // ID of the product, blog post, or category
  
  // Image details
  imageField: varchar("imageField", { length: 50 }).notNull(), // e.g., "image1Url", "image2Url", "featuredImageUrl"
  imageUrl: text("imageUrl"),
  
  // Validation result
  isValid: boolean("isValid").notNull(),
  errorType: mysqlEnum("errorType", ["null", "empty", "invalid_format", "http_error", "timeout"]),
  httpStatus: int("httpStatus"), // HTTP status code if applicable
  errorMessage: text("errorMessage"),
  
  // Timing
  responseTimeMs: int("responseTimeMs"), // Response time in milliseconds
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImageValidationLog = typeof imageValidationLogs.$inferSelect;
export type InsertImageValidationLog = typeof imageValidationLogs.$inferInsert;


/**
 * Admin notifications - alerts for admins about important events
 */
export const adminNotifications = mysqlTable("admin_notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Notification content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Notification type for categorization and icons
  type: mysqlEnum("type", [
    "new_order",
    "order_cancelled",
    "new_submission",
    "submission_approved",
    "submission_rejected",
    "new_contact",
    "low_stock",
    "payout_due",
    "system_alert",
    "security_alert"
  ]).notNull(),
  
  // Priority level
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // Link to relevant resource
  link: varchar("link", { length: 500 }),
  
  // Reference to related entity
  relatedEntityType: mysqlEnum("relatedEntityType", ["order", "submission", "contact", "product", "user"]),
  relatedEntityId: int("relatedEntityId"),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  readByUserId: int("readByUserId"), // Which admin marked it as read
  
  // Email notification status
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;


/**
 * User Badges - tracks sustainability achievement badges earned by users
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reference to user
  userId: int("userId").notNull(),
  
  // Badge identifier (matches badge ID from badges.ts)
  badgeId: varchar("badgeId", { length: 100 }).notNull(),
  
  // Badge metadata (denormalized for quick display)
  badgeName: varchar("badgeName", { length: 255 }).notNull(),
  badgeDescription: text("badgeDescription"),
  badgeIcon: varchar("badgeIcon", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 50 }),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).notNull(),
  
  // When the badge was earned
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  
  // Notification status
  notificationSent: boolean("notificationSent").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;


/**
 * Sustainability Milestones - tracks user progress towards badges
 */
export const sustainabilityMilestones = mysqlTable("sustainability_milestones", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reference to user
  userId: int("userId").notNull().unique(),
  
  // Current metrics (cached for quick access)
  totalGarmentsCount: int("totalGarmentsCount").default(0).notNull(),
  totalLandfillKgDiverted: decimal("totalLandfillKgDiverted", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalWaterLitersSaved: int("totalWaterLitersSaved").default(0).notNull(),
  totalCarbonKgAvoided: decimal("totalCarbonKgAvoided", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Badge counts by tier
  bronzeBadgesCount: int("bronzeBadgesCount").default(0).notNull(),
  silverBadgesCount: int("silverBadgesCount").default(0).notNull(),
  goldBadgesCount: int("goldBadgesCount").default(0).notNull(),
  platinumBadgesCount: int("platinumBadgesCount").default(0).notNull(),
  
  // Tracking
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SustainabilityMilestone = typeof sustainabilityMilestones.$inferSelect;
export type InsertSustainabilityMilestone = typeof sustainabilityMilestones.$inferInsert;


/**
 * Site Feedback - general user feedback about the website
 */
export const siteFeedback = mysqlTable("site_feedback", {
  id: int("id").autoincrement().primaryKey(),
  
  // Optional user reference (can be anonymous)
  userId: int("userId"),
  
  // Feedback details
  type: varchar("type", { length: 50 }).notNull(), // 'bug', 'feature', 'general', 'compliment', 'complaint'
  category: varchar("category", { length: 100 }), // 'navigation', 'checkout', 'product', 'performance', etc.
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Contact info (for anonymous users)
  email: varchar("email", { length: 255 }),
  
  // Metadata
  page: varchar("page", { length: 500 }), // URL where feedback was submitted
  userAgent: text("userAgent"), // Browser info
  
  // Status tracking
  status: varchar("status", { length: 50 }).default("new").notNull(), // 'new', 'reviewing', 'resolved', 'closed'
  adminNotes: text("adminNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteFeedback = typeof siteFeedback.$inferSelect;
export type InsertSiteFeedback = typeof siteFeedback.$inferInsert;


/**
 * Referral Codes - unique codes for each user to invite friends
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Owner of the referral code
  userId: int("userId").notNull().unique(),
  
  // Unique referral code (e.g., "URBAN-ALEX-2024")
  code: varchar("code", { length: 50 }).notNull().unique(),
  
  // Statistics
  totalReferrals: int("totalReferrals").default(0).notNull(), // Total signups using this code
  completedReferrals: int("completedReferrals").default(0).notNull(), // Signups that made first purchase
  totalTokensEarned: decimal("totalTokensEarned", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;


/**
 * Referrals - tracks individual referral relationships and rewards
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  
  // Referrer (the person who invited)
  referrerId: int("referrerId").notNull(),
  referralCodeId: int("referralCodeId").notNull(),
  
  // Referee (the person who was invited)
  refereeId: int("refereeId").notNull(),
  
  // Referral code used
  codeUsed: varchar("codeUsed", { length: 50 }).notNull(),
  
  // Reward tracking
  status: mysqlEnum("status", ["pending", "completed", "expired"]).default("pending").notNull(),
  
  // Tokens awarded to referrer
  tokensAwarded: decimal("tokensAwarded", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Bonus tokens given to referee on signup
  refereeBonus: decimal("refereeBonus", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Completion tracking
  signupAt: timestamp("signupAt").defaultNow().notNull(),
  firstPurchaseAt: timestamp("firstPurchaseAt"),
  rewardedAt: timestamp("rewardedAt"),
  
  // Expiry: referral link expires after 1 week
  expiresAt: timestamp("expiresAt"),
  
  // Whether bonus tokens are donation-only (from timer bonus)
  bonusDonationOnly: boolean("bonusDonationOnly").default(false).notNull(),
  
  // Timer bonus tokens awarded (donation-only)
  timerBonusTokens: decimal("timerBonusTokens", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Notification status
  referrerNotified: boolean("referrerNotified").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;


/**
 * Site banners - admin-managed announcement banners displayed at the top of the site
 */
export const siteBanners = mysqlTable("site_banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "promo", "warning", "urgent"]).default("info").notNull(),
  linkUrl: varchar("linkUrl", { length: 500 }),
  linkText: varchar("linkText", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteBanner = typeof siteBanners.$inferSelect;
export type InsertSiteBanner = typeof siteBanners.$inferInsert;


/**
 * Sell submission replies - conversation thread between admin and customer for price negotiation
 */
export const sellSubmissionReplies = mysqlTable("sell_submission_replies", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  senderRole: mysqlEnum("senderRole", ["admin", "customer"]).notNull(),
  senderName: varchar("senderName", { length: 255 }),
  message: text("message").notNull(),
  tokenOffer: int("tokenOffer"), // Optional: attach a token offer/counter to this message
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SellSubmissionReply = typeof sellSubmissionReplies.$inferSelect;
export type InsertSellSubmissionReply = typeof sellSubmissionReplies.$inferInsert;
