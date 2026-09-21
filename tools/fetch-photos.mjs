#!/usr/bin/env node
/**
 * Pulls openly licensed product photography from Wikimedia Commons into
 * web/public/assets/photos, and writes data/photo-credits.json with the
 * attribution each licence requires.
 *
 *     node tools/fetch-photos.mjs
 *
 * Only files under CC0 / public domain / CC BY / CC BY-SA are kept, because
 * those can be published on a commercial site as long as the credit shown in
 * the site footer stays with them.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "web", "public", "assets", "photos");
const UA = { "User-Agent": "bestwireless1-site/1.0 (retailer website build)" };
const API = "https://commons.wikimedia.org/w/api.php";

/** id -> search terms, best first. */
const WANTED = {
  "iphone-17-pro-max": ["iPhone 16 Pro photograph", "iPhone 15 Pro photograph", "iPhone Pro Max"],
  "iphone-16": ["iPhone 16 photograph", "iPhone 15 photograph", "iPhone photograph"],
  "galaxy-a17": ["Samsung Galaxy A15 photograph", "Samsung Galaxy A series photograph", "Samsung Galaxy smartphone"],
  "galaxy-s25-fe": ["Samsung Galaxy S24 photograph", "Samsung Galaxy S23 photograph", "Samsung Galaxy S"],
  "moto-g-stylus-2025": ["Motorola Moto G photograph", "Motorola smartphone photograph", "Motorola Moto"],
  "razr-2025": ["Motorola Razr 2023", "Motorola Razr foldable", "foldable smartphone"],
  "apple-watch-series-11": ["Apple Watch Series 9", "Apple Watch photograph", "smartwatch photograph"],
  "hero-store": ["mobile phone shop", "cell phone store", "mobile phone retail store"],
};

const OK_LICENCE = /^(cc0|cc by|cc by-sa|public domain|pd)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAUSE = 3000;
const strip = (html) => String(html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  // Commons rate-limits hard; back off and retry rather than dying mid-run.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return res.json();
    if (res.status !== 429 || attempt === 6) throw new Error(`${res.status} ${url}`);
    await sleep(15000 * attempt);
  }
}

async function candidates(term) {
  const j = await api({ action: "query", list: "search", srsearch: term, srnamespace: "6", srlimit: "12" });
  return (j.query?.search ?? [])
    .map((s) => s.title)
    .filter((t) => /\.(jpe?g|png)$/i.test(t));
}

async function details(titles) {
  const j = await api({
    action: "query",
    titles: titles.join("|"),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1000",
  });
  return Object.values(j.query?.pages ?? {})
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: p.title.replace(/^File:/, ""),
        page: info.descriptionurl,
        thumb: info.thumburl,
        width: info.width,
        height: info.height,
        licence: strip(meta.LicenseShortName?.value) || "unknown",
        author: strip(meta.Artist?.value) || "Unknown",
      };
    })
    .filter(Boolean);
}

function score(f) {
  // Prefer landscape-ish, reasonably large, and not a logo or screenshot.
  if (/logo|icon|screenshot|diagram|box|chart/i.test(f.title)) return -1;
  if (f.width < 700) return -1;
  if (!OK_LICENCE.test(f.licence)) return -1;
  return f.width * (f.height > f.width ? 0.8 : 1);
}

mkdirSync(OUT, { recursive: true });
const credits = {};

const existingCredits = existsSync(join(ROOT, "data", "photo-credits.json"))
  ? JSON.parse(readFileSync(join(ROOT, "data", "photo-credits.json"), "utf8")).credits ?? {}
  : {};

for (const [id, terms] of Object.entries(WANTED)) {
  if (existingCredits[id] && existsSync(join(OUT, existingCredits[id].file.split("/").pop()))) {
    credits[id] = existingCredits[id];
    console.log(`${id.padEnd(24)} kept existing`);
    continue;
  }
  let picked = null;
  for (const term of terms) {
    const titles = await candidates(term);
    await sleep(PAUSE);
    if (!titles.length) continue;
    const files = await details(titles.slice(0, 10));
    await sleep(PAUSE);
    const best = files.map((f) => ({ f, s: score(f) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0];
    if (best) { picked = best.f; break; }
  }
  if (!picked) { console.log(`${id.padEnd(24)} no usable file`); continue; }

  const bin = Buffer.from(await (await fetch(picked.thumb, { headers: UA })).arrayBuffer());
  const ext = picked.thumb.match(/\.(jpe?g|png)$/i)?.[1]?.toLowerCase() ?? "jpg";
  const file = `${id}.${ext === "jpeg" ? "jpg" : ext}`;
  writeFileSync(join(OUT, file), bin);
  credits[id] = {
    file: `assets/photos/${file}`,
    title: picked.title,
    author: picked.author,
    licence: picked.licence,
    source: picked.page,
  };
  console.log(`${id.padEnd(24)} ${file.padEnd(28)} ${picked.licence} — ${picked.author.slice(0, 36)}`);
  saveCredits();
  await sleep(PAUSE);
}

saveCredits();
console.log(`\nSaved ${Object.keys(credits).length} photos + data/photo-credits.json`);

function saveCredits() {
  writeFileSync(
    join(ROOT, "data", "photo-credits.json"),
    JSON.stringify(
      {
        _README:
          "Photos pulled from Wikimedia Commons by tools/fetch-photos.mjs. Each licence requires the credit shown here to stay visible on the site (see the photo credits line in the footer). Replace these with Cricket dealer brand-kit images when they arrive.",
        updated: new Date().toISOString().slice(0, 10),
        credits,
      },
      null,
      2
    ) + "\n"
  );
}
