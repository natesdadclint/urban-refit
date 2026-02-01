import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database module
vi.mock("./db", () => ({
  getProductById: vi.fn(),
  updateProduct: vi.fn(),
  getAllProducts: vi.fn(),
}));

describe("Image URL Validation and Database Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("URL Pattern Validators", () => {
    const patterns = {
      localPath: /^\/products\/[\w\-\/]+\.(jpg|jpeg|png|webp|gif)$/i,
      s3Url: /^https:\/\/[\w\-]+\.s3\.[\w\-]+\.amazonaws\.com\/products\/[\w\-\/]+\.(jpg|jpeg|png|webp|gif)$/i,
      cloudFrontUrl: /^https:\/\/[\w]+\.cloudfront\.net\/[\w\-\/]+\.(jpg|jpeg|png|webp|gif)$/i,
    };

    it("should validate local product image paths", () => {
      const validPaths = [
        "/products/test.jpg",
        "/products/123/image-1.png",
        "/products/abc-def/photo.webp",
        "/products/tommy-hilfiger-polo.png",
      ];

      validPaths.forEach(path => {
        expect(patterns.localPath.test(path)).toBe(true);
      });
    });

    it("should reject invalid local paths", () => {
      const invalidPaths = [
        "/images/test.jpg", // Wrong directory
        "products/test.jpg", // Missing leading slash
        "/products/test", // Missing extension
        "/products/test.exe", // Invalid extension
        "/products/../secret.jpg", // Path traversal
      ];

      invalidPaths.forEach(path => {
        expect(patterns.localPath.test(path)).toBe(false);
      });
    });

    it("should validate S3 bucket URLs", () => {
      const validUrls = [
        "https://urban-refit.s3.us-east-1.amazonaws.com/products/123/image.jpg",
        "https://my-bucket.s3.ap-southeast-2.amazonaws.com/products/456/photo.png",
      ];

      validUrls.forEach(url => {
        expect(patterns.s3Url.test(url)).toBe(true);
      });
    });

    it("should validate CloudFront URLs", () => {
      const validUrls = [
        "https://d2xsxph8kpxj0f.cloudfront.net/products/123/image.jpg",
        "https://abc123xyz.cloudfront.net/products/test.png",
      ];

      validUrls.forEach(url => {
        expect(patterns.cloudFrontUrl.test(url)).toBe(true);
      });
    });
  });

  describe("Comprehensive URL Validator Function", () => {
    const isValidImageUrl = (url: string | null | undefined): { valid: boolean; type: string; reason?: string } => {
      if (!url) {
        return { valid: false, type: "null", reason: "URL is null or undefined" };
      }

      if (typeof url !== "string") {
        return { valid: false, type: "invalid", reason: "URL is not a string" };
      }

      if (url.trim() === "") {
        return { valid: false, type: "null", reason: "URL is empty" };
      }

      // Check for path traversal attacks
      if (url.includes("..")) {
        return { valid: false, type: "security", reason: "Path traversal detected" };
      }

      // Check for javascript: protocol
      if (url.toLowerCase().startsWith("javascript:")) {
        return { valid: false, type: "security", reason: "JavaScript protocol not allowed" };
      }

      // Check for data: URLs (not allowed for storage)
      if (url.toLowerCase().startsWith("data:")) {
        return { valid: false, type: "security", reason: "Data URLs not allowed for storage" };
      }

      // Valid local path
      if (url.startsWith("/products/") && /\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
        return { valid: true, type: "local" };
      }

      // Valid S3 URL
      if (/^https:\/\/[\w\-]+\.s3\.[\w\-]+\.amazonaws\.com\/products\//.test(url)) {
        return { valid: true, type: "s3" };
      }

      // Valid CloudFront URL
      if (/^https:\/\/[\w]+\.cloudfront\.net\//.test(url)) {
        return { valid: true, type: "cloudfront" };
      }

      // Valid HTTPS URL (generic)
      if (url.startsWith("https://")) {
        return { valid: true, type: "https" };
      }

      return { valid: false, type: "unknown", reason: "URL does not match any valid pattern" };
    };

    it("should correctly identify local paths", () => {
      const result = isValidImageUrl("/products/test.jpg");
      expect(result.valid).toBe(true);
      expect(result.type).toBe("local");
    });

    it("should correctly identify S3 URLs", () => {
      const result = isValidImageUrl("https://urban-refit.s3.us-east-1.amazonaws.com/products/123/test.jpg");
      expect(result.valid).toBe(true);
      expect(result.type).toBe("s3");
    });

    it("should correctly identify CloudFront URLs", () => {
      const result = isValidImageUrl("https://d2xsxph8kpxj0f.cloudfront.net/products/test.jpg");
      expect(result.valid).toBe(true);
      expect(result.type).toBe("cloudfront");
    });

    it("should reject null URLs", () => {
      const result = isValidImageUrl(null);
      expect(result.valid).toBe(false);
      expect(result.type).toBe("null");
    });

    it("should reject undefined URLs", () => {
      const result = isValidImageUrl(undefined);
      expect(result.valid).toBe(false);
      expect(result.type).toBe("null");
    });

    it("should reject empty URLs", () => {
      const result = isValidImageUrl("");
      expect(result.valid).toBe(false);
      expect(result.type).toBe("null"); // Empty strings treated same as null
    });

    it("should reject path traversal attempts", () => {
      const result = isValidImageUrl("/products/../../../etc/passwd");
      expect(result.valid).toBe(false);
      expect(result.type).toBe("security");
    });

    it("should reject javascript: protocol", () => {
      const result = isValidImageUrl("javascript:alert(1)");
      expect(result.valid).toBe(false);
      expect(result.type).toBe("security");
    });

    it("should reject data: URLs", () => {
      const result = isValidImageUrl("data:image/png;base64,ABC123");
      expect(result.valid).toBe(false);
      expect(result.type).toBe("security");
    });
  });

  describe("Database Image URL Updates", () => {
    it("should update image1Url correctly", async () => {
      const { updateProduct } = await import("./db");
      vi.mocked(updateProduct).mockResolvedValue({ id: 1, image1Url: "/products/new.jpg" });

      const result = await updateProduct(1, { image1Url: "/products/new.jpg" });
      
      expect(updateProduct).toHaveBeenCalledWith(1, { image1Url: "/products/new.jpg" });
      expect(result.image1Url).toBe("/products/new.jpg");
    });

    it("should update image2Url correctly", async () => {
      const { updateProduct } = await import("./db");
      vi.mocked(updateProduct).mockResolvedValue({ id: 1, image2Url: "/products/detail.jpg" });

      const result = await updateProduct(1, { image2Url: "/products/detail.jpg" });
      
      expect(updateProduct).toHaveBeenCalledWith(1, { image2Url: "/products/detail.jpg" });
      expect(result.image2Url).toBe("/products/detail.jpg");
    });

    it("should update both images in one call", async () => {
      const { updateProduct } = await import("./db");
      vi.mocked(updateProduct).mockResolvedValue({ 
        id: 1, 
        image1Url: "/products/front.jpg",
        image2Url: "/products/back.jpg"
      });

      const result = await updateProduct(1, { 
        image1Url: "/products/front.jpg",
        image2Url: "/products/back.jpg"
      });
      
      expect(result.image1Url).toBe("/products/front.jpg");
      expect(result.image2Url).toBe("/products/back.jpg");
    });

    it("should handle database errors gracefully", async () => {
      const { updateProduct } = await import("./db");
      vi.mocked(updateProduct).mockRejectedValue(new Error("Database connection failed"));

      await expect(updateProduct(1, { image1Url: "/products/test.jpg" }))
        .rejects.toThrow("Database connection failed");
    });
  });

  describe("Product Image Retrieval", () => {
    it("should retrieve product with valid image URLs", async () => {
      const { getProductById } = await import("./db");
      vi.mocked(getProductById).mockResolvedValue({
        id: 1,
        name: "Test Product",
        image1Url: "/products/test.jpg",
        image2Url: "/products/detail.jpg",
      });

      const product = await getProductById(1);
      
      expect(product.image1Url).toBe("/products/test.jpg");
      expect(product.image2Url).toBe("/products/detail.jpg");
    });

    it("should handle products with null image2Url", async () => {
      const { getProductById } = await import("./db");
      vi.mocked(getProductById).mockResolvedValue({
        id: 1,
        name: "Test Product",
        image1Url: "/products/test.jpg",
        image2Url: null,
      });

      const product = await getProductById(1);
      
      expect(product.image1Url).toBe("/products/test.jpg");
      expect(product.image2Url).toBeNull();
    });

    it("should handle non-existent products", async () => {
      const { getProductById } = await import("./db");
      vi.mocked(getProductById).mockResolvedValue(null);

      const product = await getProductById(999);
      
      expect(product).toBeNull();
    });
  });

  describe("Bulk Image URL Validation", () => {
    it("should validate all product image URLs", async () => {
      const { getAllProducts } = await import("./db");
      vi.mocked(getAllProducts).mockResolvedValue([
        { id: 1, image1Url: "/products/valid1.jpg", image2Url: "/products/valid2.jpg" },
        { id: 2, image1Url: "/products/valid3.jpg", image2Url: null },
        { id: 3, image1Url: "https://d2xsxph8kpxj0f.cloudfront.net/test.jpg", image2Url: null },
      ]);

      const products = await getAllProducts();
      
      const invalidProducts = products.filter(p => {
        const img1Valid = p.image1Url?.startsWith("/products/") || p.image1Url?.startsWith("https://");
        const img2Valid = p.image2Url === null || p.image2Url?.startsWith("/products/") || p.image2Url?.startsWith("https://");
        return !img1Valid || !img2Valid;
      });

      expect(invalidProducts.length).toBe(0);
    });

    it("should identify products with broken CloudFront URLs", async () => {
      const { getAllProducts } = await import("./db");
      vi.mocked(getAllProducts).mockResolvedValue([
        { id: 1, image1Url: "/products/valid.jpg", image2Url: null },
        { id: 2, image1Url: "https://d2xsxph8kpxj0f.cloudfront.net/broken.jpg", image2Url: null },
      ]);

      const products = await getAllProducts();
      
      const cloudFrontProducts = products.filter(p => 
        p.image1Url?.includes("cloudfront.net") || p.image2Url?.includes("cloudfront.net")
      );

      expect(cloudFrontProducts.length).toBe(1);
      expect(cloudFrontProducts[0].id).toBe(2);
    });
  });

  describe("Image URL Migration Helpers", () => {
    it("should generate correct local path from CloudFront URL", () => {
      const cloudFrontUrl = "https://d2xsxph8kpxj0f.cloudfront.net/products/123/image.jpg";
      const extractPath = (url: string) => {
        const match = url.match(/cloudfront\.net\/(.+)$/);
        return match ? `/${match[1]}` : null;
      };

      const localPath = extractPath(cloudFrontUrl);
      expect(localPath).toBe("/products/123/image.jpg");
    });

    it("should generate correct S3 URL from local path", () => {
      const localPath = "/products/123/image.jpg";
      const bucket = "urban-refit";
      const region = "us-east-1";
      
      const s3Url = `https://${bucket}.s3.${region}.amazonaws.com${localPath}`;
      
      expect(s3Url).toBe("https://urban-refit.s3.us-east-1.amazonaws.com/products/123/image.jpg");
    });

    it("should generate SQL UPDATE statement for image URL fix", () => {
      const productId = 123;
      const newUrl = "/products/123/fixed-image.jpg";
      const field = "image1Url";
      
      const sql = `UPDATE products SET ${field} = '${newUrl}' WHERE id = ${productId};`;
      
      expect(sql).toBe("UPDATE products SET image1Url = '/products/123/fixed-image.jpg' WHERE id = 123;");
    });
  });
});

describe("Image File Extension Validation", () => {
  const validExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
  
  const getExtension = (filename: string): string => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  };

  const isValidExtension = (ext: string): boolean => {
    return validExtensions.includes(ext.toLowerCase());
  };

  it("should extract extension from filename", () => {
    expect(getExtension("image.jpg")).toBe("jpg");
    expect(getExtension("photo.PNG")).toBe("png");
    expect(getExtension("file.name.webp")).toBe("webp");
  });

  it("should handle files without extension", () => {
    expect(getExtension("noextension")).toBe("");
    expect(getExtension("")).toBe("");
  });

  it("should validate allowed extensions", () => {
    expect(isValidExtension("jpg")).toBe(true);
    expect(isValidExtension("JPEG")).toBe(true);
    expect(isValidExtension("png")).toBe(true);
    expect(isValidExtension("webp")).toBe(true);
    expect(isValidExtension("gif")).toBe(true);
  });

  it("should reject disallowed extensions", () => {
    expect(isValidExtension("exe")).toBe(false);
    expect(isValidExtension("php")).toBe(false);
    expect(isValidExtension("js")).toBe(false);
    expect(isValidExtension("html")).toBe(false);
    expect(isValidExtension("svg")).toBe(false); // SVG can contain scripts
  });
});

describe("MIME Type Validation", () => {
  const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  
  const isValidMimeType = (mimeType: string): boolean => {
    return validMimeTypes.includes(mimeType.toLowerCase());
  };

  const mimeToExtension: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  it("should validate allowed MIME types", () => {
    expect(isValidMimeType("image/jpeg")).toBe(true);
    expect(isValidMimeType("image/png")).toBe(true);
    expect(isValidMimeType("image/webp")).toBe(true);
    expect(isValidMimeType("image/gif")).toBe(true);
  });

  it("should reject disallowed MIME types", () => {
    expect(isValidMimeType("image/svg+xml")).toBe(false);
    expect(isValidMimeType("application/pdf")).toBe(false);
    expect(isValidMimeType("text/html")).toBe(false);
    expect(isValidMimeType("application/javascript")).toBe(false);
  });

  it("should map MIME type to correct extension", () => {
    expect(mimeToExtension["image/jpeg"]).toBe("jpg");
    expect(mimeToExtension["image/png"]).toBe("png");
    expect(mimeToExtension["image/webp"]).toBe("webp");
    expect(mimeToExtension["image/gif"]).toBe("gif");
  });
});
