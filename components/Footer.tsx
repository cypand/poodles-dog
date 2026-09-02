import Link from "next/link";

const columns = [
  {
    title: "USEFUL LINKS",
    links: [{ label: "Search Poodles", href: "/search" }],
  },
  {
    title: "FOR BREEDERS",
    links: [{ label: "Create Account", href: "/register" }],
  },
];

export default function Footer() {
  return (
    <footer className="bg-pd-black text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold mb-3">poodles.dog</h3>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold tracking-wide mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm text-gray-500">
          <span>© {new Date().getFullYear()} poodles.dog. All rights reserved.</span>
          <span className="hidden sm:inline">·</span>
          <Link href="/legal" className="hover:text-white transition-colors">
            Terms &amp; Privacy
          </Link>
          <span className="hidden sm:inline">·</span>
          <a
            href="mailto:legal@poodles.dog"
            className="hover:text-white transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
