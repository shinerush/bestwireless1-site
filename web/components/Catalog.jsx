"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const usd = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- plans ---------- */

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-brand-deep" strokeWidth="2.2" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlanCard({ plan, prepaid = false }) {
  return (
    <li className="relative flex flex-col overflow-hidden rounded-lg border border-line bg-white p-6 hover:border-brand">
      <span className={`absolute inset-x-0 top-0 h-1.5 ${prepaid ? "bg-gold" : "bg-brand"}`} />
      {plan.new_lines_only ? (
        <span className="mb-2 self-start rounded-full bg-shell px-2.5 py-0.5 text-[11px] font-bold text-muted">
          New lines only
        </span>
      ) : null}
      {prepaid ? (
        <span className="mb-2 self-start rounded-full bg-[#fff1cc] px-2.5 py-0.5 text-[11px] font-bold text-[#7a5200]">
          Pay upfront, save
        </span>
      ) : null}
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <p className="mt-2 flex items-start leading-none">
        <span className="text-4xl font-bold tracking-tight">${prepaid ? plan.per_month : plan.autopay_price}</span>
        <span className="ml-1 mt-2 font-semibold text-muted">/mo.</span>
      </p>
      <p className="mt-2 text-sm text-muted">
        {prepaid
          ? `$${plan.total} paid upfront for ${plan.months} months.`
          : `With AutoPay. $${plan.first_month} first month.`}
      </p>
      <ul className="my-5 space-y-2 border-t border-line pt-4 text-[15px] text-ink-soft">
        {plan.highlights.map((h) => (
          <li key={h} className="flex gap-2">
            <Check />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/stores/"
        className="mt-auto rounded-full bg-brand px-5 py-2.5 text-center text-[15px] font-semibold text-white no-underline hover:bg-brand-dark"
      >
        Get it in store
      </Link>
    </li>
  );
}

export function PlanGrid({ plans, prepaid = false }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} prepaid={prepaid} />
      ))}
    </ul>
  );
}

export function PlanCompare({ monthly }) {
  const rows = [
    ["Price with AutoPay", (p) => `$${p.autopay_price}/mo.`],
    ["First month", (p) => `$${p.first_month}`],
    ["High-speed data", (p) => p.compare.data],
    ["Mobile hotspot", (p) => p.compare.hotspot],
    ["Streaming", (p) => p.compare.streaming],
    ["Cloud storage", (p) => p.compare.cloud],
    ["International", (p) => p.compare.international],
    ["Who can get it", (p) => (p.new_lines_only ? "New lines only" : "New and existing customers")],
  ];
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[46rem] border-collapse text-[15px]">
        <caption className="sr-only">Compare Cricket Wireless monthly plans</caption>
        <thead>
          <tr className="bg-shell">
            <th scope="col" className="px-4 py-3 text-left" />
            {monthly.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-3 text-left font-bold">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-t border-line">
              <th scope="row" className="w-48 px-4 py-3 text-left font-semibold text-muted">
                {label}
              </th>
              {monthly.map((p) => {
                const v = value(p);
                return (
                  <td key={p.id} className={`px-4 py-3 align-top ${v === "Not included" ? "text-[#a3b0b8]" : ""}`}>
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- plan finder ---------- */

const QUESTIONS = [
  { key: "usage", legend: "How do you use your phone most?", options: [["light", "Calls, texts, some browsing"], ["everyday", "Social, music, maps every day"], ["heavy", "Streaming and gaming a lot"]] },
  { key: "hotspot", legend: "Do you share your connection with a laptop or tablet?", options: [["none", "Never"], ["some", "Sometimes"], ["lots", "All the time"]] },
  { key: "intl", legend: "Do you call or text outside the U.S.?", options: [["none", "No"], ["mxca", "Mexico or Canada"], ["world", "Other countries"]] },
  { key: "pay", legend: "How would you like to pay?", options: [["monthly", "Month to month"], ["upfront", "Pay upfront to save"]] },
];

function recommend(a, plans) {
  const all = [...plans.monthly, ...plans.prepaid];
  const find = (id) => all.find((p) => p.id === id);
  const why = [];
  let id;

  if (a.hotspot === "lots" || (a.usage === "heavy" && a.hotspot === "some")) {
    id = "supreme-unlimited";
    why.push("The biggest hotspot allowance for your laptop or tablet", "Unlimited high-speed data for heavy streaming", "HBO Max Basic with Ads is included");
  } else if (a.intl === "world" || a.hotspot === "some") {
    id = "smart-unlimited";
    if (a.intl === "world") why.push("Unlimited texts from the U.S. to 200+ countries");
    if (a.hotspot === "some") why.push("15GB of hotspot for when you need it");
    why.push("Unlimited data plus 100GB of cloud storage");
  } else if (a.pay === "upfront") {
    id = "twelve-month-unlimited";
    why.push("The lowest monthly cost when you pay for the year upfront", "Unlimited data with no monthly bill to remember", "Want a shorter commitment? Ask about the 3-month plan");
  } else if (a.usage === "light" && a.intl === "none") {
    id = "sensible-10gb";
    why.push("10GB covers calls, texts, browsing and light social", "Our lowest-priced monthly plan");
  } else {
    id = "select-unlimited";
    why.push("Unlimited data at a low monthly price");
    if (a.intl === "mxca") why.push("Calls and texts to Mexico & Canada");
    why.push("Already a Cricket customer? Select is for new lines, so ask about Smart Unlimited");
  }
  if (a.pay === "upfront" && !id.includes("month-unlimited")) {
    why.push("Paying upfront? Ask in store whether a 3- or 12-month plan fits your needs");
  }
  return { plan: find(id), why, prepaid: id.includes("month-unlimited") };
}

export function PlanFinder({ plans }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (QUESTIONS.some((q) => !answers[q.key])) {
      setError(`Answer all ${QUESTIONS.length} questions to see your match.`);
      return;
    }
    setError("");
    setResult(recommend(answers, plans));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <form onSubmit={submit} noValidate className="rounded-lg border border-line bg-white p-6">
        {QUESTIONS.map((q, i) => (
          <fieldset key={q.key} className="mb-6 border-0 p-0">
            <legend className="mb-2 font-bold">
              {i + 1}. {q.legend}
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.options.map(([value, label]) => {
                const id = `pf-${q.key}-${value}`;
                const checked = answers[q.key] === value;
                return (
                  <span key={value}>
                    <input
                      type="radio"
                      id={id}
                      name={q.key}
                      value={value}
                      checked={checked}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.key]: value }))}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={id}
                      className="cursor-pointer rounded-full border-[1.5px] border-line bg-white px-4 py-2 text-[15px] hover:border-brand peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold"
                    >
                      {label}
                    </label>
                  </span>
                );
              })}
            </div>
          </fieldset>
        ))}
        <button type="submit" className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark">
          Show my plan
        </button>
        <p className="mt-3 min-h-[1.3em] text-sm text-[#b45309]">{error}</p>
      </form>

      <div aria-live="polite">
        {result ? (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-brand">Your best match</p>
            <ul className="grid">
              <PlanCard plan={result.plan} prepaid={result.prepaid} />
            </ul>
            <div className="rounded-b-lg bg-brand-tint px-6 py-5">
              <h3 className="mb-2 font-bold">Why this plan</h3>
              <ul className="space-y-2 text-[15px] text-ink-soft">
                {result.why.map((w) => (
                  <li key={w} className="flex gap-2">
                    <Check />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
              <Link href="/plans/#compare" className="mt-3 inline-block font-semibold text-brand-dark no-underline hover:underline">
                Compare every plan ›
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-shell p-6 text-[15px] text-muted">
            Answer the four questions and we’ll point you at the plan that fits, with the reasons why.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- phones ---------- */

const BRAND_FILTERS = [
  ["all", "All"],
  ["Apple", "Apple"],
  ["Samsung", "Samsung"],
  ["Motorola", "Motorola"],
  ["watch", "Watches"],
];

function deviceArt(phone, base) {
  const file =
    phone.type === "watch"
      ? "watch"
      : ["Apple", "Samsung", "Motorola"].includes(phone.brand)
        ? phone.brand.toLowerCase()
        : "generic";
  return `${base}/assets/img/device-${file}.svg`;
}

export function PhoneGrid({ phones, limit = 0, controls = false, assetBase = "" }) {
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState("featured");

  const list = useMemo(() => {
    let out = phones.filter((p) =>
      brand === "all" ? true : brand === "watch" ? p.type === "watch" : p.brand === brand
    );
    out = [...out].sort((a, b) => {
      if (sort === "featured") return (a.priority || 99) - (b.priority || 99);
      const pa = a.price ?? Infinity;
      const pb = b.price ?? Infinity;
      if (pa === pb) return (a.priority || 99) - (b.priority || 99);
      return sort === "low" ? pa - pb : pb === Infinity ? -1 : pa === Infinity ? 1 : pb - pa;
    });
    return limit ? out.slice(0, limit) : out;
  }, [phones, brand, sort, limit]);

  return (
    <div>
      {controls ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter by brand" className="flex flex-wrap gap-2">
            {BRAND_FILTERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={brand === value}
                onClick={() => setBrand(value)}
                className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold ${
                  brand === value ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="text-sm text-muted">
            Sort{" "}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-1 rounded-full border-[1.5px] border-line bg-white px-3 py-2 text-ink"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <li key={p.id} className="flex flex-col rounded-lg border border-line bg-white p-4 hover:border-brand">
            <div className="mb-3 grid aspect-[4/3] place-items-center overflow-hidden rounded border border-line bg-[#f4f6f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={deviceArt(p, assetBase)} alt={p.name} loading="lazy" className="h-[78%] w-[62%] object-contain" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">{p.brand}</p>
            <h3 className="mt-0.5 text-[17px] font-bold">{p.name}</h3>
            {p.price != null ? (
              <p className="mt-2 text-xl font-bold">{usd(p.price)}</p>
            ) : !p.deal ? (
              <p className="mt-2 font-semibold text-muted">Ask in store for pricing</p>
            ) : null}

            {p.deal ? (
              <div className={`mt-3 rounded p-3 ${p.deal.channel === "online_only" ? "bg-shell" : "bg-brand-tint"}`}>
                <span className="mb-1 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-ink-soft">
                  {p.deal.channel === "online_only" ? "Online only" : "In store deal"}
                </span>
                <p className="text-sm leading-snug text-ink-soft">{p.deal.text}</p>
              </div>
            ) : null}

            {p.deal?.channel === "online_only" ? (
              <a
                href="https://www.cricketwireless.com/shop/all-devices"
                target="_blank"
                rel="noopener"
                className="mt-auto rounded-full border-[1.5px] border-[#c9d2d8] px-4 py-2.5 text-center text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-white"
              >
                See deal on cricketwireless.com
              </a>
            ) : (
              <Link
                href="/stores/"
                className="mt-auto rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white no-underline hover:bg-brand-dark"
              >
                Check stock at a store
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- deals ---------- */

export function DealGrid({ offers, ctaHref = "/stores/", ctaLabel = "Find your store" }) {
  const LABEL = {
    in_store: "Available in our stores",
    both: "In store or online",
    online_only: "Online only at cricketwireless.com",
  };
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {offers.map((o) => (
        <li key={o.id} className="relative flex flex-col overflow-hidden rounded-lg border border-line bg-white p-5">
          <span className={`absolute inset-x-0 top-0 h-1 ${o.channel === "online_only" ? "bg-[#c9d2d8]" : "bg-brand"}`} />
          <span
            className={`mb-3 self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              o.channel === "online_only" ? "border border-line bg-shell text-muted" : "bg-brand-tint text-brand-deep"
            }`}
          >
            {LABEL[o.channel] ?? o.channel}
          </span>
          <h3 className="text-xl font-bold">{o.headline}</h3>
          <p className="mt-2 text-[15px] text-ink-soft">{o.detail}</p>
          {o.terms_short ? <p className="mt-2 text-[13px] text-muted">{o.terms_short}</p> : null}
          {o.channel !== "online_only" && ctaHref ? (
            ctaHref.startsWith("tel:") ? (
              <a href={ctaHref} className="mt-4 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-brand-dark">
                {ctaLabel}
              </a>
            ) : (
              <Link href={ctaHref} className="mt-4 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-brand-dark">
                {ctaLabel}
              </Link>
            )
          ) : null}
          {o.disclaimer ? (
            <details className="mt-auto pt-4 text-[13px]">
              <summary className="cursor-pointer font-medium text-muted">Offer details and restrictions</summary>
              <p className="mt-2 text-xs leading-relaxed text-muted">{o.disclaimer}</p>
            </details>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
