"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientId: string;
        components: string[];
        pageType: string;
      }) => Promise<{
        findEligibleMethods: (options: { currencyCode: string }) => Promise<{
          isEligible: (method: string) => boolean;
        }>;
        createPayPalOneTimePaymentSession: (options: {
          onApprove: (data: { orderId: string }) => Promise<void>;
          onCancel?: () => void;
          onError?: (error: Error) => void;
        }) => {
          start: (
            options: { presentationMode: "auto" },
            orderPromise: Promise<string>,
          ) => Promise<void>;
        };
      }>;
    };
  }
}

type Props = {
  mediaId: string;
  priceCents: number;
  currency: string;
  onSuccess: () => void;
};

export default function PayPalCheckout({ mediaId, priceCents, currency, onSuccess }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceCents / 100);

  useEffect(() => {
    let cancelled = false;
    let button: HTMLElement | null = null;
    let clickHandler: (() => void) | null = null;

    async function setup() {
      try {
        setLoading(true);
        setError("");

        const configResponse = await fetch("/api/paypal/config", { cache: "no-store" });
        const config = await configResponse.json();
        if (!configResponse.ok) throw new Error(config.error || "PayPal is not configured.");

        const scriptSrc = config.scriptUrl as string;
        if (!document.querySelector(`script[data-paypal-v6="${scriptSrc}"]`)) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.async = true;
            script.src = scriptSrc;
            script.dataset.paypalV6 = scriptSrc;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("PayPal SDK failed to load."));
            document.head.appendChild(script);
          });
        } else {
          while (!window.paypal?.createInstance && !cancelled) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        if (cancelled || !window.paypal?.createInstance || !hostRef.current) return;

        const sdk = await window.paypal.createInstance({
          clientId: config.clientId,
          components: ["paypal-payments"],
          pageType: "checkout",
        });

        const methods = await sdk.findEligibleMethods({ currencyCode: currency });
        if (!methods.isEligible("paypal")) {
          throw new Error("PayPal checkout is not available for this currency or buyer.");
        }

        if (initialized.current || !hostRef.current) return;
        initialized.current = true;

        button = document.createElement("paypal-button");
        button.setAttribute("type", "pay");
        button.style.display = "block";
        button.style.width = "100%";

        const createOrder = async () => {
          const response = await fetch("/api/paypal/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mediaId }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to create PayPal order.");
          return data.orderId as string;
        };

        const session = sdk.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            const response = await fetch(`/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
              method: "POST",
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Payment could not be verified.");
            onSuccess();
          },
          onCancel: () => setError("Payment was cancelled. You can try again."),
          onError: (err) => setError(err.message || "PayPal checkout failed."),
        });

        clickHandler = () => {
          setError("");
          void session.start({ presentationMode: "auto" }, createOrder()).catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "PayPal checkout failed.");
          });
        };

        button.addEventListener("click", clickHandler);
        hostRef.current.replaceChildren(button);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setError(err instanceof Error ? err.message : "Unable to initialize PayPal.");
        }
      }
    }

    void setup();

    return () => {
      cancelled = true;
      if (button && clickHandler) button.removeEventListener("click", clickHandler);
      initialized.current = false;
    };
  }, [currency, mediaId, onSuccess]);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">One-time unlock</p>
          <p className="mt-1 text-xl font-semibold text-white">{price}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-white/55">
          Secure PayPal
        </span>
      </div>

      {loading && <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">Loading PayPal…</div>}
      <div ref={hostRef} />
      {error && <p className="text-xs leading-5 text-red-300">{error}</p>}
    </div>
  );
}
