import { Globe2, ShieldCheck, HeartPulse, PlaneTakeoff } from "lucide-react";

const items = [
  {
    icon: Globe2,
    title: "WORLDWIDE",
    desc: "Find Poodles from breeders around the globe",
  },
  {
    icon: ShieldCheck,
    title: "VERIFIED BREEDERS",
    desc: "Trusted breeders, real connections",
  },
  {
    icon: HeartPulse,
    title: "HEALTH FIRST",
    desc: "Health tested parents for healthier puppies",
  },
  {
    icon: PlaneTakeoff,
    title: "GLOBAL DELIVERY",
    desc: "Breeders who can assist with safe transport",
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-pd-cream pt-16 pb-10">
      <div className="container-pd grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3">
            <Icon className="text-pd-gold shrink-0" size={26} />
            <div>
              <div className="font-bold text-sm">{title}</div>
              <div className="text-xs text-pd-gray mt-1">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
