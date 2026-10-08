import { randomBytes } from "node:crypto";

const PAYPAL_BASE =
  process.env.PAYPAL_ENVIRONMENT === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function requireConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }
  return { clientId, clientSecret };
}

async function getAccessToken() {
  const { clientId, clientSecret } = requireConfig();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PayPal authentication failed (${response.status}).`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export function getPayPalClientId() {
  const { clientId } = requireConfig();
  return clientId;
}

export function getPayPalClientScriptUrl() {
  return process.env.PAYPAL_ENVIRONMENT === "production"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";
}

export async function createPayPalOrder(input: {
  mediaId: string;
  title: string;
  amount: string;
  currency: string;
}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": randomBytes(16).toString("hex"),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.mediaId,
          custom_id: input.mediaId,
          description: input.title.slice(0, 127),
          amount: {
            currency_code: input.currency,
            value: input.amount,
          },
        },
      ],
    }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.id) {
    console.error("PayPal create order error:", data);
    throw new Error(data?.message || "PayPal could not create the order.");
  }

  return data as { id: string; status: string };
}

export async function verifyPayPalWebhook(input: {
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
  webhookEvent: unknown;
}) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not configured.");
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: input.authAlgo,
      cert_url: input.certUrl,
      transmission_id: input.transmissionId,
      transmission_sig: input.transmissionSig,
      transmission_time: input.transmissionTime,
      webhook_id: webhookId,
      webhook_event: input.webhookEvent,
    }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("PayPal webhook verification error:", data);
    throw new Error(`PayPal webhook verification failed (${response.status}).`);
  }
  return data?.verification_status === "SUCCESS";
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal capture error:", data);
    throw new Error(data?.message || "PayPal could not capture the payment.");
  }

  return data as {
    id: string;
    status: string;
    payer?: { name?: { given_name?: string; surname?: string }; email_address?: string };
    purchase_units?: Array<{
      reference_id?: string;
      custom_id?: string;
      amount?: { currency_code?: string; value?: string };
      payments?: {
        captures?: Array<{
          status?: string;
          amount?: { currency_code?: string; value?: string };
        }>;
      };
    }>;
  };
}

export async function getPayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("PayPal get order error:", data);
    throw new Error(data?.message || "PayPal order could not be retrieved.");
  }
  return data;
}

export async function refundPayPalCapture(input: { captureId: string; amountCents?: number; currency?: string; note?: string }) {
  const accessToken = await getAccessToken();
  const body = input.amountCents
    ? { amount: { value: (input.amountCents / 100).toFixed(2), currency_code: input.currency || "USD" }, note_to_payer: input.note?.slice(0, 255) }
    : { note_to_payer: input.note?.slice(0, 255) };
  const response = await fetch(`${PAYPAL_BASE}/v2/payments/captures/${encodeURIComponent(input.captureId)}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": randomBytes(16).toString("hex"),
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("PayPal refund error:", data);
    throw new Error(data?.message || "PayPal could not refund the payment.");
  }
  return data as { id: string; status: string; amount?: { value?: string; currency_code?: string }; create_time?: string };
}
