import Link from "next/link";
import { StoreFinder } from "@/components/Stores";
import { byState, getStores, telHref } from "@/lib/data";

export const metadata = {
  title: "All Cricket Wireless Store Locations in NC & VA",
  description:
    "Every Best Wireless 1 Cricket Wireless Authorized Retailer location across North Carolina and Virginia, with addresses, phone numbers, hours and directions.",
};

export default function StoresPage() {
  const stores = getStores();
  const groups = byState(stores);

  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">All our stores</h1>
          <p className="mt-2 max-w-[52ch] text-lg text-white/95">
            {stores.length} Cricket Wireless locations across {groups.map((g) => g.name).join(" and ")}.
            Search by ZIP or let your phone find the closest one.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <StoreFinder stores={stores} limit={6} showAllLink={false} heading="Search stores" />
      </div>

      {groups.map((group) => (
        <section key={group.code} id={group.code.toLowerCase()} className="border-t border-line py-10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 className="text-2xl font-bold">{group.name}</h2>
              <p className="text-sm text-muted">{group.stores.length} stores</p>
            </div>
            <ul className="grid gap-x-8 md:grid-cols-2">
              {group.stores.map((s) => (
                <li key={s.slug} className="border-b border-line py-4">
                  <h3 className="text-[15px] font-bold">
                    <Link href={`/stores/${s.slug}/`} className="text-ink no-underline hover:text-brand-dark hover:underline">
                      Cricket Wireless {s.city} — {s.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">
                    {s.street}, {s.city}, {s.state} {s.zip}
                  </p>
                  <p className="mt-1 text-sm">
                    <a href={telHref(s.phone)} className="font-semibold text-brand-dark no-underline hover:underline">
                      {s.phone}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
