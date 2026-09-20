/**
 * Rebuilds data/stores.json from the locations spreadsheet.
 *
 *     node tools/import-locations.mjs <locations.csv>
 *
 * The spreadsheet arrives as .xls; save it as CSV first (Excel: File > Save As
 * > CSV UTF-8). Expected columns, in order: Location Code, Location Name,
 * Location phone number, Street, City, State, Zip, (blank), Mon-Sat Open,
 * Mon-Sat Close, (blank), Sunday Open, Sunday Close, GPS link.
 *
 * Stores already on the site keep their slug, so live URLs don't move. Hours
 * are only written per store when they differ from the defaults. The Google
 * Place ID is read out of the GPS link; short maps.app.goo.gl links have none,
 * so those stores keep the link in `maps_short_link` for later.
 *
 * Afterwards run: node tools/geocode.mjs && node tools/build.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = process.argv[2];
if (!CSV) {
  console.error("Usage: node tools/import-locations.mjs <locations.csv>");
  process.exit(1);
}

const DEFAULTS = { mon_sat: "10:00 AM - 8:00 PM", sun: "12:00 PM - 6:00 PM" };

/* --- CSV --- */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\r") { /* skip */ }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, (m) => m.toUpperCase())
  .replace(/\bNc\b/g, "NC").replace(/\bVa\b/g, "VA").replace(/\bHwy\b/gi, "Hwy");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const normStreet = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const rows = parseCsv(readFileSync(CSV, "utf8")).slice(2)
  .filter((r) => r[0] && r[0].trim() && r[3]);

const prev = JSON.parse(readFileSync(join(ROOT, "data", "stores.json"), "utf8"));
const bySt = new Map(prev.stores.map((s) => [normStreet(s.street), s]));

// City-level counts decide whether a slug needs the branch name appended.
const cityCount = {};
for (const r of rows) {
  const city = title(r[4].trim());
  cityCount[city] = (cityCount[city] || 0) + 1;
}

const seen = new Set();
const stores = rows.map((r, i) => {
  const [code, name, phone, street, cityRaw, state, zip, , mo, mc, , so, sc, gps] = r.map((x) => (x || "").trim());
  const city = title(cityRaw);
  const old = bySt.get(normStreet(street));

  let slug = old ? old.slug : (cityCount[city] > 1 ? `${slugify(city)}-${slugify(name)}` : slugify(city));
  while (seen.has(slug)) slug = `${slug}-${slugify(name)}`;
  seen.add(slug);

  const place_id = (gps.match(/destination_place_id=([^&]+)/) || [, ""])[1];
  const hours = { mon_sat: `${mo} - ${mc}`, sun: `${so} - ${sc}` };
  const store = {
    id: i + 1,
    store_code: code,
    slug,
    name: title(name),
    street,
    city,
    state: state.toUpperCase(),
    zip,
    phone,
    lat: null,
    lng: null,
    place_id,
    photo: "",
    advertised: true,
  };
  if (hours.mon_sat !== DEFAULTS.mon_sat || hours.sun !== DEFAULTS.sun) store.hours = hours;
  if (!place_id && gps) store.maps_short_link = gps;
  return store;
});

const out = {
  _README: "Every location. Source: the client's locations spreadsheet (store code, name, phone, address, ZIP, hours and Google Place ID). Map coordinates live in geo.json. Run `node tools/build.mjs` after editing, and `node tools/geocode.mjs` if you added an address.",
  _source: CSV.split(/[\/]/).pop(),
  _updated: new Date().toISOString().slice(0, 10),
  _defaults: { hours: DEFAULTS, verified: true },
  stores,
};
writeFileSync(join(ROOT, "data", "stores.json"), JSON.stringify(out, null, 2) + "\n");

const byState = stores.reduce((a, s) => ((a[s.state] = (a[s.state] || 0) + 1), a), {});
console.log(`${stores.length} stores  ${Object.entries(byState).map(([k, v]) => k + ": " + v).join("  ")}`);
console.log(`with Place ID: ${stores.filter((s) => s.place_id).length}`);
console.log(`custom hours:  ${stores.filter((s) => s.hours).map((s) => s.slug).join(", ")}`);
console.log(`kept slugs:    ${stores.filter((s) => bySt.get(normStreet(s.street))).length} of ${prev.stores.length} existing`);
console.log(`new slugs:     ${stores.filter((s) => !bySt.get(normStreet(s.street))).map((s) => s.slug).join(", ")}`);
const dropped = prev.stores.filter((p) => !stores.some((s) => normStreet(s.street) === normStreet(p.street)));
console.log(`dropped:       ${dropped.map((s) => s.slug).join(", ") || "none"}`);
