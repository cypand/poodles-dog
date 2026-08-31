import Image from "next/image";
import { Search, Plus, SlidersHorizontal } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-pd-black text-white">
      <div className="container-pd grid md:grid-cols-2 gap-8 items-center py-14">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Find your Poodle.
            <br />
            <span className="text-pd-gold">Anywhere in the world.</span>
          </h1>
          <p className="mt-4 text-white/70 max-w-md">
            The global marketplace for Poodle puppies and dogs from
            responsible breeders.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="bg-pd-gold text-pd-black font-bold text-sm px-6 py-3 flex items-center gap-2 hover:bg-pd-gold-light">
              FIND POODLES <Search size={16} />
            </button>
            <button className="border border-white/30 font-bold text-sm px-6 py-3 flex items-center gap-2 hover:border-pd-gold hover:text-pd-gold">
              POST A LISTING <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full">
          <div className="w-full h-full bg-pd-black-2 border border-white/10 flex items-center justify-center text-white/30 text-sm">
            Hero photo placeholder
          </div>
        </div>
      </div>

      <div className="container-pd -mb-10 relative z-10">
        <div className="bg-white text-pd-black p-5 shadow-xl grid sm:grid-cols-5 gap-4 items-end">
          <SearchField label="SIZE" placeholder="All Sizes" />
          <SearchField label="SEX" placeholder="Any" />
          <SearchField label="COLOUR" placeholder="Any Colour" />
          <SearchField label="COUNTRY" placeholder="Worldwide" icon />
          <button className="bg-pd-black text-white font-bold text-sm h-11 flex items-center justify-center gap-2 hover:bg-pd-black-2">
            SEARCH <Search size={16} />
          </button>
        </div>
        <button className="flex items-center gap-1 text-pd-gold text-xs font-bold mt-2">
          <SlidersHorizontal size={14} /> Advanced Filters
        </button>
      </div>
    </section>
  );
}

function SearchField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
  icon?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-wide text-pd-gray">
        {label}
      </span>
      <select className="border border-black/15 h-11 px-3 text-sm bg-white">
        <option>{placeholder}</option>
      </select>
    </label>
  );
}
