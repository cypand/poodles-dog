import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-pd-black text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-1">poodles.dog</h3>
          <p className="text-sm text-gray-500">A community built for people who love Poodles.</p>
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
