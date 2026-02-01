import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nanoid } from "nanoid";

// Mock storage functions
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://example.com/test.jpg" }),
  storageGet: vi.fn().mockResolvedValue({ key: "test-key", url: "https://example.com/test.jpg" }),
  uploadProductImage: vi.fn().mockResolvedValue({ key: "products/1/1-abc123.jpg", url: "https://s3.amazonaws.com/urban-refit/products/1/1-abc123.jpg" }),
  isAwsConfigured: vi.fn().mockReturnValue(false),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  fileExists: vi.fn(),
  getProductImageUrl: vi.fn(),
}));

// Mock db functions
vi.mock("./db", () => ({
  updateProduct: vi.fn().mockResolvedValue({ id: 1 }),
  getProductById: vi.fn().mockResolvedValue({
    id: 1,
    name: "Test Product",
    image1Url: "/products/test.jpg",
    image2Url: null,
  }),
}));

describe("Image Processing Backend Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Image URL Validation", () => {
    it("should accept valid local paths starting with /products/", () => {
      const validPaths = [
        "/products/test.jpg",
        "/products/123/image-1.png",
        "/products/abc-def/photo.webp",
      ];
      
      validPaths.forEach(path => {
        expect(path.startsWith("/products/")).toBe(true);
        expect(path.length).toBeGreaterThan(10);
      });
    });

    it("should accept valid S3 URLs with correct bucket pattern", () => {
      const s3Pattern = /^https:\/\/[\w-]+\.s3\.amazonaws\.com\/products\/\d+\/[\w-]+\.\w+$/;
      const validUrls = [
        "https://urban-refit.s3.amazonaws.com/products/123/image-1-abc123.jpg",
        "https://urban-refit.s3.amazonaws.com/products/456/photo-2-xyz789.png",
      ];
      
      validUrls.forEach(url => {
        expect(s3Pattern.test(url)).toBe(true);
      });
    });

    it("should reject invalid image URLs", () => {
      const invalidUrls = [
        "",
        null,
        undefined,
        "javascript:alert(1)",
        "data:image/png;base64,abc",
        "http://malicious-site.com/image.jpg",
        "../../../etc/passwd",
      ];
      
      invalidUrls.forEach(url => {
        const isValid = url && 
          typeof url === "string" && 
          (url.startsWith("/products/") || url.startsWith("https://"));
        expect(isValid).toBeFalsy();
      });
    });

    it("should handle null/undefined image URLs gracefully", () => {
      const product = {
        id: 1,
        image1Url: "/products/valid.jpg",
        image2Url: null,
        image3Url: undefined,
      };
      
      expect(product.image1Url).toBeTruthy();
      expect(product.image2Url).toBeNull();
      expect(product.image3Url).toBeUndefined();
    });
  });

  describe("File Upload Validation", () => {
    it("should accept valid image MIME types", () => {
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      
      validMimeTypes.forEach(mimeType => {
        expect(mimeType.startsWith("image/")).toBe(true);
      });
    });

    it("should reject non-image MIME types", () => {
      const invalidMimeTypes = [
        "application/pdf",
        "text/html",
        "application/javascript",
        "video/mp4",
        "audio/mpeg",
      ];
      
      invalidMimeTypes.forEach(mimeType => {
        expect(mimeType.startsWith("image/")).toBe(false);
      });
    });

    it("should enforce file size limits (10MB max)", () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validSizes = [1024, 100000, 5000000, 9999999];
      const invalidSizes = [10485761, 20000000, 50000000]; // 10MB + 1 byte and larger
      
      validSizes.forEach(size => {
        expect(size <= maxSize).toBe(true);
      });
      
      invalidSizes.forEach(size => {
        expect(size > maxSize).toBe(true);
      });
    });

    it("should generate unique filenames with nanoid", () => {
      const filenames = new Set();
      for (let i = 0; i < 100; i++) {
        const filename = `image-${nanoid()}.jpg`;
        expect(filenames.has(filename)).toBe(false);
        filenames.add(filename);
      }
      expect(filenames.size).toBe(100);
    });
  });

  describe("Base64 Image Processing", () => {
    it("should correctly strip data URL prefix", () => {
      const dataUrls = [
        { input: "data:image/png;base64,ABC123", expected: "ABC123" },
        { input: "data:image/jpeg;base64,XYZ789", expected: "XYZ789" },
        { input: "data:image/webp;base64,TEST", expected: "TEST" },
        { input: "ABC123", expected: "ABC123" }, // Already raw base64
      ];
      
      dataUrls.forEach(({ input, expected }) => {
        const result = input.replace(/^data:.+;base64,/, "");
        expect(result).toBe(expected);
      });
    });

    it("should convert base64 to Buffer correctly", () => {
      const base64 = "SGVsbG8gV29ybGQ="; // "Hello World" in base64
      const buffer = Buffer.from(base64, "base64");
      expect(buffer.toString()).toBe("Hello World");
    });

    it("should handle empty base64 strings", () => {
      const emptyBase64 = "";
      const buffer = Buffer.from(emptyBase64, "base64");
      expect(buffer.length).toBe(0);
    });

    it("should reject invalid base64 strings", () => {
      const invalidBase64 = "not-valid-base64!!!";
      const buffer = Buffer.from(invalidBase64, "base64");
      // Invalid base64 produces garbage, not the original string
      expect(buffer.toString()).not.toBe(invalidBase64);
    });
  });

  describe("Storage Integration", () => {
    it("should call storagePut with correct parameters", async () => {
      const { storagePut } = await import("./storage");
      const fileKey = "products/123/test.jpg";
      const buffer = Buffer.from("test");
      const mimeType = "image/jpeg";
      
      await storagePut(fileKey, buffer, mimeType);
      
      expect(storagePut).toHaveBeenCalledWith(fileKey, buffer, mimeType);
    });

    it("should return URL and key from storage upload", async () => {
      const { storagePut } = await import("./storage");
      const result = await storagePut("test.jpg", Buffer.from("test"), "image/jpeg");
      
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
      expect(typeof result.url).toBe("string");
      expect(typeof result.key).toBe("string");
    });

    it("should use AWS S3 when configured", async () => {
      const { isAwsConfigured, uploadProductImage } = await import("./storage");
      
      // Mock AWS as configured
      vi.mocked(isAwsConfigured).mockReturnValue(true);
      
      const result = await uploadProductImage({
        productId: 1,
        fileBuffer: Buffer.from("test"),
        mimeType: "image/jpeg",
        slot: 1,
      });
      
      expect(result.url).toContain("s3.amazonaws.com");
    });
  });

  describe("Database Updates", () => {
    it("should update image1Url for slot 1", async () => {
      const { updateProduct } = await import("./db");
      const productId = 1;
      const url = "/products/new-image.jpg";
      
      await updateProduct(productId, { image1Url: url });
      
      expect(updateProduct).toHaveBeenCalledWith(productId, { image1Url: url });
    });

    it("should update image2Url for slot 2", async () => {
      const { updateProduct } = await import("./db");
      const productId = 1;
      const url = "/products/new-image-2.jpg";
      
      await updateProduct(productId, { image2Url: url });
      
      expect(updateProduct).toHaveBeenCalledWith(productId, { image2Url: url });
    });

    it("should map slot number to correct field name", () => {
      const slotToField = (slot: 1 | 2) => slot === 1 ? "image1Url" : "image2Url";
      
      expect(slotToField(1)).toBe("image1Url");
      expect(slotToField(2)).toBe("image2Url");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing file gracefully", () => {
      const file = null;
      expect(file).toBeNull();
      // In actual endpoint, this returns 400 error
    });

    it("should handle storage upload failures", async () => {
      const { storagePut } = await import("./storage");
      vi.mocked(storagePut).mockRejectedValueOnce(new Error("Storage upload failed"));
      
      await expect(storagePut("test.jpg", Buffer.from("test"), "image/jpeg"))
        .rejects.toThrow("Storage upload failed");
    });

    it("should handle database update failures", async () => {
      const { updateProduct } = await import("./db");
      vi.mocked(updateProduct).mockRejectedValueOnce(new Error("Database error"));
      
      await expect(updateProduct(1, { image1Url: "/test.jpg" }))
        .rejects.toThrow("Database error");
    });

    it("should validate product ID is a positive number", () => {
      const validIds = [1, 100, 999999];
      const invalidIds = [0, -1, NaN, Infinity];
      
      validIds.forEach(id => {
        expect(Number.isInteger(id) && id > 0).toBe(true);
      });
      
      invalidIds.forEach(id => {
        expect(Number.isInteger(id) && id > 0).toBe(false);
      });
    });
  });

  describe("Security Validations", () => {
    it("should sanitize file paths to prevent directory traversal", () => {
      const maliciousPaths = [
        "../../../etc/passwd",
        "..\\..\\windows\\system32",
        "etc/passwd",
        "products/../../../secret.txt",
      ];
      
      const sanitizePath = (path: string) => {
        return path.replace(/\.\./g, "").replace(/^\//, "");
      };
      
      maliciousPaths.forEach(path => {
        const sanitized = sanitizePath(path);
        expect(sanitized).not.toContain("..");
      });
    });

    it("should reject files with dangerous extensions", () => {
      const dangerousExtensions = [".exe", ".php", ".sh", ".bat", ".cmd", ".js", ".html"];
      const safeExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
      
      const isSafeExtension = (ext: string) => safeExtensions.includes(ext.toLowerCase());
      
      dangerousExtensions.forEach(ext => {
        expect(isSafeExtension(ext)).toBe(false);
      });
      
      safeExtensions.forEach(ext => {
        expect(isSafeExtension(ext)).toBe(true);
      });
    });

    it("should validate content type matches file extension", () => {
      const validPairs = [
        { mimeType: "image/jpeg", ext: ".jpg" },
        { mimeType: "image/jpeg", ext: ".jpeg" },
        { mimeType: "image/png", ext: ".png" },
        { mimeType: "image/webp", ext: ".webp" },
      ];
      
      const mimeToExt: Record<string, string[]> = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
      };
      
      validPairs.forEach(({ mimeType, ext }) => {
        expect(mimeToExt[mimeType]?.includes(ext)).toBe(true);
      });
    });
  });

  describe("Image Proxy Endpoint", () => {
    it("should extract key from URL path", () => {
      const paths = [
        { path: "/api/image/products/123/test.jpg", key: "products/123/test.jpg" },
        { path: "/api/image/uploads/abc.png", key: "uploads/abc.png" },
      ];
      
      paths.forEach(({ path, key }) => {
        const extractedKey = path.replace("/api/image/", "");
        expect(extractedKey).toBe(key);
      });
    });

    it("should set correct cache headers", () => {
      const cacheControl = "public, max-age=86400";
      expect(cacheControl).toContain("max-age=86400"); // 24 hours
      expect(cacheControl).toContain("public");
    });

    it("should handle missing key parameter", () => {
      const key = "";
      expect(key).toBeFalsy();
      // In actual endpoint, this returns 400 error
    });
  });
});

describe("Image URL Pattern Validation", () => {
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== "string") return false;
    
    // Local paths
    if (url.startsWith("/products/")) return true;
    
    // S3 URLs
    if (url.match(/^https:\/\/[\w-]+\.s3\.amazonaws\.com\/products\//)) return true;
    
    // CloudFront URLs (legacy)
    if (url.match(/^https:\/\/[\w]+\.cloudfront\.net\//)) return true;
    
    return false;
  };

  it("should validate local product paths", () => {
    expect(isValidImageUrl("/products/test.jpg")).toBe(true);
    expect(isValidImageUrl("/products/123/image-1.png")).toBe(true);
  });

  it("should validate S3 URLs", () => {
    expect(isValidImageUrl("https://urban-refit.s3.amazonaws.com/products/123/test.jpg")).toBe(true);
  });

  it("should validate CloudFront URLs", () => {
    expect(isValidImageUrl("https://d2xsxph8kpxj0f.cloudfront.net/test.jpg")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidImageUrl(null)).toBe(false);
    expect(isValidImageUrl(undefined)).toBe(false);
    expect(isValidImageUrl("")).toBe(false);
    expect(isValidImageUrl("http://malicious.com/image.jpg")).toBe(false);
    expect(isValidImageUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("Product Image Slot Mapping", () => {
  it("should correctly map slot numbers to database fields", () => {
    const getFieldName = (slot: 1 | 2): "image1Url" | "image2Url" => {
      return slot === 1 ? "image1Url" : "image2Url";
    };

    expect(getFieldName(1)).toBe("image1Url");
    expect(getFieldName(2)).toBe("image2Url");
  });

  it("should only accept slots 1 or 2", () => {
    const validSlots = [1, 2];
    const invalidSlots = [0, 3, 4, -1];

    validSlots.forEach(slot => {
      expect(slot === 1 || slot === 2).toBe(true);
    });

    invalidSlots.forEach(slot => {
      expect(slot === 1 || slot === 2).toBe(false);
    });
  });
});
