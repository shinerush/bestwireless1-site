# Best Wireless 1 — site build

Static site. No database, no WordPress, no monthly platform cost. Hosts free on
Netlify, Cloudflare Pages, or any normal web host via FTP.

## Try it now

```bash
cd bw1
python3 -m http.server 8000
```

Open `http://localhost:8000`. Everything works offline except the map iframes,
which need a Google Maps key.

## What's here

| File | What it does |
|---|---|
| `data/stores.json` | **Every location.** The only file you edit to add or change a store. |
| `data/offers.json` | Every offer. Edit through `admin.html` rather than by hand. |
| `build.py` | Regenerates all store pages, `stores.html`, `sitemap.xml`, `robots.txt`. |
| `admin.html` | Offer manager. No code required. |
| `index.html` | Homepage with the locator and offers. |
| `assets/js/config.js` | API keys and analytics IDs. |

Run `python3 build.py` after any change to `stores.json`. It prints a report of
exactly what data is still missing.

## Before this goes live

1. **Add the 12 Virginia stores** to `data/stores.json`.
2. **Real coordinates.** Current lat/lng are city-center approximations, so
   distance sorting is accurate to roughly 1–3 miles. Geocode the real addresses.
3. **Google Place IDs** for all 39. This unlocks correct map pins, reviews, and
   the Google Business Profile link. Find them at
   `https://developers.google.com/maps/documentation/places/web-service/place-id`.
4. **ZIP codes** — 26 of 27 are missing. Schema markup needs them.
5. **Verify hours per store.** Every store currently inherits Mon–Sat 10–8,
   Sun 12–6, which was only confirmed for the Duke Street location.
6. **Store photos** at `assets/images/stores/<slug>.jpg` (3:2 ratio), then set
   `"photo": true` for that store.
7. **Google Maps API key** into `assets/js/config.js`, and replace `YOUR_KEY`
   in `build.py`'s map iframe URL before rebuilding. Restrict the key by HTTP
   referrer to `bestwireless1.com`.
8. **Cricket compliance review** of every offer disclaimer in `offers.json`.
9. **GA4 and Meta Pixel IDs** into `config.js`.

## Redirects from the old site

The old numbered URLs must 301 to the new slugs or you lose whatever ranking
they have. On Netlify, create a `_redirects` file:

```
/branches/1.html   /stores/durham-n-duke-st.html   301
/branches/2.html   /stores/durham-university-dr.html   301
```

...and so on for all 27. On Apache, use `.htaccess` with `Redirect 301`.
`build.py` can generate this list if you want it automated.

## Adding an offer

Open `admin.html`, fill the form, pick the channel, paste the Cricket-approved
disclaimer, download `offers.json`, upload it over the old one. Live immediately —
no rebuild needed, because offers load client-side.

**The channel flag matters.** `online_only` offers render without a store call-to-action
so you're never sending someone to a store for a deal it can't honor. Two of
Cricket's current five promos are online-exclusive.
