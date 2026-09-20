#!/usr/bin/env node
/**
 * Best Wireless 1 site generator (Node port of build.py — this machine has no
 * Python installed, so this is the builder that actually runs here).
 *
 *     node tools/build.mjs
 *
 * Reads  data/stores.json   addresses, phones, hours  (source of truth)
 *        data/geo.json      map coordinates for those addresses
 * Writes stores/<slug>.html one SEO-complete page per location
 *        stores.html        the all-locations index
 *        sitemap.xml, robots.txt
 *
 * Prints a data-quality report of what is still missing before launch.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.bestwireless1.com";
const CRICKET = "https://www.cricketwireless.com";
const YEAR = new Date().getFullYear();
const TODAY = new Date().toISOString().slice(0, 10);

const STATE_NAMES = { NC: "North Carolina", VA: "Virginia" };

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">`;

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tel = (p) => "+1" + String(p).replace(/\D/g, "");
const addressOf = (s) => `${s.street}, ${s.city}, ${s.state} ${s.zip || ""}`.trim();

/** "10:00 AM - 8:00 PM" -> ["10:00", "20:00"] for schema.org */
function range(r) {
  return r.split(" - ").map((t) => {
    const [, h, m, ap] = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let hh = Number(h) % 12;
    if (/pm/i.test(ap)) hh += 12;
    return `${String(hh).padStart(2, "0")}:${m}`;
  });
}

/* ---------------- shared chrome ---------------- */

function masthead(prefix, current) {
  const item = (key, href, label) =>
    `        <li><a href="${prefix}${href}"${key === current ? ' aria-current="page"' : ""}>${label}</a></li>`;
  return `<div class="utility">
  <div class="wrap">
    <a href="${prefix}stores.html">Find a store</a>
    <a href="${CRICKET}/map.html" target="_blank" rel="noopener">Coverage map</a>
    <a href="${CRICKET}/quickpay.html" target="_blank" rel="noopener">Pay bill</a>
    <a href="${CRICKET}/cwlogin.html" target="_blank" rel="noopener">My account</a>
    <a href="https://espanol.cricketwireless.com/" target="_blank" rel="noopener" lang="es">Español</a>
  </div>
</div>
<header class="masthead">
  <div class="wrap">
    <a class="brand" href="${prefix}index.html">Best Wireless 1<span>Cricket Wireless Authorized Retailer</span></a>
    <nav aria-label="Main">
      <ul>
${[
    item("phones", "phones.html", "Phones"),
    item("plans", "plans.html", "Plans"),
    item("deals", "deals.html", "Deals"),
    item("stores", "stores.html", "Stores"),
    item("about", "about.html", "About"),
  ].join("\n")}
      </ul>
    </nav>
    <a class="btn btn-sm head-cta" href="${prefix}stores.html">Find a store</a>
  </div>
</header>`;
}

function footer(prefix) {
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot-cols">
      <div><h3>Shop</h3><ul>
        <li><a href="${prefix}phones.html">Phones</a></li>
        <li><a href="${prefix}plans.html">Plans</a></li>
        <li><a href="${prefix}deals.html">Deals</a></li>
        <li><a href="${CRICKET}/shop/bring-your-phone" target="_blank" rel="noopener">Bring your own phone</a></li>
      </ul></div>
      <div><h3>Stores</h3><ul>
        <li><a href="${prefix}stores.html">All locations</a></li>
        <li><a href="${prefix}stores.html#nc">North Carolina</a></li>
        <li><a href="${prefix}stores.html#va">Virginia</a></li>
      </ul></div>
      <div><h3>Company</h3><ul>
        <li><a href="${prefix}about.html">About us</a></li>
        <li><a href="${prefix}careers.html">Careers</a></li>
        <li><a href="${prefix}contact.html">Contact us</a></li>
      </ul></div>
      <div><h3>Cricket Wireless</h3><ul>
        <li><a href="${CRICKET}/quickpay.html" target="_blank" rel="noopener">Pay your bill</a></li>
        <li><a href="${CRICKET}/map.html" target="_blank" rel="noopener">Coverage map</a></li>
        <li><a href="${CRICKET}/cwlogin.html" target="_blank" rel="noopener">My account</a></li>
        <li><a href="${CRICKET}/support" target="_blank" rel="noopener">Cricket support</a></li>
      </ul></div>
    </div>
    <p class="fineprint">
      Best Wireless 1, Inc. is an authorized retailer of Cricket Wireless. Cricket, Cricket Wireless and
      related marks are trademarks of AT&amp;T Intellectual Property. Offers, pricing and availability are
      set by Cricket Wireless and are subject to change without notice. Not all offers are available at
      every location. Coverage is not available everywhere.
      &copy; ${YEAR} Best Wireless 1, Inc.
    </p>
  </div>
</footer>`;
}

/* ---------------- map ---------------- */

/** Google embed when a key is configured, OpenStreetMap otherwise, so the map
 *  works on day one and upgrades the moment a key lands in config.js. */
function mapEmbed(s, coord, key) {
  if (key) {
    const q = s.place_id ? `place_id:${s.place_id}` : encodeURIComponent(addressOf(s));
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}`;
  }
  if (!coord) return "";
  const d = 0.008;
  const bbox = [coord.lng - d, coord.lat - d / 2, coord.lng + d, coord.lat + d / 2].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coord.lat},${coord.lng}`;
}

const directionsUrl = (s) =>
  "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addressOf(s)) +
  (s.place_id ? `&destination_place_id=${encodeURIComponent(s.place_id)}` : "");

/* ---------------- store page ---------------- */

function schema(s, hours, coord) {
  const [mo, mc] = range(hours.mon_sat);
  const [so, sc] = range(hours.sun);
  const d = {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    name: `Cricket Wireless Authorized Retailer - ${s.city} (${s.name})`,
    image: `${SITE}/assets/images/stores/${s.slug}.jpg`,
    url: `${SITE}/stores/${s.slug}.html`,
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
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: mo, closes: mc },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: so, closes: sc },
    ],
    priceRange: "$$",
  };
  if (coord) d.geo = { "@type": "GeoCoordinates", latitude: coord.lat, longitude: coord.lng };
  if (s.place_id) d.hasMap = `https://www.google.com/maps/place/?q=place_id:${s.place_id}`;
  return JSON.stringify(d, null, 2);
}

function storePage(s, hours, coord, key) {
  const title = `Cricket Wireless ${s.city}, ${s.state} — ${s.street} | Best Wireless 1`;
  const desc = `Cricket Wireless Authorized Retailer at ${s.street}, ${s.city}, ${s.state}. ` +
    `Phones, plans, activations and bill pay. Open Mon–Sat ${hours.mon_sat}. Call ${s.phone}.`;
  const src = mapEmbed(s, coord, key);

  const photo = s.photo
    ? `<img class="storephoto" src="../assets/images/stores/${s.slug}.jpg" alt="The Best Wireless 1 Cricket Wireless store at ${esc(s.street)} in ${esc(s.city)}">`
    : `<div class="photo-placeholder">Store photo goes here.<br>Drop a JPG at assets/images/stores/${s.slug}.jpg and set "photo": true in stores.json.</div>`;

  const gbp = s.place_id
    ? `<p class="gbp-note"><a href="https://www.google.com/maps/place/?q=place_id:${s.place_id}" target="_blank" rel="noopener">See reviews and photos on Google</a></p>`
    : `<p class="gbp-note">Reviews and live hours appear here once this store’s Google Business Profile ID is added to stores.json.</p>`;

  const map = src
    ? `<iframe class="mapframe" src="${src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        title="Map showing the Best Wireless 1 store in ${esc(s.city)}, ${esc(s.state)}"></iframe>`
    : `<div class="photo-placeholder">Map appears once this store has coordinates in data/geo.json.</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/stores/${s.slug}.html">
<meta property="og:type" content="business.business">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}/stores/${s.slug}.html">
<meta property="og:image" content="${SITE}/assets/images/stores/${s.slug}.jpg">
${FONTS}
<link rel="stylesheet" href="../assets/css/main.css">
<script type="application/ld+json">
${schema(s, hours, coord)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${masthead("../", "stores")}

<main id="main">
  <section class="store-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> &rsaquo;
        <a href="../stores.html">Stores</a> &rsaquo;
        <a href="../stores.html#${s.state.toLowerCase()}">${esc(s.state)}</a> &rsaquo; ${esc(s.city)}
      </nav>
      <h1>Cricket Wireless in ${esc(s.city)}, ${esc(s.state)}</h1>
      <p class="addr">${esc(s.street)}${s.zip ? " &middot; " + esc(s.zip) : ""}</p>
      <p><span class="openchip" data-hours="${esc(hours.mon_sat)}" data-hours-sun="${esc(hours.sun)}"></span></p>
      <div class="cta-row">
        <a class="btn" href="tel:${tel(s.phone)}">Call ${esc(s.phone)}</a>
        <a class="btn btn-amber" href="${directionsUrl(s)}" target="_blank" rel="noopener">Get directions</a>
      </div>
    </div>
  </section>

  <div class="wrap detail-grid">
    <div class="panel">
      ${photo}
      <h2>Store information</h2>
      <table class="hours">
        <caption class="skip">Opening hours</caption>
        <tbody>
          <tr><th scope="row">Monday to Saturday</th><td>${esc(hours.mon_sat)}</td></tr>
          <tr><th scope="row">Sunday</th><td>${esc(hours.sun)}</td></tr>
          <tr><th scope="row">Phone</th><td><a href="tel:${tel(s.phone)}">${esc(s.phone)}</a></td></tr>
        </tbody>
      </table>
      ${gbp}
    </div>

    <div class="panel">
      <h2>Find us</h2>
      ${map}
    </div>
  </div>

  <section class="offers">
    <div class="wrap">
      <h2>Deals at our ${esc(s.city)} store</h2>
      <p class="sub">Call ahead to confirm stock. Offers are set by Cricket Wireless and can change without notice.</p>
      <div data-offers="instore" data-cta-href="tel:${tel(s.phone)}" data-cta-label="Call this store"></div>
    </div>
  </section>

  <section class="nearby">
    <div class="wrap">
      <h2>Other stores near ${esc(s.city)}</h2>
      <ul class="store-list" id="store-list"></ul>
      <p class="results-count" id="store-count"></p>
    </div>
  </section>
</main>

${footer("../")}

<script src="../assets/js/config.js"></script>
<script>
  window.BW1_CONFIG.dataBase = "../data/";
  window.BW1_CONFIG.storeBase = "./";
  ${coord ? `window.BW1_ORIGIN = { lat: ${coord.lat}, lng: ${coord.lng} };` : "// no coordinates for this store yet"}
  window.BW1_SLUG = "${s.slug}";
</script>
<script src="../assets/js/promo.js"></script>
<script src="../assets/js/locator.js"></script>
<script src="../assets/js/offers.js"></script>
</body>
</html>
`;
}

/* ---------------- all-stores index ---------------- */

function storesIndex(stores) {
  const byState = {};
  for (const s of stores) (byState[s.state] ||= []).push(s);

  const blocks = Object.keys(byState).sort().map((st) => {
    const rows = byState[st]
      .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))
      .map((s) => `<li class="store-row">
  <div class="store-dist" data-empty="true">&mdash;</div>
  <div class="store-meta">
    <h3><a href="stores/${s.slug}.html">Cricket Wireless ${esc(s.city)} &mdash; ${esc(s.name)}</a></h3>
    <p>${esc(s.street)}, ${esc(s.city)}, ${esc(s.state)} ${esc(s.zip || "")}</p>
  </div>
  <div class="store-actions">
    <a class="iconlink" href="tel:${tel(s.phone)}" aria-label="Call the ${esc(s.city)} store">&#9742;</a>
    <a class="iconlink" href="${directionsUrl(s)}" target="_blank" rel="noopener" aria-label="Directions to the ${esc(s.city)} store">&#10148;</a>
  </div>
</li>`).join("\n      ");

    return `<section class="results" id="${st.toLowerCase()}">
  <div class="wrap">
    <div class="results-head">
      <h2>${STATE_NAMES[st] || st}</h2>
      <p class="results-count">${byState[st].length} stores</p>
    </div>
    <ul class="store-list">
      ${rows}
    </ul>
  </div>
</section>`;
  });

  const states = Object.keys(byState).sort().map((s) => STATE_NAMES[s] || s).join(" and ");
  const title = `All Cricket Wireless Store Locations in ${Object.keys(byState).sort().join(" &amp; ")} | Best Wireless 1`;
  const desc = `Every Best Wireless 1 Cricket Wireless Authorized Retailer location. ${stores.length} stores across ${states} with addresses, phone numbers, hours and directions.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/stores.html">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}/stores.html">
${FONTS}
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${masthead("", "stores")}
<main id="main">
  <section class="finder">
    <div class="wrap">
      <h1>All our stores</h1>
      <p class="lede">${stores.length} Cricket Wireless locations across ${states}. Search by ZIP or let your phone find the closest one.</p>
      <form id="finder-form" class="searchbar" role="search">
        <label for="finder-input" class="skip">ZIP code or city</label>
        <input id="finder-input" type="search" inputmode="numeric" placeholder="ZIP code or city" autocomplete="postal-code">
        <button class="btn" type="submit">Search</button>
        <button class="btn btn-ghost" type="button" id="use-location">Use my location</button>
      </form>
      <p class="finder-status" id="finder-status" role="status" aria-live="polite"></p>
    </div>
  </section>

  <section class="results" id="nearest" hidden>
    <div class="wrap">
      <div class="results-head">
        <h2>Closest to you</h2>
        <p class="results-count" id="store-count"></p>
      </div>
      <ul class="store-list" id="store-list" data-initial="none"></ul>
    </div>
  </section>

  ${blocks.join("\n\n  ")}
</main>
${footer("")}
<script src="assets/js/config.js"></script>
<script src="assets/js/locator.js"></script>
<script>
  // Reveal the "closest to you" band once a result set exists.
  var band = document.getElementById('nearest');
  new MutationObserver(function () {
    if (document.getElementById('store-list').children.length) band.hidden = false;
  }).observe(document.getElementById('store-list'), { childList: true });
</script>
</body>
</html>
`;
}

/* ---------------- sitemap + robots ---------------- */

function sitemap(stores) {
  const urls = [`${SITE}/`, `${SITE}/stores.html`, `${SITE}/phones.html`, `${SITE}/plans.html`,
    `${SITE}/deals.html`, `${SITE}/about.html`, `${SITE}/contact.html`, `${SITE}/careers.html`]
    .concat(stores.map((s) => `${SITE}/stores/${s.slug}.html`));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod><priority>${u.endsWith("/") ? "1.0" : "0.8"}</priority></url>\n`).join("") +
    "</urlset>\n";
}

/* ---------------- run ---------------- */

const data = JSON.parse(readFileSync(join(ROOT, "data", "stores.json"), "utf8"));
const geo = existsSync(join(ROOT, "data", "geo.json"))
  ? JSON.parse(readFileSync(join(ROOT, "data", "geo.json"), "utf8")).coords || {}
  : {};
const key = (readFileSync(join(ROOT, "assets", "js", "config.js"), "utf8")
  .match(/googleMapsKey:\s*"([^"]*)"/) || [, ""])[1];

const defaults = data._defaults.hours;
const stores = data.stores.filter((s) => s.advertised);

mkdirSync(join(ROOT, "stores"), { recursive: true });

// Remove pages for stores that are no longer in the data.
const keep = new Set(stores.map((s) => s.slug + ".html"));
const removed = readdirSync(join(ROOT, "stores")).filter((f) => f.endsWith(".html") && !keep.has(f));
removed.forEach((f) => unlinkSync(join(ROOT, "stores", f)));

for (const s of stores) {
  writeFileSync(join(ROOT, "stores", s.slug + ".html"),
    storePage(s, s.hours ?? defaults, geo[s.slug], key));
}
writeFileSync(join(ROOT, "stores.html"), storesIndex(stores));
writeFileSync(join(ROOT, "sitemap.xml"), sitemap(stores));
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* ---- data quality report ---- */
const missing = (test) => stores.filter(test).map((s) => s.slug);
const noZip = missing((s) => !s.zip);
const noPid = missing((s) => !s.place_id);
const noGeo = missing((s) => !geo[s.slug]);
const exact = ["address", "maps-link"];
const roughGeo = missing((s) => geo[s.slug] && !exact.includes(geo[s.slug].precision));
const noPic = missing((s) => !s.photo);
const byState = stores.reduce((a, s) => ((a[s.state] = (a[s.state] || 0) + 1), a), {});

console.log(`Built ${stores.length} store pages + stores.html + sitemap.xml + robots.txt`);
console.log(`  ${Object.entries(byState).map(([k, v]) => `${k}: ${v}`).join("   ")}`);
if (removed.length) console.log(`  Removed ${removed.length} page(s) for stores no longer in stores.json`);
console.log(`  Maps: ${key ? "Google (key found in config.js)" : "OpenStreetMap (no Google Maps key set)"}\n`);
console.log("BEFORE LAUNCH, FILL THESE IN data/stores.json");
console.log("-".repeat(52));
console.log(`  Missing ZIP code ........... ${String(noZip.length).padStart(2)} stores`);
console.log(`  Missing Place ID ........... ${String(noPid.length).padStart(2)} stores   <- blocks Google reviews + exact map pin`);
console.log(`  Missing coordinates ........ ${String(noGeo.length).padStart(2)} stores   <- run: node tools/geocode.mjs`);
console.log(`  Approximate coordinates .... ${String(roughGeo.length).padStart(2)} stores   <- ${roughGeo.join(", ") || "none"}`);
console.log(`  Missing photo .............. ${String(noPic.length).padStart(2)} stores`);
console.log(`\n  Add a Google Maps key to assets/js/config.js to switch the maps from`);
console.log(`  OpenStreetMap to Google Maps with your own place pins.`);
