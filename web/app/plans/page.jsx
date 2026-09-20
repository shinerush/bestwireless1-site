import Link from "next/link";
import { PlanCompare, PlanFinder, PlanGrid } from "@/components/Catalog";
import { getPlans, getStores } from "@/lib/data";

export const metadata = {
  title: "Cricket Wireless Plans & Prices",
  description:
    "Compare Cricket Wireless unlimited and 10GB plans, plus 3- and 12-month prepaid plans. Take the plan finder quiz and sign up at a Best Wireless 1 store near you.",
};

export default function PlansPage() {
  const plans = getPlans();
  const count = getStores().length;

  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">Home</Link> › Plans
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Cricket Wireless plans</h1>
          <p className="mt-2 text-lg text-white/95">
            No annual contract. No overage charges. Sign up at any of our {count} stores.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold sm:text-3xl">Monthly plans</h2>
            <Link href="#plan-finder" className="font-semibold text-brand-dark no-underline hover:underline">
              Not sure? Take the plan finder ›
            </Link>
          </div>
          <PlanGrid plans={plans.monthly} />
        </div>
      </section>

      <section className="bg-shell py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Pay upfront and save</h2>
          <p className="mb-6 mt-1 text-muted">Cover several months at once for a lower monthly cost.</p>
          <PlanGrid plans={plans.prepaid} prepaid />
        </div>
      </section>

      <section id="compare" className="border-t border-line py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold sm:text-3xl">Compare plans</h2>
            <Link href="/deals/" className="font-semibold text-brand-dark no-underline hover:underline">
              Multi-line deals ›
            </Link>
          </div>
          <PlanCompare monthly={plans.monthly} />
          <p className="mt-6 text-xs leading-relaxed text-muted">{plans.fine_print}</p>
        </div>
      </section>

      <section id="plan-finder" className="bg-shell py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">Plan finder</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Find your plan in 30 seconds</h2>
          </div>
          <PlanFinder plans={plans} />
        </div>
      </section>
    </>
  );
}
