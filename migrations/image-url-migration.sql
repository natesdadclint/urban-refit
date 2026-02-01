-- ============================================================
-- Image URL Migration Script
-- Migrates local paths to proper S3 bucket URLs
-- Generated: February 1, 2026
-- ============================================================

-- S3 Bucket Base URL: https://urban-refit.s3.amazonaws.com
-- Pattern: https://urban-refit.s3.amazonaws.com/products/{product-id}/{image-name}

-- ============================================================
-- STEP 1: Update image1Url for all products
-- ============================================================

-- Product ID: 1 - Ralph Lauren Oxford Shirt
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/1/ralph-lauren-oxford-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/1/ralph-lauren-oxford-detail.jpg'
WHERE id = 1;

-- Product ID: 2 - Levi's 501 Original Jeans
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/2/levis-501-jeans-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/2/levis-501-jeans-detail.jpg'
WHERE id = 2;

-- Product ID: 3 - Carhartt Work Jacket
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/3/carhartt-work-jacket-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/3/carhartt-work-jacket-detail.jpg'
WHERE id = 3;

-- Product ID: 4 - Nike Air Force 1 Low
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/4/nike-air-force-1-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/4/nike-air-force-1-detail.jpg'
WHERE id = 4;

-- Product ID: 5 - New Era Yankees Cap
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/5/new-era-cap-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/5/new-era-cap-detail.jpg'
WHERE id = 5;

-- Product ID: 6 - Tommy Hilfiger Polo
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/6/tommy-hilfiger-polo-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/6/tommy-hilfiger-polo-detail.jpg'
WHERE id = 6;

-- Product ID: 7 - Dickies 874 Work Pants
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/7/dickies-work-pants-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/7/dickies-work-pants-detail.jpg'
WHERE id = 7;

-- Product ID: 8 - Patagonia Fleece Jacket
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/8/patagonia-fleece-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/8/patagonia-fleece-detail.jpg'
WHERE id = 8;

-- Product ID: 120002 - Nike Sports Shoes
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/120002/nike-sports-shoes-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/120002/nike-sports-shoes-detail.jpg'
WHERE id = 120002;

-- Product ID: 150001 - Doc Martins
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/150001/doc-martins-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/150001/doc-martins-detail.jpg'
WHERE id = 150001;

-- Product ID: 180001 - Tommy Hilfiger Polo (duplicate)
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/180001/tommy-hilfiger-polo-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/180001/tommy-hilfiger-polo-detail.jpg'
WHERE id = 180001;

-- Product ID: 210002 - Vintage (CloudFront -> S3)
UPDATE products 
SET image1Url = 'https://urban-refit.s3.amazonaws.com/products/210002/vintage-main.png',
    image2Url = 'https://urban-refit.s3.amazonaws.com/products/210002/vintage-detail.jpg'
WHERE id = 210002;

-- ============================================================
-- VERIFICATION QUERY
-- Run after migration to confirm all URLs are correct
-- ============================================================

-- SELECT id, name, 
--        CASE WHEN image1Url LIKE 'https://urban-refit.s3.amazonaws.com/%' THEN 'VALID' ELSE 'BROKEN' END AS img1_status,
--        CASE WHEN image2Url LIKE 'https://urban-refit.s3.amazonaws.com/%' THEN 'VALID' ELSE 'BROKEN' END AS img2_status
-- FROM products
-- ORDER BY id;

-- ============================================================
-- ROLLBACK SCRIPT (if needed)
-- Restores original local paths
-- ============================================================

-- UPDATE products SET image1Url = '/products/ralph-lauren-oxford.png', image2Url = '/stitching-detail-1.jpg' WHERE id = 1;
-- UPDATE products SET image1Url = '/products/levis-501-jeans.png', image2Url = '/stitching-detail-2.jpg' WHERE id = 2;
-- UPDATE products SET image1Url = '/products/nike-air-force-1.png', image2Url = '/stitching-detail-3.jpg' WHERE id = 3;
-- UPDATE products SET image1Url = '/products/nike-air-force-1.png', image2Url = '/stitching-detail-4.jpg' WHERE id = 4;
-- UPDATE products SET image1Url = '/products/new-era-cap.png', image2Url = '/stitching-detail-1.jpg' WHERE id = 5;
-- UPDATE products SET image1Url = '/products/tommy-hilfiger-polo.png', image2Url = '/stitching-detail-2.jpg' WHERE id = 6;
-- UPDATE products SET image1Url = '/products/dickies-work-pants.png', image2Url = '/stitching-detail-3.jpg' WHERE id = 7;
-- UPDATE products SET image1Url = '/products/patagonia-fleece.png', image2Url = '/stitching-detail-4.jpg' WHERE id = 8;
-- UPDATE products SET image1Url = '/products/nike-air-force-1.png', image2Url = NULL WHERE id = 120002;
-- UPDATE products SET image1Url = '/products/sneakers-white.jpg', image2Url = NULL WHERE id = 150001;
-- UPDATE products SET image1Url = '/products/tommy-hilfiger-polo.png', image2Url = NULL WHERE id = 180001;
-- UPDATE products SET image1Url = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663045015687/E6p...', image2Url = NULL WHERE id = 210002;
