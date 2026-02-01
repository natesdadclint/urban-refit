import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Image Validation System - Multi Asset Types', () => {
  let testRunId: string;
  
  beforeAll(async () => {
    testRunId = 'test-run-multi-' + Date.now();
  });

  it('should create image validation log for product asset', async () => {
    const logData = {
      validationRunId: testRunId,
      assetType: 'product' as const,
      assetId: 1,
      imageField: 'image1Url',
      imageUrl: 'https://example.com/product.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 150,
    };
    
    const logId = await db.createImageValidationLog(logData);
    expect(logId).toBeGreaterThan(0);
  });

  it('should create image validation log for blog asset', async () => {
    const logData = {
      validationRunId: testRunId,
      assetType: 'blog' as const,
      assetId: 1,
      imageField: 'featuredImageUrl',
      imageUrl: 'https://example.com/blog-featured.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 120,
    };
    
    const logId = await db.createImageValidationLog(logData);
    expect(logId).toBeGreaterThan(0);
  });

  it('should retrieve validation logs by run ID with multiple asset types', async () => {
    const runId = 'test-multi-' + Date.now();
    
    // Create product log
    await db.createImageValidationLog({
      validationRunId: runId,
      assetType: 'product',
      assetId: 1,
      imageField: 'image1Url',
      imageUrl: 'https://example.com/product1.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 100,
    });
    
    // Create blog log
    await db.createImageValidationLog({
      validationRunId: runId,
      assetType: 'blog',
      assetId: 2,
      imageField: 'featuredImageUrl',
      imageUrl: 'https://example.com/blog2.jpg',
      isValid: false,
      errorType: 'http_error',
      httpStatus: 404,
      errorMessage: 'Not found',
      responseTimeMs: 200,
    });
    
    const logs = await db.getImageValidationLogsByRunId(runId);
    expect(logs.length).toBe(2);
    
    const productLog = logs.find(log => log.assetType === 'product');
    const blogLog = logs.find(log => log.assetType === 'blog');
    
    expect(productLog).toBeDefined();
    expect(productLog?.assetId).toBe(1);
    expect(productLog?.isValid).toBe(true);
    
    expect(blogLog).toBeDefined();
    expect(blogLog?.assetId).toBe(2);
    expect(blogLog?.isValid).toBe(false);
  });

  it('should get validation statistics with asset type breakdown', async () => {
    const stats = await db.getValidationStats();
    expect(stats).toHaveProperty('totalAssets');
    expect(stats).toHaveProperty('totalProducts');
    expect(stats).toHaveProperty('totalBlogs');
    expect(stats).toHaveProperty('validImages');
    expect(stats).toHaveProperty('invalidImages');
    expect(stats).toHaveProperty('lastRunDate');
    expect(stats).toHaveProperty('byAssetType');
    
    expect(typeof stats.totalAssets).toBe('number');
    expect(typeof stats.totalProducts).toBe('number');
    expect(typeof stats.totalBlogs).toBe('number');
    expect(typeof stats.validImages).toBe('number');
    expect(typeof stats.invalidImages).toBe('number');
    expect(typeof stats.byAssetType).toBe('object');
  });

  it('should correctly categorize assets by type in stats', async () => {
    const runId = 'test-stats-' + Date.now();
    
    // Create 2 product logs (1 valid, 1 invalid)
    await db.createImageValidationLog({
      validationRunId: runId,
      assetType: 'product',
      assetId: 10,
      imageField: 'image1Url',
      imageUrl: 'https://example.com/valid.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 100,
    });
    
    await db.createImageValidationLog({
      validationRunId: runId,
      assetType: 'product',
      assetId: 11,
      imageField: 'image1Url',
      imageUrl: null,
      isValid: false,
      errorType: 'null',
      httpStatus: null,
      errorMessage: 'Image URL is null',
      responseTimeMs: 0,
    });
    
    // Create 1 blog log (valid)
    await db.createImageValidationLog({
      validationRunId: runId,
      assetType: 'blog',
      assetId: 20,
      imageField: 'featuredImageUrl',
      imageUrl: 'https://example.com/blog.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 150,
    });
    
    const logs = await db.getImageValidationLogsByRunId(runId);
    expect(logs.length).toBe(3);
    
    const productLogs = logs.filter(log => log.assetType === 'product');
    const blogLogs = logs.filter(log => log.assetType === 'blog');
    
    expect(productLogs.length).toBe(2);
    expect(blogLogs.length).toBe(1);
  });

  it('should handle different error types across asset types', async () => {
    const runId = 'test-errors-' + Date.now();
    const errorTypes = ['null', 'empty', 'invalid_format', 'http_error', 'timeout'] as const;
    const assetTypes = ['product', 'blog'] as const;
    
    for (const assetType of assetTypes) {
      for (const errorType of errorTypes) {
        const log = {
          validationRunId: runId,
          assetType,
          assetId: 1000 + errorTypes.indexOf(errorType) + assetTypes.indexOf(assetType) * 10,
          imageField: assetType === 'product' ? 'image1Url' : 'featuredImageUrl',
          imageUrl: 'https://example.com/test.jpg',
          isValid: false,
          errorType,
          httpStatus: errorType === 'http_error' ? 500 : null,
          errorMessage: `Test ${errorType} error for ${assetType}`,
          responseTimeMs: 100,
        };
        
        const logId = await db.createImageValidationLog(log);
        expect(logId).toBeGreaterThan(0);
      }
    }
    
    const logs = await db.getImageValidationLogsByRunId(runId);
    expect(logs.length).toBe(errorTypes.length * assetTypes.length);
    
    for (const assetType of assetTypes) {
      const assetLogs = logs.filter(log => log.assetType === assetType);
      expect(assetLogs.length).toBe(errorTypes.length);
      
      for (const errorType of errorTypes) {
        const found = assetLogs.some(log => log.errorType === errorType);
        expect(found).toBe(true);
      }
    }
  });

  it('should fetch blog posts for validation', async () => {
    const blogs = await db.getAllBlogPostsForValidation();
    expect(Array.isArray(blogs)).toBe(true);
    blogs.forEach(blog => {
      expect(blog).toHaveProperty('id');
      expect(blog).toHaveProperty('featuredImageUrl');
      expect(typeof blog.id).toBe('number');
    });
  });
});
