import Link from "next/link";
import { PhoneGrid } from "@/components/Catalog";
import { CRICKET, getPhones } from "@/lib/data";

export const metadata = {
  title: "Cricket Wireless Phones & Deals",
  description:
    "Shop Cricket Wireless phones from Apple, Samsung and Motorola at Best Wireless 1 stores in North Carolina and Virginia. See prices, deals and check stock at a store near you.",
};

export default function PhonesPage() {
  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">Home</Link> &rsaquo; Phones
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Phones &amp; devices</h1>
          <p className="mt-2 max-w-[56ch] text-lg text-white/95">
            Prices as listed by Cricket Wireless. Stock varies by store, so call ahead before you visit.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <PhoneGrid phones={getPhones()} controls assetBase={process.env.BASE_PATH || ""} />
          <p className="mt-8 text-xs leading-relaxed text-muted">
            Prices shown are full retail prices listed by Cricket Wireless and exclude taxes and fees. Deal
            pricing requires the plan and activation terms shown with each offer. Online-only deals are
            available at cricketwireless.com and can&rsquo;t be redeemed in our stores.
          </p>
        </div>
      </section>

      <section className="bg-shell py-12">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
          <div className="flex flex-col rounded-lg bg-navy p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">Bring your own phone</p>
            <h2 className="mt-2 text-xl font-bold">Already have a phone?</h2>
            <p className="mt-2 text-[15px] text-white/85">
              Most unlocked phones work on Cricket. Bring yours in and we&rsquo;ll check it for you.
            </p>
            <Link href="/stores/" className="mt-4 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy no-underline hover:bg-gold hover:text-black">
              Find a store
            </Link>
          </div>
          <div className="flex flex-col rounded-lg border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Save more</p>
            <h2 className="mt-2 text-xl font-bold">See phone deals</h2>
            <p className="mt-2 text-[15px] text-muted">Free and discounted phones when you switch to Cricket.</p>
            <Link href="/deals/" className="mt-4 self-start rounded-full border-[1.5px] border-[#c9d2d8] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white">
              View deals
            </Link>
          </div>
          <div className="flex flex-col rounded-lg border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Plans</p>
            <h2 className="mt-2 text-xl font-bold">Pick a plan</h2>
            <p className="mt-2 text-[15px] text-muted">Unlimited plans from $35/mo. with AutoPay.</p>
            <a href={`${CRICKET}/cell-phone-plans/all-plans`} target="_blank" rel="noopener" className="mt-4 self-start rounded-full border-[1.5px] border-[#c9d2d8] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white">
              Cricket plan details
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
