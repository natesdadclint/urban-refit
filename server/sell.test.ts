import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from 'drizzle-orm/mysql2';
import { sellSubmissions } from '../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

// Test database connection
let db: ReturnType<typeof drizzle> | null = null;

beforeAll(async () => {
  if (process.env.DATABASE_URL) {
    db = drizzle(process.env.DATABASE_URL);
  }
});

describe('Sell Submissions', () => {
  it('should have sell_submissions table accessible', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Query should not throw
    const submissions = await db.select().from(sellSubmissions).limit(1);
    expect(Array.isArray(submissions)).toBe(true);
  });

  it('should support all required fields in sell_submissions table', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that we can query with all expected fields
    const submissions = await db.select({
      id: sellSubmissions.id,
      userId: sellSubmissions.userId,
      name: sellSubmissions.name,
      email: sellSubmissions.email,
      phone: sellSubmissions.phone,
      brand: sellSubmissions.brand,
      itemType: sellSubmissions.itemType,
      itemName: sellSubmissions.itemName,
      size: sellSubmissions.size,
      condition: sellSubmissions.condition,
      description: sellSubmissions.description,
      originalPrice: sellSubmissions.originalPrice,
      askingPrice: sellSubmissions.askingPrice,
      image1Url: sellSubmissions.image1Url,
      image2Url: sellSubmissions.image2Url,
      image3Url: sellSubmissions.image3Url,
      image4Url: sellSubmissions.image4Url,
      status: sellSubmissions.status,
      adminNotes: sellSubmissions.adminNotes,
      offerAmount: sellSubmissions.offerAmount,
      createdAt: sellSubmissions.createdAt,
      updatedAt: sellSubmissions.updatedAt,
    }).from(sellSubmissions).limit(1);
    
    expect(Array.isArray(submissions)).toBe(true);
  });

  it('should support item type enum values', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that itemType can be queried with valid enum values
    const topsSubmissions = await db.select()
      .from(sellSubmissions)
      .where(eq(sellSubmissions.itemType, 'tops'))
      .limit(1);
    
    expect(Array.isArray(topsSubmissions)).toBe(true);
  });

  it('should support condition enum values', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that condition can be queried with valid enum values
    const likeNewSubmissions = await db.select()
      .from(sellSubmissions)
      .where(eq(sellSubmissions.condition, 'like_new'))
      .limit(1);
    
    expect(Array.isArray(likeNewSubmissions)).toBe(true);
  });

  it('should support status enum values', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Check that status can be queried with valid enum values
    const pendingSubmissions = await db.select()
      .from(sellSubmissions)
      .where(eq(sellSubmissions.status, 'pending'))
      .limit(1);
    
    expect(Array.isArray(pendingSubmissions)).toBe(true);
  });

  it('should be able to calculate submission statistics', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Test aggregation queries work
    const stats = await db.select({
      total: sql<number>`COUNT(*)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
    }).from(sellSubmissions);
    
    expect(stats).toBeDefined();
    expect(stats.length).toBe(1);
  });
});
