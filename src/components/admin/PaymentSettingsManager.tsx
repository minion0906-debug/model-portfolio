"use client";

import { useEffect, useState } from "react";

type Settings = { usdtPaymentsEnabled: boolean; usdtRequiredConfirmations: number; usdtPaymentInstructions: string };
type Checks = { walletConfigured: boolean; rpcConfigured: boolean; paypalConfigured: boolean };
const empty: Settings = { usdtPaymentsEnabled: true, usdtRequiredConfirmations: 12, usdtPaymentInstructions: "" };

export default function PaymentSettingsManager() {
  const [settings, setSettings] = useState<Settings>(empty);
  const [checks, setChecks] = useState<Checks | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/payment-settings", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load payment settings.");
      setSettings({ ...empty, ...data.settings });
      setChecks(data.checks || null);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load payment settings."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/payment-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save payment settings.");
      setSettings({ ...empty, ...data.settings });
      setMessage("Payment settings saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save payment settings."); }
    finally { setSaving(false); }
  }

  const checkLabel = (value: boolean) => value ? "Configured" : "Missing configuration";
  if (loading) return <section className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-neutral-500">Loading payment settings…</section>;

  return <form onSubmit={save} className="space-y-5 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
    <div><p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Checkout</p><h2 className="mt-2 font-display text-3xl">Payment settings</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Configure the customer-facing Ethereum USDT checkout instructions and confirmation threshold. Private RPC credentials and PayPal secrets remain in deployment environment variables.</p></div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-black/10 p-4"><p className="text-xs text-neutral-500">USDT receiving wallet</p><p className="mt-2 text-sm font-medium">{checks ? checkLabel(checks.walletConfigured) : "Unknown"}</p></div>
      <div className="rounded-2xl border border-black/10 p-4"><p className="text-xs text-neutral-500">Ethereum RPC endpoint</p><p className="mt-2 text-sm font-medium">{checks ? checkLabel(checks.rpcConfigured) : "Unknown"}</p></div>
      <div className="rounded-2xl border border-black/10 p-4"><p className="text-xs text-neutral-500">PayPal credentials</p><p className="mt-2 text-sm font-medium">{checks ? checkLabel(checks.paypalConfigured) : "Unknown"}</p></div>
    </div>
    <label className="flex items-start gap-3 rounded-2xl border border-black/10 p-4"><input type="checkbox" checked={settings.usdtPaymentsEnabled} onChange={e => setSettings(s => ({ ...s, usdtPaymentsEnabled: e.target.checked }))} className="mt-1 h-4 w-4"/><span><span className="block text-sm font-medium">Enable Ethereum USDT checkout</span><span className="mt-1 block text-xs leading-5 text-neutral-500">When disabled, the checkout hides the USDT payment instructions and the verification endpoint rejects new USDT payment attempts.</span></span></label>
    <label className="block"><span className="text-xs font-medium text-neutral-600">Required blockchain confirmations</span><input type="number" min={1} max={1000} required value={settings.usdtRequiredConfirmations} onChange={e => setSettings(s => ({ ...s, usdtRequiredConfirmations: Number(e.target.value) }))} className="mt-2 block w-full max-w-xs rounded-xl border border-black/10 px-4 py-3 text-sm"/><span className="mt-1 block text-xs text-neutral-500">Choose from 1 to 1000. Higher thresholds can increase checkout wait time.</span></label>
    <label className="block"><span className="text-xs font-medium text-neutral-600">Additional customer instructions (optional)</span><textarea rows={4} maxLength={1000} value={settings.usdtPaymentInstructions} onChange={e => setSettings(s => ({ ...s, usdtPaymentInstructions: e.target.value }))} placeholder="Example: Contact support if your transaction remains pending." className="mt-2 block w-full rounded-xl border border-black/10 px-4 py-3 text-sm"/><span className="mt-1 block text-xs text-neutral-500">Displayed in checkout below the standard Ethereum Mainnet warning. Do not put secrets here.</span></label>
    {message && <p role="status" className="text-sm text-neutral-600">{message}</p>}
    <button type="submit" disabled={saving} className="rounded-full bg-neutral-900 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{saving ? "Saving…" : "Save payment settings"}</button>
  </form>;
}
