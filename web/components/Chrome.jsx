"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CRICKET = "https://www.cricketwireless.com";

const NAV = [
  ["/phones/", "Phones"],
  ["/plans/", "Plans"],
  ["/deals/", "Deals"],
  ["/stores/", "Stores"],
  ["/about/", "About"],
];

const UTILITY = [
  [CRICKET + "/map.html", "Coverage map"],
  [CRICKET + "/quickpay.html", "Pay bill"],
  [CRICKET + "/cwlogin.html", "My account"],
  ["https://espanol.cricketwireless.com/", "Español"],
];

export function PromoBar({ offer }) {
  if (!offer) return null;
  return (
    <div className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm">
        <span className="rounded-sm bg-gold px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-black">
          Deal
        </span>
        <strong className="font-semibold">{offer.headline}</strong>
        {offer.terms_short ? (
          <span className="text-xs text-white/80">{offer.terms_short}</span>
        ) : null}
        <Link href="/deals/" className="font-semibold underline underline-offset-4">
          See the deal
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname() || "/";
  return (
    <header>
      <div className="border-b border-line bg-[#f1f1f2] text-[13px]">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-end gap-x-5 gap-y-1 px-4 py-1.5">
          <Link href="/stores/" className="text-ink-soft hover:text-navy hover:underline">
            Find a store
          </Link>
          {UTILITY.map(([href, label]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener"
              className="text-ink-soft hover:text-navy hover:underline"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="grid h-10 w-10 place-items-center rounded bg-brand text-[13px] font-extrabold text-white">
              BW1
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold text-ink">Best Wireless 1</span>
              <span className="block text-[11px] text-muted">Cricket Wireless Authorized Retailer</span>
            </span>
          </Link>

          <nav aria-label="Main" className="order-3 -mx-1 w-full overflow-x-auto md:order-none md:ml-auto md:w-auto">
            <ul className="flex gap-1">
              {NAV.map(([href, label]) => {
                const active = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`block whitespace-nowrap rounded px-3 py-2 text-[15px] font-semibold no-underline ${
                        active ? "bg-brand-tint text-brand-deep" : "text-ink-soft hover:bg-shell hover:text-ink"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/stores/"
            className="ml-auto rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-dark md:ml-0"
          >
            Find a store
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const cols = [
    ["Shop", [["/phones/", "Phones"], ["/plans/", "Plans"], ["/deals/", "Deals"], [CRICKET + "/shop/bring-your-phone", "Bring your own phone"]]],
    ["Stores", [["/stores/", "All locations"], ["/stores/#nc", "North Carolina"], ["/stores/#va", "Virginia"]]],
    ["Company", [["/about/", "About us"], ["/careers/", "Careers"], ["/contact/", "Contact us"], ["/credits/", "Photo credits"]]],
    ["Cricket Wireless", [[CRICKET + "/quickpay.html", "Pay your bill"], [CRICKET + "/map.html", "Coverage map"], [CRICKET + "/support", "Cricket support"]]],
  ];
  return (
    <footer className="bg-navy text-[#c7dbef]">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cols.map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white">{title}</h3>
              <ul className="space-y-2 text-sm">
                {links.map(([href, label]) =>
                  href.startsWith("http") ? (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noopener" className="text-[#e3ecf0] no-underline hover:underline">
                        {label}
                      </a>
                    </li>
                  ) : (
                    <li key={label}>
                      <Link href={href} className="text-[#e3ecf0] no-underline hover:underline">
                        {label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-white/20 pt-6 text-xs leading-relaxed text-[#9fc0de]">
          Best Wireless 1, Inc. is an authorized retailer of Cricket Wireless. Cricket, Cricket Wireless and
          related marks are trademarks of AT&amp;T Intellectual Property. Offers, pricing and availability are set
          by Cricket Wireless and are subject to change without notice. Not all offers are available at every
          location. Coverage is not available everywhere. Device photographs are for illustration; see{" "}
          <Link href="/credits/" className="text-[#c7dbef] underline">photo credits</Link>. ©{" "}
          {new Date().getFullYear()} Best Wireless 1, Inc.
        </p>
      </div>
    </footer>
  );
}
