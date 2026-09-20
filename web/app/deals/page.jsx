import Link from "next/link";
import { DealGrid } from "@/components/Catalog";
import { getOffers, getStores } from "@/lib/data";

export const metadata = {
  title: "Cricket Wireless Deals & Promotions",
  description:
    "Current Cricket Wireless phone and plan deals at Best Wireless 1 stores across North Carolina and Virginia, including multi-line savings and free phones when you switch.",
};

export default function DealsPage() {
  const count = getStores().length;
  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">Home</Link> &rsaquo; Deals
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Deals</h1>
          <p className="mt-2 max-w-[56ch] text-lg text-white/95">
            Offers change often. Call your store to confirm availability before you drive out.
          </p>
        </div>
      </section>

      <section className="bg-shell py-10">
        <div className="mx-auto max-w-6xl px-4">
          <DealGrid offers={getOffers()} />
          <p className="mt-8 text-xs leading-relaxed text-muted">
            Deals marked &ldquo;Online only&rdquo; are available at cricketwireless.com and can&rsquo;t be
            redeemed in our stores. Offers are set by Cricket Wireless, are subject to change without notice,
            and may not be available at every location.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
          <div className="flex flex-col rounded-lg border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Plans</p>
            <h2 className="mt-2 text-xl font-bold">Compare plans</h2>
            <p className="mt-2 text-[15px] text-muted">Unlimited from $35/mo. with AutoPay, or pay upfront and save.</p>
            <Link href="/plans/" className="mt-4 self-start rounded-full border-[1.5px] border-[#c9d2d8] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white">
              See plans
            </Link>
          </div>
          <div className="flex flex-col rounded-lg border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Phones</p>
            <h2 className="mt-2 text-xl font-bold">Shop phones</h2>
            <p className="mt-2 text-[15px] text-muted">Apple, Samsung and Motorola phones with prices.</p>
            <Link href="/phones/" className="mt-4 self-start rounded-full border-[1.5px] border-[#c9d2d8] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white">
              See phones
            </Link>
          </div>
          <div className="flex flex-col rounded-lg bg-navy p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">In person</p>
            <h2 className="mt-2 text-xl font-bold">Find a store</h2>
            <p className="mt-2 text-[15px] text-white/85">{count} stores across North Carolina and Virginia.</p>
            <Link href="/stores/" className="mt-4 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy no-underline hover:bg-gold hover:text-black">
              Find a store
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
