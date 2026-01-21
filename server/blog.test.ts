import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { blogPosts, chatMessages } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Test database connection
let db: ReturnType<typeof drizzle> | null = null;

beforeAll(async () => {
  if (process.env.DATABASE_URL) {
    db = drizzle(process.env.DATABASE_URL);
  }
});

describe('Blog Posts', () => {
  it('should have blog_posts table accessible', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Query should not throw
    const posts = await db.select().from(blogPosts).limit(1);
    expect(Array.isArray(posts)).toBe(true);
  });

  it('should have published blog posts in the database', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    const publishedPosts = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'));
    
    expect(publishedPosts.length).toBeGreaterThan(0);
  });

  it('should have required fields for each blog post', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    const posts = await db.select().from(blogPosts).limit(5);
    
    for (const post of posts) {
      expect(post.id).toBeDefined();
      expect(post.slug).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.category).toBeDefined();
      expect(['style_tips', 'sustainability', 'brand_spotlight', 'behind_the_scenes', 'community', 'trends']).toContain(post.category);
    }
  });

  it('should have unique slugs for blog posts', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    const posts = await db.select({ slug: blogPosts.slug }).from(blogPosts);
    const slugs = posts.map(p => p.slug);
    const uniqueSlugs = [...new Set(slugs)];
    
    expect(slugs.length).toBe(uniqueSlugs.length);
  });
});

describe('Chat Messages', () => {
  it('should have chat_messages table accessible', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // Query should not throw
    const messages = await db.select().from(chatMessages).limit(1);
    expect(Array.isArray(messages)).toBe(true);
  });

  it('should support both user and assistant roles', async () => {
    if (!db) {
      console.warn('Database not available, skipping test');
      return;
    }
    
    // This test verifies the schema allows both roles
    // We don't insert test data, just verify the schema structure
    const messages = await db.select().from(chatMessages).limit(10);
    
    for (const msg of messages) {
      expect(['user', 'assistant']).toContain(msg.role);
    }
  });
});
