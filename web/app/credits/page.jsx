import Link from "next/link";
import { getPhotoCredits } from "@/lib/data";

export const metadata = {
  title: "Photo credits",
  description: "Attribution for the photography used on the Best Wireless 1 website.",
};

export default function CreditsPage() {
  const credits = Object.entries(getPhotoCredits());

  return (
    <>
      <section className="bg-brand py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/85">
            <Link href="/" className="text-white no-underline hover:underline">
              Home
            </Link>{" "}
            › Photo credits
          </nav>
          <h1 className="text-3xl font-bold sm:text-4xl">Photo credits</h1>
          <p className="mt-2 max-w-[60ch] text-lg text-white/95">
            Photography on this site is used under open licences, which require the credits below.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="max-w-[70ch] text-[17px] leading-relaxed text-ink-soft">
          Device photographs are for illustration. Colours, models and accessories in stock vary by store, so
          call ahead to check what is available.
        </p>

        <div className="mt-8 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[40rem] border-collapse text-[15px]">
            <thead>
              <tr className="bg-shell">
                <th scope="col" className="px-4 py-3 text-left font-bold">Used for</th>
                <th scope="col" className="px-4 py-3 text-left font-bold">Photograph</th>
                <th scope="col" className="px-4 py-3 text-left font-bold">Photographer</th>
                <th scope="col" className="px-4 py-3 text-left font-bold">Licence</th>
              </tr>
            </thead>
            <tbody>
              {credits.map(([id, c]) => (
                <tr key={id} className="border-t border-line align-top">
                  <td className="px-4 py-3">{id.replace(/-/g, " ")}</td>
                  <td className="px-4 py-3">
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noopener"
                      className="text-brand-dark no-underline hover:underline"
                    >
                      {c.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">{c.author}</td>
                  <td className="px-4 py-3 text-muted">{c.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-[70ch] text-xs leading-relaxed text-muted">
          Photographs sourced from Wikimedia Commons. Licence terms are linked from each photograph’s page.
          Cricket, Cricket Wireless and related marks are trademarks of AT&amp;T Intellectual Property.
        </p>
      </div>
    </>
  );
}
