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
