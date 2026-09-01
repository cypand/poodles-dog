'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setDisplayName(profile?.display_name ?? "Account");
      } else {
        setDisplayName(null);
      }
      setLoading(false);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-pd-black text-white">
      <div className="container-pd flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-black-bg.png"
            alt="POODLES.DOG"
            width={44}
            height={44}
            className="rounded-sm"
          />
          <div className="leading-tight">
            <div className="text-pd-gold font-bold tracking-wide text-sm">
              POODLES.DOG
            </div>
            <div className="text-[9px] tracking-[0.2em] text-white/60">
              FIND · CONNECT · LOVE
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-bold">
          <Link href="/search" className="text-pd-gold">
            FIND POODLES
          </Link>
          <Link href="/breeders" className="hover:text-pd-gold">
            BREEDERS
          </Link>
          <Link href="/post-a-listing" className="hover:text-pd-gold">
            POST A LISTING
          </Link>
          <Link href="/about" className="hover:text-pd-gold">
            ABOUT US
          </Link>
          <button className="flex items-center gap-1 hover:text-pd-gold">
            RESOURCES <ChevronDown size={14} />
          </button>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <button className="hidden sm:flex items-center gap-1 text-white/80 hover:text-white">
            EN <ChevronDown size={12} />
          </button>
          <Link href="/favorites" aria-label="Favorites">
            <Heart size={18} />
          </Link>

          {loading ? null : displayName ? (
            <>
              <span className="hidden sm:inline text-white/80 text-xs font-bold">
                Hi, {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="border border-white/30 px-4 py-2 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
              >
                LOG OUT
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-white/30 px-4 py-2 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
              >
                SIGN IN
              </Link>
              <Link
                href="/register"
                className="bg-pd-gold text-pd-black px-4 py-2 text-xs font-bold hover:bg-pd-gold-light"
              >
                SIGN UP
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
