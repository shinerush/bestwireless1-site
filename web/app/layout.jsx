import "./globals.css";
import { Footer, Header, PromoBar } from "@/components/Chrome";
import { getInStoreOffers, SITE } from "@/lib/data";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Cricket Wireless Stores in NC & VA | Best Wireless 1",
    template: "%s | Best Wireless 1",
  },
  description:
    "Best Wireless 1 is a Cricket Wireless Authorized Retailer with 46 stores across North Carolina and Virginia. Find your nearest store, compare plans, shop phones and see current deals.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  const offer = getInStoreOffers()[0] ?? null;
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        <PromoBar offer={offer} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
