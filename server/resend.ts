/**
 * Resend transactional email service integration
 * Used for sending direct email replies to customers
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Urban Refit <noreply@urbanrefit.store>";

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a transactional email via Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.warn("[Resend] API key not configured");
    return { success: false, error: "Email service not configured" };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const emailOptions: any = {
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
    };
    
    if (options.text) emailOptions.text = options.text;
    if (options.html) emailOptions.html = options.html;
    if (options.replyTo) emailOptions.replyTo = options.replyTo;
    
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("[Resend] Error sending email:", error);
      return { success: false, error: error.message };
    }

    console.log("[Resend] Email sent successfully:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Resend] Network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Send a reply to a contact form message
 */
export async function sendContactReply(
  customerEmail: string,
  customerName: string | null,
  originalMessage: string,
  replyContent: string
): Promise<SendEmailResult> {
  const greeting = customerName ? `Hi ${customerName.split(" ")[0]},` : "Hi,";
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1c1917; padding: 24px; text-align: center;">
        <h1 style="color: #fafaf9; margin: 0; font-size: 24px;">Urban Refit</h1>
      </div>
      
      <div style="padding: 32px 24px; background-color: #fafaf9;">
        <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
          ${greeting}
        </p>
        
        <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Thanks for getting in touch. Here's our reply:
        </p>
        
        <div style="background-color: #f5f5f4; border-left: 4px solid #1c1917; padding: 16px; margin: 0 0 24px 0;">
          <p style="color: #44403c; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${replyContent}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;" />
        
        <p style="color: #78716c; font-size: 12px; margin: 0 0 8px 0;">
          <strong>Your original message:</strong>
        </p>
        <p style="color: #a8a29e; font-size: 12px; line-height: 1.5; margin: 0; font-style: italic;">
          "${originalMessage.substring(0, 200)}${originalMessage.length > 200 ? '...' : ''}"
        </p>
      </div>
      
      <div style="background-color: #1c1917; padding: 24px; text-align: center;">
        <p style="color: #a8a29e; font-size: 12px; margin: 0 0 8px 0;">
          Personally curated pre-loved fashion that gives back to the community.
        </p>
        <p style="color: #78716c; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} Urban Refit. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = `
${greeting}

Thanks for getting in touch. Here's our reply:

${replyContent}

---
Your original message:
"${originalMessage.substring(0, 200)}${originalMessage.length > 200 ? '...' : ''}"

---
Urban Refit
Personally curated pre-loved fashion that gives back to the community.
  `.trim();

  return sendEmail({
    to: customerEmail,
    subject: "We've got your message – Urban Refit",
    html: htmlContent,
    text: textContent,
    replyTo: "help@urbanrefit.store",
  });
}

/**
 * Verify Resend API connection
 */
export async function verifyResendConnection(): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { success: false, error: "Resend API key not configured" };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // Try to get API key info to verify connection
    const { data, error } = await resend.apiKeys.list();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}


/**
 * Order item type for email templates
 */
interface OrderItemForEmail {
  name: string;
  brand: string | null;
  size: string | null;
  price: string;
  imageUrl: string | null;
}

/**
 * Order type for email templates
 */
interface OrderForEmail {
  id: number;
  subtotal: string;
  gstAmount: string | null;
  shippingCost: string;
  total: string;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  shippingPhone: string | null;
  customerEmail: string | null;
}

/**
 * Send order confirmation email to customer via Resend
 */
export async function sendOrderConfirmationEmailViaResend(
  order: OrderForEmail,
  items: OrderItemForEmail[]
): Promise<SendEmailResult> {
  if (!order.customerEmail) {
    console.warn("[Resend] No customer email for order confirmation");
    return { success: false, error: "No customer email provided" };
  }

  const customerName = order.shippingName?.split(" ")[0] || "there";
  const gstAmount = order.gstAmount || (parseFloat(order.subtotal) * (15 / 115)).toFixed(2);

  // Generate items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4;">
        <div style="display: flex; align-items: center;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: 500; color: #1c1917;">${item.name}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #78716c;">
              ${item.brand || 'No brand'}${item.size ? ` • Size ${item.size}` : ''}
            </p>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e7e5e4; text-align: right; font-weight: 500; color: #1c1917;">
        NZ$${parseFloat(item.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  // Generate items text
  const itemsText = items.map(item => 
    `- ${item.name} (${item.brand || 'No brand'}${item.size ? `, Size ${item.size}` : ''}) - NZ$${parseFloat(item.price).toFixed(2)}`
  ).join('\n');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1c1917; padding: 32px 24px; text-align: center;">
          <h1 style="color: #fafaf9; margin: 0; font-size: 28px; letter-spacing: 1px;">Urban Refit</h1>
        </div>
        
        <!-- Success Banner -->
        <div style="background-color: #22c55e; padding: 16px 24px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">Order Confirmed!</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi ${customerName},
          </p>
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Thanks for shopping sustainably! Your order is confirmed and we're getting your pre-loved finds ready to ship.
          </p>
          
          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #78716c; font-size: 14px; margin: 0 0 8px 0;">Order Number</p>
            <p style="color: #1c1917; font-size: 20px; font-weight: 600; margin: 0;">#${order.id}</p>
          </div>
          
          <!-- Order Items -->
          <h2 style="color: #1c1917; font-size: 18px; margin: 0 0 16px 0; border-bottom: 2px solid #1c1917; padding-bottom: 8px;">
            Your Items
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          
          <!-- Order Summary -->
          <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #1c1917;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 4px 0; color: #78716c;">Subtotal</td>
                <td style="padding: 4px 0; text-align: right; color: #1c1917;">NZ$${parseFloat(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #a8a29e; font-size: 12px;">(Includes GST)</td>
                <td style="padding: 4px 0; text-align: right; color: #a8a29e; font-size: 12px;">NZ$${parseFloat(gstAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78716c;">Shipping</td>
                <td style="padding: 4px 0; text-align: right; color: #1c1917;">NZ$${parseFloat(order.shippingCost).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 600; color: #1c1917;">Total</td>
                <td style="padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: 600; color: #1c1917;">NZ$${parseFloat(order.total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Shipping Address -->
          <h2 style="color: #1c1917; font-size: 18px; margin: 32px 0 16px 0; border-bottom: 2px solid #1c1917; padding-bottom: 8px;">
            Shipping To
          </h2>
          
          <div style="color: #44403c; line-height: 1.6;">
            <p style="margin: 0; font-weight: 500;">${order.shippingName}</p>
            <p style="margin: 4px 0 0 0;">${order.shippingAddress}</p>
            <p style="margin: 4px 0 0 0;">${order.shippingCity}, ${order.shippingState} ${order.shippingZip}</p>
            <p style="margin: 4px 0 0 0;">${order.shippingCountry}</p>
            ${order.shippingPhone ? `<p style="margin: 8px 0 0 0;">${order.shippingPhone}</p>` : ''}
          </div>
          
          <!-- What's Next -->
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 32px 0 0 0;">
            <h3 style="color: #92400e; font-size: 14px; margin: 0 0 8px 0;">What happens next?</h3>
            <ul style="color: #78350f; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>We'll carefully package your items within 1-2 business days</li>
              <li>You'll receive a shipping notification with tracking info</li>
              <li>Your items will arrive within 5-7 business days</li>
            </ul>
          </div>
        </div>
        
        <!-- Sustainability Message -->
        <div style="background-color: #dcfce7; padding: 24px; text-align: center;">
          <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.6;">
            You just kept quality clothing out of landfill and supported a local thrift store. That's the kind of shopping we can all feel good about.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <p style="color: #a8a29e; font-size: 12px; margin: 0 0 8px 0;">
            Personally curated pre-loved fashion that gives back to the community.
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0 0 16px 0;">
            Questions? Contact us at help@urbanrefit.store
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0;">
            &copy; ${new Date().getFullYear()} Urban Refit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${customerName},

Thanks for shopping sustainably! Your order is confirmed and we're getting your pre-loved finds ready to ship.

ORDER #${order.id}

YOUR ITEMS:
${itemsText}

ORDER SUMMARY:
Subtotal: NZ$${parseFloat(order.subtotal).toFixed(2)}
(Includes GST: NZ$${parseFloat(gstAmount).toFixed(2)})
Shipping: NZ$${parseFloat(order.shippingCost).toFixed(2)}
Total: NZ$${parseFloat(order.total).toFixed(2)}

SHIPPING TO:
${order.shippingName}
${order.shippingAddress}
${order.shippingCity}, ${order.shippingState} ${order.shippingZip}
${order.shippingCountry}
${order.shippingPhone ? `Phone: ${order.shippingPhone}` : ''}

WHAT HAPPENS NEXT:
1. We'll carefully package your items within 1-2 business days
2. You'll receive a shipping notification with tracking info
3. Your items will arrive within 5-7 business days

By shopping with Urban Refit, you've helped give pre-loved clothing a second life 
and supported our local thrift store partners. Thank you for being part of the circular fashion movement!

Questions? Contact us at help@urbanrefit.store

Urban Refit
Personally curated pre-loved fashion that gives back to the community.
  `.trim();

  return sendEmail({
    to: order.customerEmail,
    subject: `Your order is confirmed! – Urban Refit #${order.id}`,
    html: htmlContent,
    text: textContent,
    replyTo: "help@urbanrefit.store",
  });
}

/**
 * Send shipping notification email to customer via Resend
 */
export async function sendShippingNotificationViaResend(
  order: OrderForEmail,
  trackingNumber?: string,
  carrier?: string
): Promise<SendEmailResult> {
  if (!order.customerEmail) {
    console.warn("[Resend] No customer email for shipping notification");
    return { success: false, error: "No customer email provided" };
  }

  const customerName = order.shippingName?.split(" ")[0] || "there";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1c1917; padding: 32px 24px; text-align: center;">
          <h1 style="color: #fafaf9; margin: 0; font-size: 28px; letter-spacing: 1px;">Urban Refit</h1>
        </div>
        
        <!-- Success Banner -->
        <div style="background-color: #3b82f6; padding: 16px 24px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">Your Order Has Shipped!</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi ${customerName},
          </p>
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Great news! Your Urban Refit order #${order.id} is on its way to you.
          </p>
          
          ${trackingNumber ? `
          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #78716c; font-size: 14px; margin: 0 0 8px 0;">Tracking Number</p>
            <p style="color: #1c1917; font-size: 18px; font-weight: 600; margin: 0;">${trackingNumber}</p>
            ${carrier ? `<p style="color: #78716c; font-size: 12px; margin: 8px 0 0 0;">Carrier: ${carrier}</p>` : ''}
          </div>
          ` : `
          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #78716c; font-size: 14px; margin: 0;">
              Tracking information will be updated shortly.
            </p>
          </div>
          `}
          
          <!-- Shipping Address -->
          <h2 style="color: #1c1917; font-size: 18px; margin: 0 0 16px 0; border-bottom: 2px solid #1c1917; padding-bottom: 8px;">
            Delivering To
          </h2>
          
          <div style="color: #44403c; line-height: 1.6;">
            <p style="margin: 0; font-weight: 500;">${order.shippingName}</p>
            <p style="margin: 4px 0 0 0;">${order.shippingAddress}</p>
            <p style="margin: 4px 0 0 0;">${order.shippingCity}, ${order.shippingState} ${order.shippingZip}</p>
            <p style="margin: 4px 0 0 0;">${order.shippingCountry}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <p style="color: #a8a29e; font-size: 12px; margin: 0 0 8px 0;">
            Personally curated pre-loved fashion that gives back to the community.
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0 0 16px 0;">
            Questions? Contact us at help@urbanrefit.store
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0;">
            &copy; ${new Date().getFullYear()} Urban Refit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${customerName},

Great news! Your Urban Refit order #${order.id} is on its way to you.

${trackingNumber ? `TRACKING NUMBER: ${trackingNumber}${carrier ? `\nCarrier: ${carrier}` : ''}` : 'Tracking information will be updated shortly.'}

DELIVERING TO:
${order.shippingName}
${order.shippingAddress}
${order.shippingCity}, ${order.shippingState} ${order.shippingZip}
${order.shippingCountry}

Questions? Contact us at help@urbanrefit.store

Urban Refit
Personally curated pre-loved fashion that gives back to the community.
  `.trim();

  return sendEmail({
    to: order.customerEmail,
    subject: `Your order is on its way! – Urban Refit #${order.id}`,
    html: htmlContent,
    text: textContent,
    replyTo: "help@urbanrefit.store",
  });
}


/**
 * Send sell offer email to customer when admin makes an offer
 */
export async function sendSellOfferEmail(options: {
  to: string;
  customerName: string;
  itemName: string;
  brand: string;
  offerAmount: string;
  submissionId: number;
}): Promise<SendEmailResult> {
  const { to, customerName, itemName, brand, offerAmount, submissionId } = options;
  const firstName = customerName.split(" ")[0];
  const baseUrl = process.env.VITE_APP_URL || "https://urbanrefit.store";
  const responseUrl = `${baseUrl}/my-submissions/${submissionId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1c1917; padding: 32px 24px; text-align: center;">
          <h1 style="color: #fafaf9; margin: 0; font-size: 28px; letter-spacing: 1px;">Urban Refit</h1>
        </div>
        
        <!-- Offer Banner -->
        <div style="background-color: #3b82f6; padding: 16px 24px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">We've Made You an Offer!</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi ${firstName},
          </p>
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Great news! We've reviewed your submission and would like to make you an offer for your item.
          </p>
          
          <!-- Item Details -->
          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
            <p style="color: #78716c; font-size: 14px; margin: 0 0 8px 0;">Your Item</p>
            <p style="color: #1c1917; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${brand} - ${itemName}</p>
            <p style="color: #78716c; font-size: 14px; margin: 0;">Submission #${submissionId}</p>
          </div>
          
          <!-- Offer Amount -->
          <div style="background-color: #dcfce7; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; text-align: center;">
            <p style="color: #166534; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Our Offer</p>
            <p style="color: #166534; font-size: 36px; font-weight: 700; margin: 0;">NZ$${parseFloat(offerAmount).toFixed(2)}</p>
          </div>
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            You can accept this offer, reject it, or make a counter-offer. Simply click the button below to respond.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${responseUrl}" style="display: inline-block; background-color: #1c1917; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
              Respond to Offer
            </a>
          </div>
          
          <p style="color: #78716c; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
            This offer is valid for 7 days. If you have any questions, feel free to reply to this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <p style="color: #a8a29e; font-size: 12px; margin: 0 0 8px 0;">
            Personally curated pre-loved fashion that gives back to the community.
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Urban Refit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${firstName},

Great news! We've reviewed your submission and would like to make you an offer for your item.

YOUR ITEM
${brand} - ${itemName}
Submission #${submissionId}

OUR OFFER: NZ$${parseFloat(offerAmount).toFixed(2)}

You can accept this offer, reject it, or make a counter-offer. Visit the link below to respond:
${responseUrl}

This offer is valid for 7 days. If you have any questions, feel free to reply to this email.

---
Urban Refit
Personally curated pre-loved fashion that gives back to the community.
  `.trim();

  return sendEmail({
    to,
    subject: `We've made you an offer for your ${brand} ${itemName}!`,
    html: htmlContent,
    text: textContent,
    replyTo: "help@urbanrefit.store",
  });
}

/**
 * Send email when admin accepts customer's counter offer
 */
export async function sendSellOfferAcceptedEmail(options: {
  to: string;
  customerName: string;
  itemName: string;
  brand: string;
  finalAmount: string;
  submissionId: number;
}): Promise<SendEmailResult> {
  const { to, customerName, itemName, brand, finalAmount, submissionId } = options;
  const firstName = customerName.split(" ")[0];
  const baseUrl = process.env.VITE_APP_URL || "https://urbanrefit.store";
  const submissionUrl = `${baseUrl}/my-submissions/${submissionId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1c1917; padding: 32px 24px; text-align: center;">
          <h1 style="color: #fafaf9; margin: 0; font-size: 28px; letter-spacing: 1px;">Urban Refit</h1>
        </div>
        
        <!-- Success Banner -->
        <div style="background-color: #22c55e; padding: 16px 24px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">Your Offer Has Been Accepted!</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi ${firstName},
          </p>
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Great news! We've accepted your offer for your item. Here are the details:
          </p>
          
          <!-- Item Details -->
          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
            <p style="color: #78716c; font-size: 14px; margin: 0 0 8px 0;">Your Item</p>
            <p style="color: #1c1917; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${brand} - ${itemName}</p>
            <p style="color: #78716c; font-size: 14px; margin: 0;">Submission #${submissionId}</p>
          </div>
          
          <!-- Final Amount -->
          <div style="background-color: #dcfce7; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; text-align: center;">
            <p style="color: #166534; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Agreed Amount</p>
            <p style="color: #166534; font-size: 36px; font-weight: 700; margin: 0;">NZ$${parseFloat(finalAmount).toFixed(2)}</p>
          </div>
          
          <h2 style="color: #1c1917; font-size: 18px; margin: 24px 0 16px 0;">What Happens Next?</h2>
          
          <ol style="color: #1c1917; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
            <li style="margin-bottom: 8px;">We'll send you a prepaid shipping label via email within 24 hours.</li>
            <li style="margin-bottom: 8px;">Pack your item securely and drop it off at your nearest courier location.</li>
            <li style="margin-bottom: 8px;">Once we receive and verify the item, we'll process your payment within 48 hours.</li>
          </ol>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${submissionUrl}" style="display: inline-block; background-color: #1c1917; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
              View Submission Details
            </a>
          </div>
          
          <p style="color: #78716c; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
            If you have any questions, feel free to reply to this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <p style="color: #a8a29e; font-size: 12px; margin: 0 0 8px 0;">
            Personally curated pre-loved fashion that gives back to the community.
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Urban Refit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${firstName},

Great news! We've accepted your offer for your item.

YOUR ITEM
${brand} - ${itemName}
Submission #${submissionId}

AGREED AMOUNT: NZ$${parseFloat(finalAmount).toFixed(2)}

WHAT HAPPENS NEXT?
1. We'll send you a prepaid shipping label via email within 24 hours.
2. Pack your item securely and drop it off at your nearest courier location.
3. Once we receive and verify the item, we'll process your payment within 48 hours.

View your submission details: ${submissionUrl}

If you have any questions, feel free to reply to this email.

---
Urban Refit
Personally curated pre-loved fashion that gives back to the community.
  `.trim();

  return sendEmail({
    to,
    subject: `Offer accepted! Your ${brand} ${itemName} - Next steps`,
    html: htmlContent,
    text: textContent,
    replyTo: "help@urbanrefit.store",
  });
}

/**
 * Send email when customer's submission is rejected
 */
export async function sendSellRejectionEmail(options: {
  to: string;
  customerName: string;
  itemName: string;
  brand: string;
  reason?: string;
  submissionId: number;
}): Promise<SendEmailResult> {
  const { to, customerName, itemName, brand, reason, submissionId } = options;
  const firstName = customerName.split(" ")[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1c1917; padding: 32px 24px; text-align: center;">
          <h1 style="color: #fafaf9; margin: 0; font-size: 28px; letter-spacing: 1px;">Urban Refit</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi ${firstName},
          </p>
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for submitting your item to Urban Refit. After careful review, we're unable to accept your submission at this time.
          </p>
          
          <!-- Item Details -->
          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
            <p style="color: #78716c; font-size: 14px; margin: 0 0 8px 0;">Your Item</p>
            <p style="color: #1c1917; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${brand} - ${itemName}</p>
            <p style="color: #78716c; font-size: 14px; margin: 0;">Submission #${submissionId}</p>
          </div>
          
          ${reason ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          ` : ''}
          
          <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            We appreciate you thinking of Urban Refit. If you have other items you'd like to sell, we'd be happy to review them.
          </p>
          
          <p style="color: #78716c; font-size: 14px; line-height: 1.6; margin: 0;">
            If you have any questions about this decision, feel free to reply to this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <p style="color: #a8a29e; font-size: 12px; margin: 0 0 8px 0;">
            Personally curated pre-loved fashion that gives back to the community.
          </p>
          <p style="color: #78716c; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Urban Refit. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${firstName},

Thank you for submitting your item to Urban Refit. After careful review, we're unable to accept your submission at this time.

YOUR ITEM
${brand} - ${itemName}
Submission #${submissionId}

${reason ? `REASON: ${reason}\n\n` : ''}We appreciate you thinking of Urban Refit. If you have other items you'd like to sell, we'd be happy to review them.

If you have any questions about this decision, feel free to reply to this email.

---
Urban Refit
Personally curated pre-loved fashion that gives back to the community.
  `.trim();

  return sendEmail({
    to,
    subject: `Update on your ${brand} ${itemName} submission`,
    html: htmlContent,
    text: textContent,
    replyTo: "help@urbanrefit.store",
  });
}
