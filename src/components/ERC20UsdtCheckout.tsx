"use client";

import { useEffect, useState } from "react";

type Props = { mediaId: string; priceCents: number; currency: string; onSuccess: () => void };
type Config = { enabled: boolean; network: string; token: string; wallet: string | null; requiredConfirmations: number };

export default function ERC20UsdtCheckout({ mediaId, priceCents, currency, onSuccess }: Props) {
  const [config, setConfig] = useState<Config | null>(null);
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmationProgress, setConfirmationProgress] = useState<{ current: number; required: number } | null>(null);
  useEffect(() => { fetch("/api/crypto/config", { cache: "no-store" }).then(r => r.json()).then(setConfig).catch(() => setConfig({ enabled: false, network: "Ethereum Mainnet", token: "USDT", wallet: null, requiredConfirmations: 12 })); }, []);
  const amount = (priceCents / 100).toFixed(2);

  async function verify() {
    setBusy(true); setError(""); setNotice(""); setConfirmationProgress(null);
    try {
      const response = await fetch("/api/crypto/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaId, txHash: txHash.trim() }) });
      const data = await response.json();
      if (response.status === 202 && data.pending) {
        setConfirmationProgress({ current: Number(data.confirmations || 0), required: Number(data.requiredConfirmations || config?.requiredConfirmations || 12) });
        setNotice(data.message || "Transaction detected and waiting for confirmations. Submit the same hash again shortly.");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to verify transaction.");
      setNotice("Payment confirmed on Ethereum. Your purchase is unlocked.");
      onSuccess();
      if (typeof data.paymentId === "string") {
        window.location.assign(`/checkout/success?paymentId=${encodeURIComponent(data.paymentId)}`);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to verify transaction."); }
    finally { setBusy(false); }
  }

  if (currency.toUpperCase() !== "USD") return <div className="mt-3 rounded-xl border border-white/10 p-3 text-xs text-white/50">USDT checkout is available for USD-priced items only.</div>;
  return <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
    <div className="flex items-center justify-between"><p className="text-xs font-semibold text-white">Pay with USDT</p><span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-white/50">Ethereum ERC-20</span></div>
    {!config && <p className="text-xs text-white/45">Checking crypto payment setup…</p>}
    {config && !config.enabled && <p className="text-xs leading-5 text-amber-200/80">USDT payments are not enabled yet. The site owner must configure the receiving wallet and Ethereum RPC endpoint.</p>}
    {config?.enabled && config.wallet && <>
      <p className="text-xs leading-5 text-white/55">Send exactly <strong className="text-white">{amount} USDT</strong> (or more) to this address on Ethereum Mainnet. Sending on another network may permanently lose funds.</p>
      <div className="break-all rounded-lg bg-white/5 p-3 font-mono text-[10px] text-white/75">{config.wallet}</div>
      <button type="button" onClick={() => { void navigator.clipboard.writeText(config.wallet!); setNotice("Wallet address copied."); }} className="w-full rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-wider text-white/70 hover:bg-white/10">Copy wallet address</button>
      <p className="text-[10px] leading-4 text-white/40">Wait for {config.requiredConfirmations} blockchain confirmations, then submit your transaction hash below. The transfer is irreversible.</p>
      <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="0x transaction hash" spellCheck={false} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 font-mono text-xs text-white outline-none focus:border-white/40" />
      <button type="button" disabled={busy || !/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())} onClick={() => void verify()} className="w-full rounded-full bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-black disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Verifying on Ethereum…" : "Verify USDT payment"}</button>
    </>}
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    {notice && <p role="status" className={`text-xs leading-5 ${confirmationProgress ? "text-amber-200" : "text-emerald-200"}`}>{notice}</p>}
    {confirmationProgress && <div className="space-y-2 rounded-xl border border-amber-200/20 bg-amber-200/5 p-3"><div className="flex items-center justify-between text-[10px] text-white/65"><span>Blockchain confirmations</span><span>{confirmationProgress.current}/{confirmationProgress.required}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-200 transition-all" style={{ width: `${Math.min(100, confirmationProgress.current / Math.max(1, confirmationProgress.required) * 100)}%` }} /></div><a className="text-[10px] underline text-white/65" href={`https://etherscan.io/tx/${encodeURIComponent(txHash.trim())}`} target="_blank" rel="noreferrer">View transaction on Etherscan</a></div>}
  </div>;
}
