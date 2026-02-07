/**
 * Shipping Label Generation Service
 * 
 * Generates prepaid shipping labels for sell submissions.
 * Uses a PDF-based label that customers can print and attach to their package.
 * 
 * For production, this could be integrated with:
 * - NZ Post API
 * - CourierPost
 * - Aramex NZ
 * - Fastway Couriers
 */

import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Urban Refit warehouse address (configurable)
const WAREHOUSE_ADDRESS = {
  name: "Urban Refit Returns",
  street: "123 Fashion Lane",
  city: "Auckland",
  postcode: "1010",
  country: "New Zealand",
  phone: "0800 REFIT NZ",
};

interface ShippingLabelInput {
  submissionId: number;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  itemDescription: string;
  tokenValue: number;
}

interface ShippingLabelResult {
  labelUrl: string;
  trackingNumber: string;
  courierService: string;
}

/**
 * Generate a unique tracking number
 */
function generateTrackingNumber(): string {
  const prefix = "UR"; // Urban Refit
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Generate SVG-based shipping label
 */
function generateLabelSVG(input: ShippingLabelInput, trackingNumber: string): string {
  const { senderName, senderPhone, itemDescription, tokenValue } = input;
  
  // Generate barcode representation (simplified - in production use proper barcode library)
  const barcodeLines = trackingNumber.split('').map((char, i) => {
    const width = (char.charCodeAt(0) % 3) + 1;
    const x = 50 + i * 8;
    return `<rect x="${x}" y="380" width="${width}" height="40" fill="black"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <!-- Background -->
  <rect width="400" height="600" fill="white"/>
  
  <!-- Border -->
  <rect x="5" y="5" width="390" height="590" fill="none" stroke="black" stroke-width="2"/>
  
  <!-- Header -->
  <rect x="5" y="5" width="390" height="60" fill="#1a1a1a"/>
  <text x="200" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">• Urban Refit •</text>
  <text x="200" y="55" text-anchor="middle" fill="#cccccc" font-family="Arial, sans-serif" font-size="12">PREPAID RETURN LABEL</text>
  
  <!-- From Section -->
  <text x="20" y="90" fill="#666666" font-family="Arial, sans-serif" font-size="10" font-weight="bold">FROM:</text>
  <text x="20" y="110" fill="black" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${escapeXml(senderName)}</text>
  <text x="20" y="128" fill="#333333" font-family="Arial, sans-serif" font-size="12">${escapeXml(senderPhone || 'No phone provided')}</text>
  
  <!-- Divider -->
  <line x1="20" y1="145" x2="380" y2="145" stroke="#cccccc" stroke-width="1"/>
  
  <!-- To Section -->
  <text x="20" y="170" fill="#666666" font-family="Arial, sans-serif" font-size="10" font-weight="bold">SHIP TO:</text>
  <text x="20" y="195" fill="black" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${escapeXml(WAREHOUSE_ADDRESS.name)}</text>
  <text x="20" y="218" fill="black" font-family="Arial, sans-serif" font-size="14">${escapeXml(WAREHOUSE_ADDRESS.street)}</text>
  <text x="20" y="238" fill="black" font-family="Arial, sans-serif" font-size="14">${escapeXml(WAREHOUSE_ADDRESS.city)} ${escapeXml(WAREHOUSE_ADDRESS.postcode)}</text>
  <text x="20" y="258" fill="black" font-family="Arial, sans-serif" font-size="14">${escapeXml(WAREHOUSE_ADDRESS.country)}</text>
  <text x="20" y="280" fill="#666666" font-family="Arial, sans-serif" font-size="12">Phone: ${escapeXml(WAREHOUSE_ADDRESS.phone)}</text>
  
  <!-- Divider -->
  <line x1="20" y1="300" x2="380" y2="300" stroke="#cccccc" stroke-width="1"/>
  
  <!-- Item Info -->
  <text x="20" y="325" fill="#666666" font-family="Arial, sans-serif" font-size="10" font-weight="bold">CONTENTS:</text>
  <text x="20" y="345" fill="black" font-family="Arial, sans-serif" font-size="12">${escapeXml(itemDescription)}</text>
  <text x="20" y="365" fill="#666666" font-family="Arial, sans-serif" font-size="11">Token Value: ${tokenValue} tokens ($${(tokenValue * 0.5).toFixed(2)} NZD)</text>
  
  <!-- Barcode Area -->
  <rect x="40" y="370" width="320" height="70" fill="white" stroke="#cccccc"/>
  ${barcodeLines}
  <text x="200" y="455" text-anchor="middle" fill="black" font-family="monospace" font-size="14" font-weight="bold">${trackingNumber}</text>
  
  <!-- Instructions -->
  <rect x="20" y="475" width="360" height="80" fill="#f5f5f5" rx="5"/>
  <text x="200" y="495" text-anchor="middle" fill="#333333" font-family="Arial, sans-serif" font-size="11" font-weight="bold">INSTRUCTIONS</text>
  <text x="30" y="515" fill="#666666" font-family="Arial, sans-serif" font-size="10">1. Print this label and attach securely to your package</text>
  <text x="30" y="530" fill="#666666" font-family="Arial, sans-serif" font-size="10">2. Drop off at any NZ Post outlet or courier pickup point</text>
  <text x="30" y="545" fill="#666666" font-family="Arial, sans-serif" font-size="10">3. Tokens will be credited once item is verified</text>
  
  <!-- Footer -->
  <text x="200" y="580" text-anchor="middle" fill="#999999" font-family="Arial, sans-serif" font-size="9">urbanrefit.co.nz | Circular Fashion for a Sustainable Future</text>
</svg>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a prepaid shipping label for a sell submission
 */
export async function generateShippingLabel(input: ShippingLabelInput): Promise<ShippingLabelResult> {
  const trackingNumber = generateTrackingNumber();
  const courierService = "NZ Post Prepaid";
  
  // Generate SVG label
  const svgContent = generateLabelSVG(input, trackingNumber);
  
  // Upload to S3
  const filename = `shipping-labels/${input.submissionId}-${trackingNumber}.svg`;
  const { url: labelUrl } = await storagePut(filename, svgContent, "image/svg+xml");
  
  return {
    labelUrl,
    trackingNumber,
    courierService,
  };
}

/**
 * Get warehouse address for display
 */
export function getWarehouseAddress() {
  return WAREHOUSE_ADDRESS;
}
