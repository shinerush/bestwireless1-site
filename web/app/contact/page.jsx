import Link from "next/link";
import { StoreFinder } from "@/components/Stores";
import { CRICKET, getStores } from "@/lib/data";

export const metadata = {
  title: "Contact Best Wireless 1",
  description:
    "Call your local Best Wireless 1 Cricket Wireless store, or find the right contact for Cricket account and billing questions.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">
              Home
            </Link>{" "}
            › Contact
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Contact us</h1>
          <p className="mt-2 text-lg text-white/95">The fastest way to reach us is to call your local store.</p>
        </div>
      </section>

      {/* TODO: add a business / corporate contact email or phone when available. */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Call a store</h2>
          <StoreFinder stores={getStores()} limit={5} heading="Search stores" />
        </div>

        <aside className="h-fit rounded-lg border border-line bg-shell p-6">
          <h2 className="text-lg font-bold">Account or billing questions?</h2>
          <p className="mt-2 text-[15px] text-muted">
            Cricket Wireless customer support handles account changes, billing and technical issues.
          </p>
          <p className="mt-3 text-[15px]">
            Call <strong>611</strong> from your Cricket phone, or{" "}
            <a href="tel:+18002742538" className="font-semibold text-brand-dark no-underline hover:underline">
              1-800-274-2538
            </a>
            .
          </p>
          <p className="mt-3 text-[15px]">
            <a
              href={`${CRICKET}/support`}
              target="_blank"
              rel="noopener"
              className="font-semibold text-brand-dark no-underline hover:underline"
            >
              Cricket support site
            </a>
          </p>
        </aside>
      </div>
    </>
  );
}
