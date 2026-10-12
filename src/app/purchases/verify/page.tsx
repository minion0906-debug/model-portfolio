import Link from "next/link";

export const metadata = {
  title: "Confirm purchase library access",
  robots: { index: false, follow: false },
};

export default async function VerifyPurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const validToken = token && /^[a-f0-9]{64}$/i.test(token) ? token : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0c] px-5 py-12 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.035] p-8 sm:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Customer library</p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight">Confirm your access</h1>
        {validToken ? (
          <>
            <p className="mt-4 text-sm leading-6 text-white/55">
              Continue to securely open your purchase library. This confirmation step helps prevent email security scanners from using your link before you do.
            </p>
            <form action="/api/customer/verify" method="post" className="mt-8">
              <input type="hidden" name="token" value={validToken} />
              <button type="submit" className="w-full rounded-full bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90">
                Confirm and open library
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-white/55">This access link is missing or invalid. Request a new link to recover your purchases.</p>
            <Link href="/account" className="mt-8 inline-flex rounded-full bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black">Request a new link</Link>
          </>
        )}
      </section>
    </main>
  );
}
