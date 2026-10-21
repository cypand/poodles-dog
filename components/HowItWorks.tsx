import { Search, MessageCircle, Home, ClipboardCheck, ShieldAlert } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Browse",
    desc: "Search Poodles by size, colour, sex and location from breeders worldwide.",
  },
  {
    icon: MessageCircle,
    title: "2. Contact",
    desc: "Message the breeder directly through the site — no middleman, no agents.",
  },
  {
    icon: Home,
    title: "3. Welcome home",
    desc: "Agree the details directly with the breeder and bring your Poodle home.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-pd-cream py-16">
      <div className="container-pd">
        <h2 className="text-center font-bold text-xl mb-10">HOW IT WORKS</h2>

        <div className="grid sm:grid-cols-3 gap-8 mb-14">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center px-2">
              <Icon className="text-pd-gold mx-auto mb-3" size={28} />
              <h3 className="font-bold text-sm">{title}</h3>
              <p className="text-xs text-pd-gray mt-2">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white border border-pd-black/10 rounded-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="text-pd-gold" size={20} />
              <h3 className="font-bold text-sm">Breeder listings</h3>
            </div>
            <p className="text-xs text-pd-gray">
              Breeders go through a manual review before they can publish listings. Always ask
              breeders directly for health testing records and documentation before you decide.
            </p>
          </div>

          <div className="bg-white border border-pd-black/10 rounded-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="text-pd-gold" size={20} />
              <h3 className="font-bold text-sm">Buyer safety</h3>
            </div>
            <p className="text-xs text-pd-gray">
              Meet or video-call the breeder before paying anything, ask to see the puppy and its
              parents, and never send money to someone you haven&apos;t verified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
