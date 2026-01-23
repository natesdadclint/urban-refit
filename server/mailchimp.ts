/**
 * Mailchimp integration helper for newsletter subscriber management
 */

import crypto from "crypto";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || "";

// Extract datacenter from API key (e.g., "us4" from "xxx-us4")
const getDatacenter = () => {
  const parts = MAILCHIMP_API_KEY.split("-");
  return parts[parts.length - 1] || "us1";
};

const getBaseUrl = () => `https://${getDatacenter()}.api.mailchimp.com/3.0`;

// Generate MD5 hash of email for Mailchimp subscriber ID
const getSubscriberHash = (email: string) => {
  return crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
};

interface MailchimpResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Add or update a subscriber in Mailchimp audience
 */
export async function addSubscriberToMailchimp(
  email: string,
  options?: {
    firstName?: string;
    lastName?: string;
    tags?: string[];
    status?: "subscribed" | "pending";
  }
): Promise<MailchimpResponse> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    console.warn("[Mailchimp] API key or Audience ID not configured");
    return { success: false, error: "Mailchimp not configured" };
  }

  const subscriberHash = getSubscriberHash(email);
  const url = `${getBaseUrl()}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`;

  const body: Record<string, unknown> = {
    email_address: email,
    status_if_new: options?.status || "subscribed",
    status: options?.status || "subscribed",
  };

  // Add merge fields if provided
  if (options?.firstName || options?.lastName) {
    body.merge_fields = {
      ...(options.firstName && { FNAME: options.firstName }),
      ...(options.lastName && { LNAME: options.lastName }),
    };
  }

  // Add tags if provided
  if (options?.tags && options.tags.length > 0) {
    body.tags = options.tags;
  }

  try {
    const response = await fetch(url, {
      method: "PUT", // PUT creates or updates
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Mailchimp] Error adding subscriber:", data);
      return {
        success: false,
        error: data.detail || data.title || "Failed to add subscriber",
      };
    }

    console.log("[Mailchimp] Subscriber added/updated:", email);
    return { success: true, data };
  } catch (error) {
    console.error("[Mailchimp] Network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Remove a subscriber from Mailchimp audience (archive)
 */
export async function removeSubscriberFromMailchimp(
  email: string
): Promise<MailchimpResponse> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    return { success: false, error: "Mailchimp not configured" };
  }

  const subscriberHash = getSubscriberHash(email);
  const url = `${getBaseUrl()}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const data = await response.json();
      return {
        success: false,
        error: data.detail || "Failed to remove subscriber",
      };
    }

    console.log("[Mailchimp] Subscriber removed:", email);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Verify Mailchimp API connection
 */
export async function verifyMailchimpConnection(): Promise<MailchimpResponse> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
    return { success: false, error: "Mailchimp not configured" };
  }

  const url = `${getBaseUrl()}/lists/${MAILCHIMP_AUDIENCE_ID}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.title || "Failed to verify connection",
      };
    }

    return {
      success: true,
      data: {
        listName: data.name,
        memberCount: data.stats?.member_count,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
