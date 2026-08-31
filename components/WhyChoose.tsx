import {
  Search,
  ShieldCheck,
  Users,
  FileHeart,
  Globe2,
  Heart,
} from "lucide-react";

const items = [
  {
    icon: Search,
    title: "EASY TO FIND",
    desc: "Powerful search and filters to find your perfect Poodle.",
  },
  {
    icon: ShieldCheck,
    title: "SAFE & SECURE",
    desc: "We prioritize your safety and the well being of the dogs.",
  },
  {
    icon: Users,
    title: "DIRECT CONTACT",
    desc: "Connect directly with breeders worldwide.",
  },
  {
    icon: FileHeart,
    title: "HEALTH & QUALITY",
    desc: "Focus on responsible breeding and health testing.",
  },
  {
    icon: Globe2,
    title: "WORLDWIDE OPTIONS",
    desc: "Find Poodles locally or get assistance with transport.",
  },
  {
    icon: Heart,
    title: "MADE FOR POODLE LOVERS",
    desc: "A community built for people who love Poodles.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-white py-16 border-y border-black/5">
      <div className="container-pd">
        <h2 className="text-center font-bold text-xl mb-10">
          WHY CHOOSE <span className="text-pd-gold">POODLES.DOG</span>?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center px-2">
              <Icon className="text-pd-gold mx-auto mb-3" size={28} />
              <h3 className="font-bold text-sm">{title}</h3>
              <p className="text-xs text-pd-gray mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
