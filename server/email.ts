import { notifyOwner } from "./_core/notification";
import * as db from "./db";
import { Order, ThriftStore } from "../drizzle/schema";

interface OrderItemWithDetails {
  orderItem: {
    id: number;
    orderId: number;
    productId: number;
    price: string;
    thriftStoreId: number | null;
    thriftStorePayoutAmount: string | null;
  };
  product: {
    id: number;
    name: string;
    brand: string | null;
    size: string | null;
    image1Url: string | null;
  };
  thriftStore: {
    name: string;
  } | null;
}

export async function sendOrderConfirmationEmail(
  order: Order,
  items: OrderItemWithDetails[]
) {
  try {
    const itemsList = items
      .map(
        (item) =>
          `- ${item.product.name} (${item.product.brand || "No brand"}, Size: ${item.product.size || "N/A"}) - NZ$${item.orderItem.price}`
      )
      .join("\n");

    // Calculate GST (15% included in prices)
    const gstAmount = order.gstAmount || (parseFloat(order.subtotal) * (15 / 115)).toFixed(2);
    
    const content = `
🎉 New Order Received!

Order #${order.id}
Customer: ${order.shippingName}
Email: ${order.customerEmail}

Items:
${itemsList}

Subtotal: NZ$${order.subtotal}
(Includes GST: NZ$${gstAmount})
Shipping: NZ$${order.shippingCost}
Total: NZ$${order.total}

Shipping Address:
${order.shippingName}
${order.shippingAddress}
${order.shippingCity}, ${order.shippingState} ${order.shippingZip}
${order.shippingCountry}
Phone: ${order.shippingPhone}

Payment Status: Paid ✓
    `.trim();

    // Log the email
    await db.createEmailLog({
      type: "order_confirmation",
      recipientEmail: order.customerEmail || "",
      subject: `Order Confirmation #${order.id}`,
      status: "sent",
      relatedOrderId: order.id,
    });

    // Notify owner about new order
    await notifyOwner({
      title: `New Order #${order.id} - NZ$${order.total}`,
      content,
    });

    console.log(`[Email] Order confirmation sent for order #${order.id}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send order confirmation:", error);
    
    await db.createEmailLog({
      type: "order_confirmation",
      recipientEmail: order.customerEmail || "",
      subject: `Order Confirmation #${order.id}`,
      status: "failed",
      relatedOrderId: order.id,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    
    return false;
  }
}

export async function sendPayoutNotificationEmail(
  thriftStore: ThriftStore,
  amount: number,
  orderId: number
) {
  try {
    const content = `
💰 Payout Notification for ${thriftStore.name}

A sale has been completed and you're entitled to a payout!

Order #${orderId}
Payout Amount: NZ$${amount.toFixed(2)}
(10% of sale price as per our partnership agreement)

This payout will be processed according to our standard payment schedule.

Total Lifetime Payouts: NZ$${thriftStore.totalPayout}

Thank you for being a valued partner of Urban Refit!
    `.trim();

    // Log the email
    await db.createEmailLog({
      type: "payout_notification",
      recipientEmail: thriftStore.email || "",
      subject: `Payout Notification - NZ$${amount.toFixed(2)}`,
      status: "sent",
      relatedOrderId: orderId,
    });

    // Notify owner about payout
    await notifyOwner({
      title: `Payout Due: ${thriftStore.name} - NZ$${amount.toFixed(2)}`,
      content,
    });

    console.log(`[Email] Payout notification sent to ${thriftStore.name}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send payout notification:", error);
    
    await db.createEmailLog({
      type: "payout_notification",
      recipientEmail: thriftStore.email || "",
      subject: `Payout Notification - NZ$${amount.toFixed(2)}`,
      status: "failed",
      relatedOrderId: orderId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    
    return false;
  }
}

export async function sendShippingNotificationEmail(
  order: Order,
  trackingNumber?: string
) {
  try {
    const content = `
📦 Your Order Has Shipped!

Order #${order.id}

Your Urban Refit order is on its way!

${trackingNumber ? `Tracking Number: ${trackingNumber}` : "Tracking information will be updated shortly."}

Shipping To:
${order.shippingName}
${order.shippingAddress}
${order.shippingCity}, ${order.shippingState} ${order.shippingZip}
${order.shippingCountry}

Thank you for shopping sustainably with Urban Refit!
    `.trim();

    await db.createEmailLog({
      type: "shipping_notification",
      recipientEmail: order.customerEmail || "",
      subject: `Your Order #${order.id} Has Shipped!`,
      status: "sent",
      relatedOrderId: order.id,
    });

    console.log(`[Email] Shipping notification sent for order #${order.id}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send shipping notification:", error);
    return false;
  }
}
