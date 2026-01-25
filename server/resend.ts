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
          Thank you for reaching out to Urban Refit. Here's our response to your inquiry:
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

Thank you for reaching out to Urban Refit. Here's our response to your inquiry:

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
    subject: "Re: Your inquiry to Urban Refit",
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
