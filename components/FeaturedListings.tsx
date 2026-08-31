import { Heart, ShieldCheck, ArrowRight } from "lucide-react";

const sampleListings = [
  {
    title: "Red Toy Poodle Puppies",
    size: "Toy Poodle",
    sex: "Female",
    colour: "Apricot / Red",
    country: "Spain",
    price: "€2,500",
    posted: "2 weeks ago",
  },
  {
    title: "Black Miniature Poodle",
    size: "Miniature Poodle",
    sex: "Male",
    colour: "Black",
    country: "Germany",
    price: "€1,800",
    posted: "1 week ago",
  },
  {
    title: "White Toy Poodle Puppies",
    size: "Toy Poodle",
    sex: "Male / Female",
    colour: "White",
    country: "USA",
    price: "$2,200",
    posted: "3 days ago",
  },
  {
    title: "Parti Miniature Poodles",
    size: "Miniature Poodle",
    sex: "Female",
    colour: "Parti",
    country: "Australia",
    price: "AUD $2,800",
    posted: "5 days ago",
  },
];

export default function FeaturedListings() {
  return (
    <section className="bg-pd-cream pb-16">
      <div className="container-pd">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">FEATURED LISTINGS</h2>
          <button className="text-pd-gold text-xs font-bold flex items-center gap-1">
            VIEW ALL LISTINGS <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sampleListings.map((l) => (
            <article
              key={l.title}
              className="bg-white border border-black/10 overflow-hidden group"
            >
              <div className="relative aspect-square bg-pd-black-2/5">
                <div className="w-full h-full flex items-center justify-center text-pd-gray text-xs">
                  Photo
                </div>
                <button
                  aria-label="Favorite"
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5"
                >
                  <Heart size={14} />
                </button>
                <span className="absolute bottom-2 left-2 bg-pd-black text-pd-gold text-[10px] font-bold px-2 py-1 flex items-center gap-1">
                  <ShieldCheck size={12} /> VERIFIED BREEDER
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm">{l.title}</h3>
                <p className="text-xs text-pd-gray mt-1">
                  {l.size} · {l.sex}
                </p>
                <p className="text-xs text-pd-gray">{l.colour}</p>
                <p className="text-xs text-pd-gray">{l.country}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm">{l.price}</span>
                  <span className="text-[10px] text-pd-gray">{l.posted}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
