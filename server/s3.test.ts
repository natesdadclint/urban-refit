import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: vi.fn().mockImplementation((params) => params),
  DeleteObjectCommand: vi.fn().mockImplementation((params) => params),
  HeadObjectCommand: vi.fn().mockImplementation((params) => params),
}));

describe("S3 Utility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      AWS_REGION: 'us-west-2',
      AWS_ACCESS_KEY_ID: 'test-key-id',
      AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      S3_BUCKET: 'urban-refit',
      S3_BASE_URL: 'https://urban-refit.s3.amazonaws.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("isAwsConfigured", () => {
    it("should return true when all AWS credentials are set", async () => {
      const { isAwsConfigured } = await import("./s3");
      expect(isAwsConfigured()).toBe(true);
    });

    it("should return false when AWS_REGION is missing", async () => {
      delete process.env.AWS_REGION;
      const { isAwsConfigured } = await import("./s3");
      expect(isAwsConfigured()).toBe(false);
    });

    it("should return false when AWS_ACCESS_KEY_ID is missing", async () => {
      delete process.env.AWS_ACCESS_KEY_ID;
      const { isAwsConfigured } = await import("./s3");
      expect(isAwsConfigured()).toBe(false);
    });

    it("should return false when AWS_SECRET_ACCESS_KEY is missing", async () => {
      delete process.env.AWS_SECRET_ACCESS_KEY;
      const { isAwsConfigured } = await import("./s3");
      expect(isAwsConfigured()).toBe(false);
    });
  });

  describe("getProductImageUrl", () => {
    it("should generate correct URL for product image", async () => {
      const { getProductImageUrl } = await import("./s3");
      const url = getProductImageUrl(123, 1, 'abc123.jpg');
      expect(url).toBe('https://urban-refit.s3.amazonaws.com/products/123/1-abc123.jpg');
    });

    it("should handle different slots", async () => {
      const { getProductImageUrl } = await import("./s3");
      expect(getProductImageUrl(1, 1, 'a.jpg')).toContain('/1-a.jpg');
      expect(getProductImageUrl(1, 2, 'b.jpg')).toContain('/2-b.jpg');
      expect(getProductImageUrl(1, 3, 'c.jpg')).toContain('/3-c.jpg');
      expect(getProductImageUrl(1, 4, 'd.jpg')).toContain('/4-d.jpg');
    });
  });

  describe("uploadProductImage", () => {
    it("should upload image and return URL", async () => {
      const { uploadProductImage } = await import("./s3");
      const result = await uploadProductImage({
        productId: 123,
        fileBuffer: Buffer.from('test image data'),
        mimeType: 'image/jpeg',
        slot: 1,
      });

      expect(result.url).toMatch(/^https:\/\/urban-refit\.s3\.amazonaws\.com\/products\/123\/1-/);
      expect(result.url).toMatch(/\.jpeg$/);
      expect(result.key).toMatch(/^products\/123\/1-/);
    });

    it("should handle different mime types", async () => {
      const { uploadProductImage } = await import("./s3");
      
      const jpgResult = await uploadProductImage({
        productId: 1,
        fileBuffer: Buffer.from('test'),
        mimeType: 'image/jpeg',
        slot: 1,
      });
      expect(jpgResult.url).toMatch(/\.jpeg$/);

      const pngResult = await uploadProductImage({
        productId: 1,
        fileBuffer: Buffer.from('test'),
        mimeType: 'image/png',
        slot: 2,
      });
      expect(pngResult.url).toMatch(/\.png$/);
    });

    it("should throw error when AWS credentials are missing", async () => {
      delete process.env.AWS_REGION;
      vi.resetModules();
      const { uploadProductImage } = await import("./s3");
      
      await expect(uploadProductImage({
        productId: 123,
        fileBuffer: Buffer.from('test'),
        mimeType: 'image/jpeg',
        slot: 1,
      })).rejects.toThrow('AWS credentials not configured');
    });
  });

  describe("uploadFile", () => {
    it("should upload file with custom key", async () => {
      const { uploadFile } = await import("./s3");
      const result = await uploadFile({
        key: 'blog/images/hero.jpg',
        fileBuffer: Buffer.from('test'),
        mimeType: 'image/jpeg',
      });

      expect(result.key).toBe('blog/images/hero.jpg');
      expect(result.url).toBe('https://urban-refit.s3.amazonaws.com/blog/images/hero.jpg');
    });
  });

  describe("deleteFile", () => {
    it("should delete file by key", async () => {
      const { deleteFile } = await import("./s3");
      await expect(deleteFile('products/123/1-abc.jpg')).resolves.toBeUndefined();
    });
  });

  describe("fileExists", () => {
    it("should return true when file exists", async () => {
      const { fileExists } = await import("./s3");
      const exists = await fileExists('products/123/1-abc.jpg');
      expect(exists).toBe(true);
    });
  });

  describe("Storage exports", () => {
    it("should export S3 utilities from storage.ts", async () => {
      const storage = await import("./storage");
      
      expect(storage.uploadProductImage).toBeDefined();
      expect(storage.uploadFile).toBeDefined();
      expect(storage.deleteFile).toBeDefined();
      expect(storage.fileExists).toBeDefined();
      expect(storage.getProductImageUrl).toBeDefined();
      expect(storage.isAwsConfigured).toBeDefined();
      
      // Original Manus helpers should still exist
      expect(storage.storagePut).toBeDefined();
      expect(storage.storageGet).toBeDefined();
    });
  });
});
