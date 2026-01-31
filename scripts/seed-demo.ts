/**
 * Demo seed script for Urban Refit
 * Adds sample thrift stores and products for demonstration
 */

import { drizzle } from "drizzle-orm/mysql2";
import { thriftStores, products } from "../drizzle/schema";

const sampleThriftStores = [
  {
    name: "Vintage Vault",
    address: "123 Main Street, Brooklyn, NY 11201",
    contactEmail: "contact@vintagevault.com",
    contactPhone: "(718) 555-0101",
    payoutPercentage: 10,
    status: "active" as const,
  },
  {
    name: "Second Time Around",
    address: "456 Oak Avenue, Queens, NY 11375",
    contactEmail: "info@secondtimearound.com",
    contactPhone: "(718) 555-0202",
    payoutPercentage: 10,
    status: "active" as const,
  },
  {
    name: "The Thrift Collective",
    address: "789 Pine Road, Manhattan, NY 10001",
    contactEmail: "hello@thriftcollective.com",
    contactPhone: "(212) 555-0303",
    payoutPercentage: 10,
    status: "active" as const,
  },
];

const sampleProducts = [
  {
    name: "Ralph Lauren Oxford Shirt",
    description: "Classic blue oxford button-down shirt in excellent condition. Premium cotton fabric with signature pony logo. Perfect for both casual and business casual occasions.",
    category: "tops" as const,
    brand: "Ralph Lauren",
    size: "L",
    color: "Light Blue",
    condition: "excellent" as const,
    material: "100% Cotton",
    originalCost: "15.00",
    markupPercentage: "150.00",
    salePrice: "37.50",
    thriftStorePayoutAmount: "3.75",
    image1Url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
    image2Url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800",
    status: "available" as const,
    thriftStoreId: 1,
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "Iconic Levi's 501 straight-leg jeans in dark indigo wash. Classic five-pocket styling with button fly. Minimal wear, great fade potential.",
    category: "bottoms" as const,
    brand: "Levi's",
    size: "32x32",
    color: "Dark Indigo",
    condition: "good" as const,
    material: "100% Cotton Denim",
    originalCost: "12.00",
    markupPercentage: "175.00",
    salePrice: "33.00",
    thriftStorePayoutAmount: "3.30",
    image1Url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
    image2Url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
    status: "available" as const,
    thriftStoreId: 2,
  },
  {
    name: "Carhartt Work Jacket",
    description: "Heavy-duty Carhartt Detroit jacket in duck brown. Blanket-lined for warmth. Authentic workwear with character and patina.",
    category: "outerwear" as const,
    brand: "Carhartt",
    size: "XL",
    color: "Duck Brown",
    condition: "good" as const,
    material: "Cotton Duck Canvas",
    originalCost: "25.00",
    markupPercentage: "120.00",
    salePrice: "55.00",
    thriftStorePayoutAmount: "5.50",
    image1Url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
    image2Url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800",
    status: "available" as const,
    thriftStoreId: 1,
  },
  {
    name: "Nike Air Force 1 Low",
    description: "Classic white Nike Air Force 1 sneakers. Gently worn with minor creasing. Iconic silhouette that goes with everything.",
    category: "shoes" as const,
    brand: "Nike",
    size: "10.5",
    color: "White",
    condition: "good" as const,
    material: "Leather",
    originalCost: "20.00",
    markupPercentage: "100.00",
    salePrice: "40.00",
    thriftStorePayoutAmount: "4.00",
    image1Url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    image2Url: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
    status: "available" as const,
    thriftStoreId: 3,
  },
  {
    name: "New Era Yankees Cap",
    description: "Authentic New Era 59FIFTY fitted cap. New York Yankees classic navy with white logo. Like new condition.",
    category: "accessories" as const,
    brand: "New Era",
    size: "7 1/4",
    color: "Navy",
    condition: "excellent" as const,
    material: "Wool Blend",
    originalCost: "8.00",
    markupPercentage: "125.00",
    salePrice: "18.00",
    thriftStorePayoutAmount: "1.80",
    image1Url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
    image2Url: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800",
    status: "available" as const,
    thriftStoreId: 2,
  },
  {
    name: "Tommy Hilfiger Polo",
    description: "Classic Tommy Hilfiger polo shirt in navy with signature flag logo. Soft pique cotton, perfect for casual wear.",
    category: "tops" as const,
    brand: "Tommy Hilfiger",
    size: "M",
    color: "Navy",
    condition: "excellent" as const,
    material: "100% Cotton Pique",
    originalCost: "10.00",
    markupPercentage: "150.00",
    salePrice: "25.00",
    thriftStorePayoutAmount: "2.50",
    image1Url: "https://images.unsplash.com/photo-1625910513413-5fc45e2f6f0e?w=800",
    image2Url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800",
    status: "available" as const,
    thriftStoreId: 3,
  },
  {
    name: "Dickies 874 Work Pants",
    description: "Original Dickies 874 work pants in khaki. Stain-resistant twill fabric. A streetwear staple in excellent condition.",
    category: "bottoms" as const,
    brand: "Dickies",
    size: "34x30",
    color: "Khaki",
    condition: "excellent" as const,
    material: "Polyester/Cotton Twill",
    originalCost: "9.00",
    markupPercentage: "165.00",
    salePrice: "23.85",
    thriftStorePayoutAmount: "2.39",
    image1Url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
    image2Url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
    status: "available" as const,
    thriftStoreId: 1,
  },
  {
    name: "Patagonia Fleece Jacket",
    description: "Patagonia Better Sweater fleece jacket in heather grey. Warm, sustainable, and incredibly comfortable. Minor pilling.",
    category: "outerwear" as const,
    brand: "Patagonia",
    size: "L",
    color: "Heather Grey",
    condition: "good" as const,
    material: "Recycled Polyester Fleece",
    originalCost: "30.00",
    markupPercentage: "100.00",
    salePrice: "60.00",
    thriftStorePayoutAmount: "6.00",
    image1Url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
    image2Url: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800",
    status: "available" as const,
    thriftStoreId: 2,
  },
];

export async function seedDemoData() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    return;
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("Seeding demo thrift stores...");
  
  // Insert thrift stores
  for (const store of sampleThriftStores) {
    try {
      await db.insert(thriftStores).values(store);
      console.log(`  Added: ${store.name}`);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  Skipped (exists): ${store.name}`);
      } else {
        throw error;
      }
    }
  }

  console.log("\nSeeding demo products...");
  
  // Insert products
  for (const product of sampleProducts) {
    try {
      await db.insert(products).values(product);
      console.log(`  Added: ${product.name}`);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  Skipped (exists): ${product.name}`);
      } else {
        throw error;
      }
    }
  }

  console.log("\nDemo data seeding complete!");
}

// Run if called directly
seedDemoData().catch(console.error);
