/* Build-time data access. The JSON files in ../data stay the single source of
   truth, so the spreadsheet import and the site keep sharing one pipeline. */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const DATA = join(process.cwd(), "..", "data");

const read = (file) => JSON.parse(readFileSync(join(DATA, file), "utf8"));

export const SITE = "https://www.bestwireless1.com";
export const CRICKET = "https://www.cricketwireless.com";

export function getStores() {
  const { stores, _defaults } = read("stores.json");
  const coords = read("geo.json").coords || {};
  return stores
    .filter((s) => s.advertised)
    .map((s) => ({
      ...s,
      hours: s.hours ?? _defaults.hours,
      coords: coords[s.slug] ?? null,
    }));
}

export function getStore(slug) {
  return getStores().find((s) => s.slug === slug) ?? null;
}

export function getOffers() {
  const today = new Date().toISOString().slice(0, 10);
  return read("offers.json")
    .offers.filter((o) => (!o.start || o.start <= today) && (!o.end || o.end >= today))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

export function getInStoreOffers() {
  return getOffers().filter((o) => o.channel !== "online_only");
}

export function getPlans() {
  return read("plans.json");
}

export function getPhotoCredits() {
  try {
    return read("photo-credits.json").credits ?? {};
  } catch {
    return {};
  }
}

export function getPhones() {
  const photos = getPhotoCredits();
  return read("phones.json")
    .phones.map((p) => ({ ...p, photo: photos[p.id]?.file ?? null }))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/* Helpers shared by pages */

export const telHref = (phone) => "tel:+1" + String(phone).replace(/\D/g, "");

export const fullAddress = (s) => `${s.street}, ${s.city}, ${s.state} ${s.zip || ""}`.trim();

export const directionsUrl = (s) =>
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(fullAddress(s)) +
  (s.place_id ? `&destination_place_id=${encodeURIComponent(s.place_id)}` : "");

export function mapEmbed(s) {
  if (!s.coords) return null;
  const d = 0.008;
  const { lat, lng } = s.coords;
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export function byState(stores) {
  const names = { NC: "North Carolina", VA: "Virginia" };
  const map = {};
  for (const s of stores) (map[s.state] ||= []).push(s);
  return Object.keys(map)
    .sort()
    .map((code) => ({
      code,
      name: names[code] ?? code,
      stores: map[code].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
    }));
}

/** schema.org markup so each store page can stand on its own in local search. */
export function storeSchema(s) {
  const to24 = (t) => {
    const [, h, m, ap] = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let hh = Number(h) % 12;
    if (/pm/i.test(ap)) hh += 12;
    return `${String(hh).padStart(2, "0")}:${m}`;
  };
  const [monOpen, monClose] = s.hours.mon_sat.split(" - ").map(to24);
  const [sunOpen, sunClose] = s.hours.sun.split(" - ").map(to24);
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    name: `Cricket Wireless Authorized Retailer - ${s.city} (${s.name})`,
    url: `${SITE}/stores/${s.slug}/`,
    telephone: s.phone,
    parentOrganization: { "@type": "Organization", name: "Best Wireless 1, Inc." },
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: s.city,
      addressRegion: s.state,
      postalCode: s.zip || "",
      addressCountry: "US",
    },
    ...(s.coords
      ? { geo: { "@type": "GeoCoordinates", latitude: s.coords.lat, longitude: s.coords.lng } }
      : {}),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: monOpen,
        closes: monClose,
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: sunOpen, closes: sunClose },
    ],
    priceRange: "$$",
    ...(s.place_id ? { hasMap: `https://www.google.com/maps/place/?q=place_id:${s.place_id}` } : {}),
  };
}
