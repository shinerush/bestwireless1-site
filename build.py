#!/usr/bin/env python3
"""
Best Wireless 1 site generator.

Reads data/stores.json and writes:
  stores/<slug>.html   one SEO-complete page per location
  stores.html          the all-locations index
  sitemap.xml          every URL

Run after any edit to stores.json:
    python3 build.py

It also prints a data-quality report telling you exactly which fields are
still missing before launch.
"""

import json
import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.bestwireless1.com"

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600'
         '&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap" rel="stylesheet">')


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def masthead(prefix):
    return f'''<header class="masthead">
  <div class="wrap">
    <a class="brand" href="{prefix}index.html">Best Wireless 1<span>Cricket Wireless Authorized Retailer</span></a>
    <nav aria-label="Main">
      <ul>
        <li><a href="{prefix}stores.html">Stores</a></li>
        <li><a href="{prefix}index.html#offers">Deals</a></li>
        <li><a href="{prefix}about.html">About</a></li>
      </ul>
    </nav>
  </div>
</header>'''


def footer(prefix):
    return f'''<footer class="foot">
  <div class="wrap">
    <div class="foot-cols">
      <div><h3>Stores</h3><ul>
        <li><a href="{prefix}stores.html">All locations</a></li>
        <li><a href="{prefix}stores.html#nc">North Carolina</a></li>
        <li><a href="{prefix}stores.html#va">Virginia</a></li>
      </ul></div>
      <div><h3>Company</h3><ul>
        <li><a href="{prefix}about.html">About us</a></li>
        <li><a href="{prefix}careers.html">Apply for a job</a></li>
        <li><a href="{prefix}contact.html">Contact us</a></li>
      </ul></div>
      <div><h3>Cricket Wireless</h3><ul>
        <li><a href="https://www.cricketwireless.com/quickpay.html" rel="noopener">Pay your bill</a></li>
        <li><a href="https://www.cricketwireless.com/map.html" rel="noopener">Coverage map</a></li>
        <li><a href="https://www.cricketwireless.com/support" rel="noopener">Cricket support</a></li>
      </ul></div>
    </div>
    <p class="fineprint">
      Best Wireless 1, Inc. is an authorized retailer of Cricket Wireless. Cricket, Cricket Wireless and
      related marks are trademarks of AT&amp;T Intellectual Property. Offers, pricing and availability are
      set by Cricket Wireless and are subject to change without notice. Not all offers are available at
      every location. Coverage is not available everywhere.
      &copy; {date.today().year} Best Wireless 1, Inc.
    </p>
  </div>
</footer>'''


def schema(s, hours):
    d = {
        "@context": "https://schema.org",
        "@type": "MobilePhoneStore",
        "name": f"Cricket Wireless Authorized Retailer - {s['city']} ({s['name']})",
        "image": f"{SITE}/assets/images/stores/{s['slug']}.jpg",
        "url": f"{SITE}/stores/{s['slug']}.html",
        "telephone": s["phone"],
        "parentOrganization": {"@type": "Organization", "name": "Best Wireless 1, Inc."},
        "address": {
            "@type": "PostalAddress",
            "streetAddress": s["street"],
            "addressLocality": s["city"],
            "addressRegion": s["state"],
            "postalCode": s.get("zip", ""),
            "addressCountry": "US",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": s["lat"], "longitude": s["lng"]},
        "openingHoursSpecification": [
            {"@type": "OpeningHoursSpecification",
             "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
             "opens": "10:00", "closes": "20:00"},
            {"@type": "OpeningHoursSpecification",
             "dayOfWeek": "Sunday", "opens": "12:00", "closes": "18:00"},
        ],
        "priceRange": "$$",
    }
    if s.get("place_id"):
        d["hasMap"] = f"https://www.google.com/maps/place/?q=place_id:{s['place_id']}"
    return json.dumps(d, indent=2)


def store_page(s, hours):
    tel = "+1" + re.sub(r"\D", "", s["phone"])
    addr_q = f"{s['street']}, {s['city']}, {s['state']} {s.get('zip','')}".strip()
    title = f"Cricket Wireless {s['city']}, {s['state']} \u2014 {s['street']} | Best Wireless 1"
    desc = (f"Cricket Wireless Authorized Retailer at {s['street']}, {s['city']}, {s['state']}. "
            f"Phones, plans, activations and bill pay. Open Mon\u2013Sat {hours['mon_sat']}. "
            f"Call {s['phone']}.")

    if s.get("place_id"):
        mapsrc = f"https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=place_id:{s['place_id']}"
    else:
        mapsrc = ("https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q="
                  + addr_q.replace(" ", "+").replace(",", "%2C"))

    dir_url = ("https://www.google.com/maps/dir/?api=1&destination="
               + addr_q.replace(" ", "+").replace(",", "%2C")
               + (f"&destination_place_id={s['place_id']}" if s.get("place_id") else ""))

    photo = (f'<img class="storephoto" src="../assets/images/stores/{s["slug"]}.jpg" '
             f'alt="The Best Wireless 1 Cricket Wireless store at {esc(s["street"])} in {esc(s["city"])}">'
             if s.get("photo") else
             '<div class="photo-placeholder">Store photo goes here.<br>'
             f'Drop a JPG at assets/images/stores/{s["slug"]}.jpg and set "photo": true in stores.json.</div>')

    gbp = (f'<p class="gbp-note">Reviews and live hours pull from this store\u2019s Google Business Profile '
           f'once a Place ID is added to stores.json.</p>' if not s.get("place_id") else
           f'<p class="gbp-note"><a href="https://www.google.com/maps/place/?q=place_id:{s["place_id"]}" '
           f'target="_blank" rel="noopener">See reviews and photos on Google</a></p>')

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}/stores/{s['slug']}.html">
<meta property="og:type" content="business.business">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE}/stores/{s['slug']}.html">
<meta property="og:image" content="{SITE}/assets/images/stores/{s['slug']}.jpg">
{FONTS}
<link rel="stylesheet" href="../assets/css/main.css">
<script type="application/ld+json">
{schema(s, hours)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{masthead("../")}

<main id="main">
  <section class="store-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> &rsaquo;
        <a href="../stores.html">Stores</a> &rsaquo;
        {esc(s['state'])} &rsaquo; {esc(s['city'])}
      </nav>
      <h1>Cricket Wireless in {esc(s['city'])}, {esc(s['state'])}</h1>
      <p class="addr">{esc(s['street'])}{(' &middot; ' + esc(s['zip'])) if s.get('zip') else ''}</p>
      <div class="cta-row">
        <a class="btn" href="tel:{tel}">Call {esc(s['phone'])}</a>
        <a class="btn btn-amber" href="{dir_url}" target="_blank" rel="noopener">Get directions</a>
      </div>
    </div>
  </section>

  <div class="wrap detail-grid">
    <div class="panel">
      {photo}
      <h2>Store information</h2>
      <table class="hours">
        <caption class="skip">Opening hours</caption>
        <tbody>
          <tr><th scope="row">Monday to Saturday</th><td>{esc(hours['mon_sat'])}</td></tr>
          <tr><th scope="row">Sunday</th><td>{esc(hours['sun'])}</td></tr>
          <tr><th scope="row">Phone</th><td><a href="tel:{tel}">{esc(s['phone'])}</a></td></tr>
        </tbody>
      </table>
      {gbp}
    </div>

    <div class="panel">
      <h2>Find us</h2>
      <iframe class="mapframe" src="{mapsrc}" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Map showing the Best Wireless 1 store in {esc(s['city'])}, {esc(s['state'])}"></iframe>
    </div>
  </div>

  <section class="offers">
    <div class="wrap">
      <h2>Deals at our {esc(s['city'])} store</h2>
      <p class="sub">Call ahead to confirm stock. Offers are set by Cricket Wireless and can change without notice.</p>
      <div data-offers="instore" data-cta-href="tel:{tel}" data-cta-label="Call this store"></div>
    </div>
  </section>

  <section class="nearby">
    <div class="wrap">
      <h2>Other stores near {esc(s['city'])}</h2>
      <ul class="store-list" id="store-list"></ul>
      <p class="results-count" id="store-count"></p>
    </div>
  </section>
</main>

{footer("../")}

<script src="../assets/js/config.js"></script>
<script>
  window.BW1_CONFIG.dataBase = "../data/";
  window.BW1_CONFIG.storeBase = "./";
  window.BW1_ORIGIN = {{ lat: {s['lat']}, lng: {s['lng']} }};
  window.BW1_SLUG = "{s['slug']}";
</script>
<script src="../assets/js/locator.js"></script>
<script src="../assets/js/offers.js"></script>
</body>
</html>
'''


def stores_index(stores, hours):
    by_state = {}
    for s in stores:
        by_state.setdefault(s["state"], []).append(s)

    blocks = []
    names = {"NC": "North Carolina", "VA": "Virginia"}
    for st in sorted(by_state):
        rows = []
        for s in sorted(by_state[st], key=lambda x: (x["city"], x["name"])):
            tel = "+1" + re.sub(r"\D", "", s["phone"])
            rows.append(f'''<li class="store-row">
  <div class="store-dist" data-empty="true">&mdash;</div>
  <div class="store-meta">
    <h3><a href="stores/{s['slug']}.html">Cricket Wireless {esc(s['city'])} &mdash; {esc(s['name'])}</a></h3>
    <p>{esc(s['street'])}, {esc(s['city'])}, {esc(s['state'])} {esc(s.get('zip',''))}</p>
  </div>
  <div class="store-actions">
    <a class="iconlink" href="tel:{tel}" aria-label="Call the {esc(s['city'])} store">&#9742;</a>
  </div>
</li>''')
        blocks.append(f'''<section class="results" id="{st.lower()}">
  <div class="wrap">
    <div class="results-head">
      <h2>{names.get(st, st)}</h2>
      <p class="results-count">{len(by_state[st])} stores</p>
    </div>
    <ul class="store-list">
      {"".join(rows)}
    </ul>
  </div>
</section>''')

    title = "All Cricket Wireless Store Locations in NC &amp; VA | Best Wireless 1"
    desc = (f"Every Best Wireless 1 Cricket Wireless Authorized Retailer location. "
            f"{len(stores)} stores with addresses, phone numbers, hours and directions.")

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}/stores.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE}/stores.html">
{FONTS}
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{masthead("")}
<main id="main">
  <section class="finder">
    <div class="wrap">
      <h1>All our stores</h1>
      <p class="lede">{len(stores)} Cricket Wireless locations. Search by ZIP or let your phone find the closest one.</p>
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
      <ul class="store-list" id="store-list"></ul>
    </div>
  </section>

  {"".join(blocks)}
</main>
{footer("")}
<script src="assets/js/config.js"></script>
<script src="assets/js/locator.js"></script>
<script>
  // Reveal the "closest to you" band once a result set exists.
  var band = document.getElementById('nearest');
  new MutationObserver(function () {{
    if (document.getElementById('store-list').children.length) band.hidden = false;
  }}).observe(document.getElementById('store-list'), {{ childList: true }});
</script>
</body>
</html>
'''


def sitemap(stores):
    urls = [f"{SITE}/", f"{SITE}/stores.html", f"{SITE}/about.html", f"{SITE}/contact.html"]
    urls += [f"{SITE}/stores/{s['slug']}.html" for s in stores]
    today = date.today().isoformat()
    body = "".join(
        f"  <url><loc>{u}</loc><lastmod>{today}</lastmod>"
        f"<priority>{'1.0' if u.endswith('/') else '0.8'}</priority></url>\n" for u in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"{body}</urlset>\n")


def main():
    with open(os.path.join(ROOT, "data", "stores.json")) as f:
        data = json.load(f)

    hours = data["_defaults"]["hours"]
    stores = [s for s in data["stores"] if s.get("advertised")]

    os.makedirs(os.path.join(ROOT, "stores"), exist_ok=True)
    for s in stores:
        with open(os.path.join(ROOT, "stores", s["slug"] + ".html"), "w") as f:
            f.write(store_page(s, hours))

    with open(os.path.join(ROOT, "stores.html"), "w") as f:
        f.write(stores_index(stores, hours))

    with open(os.path.join(ROOT, "sitemap.xml"), "w") as f:
        f.write(sitemap(stores))

    with open(os.path.join(ROOT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")

    # ---- data quality report ----
    no_zip = [s["slug"] for s in stores if not s.get("zip")]
    no_pid = [s["slug"] for s in stores if not s.get("place_id")]
    no_geo = [s["slug"] for s in stores if not s.get("geo_verified")]
    no_pic = [s["slug"] for s in stores if not s.get("photo")]

    print(f"Built {len(stores)} store pages + stores.html + sitemap.xml + robots.txt\n")
    print("BEFORE LAUNCH, FILL THESE IN data/stores.json")
    print("-" * 52)
    print(f"  Missing ZIP code ........ {len(no_zip):>2} stores")
    print(f"  Missing Place ID ........ {len(no_pid):>2} stores   <- blocks reviews + correct map pin")
    print(f"  Unverified coordinates .. {len(no_geo):>2} stores   <- distance sort is approximate")
    print(f"  Missing photo ........... {len(no_pic):>2} stores")
    print(f"\n  Virginia locations ...... 12 not yet supplied")
    print(f"\n  Also: paste a Google Maps key into assets/js/config.js and")
    print(f"  replace YOUR_KEY in the generated map iframes.")


if __name__ == "__main__":
    main()
