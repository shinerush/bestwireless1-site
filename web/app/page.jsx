import Link from "next/link";
import { DealGrid, PhoneGrid, PlanFinder, PlanGrid } from "@/components/Catalog";
import { StoreFinder } from "@/components/Stores";
import { CRICKET, getInStoreOffers, getOffers, getPhones, getPlans, getStores } from "@/lib/data";

const FACTS = [
  ["5G on the AT&T network", "M5 12.5a9 9 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"],
  ["No annual contract", "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6zM9.5 12l1.8 1.8 3.4-3.6"],
  ["No overage charges", "M12 7v10M14.5 9.5c-.6-.7-1.6-1.1-2.6-1.1-1.6 0-2.6.8-2.6 1.9 0 2.6 5.4 1.4 5.4 4.1 0 1.2-1.1 2-2.8 2-1.1 0-2.1-.4-2.7-1.1"],
  ["Walk-ins welcome", "M4 7h16M4 12h16M4 17h10"],
  ["Se habla español", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 2.5 15 0 18M12 3c-2.5 2.6-2.5 15 0 18"],
];

export default function HomePage() {
  const stores = getStores();
  const plans = getPlans();
  const offers = getOffers();
  const topOffer = getInStoreOffers()[0] ?? null;
  const nc = stores.filter((s) => s.state === "NC").length;
  const va = stores.filter((s) => s.state === "VA").length;

  return (
    <>
      <section className="bg-brand pb-24 pt-8 text-white sm:pb-28">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-white/85">
              Cricket Wireless Authorized Retailer · {stores.length} stores
            </p>
            <h1 className="max-w-[16ch] text-4xl font-bold leading-[1.1] sm:text-5xl">
              Switch to Cricket at a store near you.
            </h1>
            <p className="mt-4 max-w-[48ch] text-lg text-white/95">
              Phones, plans, bill pay and same-day setup at {nc} stores in North Carolina and {va} in Virginia.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/stores/"
                className="rounded-full bg-white px-6 py-3 font-semibold text-brand-deep no-underline hover:bg-gold hover:text-black"
              >
                Find your store
              </Link>
              <Link
                href="/deals/"
                className="rounded-full border-2 border-white/70 px-6 py-3 font-semibold text-white no-underline hover:bg-white/15"
              >
                See this week’s deals
              </Link>
            </div>
          </div>

          {topOffer ? (
            <div className="rounded-lg border-t-4 border-gold bg-white p-6 text-ink">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-dark">
                This week in our stores
              </p>
              <p className="mt-1 text-2xl font-bold leading-tight">{topOffer.headline}</p>
              <p className="mt-2 text-[15px] text-ink-soft">{topOffer.detail}</p>
              {topOffer.terms_short ? (
                <p className="mt-2 text-[13px] text-muted">{topOffer.terms_short}</p>
              ) : null}
              <Link
                href="/deals/"
                className="mt-4 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-brand-dark"
              >
                See the deal
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto -mt-16 max-w-6xl px-4">
        <StoreFinder stores={stores} limit={4} />
      </div>

      <section aria-label="What to expect" className="mx-auto max-w-6xl px-4">
        <ul className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line py-5 text-[15px]">
          {FACTS.map(([label, path]) => (
            <li key={label} className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-brand-deep" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={path} />
              </svg>
              <span className="font-semibold">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-shell py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Plan finder</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Find your plan in 30 seconds</h2>
            </div>
            <p className="text-muted">Four quick questions. No sign-up.</p>
          </div>
          <PlanFinder plans={plans} />
        </div>
      </section>

      <section className="border-t border-line py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold sm:text-3xl">Plans</h2>
            <Link href="/plans/#compare" className="font-semibold text-brand-dark no-underline hover:underline">
              Compare all plans ›
            </Link>
          </div>
          <PlanGrid plans={plans.monthly} />
          <p className="mt-6 text-xs leading-relaxed text-muted">{plans.fine_print}</p>
        </div>
      </section>

      <section className="bg-shell py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Current deals</h2>
              <p className="mt-1 text-muted">
                Offers change often. Call your store to confirm availability before you drive out.
              </p>
            </div>
            <Link href="/deals/" className="font-semibold text-brand-dark no-underline hover:underline">
              All deals ›
            </Link>
          </div>
          <DealGrid offers={offers} />
        </div>
      </section>

      <section className="border-t border-line py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold sm:text-3xl">Popular phones</h2>
            <Link href="/phones/" className="font-semibold text-brand-dark no-underline hover:underline">
              Shop all phones ›
            </Link>
          </div>
          <PhoneGrid phones={getPhones()} limit={4} assetBase={process.env.BASE_PATH || ""} />
        </div>
      </section>

      <section className="bg-shell py-12">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
          <div className="flex flex-col rounded-lg bg-navy p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">Bring your own phone</p>
            <h3 className="mt-2 text-xl font-bold">Keep the phone you love</h3>
            <p className="mt-2 text-[15px] text-white/85">
              Bring it into any store. We’ll check it works on Cricket and move your number over.
            </p>
            <Link href="/stores/" className="mt-4 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy no-underline hover:bg-gold hover:text-black">
              Find a store
            </Link>
          </div>
          <div className="flex flex-col rounded-lg border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Coverage</p>
            <h3 className="mt-2 text-xl font-bold">Check coverage near you</h3>
            <p className="mt-2 text-[15px] text-muted">See Cricket’s 5G coverage where you live and work.</p>
            <a href={`${CRICKET}/map.html`} target="_blank" rel="noopener" className="mt-4 self-start rounded-full border-[1.5px] border-[#c9d2d8] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white">
              Open coverage map
            </a>
          </div>
          <div className="flex flex-col rounded-lg border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Bill pay</p>
            <h3 className="mt-2 text-xl font-bold">Pay your bill</h3>
            <p className="mt-2 text-[15px] text-muted">Pay online in a minute, or in person at any store.</p>
            <a href={`${CRICKET}/quickpay.html`} target="_blank" rel="noopener" className="mt-4 self-start rounded-full border-[1.5px] border-[#c9d2d8] px-5 py-2.5 text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white">
              Pay online
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
