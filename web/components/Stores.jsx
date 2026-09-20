"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ---------- helpers ---------- */

const telHref = (phone) => "tel:+1" + String(phone).replace(/\D/g, "");

const directionsUrl = (s) =>
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(`${s.street}, ${s.city}, ${s.state} ${s.zip || ""}`.trim()) +
  (s.place_id ? `&destination_place_id=${encodeURIComponent(s.place_id)}` : "");

function minutesOf(t) {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

/** Open now / closed, worked out from the store's own hours in the browser. */
export function openState(hours, now = new Date()) {
  const span = (now.getDay() === 0 ? hours.sun : hours.mon_sat) || "";
  const [from, to] = span.split(" - ");
  const open = minutesOf(from);
  const close = minutesOf(to);
  if (open == null || close == null) return null;
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < open) return { open: false, text: `Opens at ${from}` };
  if (mins >= close) return { open: false, text: "Closed now" };
  return { open: true, text: `Open until ${to}` };
}

export function OpenBadge({ hours, className = "" }) {
  const [state, setState] = useState(null);
  // Opening hours depend on the visitor's clock, so work them out after hydration.
  useEffect(() => {
    setState(openState(hours));
  }, [hours]);
  if (!state) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        state.open ? "bg-brand-tint text-brand-deep" : "bg-[#fff3dc] text-[#8a5200]"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${state.open ? "bg-brand" : "bg-[#e09b00]"}`} />
      {state.text}
    </span>
  );
}

function miles(a, b) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ---------- one row in a list of stores ---------- */

export function StoreRow({ store, distance }) {
  return (
    <li className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
      <div className="grid h-12 w-14 shrink-0 place-items-center rounded bg-brand-tint text-center">
        {typeof distance === "number" ? (
          <span className="leading-none">
            <span className="block text-lg font-bold text-brand-deep tabular-nums">
              {distance.toFixed(1)}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">mi</span>
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-brand-deep" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold leading-tight">
          <Link href={`/stores/${store.slug}/`} className="text-ink no-underline hover:text-brand-dark hover:underline">
            Cricket Wireless {store.city} — {store.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          {store.street}, {store.city}, {store.state} {store.zip}
        </p>
        <OpenBadge hours={store.hours} className="mt-1.5" />
      </div>

      <div className="flex shrink-0 gap-2">
        <a
          href={telHref(store.phone)}
          aria-label={`Call the ${store.city} store at ${store.phone}`}
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-brand-deep no-underline hover:bg-brand hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z" />
          </svg>
        </a>
        <a
          href={directionsUrl(store)}
          target="_blank"
          rel="noopener"
          aria-label={`Directions to the ${store.city} store`}
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-brand-deep no-underline hover:bg-brand hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M21.7 11.3 12.7 2.3a1 1 0 0 0-1.4 0l-9 9a1 1 0 0 0 0 1.4l9 9a1 1 0 0 0 1.4 0l9-9a1 1 0 0 0 0-1.4zM13 15v-2.5h-2V15H9v-3.5c0-.8.7-1.5 1.5-1.5H13V7.5l3.5 3.5L13 15z" />
          </svg>
        </a>
      </div>
    </li>
  );
}

/* ---------- search + nearest list ---------- */

export function StoreFinder({ stores, limit = 4, showAllLink = true, heading = "Find a store near you" }) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState(null);
  const [status, setStatus] = useState("");
  const [touched, setTouched] = useState(false);

  const results = useMemo(() => {
    if (!origin) return stores.map((s) => ({ store: s, distance: null }));
    return stores
      .map((s) => ({ store: s, distance: s.coords ? miles(origin, s.coords) : null }))
      .sort((a, b) => {
        if (a.distance == null) return b.distance == null ? 0 : 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }, [stores, origin]);

  function search(event) {
    event.preventDefault();
    const needle = query.trim().toLowerCase();
    if (!needle) {
      setStatus("Enter a ZIP code or city.");
      return;
    }
    const matches = stores.filter(
      (s) => s.city.toLowerCase().startsWith(needle) || (s.zip && s.zip.startsWith(needle))
    );
    const anchor = matches.find((s) => s.coords);
    if (anchor) {
      setOrigin(anchor.coords);
      setStatus(`Showing stores near ${anchor.city}.`);
      setTouched(true);
      return;
    }
    setStatus(`No match for “${query}”. Try a city name or a ZIP code.`);
  }

  function locate() {
    if (!navigator.geolocation) {
      setStatus("This browser can't share your location. Enter a ZIP code instead.");
      return;
    }
    setStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("Showing the stores closest to you.");
        setTouched(true);
      },
      () => setStatus("Location access is off. Enter a ZIP code or city instead."),
      { timeout: 10000, maximumAge: 300000 }
    );
  }

  const shown = touched || limit === 0 ? results.slice(0, limit || results.length) : results.slice(0, limit);

  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <h2 className="text-xl font-bold">{heading}</h2>
        <p className="text-sm text-muted">
          {origin ? `${shown.length} of ${stores.length} stores, closest first` : `${stores.length} stores`}
        </p>
      </div>

      <form onSubmit={search} role="search" className="flex flex-wrap gap-2">
        <label htmlFor="store-search" className="sr-only">
          ZIP code or city
        </label>
        <input
          id="store-search"
          type="search"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Enter ZIP code or city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-[#cbd5dc] px-5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
        />
        <button type="submit" className="rounded-full bg-brand px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-brand-dark">
          Search
        </button>
        <button
          type="button"
          onClick={locate}
          className="rounded-full border border-[#c9d2d8] px-5 py-2.5 text-[15px] font-semibold text-ink hover:bg-ink hover:text-white"
        >
          Use my location
        </button>
      </form>

      <p role="status" aria-live="polite" className="mt-2 min-h-[1.4em] text-sm text-muted">
        {status}
      </p>

      <ul className="mt-2">
        {shown.map(({ store, distance }) => (
          <StoreRow key={store.slug} store={store} distance={distance} />
        ))}
      </ul>

      {showAllLink ? (
        <p className="mt-4">
          <Link href="/stores/" className="font-semibold text-brand-dark no-underline hover:underline">
            See all {stores.length} stores ›
          </Link>
        </p>
      ) : null}
    </div>
  );
}
