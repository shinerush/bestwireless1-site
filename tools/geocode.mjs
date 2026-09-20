import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(ROOT, "data", "stores.json"), "utf8"));
const out = existsSync(join(ROOT, "data", "geo.json"))
  ? JSON.parse(readFileSync(join(ROOT, "data", "geo.json"), "utf8")) : { _README: "", geocoded: "", coords: {} };
const UA = { "User-Agent": "bestwireless1-site-build/1.0 (store locator geocoding)" };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function lookup(q) {
  const u = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=" + encodeURIComponent(q);
  const r = await fetch(u, { headers: UA });
  if (!r.ok) return null;
  const j = await r.json();
  return j.length ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5), match: j[0].type } : null;
}

const live = new Set(data.stores.filter(s => s.advertised).map(s => s.slug));
// Drop coordinates for stores that are no longer in stores.json.
for (const slug of Object.keys(out.coords)) if (!live.has(slug)) delete out.coords[slug];

for (const s of data.stores.filter(s => s.advertised)) {
  // A store that carries its own coordinates (from its Google Maps link) is
  // more accurate than anything we can look up, so take those first.
  if (typeof s.lat === "number" && typeof s.lng === "number") {
    out.coords[s.slug] = { lat: s.lat, lng: s.lng, precision: "maps-link" };
    continue;
  }
  if (out.coords[s.slug]) continue;
  const street = `${s.street.replace(/\s+(Ste|Suite|Unit|#)\s*[\w-]+$/i, "")}, ${s.city}, ${s.state} ${s.zip}`;
  let hit = await lookup(street);
  let precision = "address";
  if (!hit) { await sleep(1100); hit = await lookup(`${s.zip}, ${s.state}`); precision = "zip"; }
  if (!hit) { await sleep(1100); hit = await lookup(`${s.city}, ${s.state}`); precision = "city"; }
  if (hit) out.coords[s.slug] = { lat: hit.lat, lng: hit.lng, precision };
  console.log(s.slug.padEnd(34), hit ? `${hit.lat}, ${hit.lng}  (${precision})` : "NOT FOUND");
  await sleep(1100);
}
out._README = "Coordinates for the store locator, looked up from the addresses in stores.json (OpenStreetMap / Nominatim, ODbL). stores.json stays the source of truth for addresses; this file only adds map coordinates. Delete a slug here and re-run tools/geocode to look it up again. precision: address = exact street match, zip/city = approximate centre.";
out.geocoded = new Date().toISOString().slice(0, 10);
writeFileSync(join(ROOT, "data", "geo.json"), JSON.stringify(out, null, 2) + "\n");
console.log("\nsaved", Object.keys(out.coords).length, "coordinates");
