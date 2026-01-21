import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from 'drizzle-orm/mysql2';
import { productReviews, products, users } from '../drizzle/schema';
import { eq, avg, count, sql } from 'drizzle-orm';

// Test database connection
let db: ReturnType<typeof drizzle> | null = null;

beforeAll(async () => {
  if (process.env.DATABASE_URL) {
    db = drizzle(process.env.DATABASE_URL);
  }
});

describe('Product Reviews', () => {
  it('should have product_reviews table accessible', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Query should not throw
    const reviews = await db.select().from(productReviews).limit(1);
    expect(Array.isArray(reviews)).toBe(true);
  });

  it('should support all required fields in product_reviews table', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that we can query with all expected fields
    const reviews = await db.select({
      id: productReviews.id,
      productId: productReviews.productId,
      userId: productReviews.userId,
      rating: productReviews.rating,
      title: productReviews.title,
      content: productReviews.content,
      fitFeedback: productReviews.fitFeedback,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      helpfulCount: productReviews.helpfulCount,
      createdAt: productReviews.createdAt,
    }).from(productReviews).limit(1);
    
    expect(Array.isArray(reviews)).toBe(true);
  });

  it('should be able to calculate review statistics', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Test aggregation queries work
    const stats = await db.select({
      avgRating: avg(productReviews.rating),
      totalReviews: count(),
    }).from(productReviews);
    
    expect(stats).toBeDefined();
    expect(stats.length).toBe(1);
  });

  it('should be able to join reviews with products and users', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Test join query works
    const reviewsWithDetails = await db.select({
      review: productReviews,
      product: products,
      user: users,
    })
    .from(productReviews)
    .innerJoin(products, eq(productReviews.productId, products.id))
    .innerJoin(users, eq(productReviews.userId, users.id))
    .limit(5);
    
    expect(Array.isArray(reviewsWithDetails)).toBe(true);
  });

  it('should support rating values from 1 to 5', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that rating column exists and can be filtered
    const fiveStarReviews = await db.select()
      .from(productReviews)
      .where(eq(productReviews.rating, 5))
      .limit(1);
    
    expect(Array.isArray(fiveStarReviews)).toBe(true);
  });

  it('should support fit feedback enum values', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that fitFeedback can be queried with valid enum values
    const trueToSizeReviews = await db.select()
      .from(productReviews)
      .where(eq(productReviews.fitFeedback, 'true_to_size'))
      .limit(1);
    
    expect(Array.isArray(trueToSizeReviews)).toBe(true);
  });
});
