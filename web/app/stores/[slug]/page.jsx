import Link from "next/link";
import { notFound } from "next/navigation";
import { DealGrid } from "@/components/Catalog";
import { OpenBadge, StoreRow } from "@/components/Stores";
import {
  directionsUrl,
  fullAddress,
  getInStoreOffers,
  getStore,
  getStores,
  mapEmbed,
  storeSchema,
  telHref,
} from "@/lib/data";

export function generateStaticParams() {
  return getStores().map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }) {
  const s = getStore(params.slug);
  if (!s) return {};
  const title = `Cricket Wireless ${s.city}, ${s.state} — ${s.street}`;
  const description = `Cricket Wireless Authorized Retailer at ${fullAddress(s)}. Phones, plans, activations and bill pay. Open Mon–Sat ${s.hours.mon_sat}. Call ${s.phone}.`;
  return {
    title,
    description,
    alternates: { canonical: `/stores/${s.slug}/` },
    openGraph: { title: `${title} | Best Wireless 1`, description, type: "website" },
  };
}

function miles(a, b) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  return 2 * R * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2)));
}

export default function StorePage({ params }) {
  const store = getStore(params.slug);
  if (!store) notFound();

  const nearby = store.coords
    ? getStores()
        .filter((s) => s.slug !== store.slug && s.coords)
        .map((s) => ({ store: s, distance: miles(store.coords, s.coords) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4)
    : [];

  const map = mapEmbed(store);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema(store)) }}
      />

      <section className="bg-brand py-8 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">Home</Link> ›{" "}
            <Link href="/stores/" className="text-white no-underline hover:underline">Stores</Link> ›{" "}
            <Link href={`/stores/#${store.state.toLowerCase()}`} className="text-white no-underline hover:underline">
              {store.state}
            </Link> › {store.city}
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Cricket Wireless in {store.city}, {store.state}
          </h1>
          <p className="mt-2 text-lg text-white/95">
            {store.street} · {store.zip}
          </p>
          <OpenBadge hours={store.hours} className="mt-3 bg-white/90 text-brand-deep" />
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={telHref(store.phone)}
              className="rounded-full bg-white px-6 py-3 font-semibold text-brand-deep no-underline hover:bg-gold hover:text-black"
            >
              Call {store.phone}
            </a>
            <a
              href={directionsUrl(store)}
              target="_blank"
              rel="noopener"
              className="rounded-full border-2 border-white/70 px-6 py-3 font-semibold text-white no-underline hover:bg-white/15"
            >
              Get directions
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-lg border border-line p-5">
          <div className="mb-5 grid aspect-[3/2] place-items-center rounded border border-dashed border-line bg-shell p-4 text-center text-sm text-muted">
            Store photo goes here. Drop a JPG at assets/images/stores/{store.slug}.jpg and set &quot;photo&quot;: true in stores.json.
          </div>
          <h2 className="border-b border-line pb-3 text-lg font-bold">Store information</h2>
          <table className="w-full border-collapse">
            <caption className="sr-only">Opening hours</caption>
            <tbody>
              <tr className="border-b border-line">
                <th scope="row" className="py-2.5 text-left font-medium text-muted">Monday to Saturday</th>
                <td className="py-2.5 text-right font-semibold tabular-nums">{store.hours.mon_sat}</td>
              </tr>
              <tr className="border-b border-line">
                <th scope="row" className="py-2.5 text-left font-medium text-muted">Sunday</th>
                <td className="py-2.5 text-right font-semibold tabular-nums">{store.hours.sun}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 text-left font-medium text-muted">Phone</th>
                <td className="py-2.5 text-right font-semibold">
                  <a href={telHref(store.phone)} className="text-brand-dark no-underline hover:underline">
                    {store.phone}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          {store.place_id ? (
            <p className="mt-4 rounded bg-brand-tint px-4 py-3 text-sm">
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${store.place_id}`}
                target="_blank"
                rel="noopener"
                className="font-semibold text-brand-deep no-underline hover:underline"
              >
                See reviews and photos on Google
              </a>
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-line p-5">
          <h2 className="mb-4 border-b border-line pb-3 text-lg font-bold">Find us</h2>
          {map ? (
            <iframe
              src={map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing the Best Wireless 1 store in ${store.city}, ${store.state}`}
              className="aspect-[4/3] w-full rounded border-0 bg-shell"
            />
          ) : (
            <p className="text-sm text-muted">Map appears once this store has coordinates in data/geo.json.</p>
          )}
        </div>
      </div>

      <section className="bg-shell py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Deals at our {store.city} store</h2>
          <p className="mb-6 mt-1 text-muted">
            Call ahead to confirm stock. Offers are set by Cricket Wireless and can change without notice.
          </p>
          <DealGrid offers={getInStoreOffers()} ctaHref={telHref(store.phone)} ctaLabel="Call this store" />
        </div>
      </section>

      {nearby.length ? (
        <section className="border-t border-line py-10">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-2 text-2xl font-bold">Other stores near {store.city}</h2>
            <ul>
              {nearby.map(({ store: s, distance }) => (
                <StoreRow key={s.slug} store={s} distance={distance} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
