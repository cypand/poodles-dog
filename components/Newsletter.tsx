import { Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="bg-pd-black text-white py-6">
      <div className="container-pd flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="text-pd-gold" size={22} />
          <div>
            <div className="font-bold text-sm">Join our community</div>
            <div className="text-xs text-white/60">
              Get tips, new listings and updates delivered to your inbox.
            </div>
          </div>
        </div>
        <form className="flex w-full md:w-auto gap-2">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 md:w-64 bg-transparent border border-white/25 px-4 py-2 text-sm placeholder:text-white/40"
          />
          <button
            type="submit"
            className="bg-pd-gold text-pd-black font-bold text-xs px-5 py-2 hover:bg-pd-gold-light"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
    </section>
  );
}
