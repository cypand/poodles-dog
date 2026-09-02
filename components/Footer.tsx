import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

const columns = [
  {
    title: "USEFUL LINKS",
    links: ["Search Poodles", "Browse Breeders"],
  },
  {
    title: "FOR BREEDERS",
    links: ["Create Account", "Breeder Dashboard"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-pd-black text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold mb-3">poodles.dog</h3>
            <div className="flex gap-4 mt-4">
              <Facebook className="w-5 h-5" />
              <Instagram className="w-5 h-5" />
              <Youtube className="w-5 h-5" />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold tracking-wide mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} poodles.dog. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
