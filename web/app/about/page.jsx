import Link from "next/link";
import { getStores } from "@/lib/data";

export const metadata = {
  title: "About Best Wireless 1",
  description:
    "Best Wireless 1, Inc. is a Cricket Wireless Authorized Retailer with stores across North Carolina and Virginia.",
};

export default function AboutPage() {
  const stores = getStores();
  const nc = stores.filter((s) => s.state === "NC").length;
  const va = stores.filter((s) => s.state === "VA").length;

  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">
              Home
            </Link>{" "}
            › About
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">About Best Wireless 1</h1>
          <p className="mt-2 text-lg text-white/95">
            A Cricket Wireless Authorized Retailer with {stores.length} stores across North Carolina and Virginia.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="max-w-[66ch] text-[17px] leading-relaxed text-ink-soft">
          <h2 className="text-2xl font-bold text-ink">Who we are</h2>
          <p className="mt-3">
            Best Wireless 1, Inc. runs {stores.length} Cricket Wireless stores — {nc} in North Carolina and {va} in
            Virginia. Our stores are where you can sit down with a real person, try a phone in your hand, and leave
            with everything set up.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-ink">What you can do in our stores</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Start new Cricket service, or switch from another carrier and keep your number</li>
            <li>Shop phones and find a plan that fits</li>
            <li>Bring your own phone and get it set up</li>
            <li>Upgrade your phone</li>
            <li>Pay your bill in person</li>
            <li>Get help with setup and your account</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-ink">An authorized retailer</h2>
          <p className="mt-3">
            We’re an independent business authorized to sell Cricket Wireless service. Plans, pricing and offers are
            set by Cricket Wireless. A few deals are only available at cricketwireless.com, and we mark those clearly
            so you never make a trip for an offer we can’t honor.
          </p>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-shell p-6">
          <h2 className="text-lg font-bold">Visit a store</h2>
          <p className="mt-2 text-[15px] text-muted">
            Search by ZIP code or city, or let your phone find the closest one.
          </p>
          <Link
            href="/stores/"
            className="mt-4 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-brand-dark"
          >
            Find a store
          </Link>
        </aside>
      </div>
    </>
  );
}
