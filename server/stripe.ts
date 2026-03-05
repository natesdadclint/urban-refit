import Stripe from "stripe";
import { ENV } from "./_core/env";
import * as db from "./db";
import { sendOrderConfirmationEmail, sendPayoutNotificationEmail } from "./email";
import { sendOrderConfirmationEmailViaResend } from "./resend";

// Initialize Stripe
let stripe: Stripe | null = null;
try {
  if (ENV.stripeSecretKey) {
    stripe = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2026-02-25.clover" as any,
    });
  } else {
    console.warn("[Stripe] STRIPE_SECRET_KEY is not configured. Stripe features will be disabled.");
  }
} catch (error) {
  console.error("[Stripe] Failed to initialize Stripe:", error);
}

export { stripe };

interface CartItemWithProduct {
  cartItem: { id: number; userId: number; productId: number };
  product: {
    id: number;
    name: string;
    salePrice: string;
    image1Url: string | null;
    thriftStoreId: number;
    thriftStorePayoutAmount: string;
    charityPayoutAmount: string;
  };
}

export async function createCheckoutSession(
  userId: number,
  userEmail: string | null,
  userName: string | null,
  cartItems: CartItemWithProduct[],
  shippingInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  },
  origin: string
) {
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.salePrice),
    0
  );
  // GST is included in prices (NZ standard) - calculate GST component (15%)
  // GST = Price × (15/115) for GST-inclusive pricing
  const gstAmount = subtotal * (15 / 115);
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99; // Free shipping on orders over NZ$50
  const total = subtotal + shippingCost;

  // Create order in database first
  const orderId = await db.createOrder({
    userId,
    status: "pending",
    subtotal: subtotal.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    shippingCost: shippingCost.toFixed(2),
    total: total.toFixed(2),
    shippingName: shippingInfo.name,
    shippingAddress: shippingInfo.address,
    shippingCity: shippingInfo.city,
    shippingState: shippingInfo.state,
    shippingZip: shippingInfo.zip,
    shippingCountry: shippingInfo.country,
    shippingPhone: shippingInfo.phone,
    customerEmail: userEmail,
  });

  // Create order items
  for (const item of cartItems) {
    await db.createOrderItem({
      orderId,
      productId: item.product.id,
      price: item.product.salePrice,
      thriftStoreId: item.product.thriftStoreId || null,
      thriftStorePayoutAmount: item.product.thriftStorePayoutAmount || null,
      charityPayoutAmount: item.product.charityPayoutAmount || (parseFloat(item.product.salePrice) * 0.10).toFixed(2),
    });
  }

  // Create Stripe line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map(
    (item) => ({
      price_data: {
        currency: "nzd",
        product_data: {
          name: item.product.name,
          images: item.product.image1Url ? [item.product.image1Url] : [],
        },
        unit_amount: Math.round(parseFloat(item.product.salePrice) * 100),
      },
      quantity: 1,
    })
  );

  // Add shipping as a line item (only if not free)
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "nzd",
        product_data: {
          name: "Shipping",
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  // Create Stripe checkout session with multiple payment methods
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/canceled`,
    customer_email: userEmail || undefined,
    client_reference_id: userId.toString(),
    metadata: {
      order_id: orderId.toString(),
      user_id: userId.toString(),
      customer_email: userEmail || "",
      customer_name: userName || "",
    },
    allow_promotion_codes: true,
  });

  // Update order with Stripe session ID
  await db.updateOrder(orderId, {
    stripeSessionId: session.id,
  });

  return {
    sessionId: session.id,
    url: session.url,
    orderId,
  };
}

export async function handleWebhookEvent(event: Stripe.Event) {
  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("[Webhook] No order_id in session metadata");
    return;
  }

  const order = await db.getOrderById(parseInt(orderId));
  if (!order) {
    console.error(`[Webhook] Order not found: ${orderId}`);
    return;
  }

  // Update order status
  await db.updateOrder(order.id, {
    status: "paid",
    paidAt: new Date(),
    stripePaymentIntentId: session.payment_intent as string,
  });

  // Get order items with full details and mark products as sold
  const orderItems = await db.getOrderItemsWithDetails(order.id);
  
  // Track payouts by thrift store and total charity payout
  const thriftStorePayouts: Record<number, number> = {};
  let totalCharityPayout = 0;
  
  for (const item of orderItems) {
    // Mark product as sold
    await db.markProductAsSold(item.product.id);
    
    // Accumulate thrift store payout amounts (only if thrift store is associated)
    const storeId = item.orderItem.thriftStoreId;
    const payoutAmountStr = item.orderItem.thriftStorePayoutAmount;
    
    if (storeId && payoutAmountStr) {
      const payoutAmount = parseFloat(payoutAmountStr);
      thriftStorePayouts[storeId] = (thriftStorePayouts[storeId] || 0) + payoutAmount;
      
      // Update thrift store total payout
      await db.incrementThriftStorePayout(storeId, payoutAmountStr);
    }
    
    // Accumulate charity payout (10% of sale price for every item)
    const charityAmountStr = item.orderItem.charityPayoutAmount;
    if (charityAmountStr) {
      totalCharityPayout += parseFloat(charityAmountStr);
    } else {
      // Fallback: calculate 10% of item price
      totalCharityPayout += parseFloat(item.orderItem.price) * 0.10;
    }
  }
  
  // Log charity payout for this order
  if (totalCharityPayout > 0) {
    console.log(`[Webhook] Order ${orderId}: NZ$${totalCharityPayout.toFixed(2)} allocated to charity partners`);
  }

  // Create payout records for each thrift store
  for (const [storeId, amount] of Object.entries(thriftStorePayouts)) {
    await db.createPayout({
      thriftStoreId: parseInt(storeId),
      amount: amount.toFixed(2),
      status: "pending",
    });
    
    // Send payout notification to thrift store
    const store = await db.getThriftStoreById(parseInt(storeId));
    if (store?.email) {
      await sendPayoutNotificationEmail(store, amount, order.id);
    }
  }

  // Clear user's cart
  await db.clearCart(order.userId);

  // Notify admin about new order
  try {
    const customerName = order.shippingName || 'Customer';
    await db.notifyAdminNewOrder(order.id, customerName, parseFloat(order.total));
  } catch (error) {
    console.error('[Webhook] Failed to create admin notification:', error);
  }

  // Send order confirmation email via Resend (with fallback to owner notification)
  if (order.customerEmail) {
    // Prepare items for Resend email
    const itemsForEmail = orderItems.map(item => ({
      name: item.product.name,
      brand: item.product.brand,
      size: item.product.size,
      price: item.orderItem.price,
      imageUrl: item.product.image1Url,
    }));
    
    // Try sending via Resend first
    const resendResult = await sendOrderConfirmationEmailViaResend(order, itemsForEmail);
    
    if (!resendResult.success) {
      console.warn(`[Webhook] Resend email failed: ${resendResult.error}, falling back to owner notification`);
    }
    
    // Always send owner notification as backup
    await sendOrderConfirmationEmail(order, orderItems);
  }

  console.log(`[Webhook] Order ${orderId} completed successfully`);
}

export async function getPaymentHistory(userId: number) {
  const orders = await db.getUserOrders(userId);
  return orders.filter((order) => order.status !== "pending");
}
