# Best Wireless 1 — site build

Static site. No database, no WordPress, no monthly platform cost. Hosts free on
Netlify, Cloudflare Pages, or any normal web host via FTP.

## Try it now

```bash
npx serve .
```

Or any static file server. Open the address it prints. Everything works
offline except the store maps, which load from OpenStreetMap.

## What's here

| File | What it does |
|---|---|
| `data/stores.json` | **Every location.** The only file you edit to add or change a store. |
| `data/offers.json` | Every offer. Edit through `admin.html` rather than by hand. |
| `tools/build.mjs` | **The builder.** Regenerates all store pages, `stores.html`, `sitemap.xml`, `robots.txt`. |
| `tools/import-locations.mjs` | Rebuilds `data/stores.json` from the locations spreadsheet (save the .xls as CSV first). |
| `tools/geocode.mjs` | Looks up map coordinates for new store addresses and writes `data/geo.json`. |
| `data/geo.json` | Map coordinates per store, for distance sorting and the store maps. |
| `build.py` | The original Python builder, kept for reference. `tools/build.mjs` is what runs now. |
| `data/plans.json` | Plans, prices and comparison rows for `plans.html`, the homepage and the plan finder quiz. |
| `data/phones.json` | Phones, prices and phone deals for `phones.html` and the homepage. |
| `admin.html` | Offer manager. No code required. |
| `index.html` | Homepage: locator, featured deal, plan finder, plans, deals, phones. |
| `phones.html`, `plans.html`, `deals.html` | Shop pages. Content loads from the JSON files above. |
| `about.html`, `contact.html`, `careers.html` | Company pages. Search for `TODO` for details still to add. |
| `assets/js/config.js` | API keys and analytics IDs. |

Run this after any change to `data/stores.json`:

```bash
node tools/build.mjs
```

It rebuilds every store page, deletes pages for stores that were dropped, and
prints a report of what data is still missing. If you added a store, run
`node tools/geocode.mjs` first so it has map coordinates.

**Maps:** with no Google Maps key in `assets/js/config.js`, store pages embed
OpenStreetMap, which needs no key and costs nothing. Add a Google key and
rebuild to switch to Google Maps with your own place pins.

## Before this goes live

All 46 stores (32 NC, 14 VA) come from the client's locations spreadsheet:
addresses, ZIP codes, phone numbers, per-store hours and Google Place IDs.
Every store has map coordinates in `data/geo.json`.

1. **Nine missing Place IDs.** These stores were supplied with a short
   `maps.app.goo.gl` link instead of a full Google Maps link, so there is no
   Place ID to read: arden, charlotte, charlottesville-pantops-ctr,
   charlottesville-rio-hill, fayetteville, greensboro-battleground-ave,
   raeford, spring-lake, virginia-beach-holland-rd. Their coordinates are exact,
   so maps and directions work; what's missing is the Google reviews link.
2. **Five approximate pins:** chesapeake-sams-cir, albemarle, clyde,
   hillsborough, richmond-meadowdale-blvd matched at ZIP level, so the pin can
   be a street or two off. Fix by editing `data/geo.json`.
3. **Store photos** at `assets/images/stores/<slug>.jpg` (3:2 ratio), then set
   `"photo": true` for that store.
4. **Google Maps API key** into `assets/js/config.js`, then rebuild, to switch
   the maps from OpenStreetMap to Google. Restrict the key by HTTP referrer to
   `bestwireless1.com`.
5. **Cricket compliance review** of every offer disclaimer in `offers.json`.
6. **GA4, Meta, TikTok and Snapchat IDs** into `config.js`.

## When the locations list changes

The client sends an .xls of locations. Save it as CSV, then:

```bash
node tools/import-locations.mjs "locations.csv"
node tools/geocode.mjs
node tools/build.mjs
```

## Redirects from the old site

The old numbered URLs must 301 to the new slugs or you lose whatever ranking
they have. On Netlify, create a `_redirects` file:

```
/branches/1.html   /stores/durham-n-duke-st.html   301
/branches/2.html   /stores/durham-university-dr.html   301
```

...and so on for every old URL. On Apache, use `.htaccess` with `Redirect 301`.
Map each old branch page to the store page with the same address.

## Adding an offer

Open `admin.html`, fill the form, pick the channel, paste the Cricket-approved
disclaimer, download `offers.json`, upload it over the old one. Live immediately —
no rebuild needed, because offers load client-side.

**The channel flag matters.** `online_only` offers render without a store call-to-action
so you're never sending someone to a store for a deal it can't honor. Two of
Cricket's current five promos are online-exclusive.
