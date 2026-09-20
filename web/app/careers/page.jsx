import Link from "next/link";
import { getStores } from "@/lib/data";

export const metadata = {
  title: "Careers at Best Wireless 1",
  description:
    "Work at a Best Wireless 1 Cricket Wireless store in North Carolina or Virginia. Find out how to apply at a store near you.",
};

export default function CareersPage() {
  const count = getStores().length;

  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">
              Home
            </Link>{" "}
            › Careers
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Careers</h1>
          <p className="mt-2 text-lg text-white/95">
            Help people get connected at a Cricket Wireless store near you.
          </p>
        </div>
      </section>

      {/* TODO: link an online job application or hiring email when available. */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="max-w-[66ch] text-[17px] leading-relaxed text-ink-soft">
          <h2 className="text-2xl font-bold text-ink">Work with us</h2>
          <p className="mt-3">
            We run {count} stores across North Carolina and Virginia. If you enjoy helping people and know your way
            around a phone, we’d like to hear from you.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-ink">What the work looks like</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Helping customers choose the right phone and plan</li>
            <li>Setting up new service and transferring phone numbers</li>
            <li>Taking payments and answering account questions</li>
            <li>Keeping the store stocked and ready for customers</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-ink">How to apply</h2>
          <p className="mt-3">
            Stop by any of our stores and ask for the store manager, or call the store nearest you to ask about
            current openings.
          </p>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-shell p-6">
          <h2 className="text-lg font-bold">Find a store near you</h2>
          <p className="mt-2 text-[15px] text-muted">Every store lists its phone number and hours.</p>
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
