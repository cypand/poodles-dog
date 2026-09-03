'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ChevronDown, MessageSquare, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import IdleTimeout from "@/components/IdleTimeout";

const SIZE_OPTIONS = [
  { code: 'TOY', label: 'Toy (24–28cm)' },
  { code: 'MINIATURE', label: 'Miniature (28–35cm)' },
  { code: 'MEDIUM', label: 'Medium (35–45cm)' },
  { code: 'STANDARD', label: 'Standard (45–60cm)' },
]

const SEX_OPTIONS = [
  { code: 'MALE', label: 'Male' },
  { code: 'FEMALE', label: 'Female' },
]

const REGION_OPTIONS = [
  { code: 'EUROPE', label: 'Europe' },
  { code: 'UK', label: 'UK' },
  { code: 'NORTH_AMERICA', label: 'North America' },
  { code: 'SOUTH_AMERICA', label: 'South America' },
  { code: 'ASIA', label: 'Asia' },
  { code: 'AFRICA', label: 'Africa' },
  { code: 'OCEANIA', label: 'Oceania' },
  { code: 'WORLDWIDE', label: 'Worldwide' },
]

type Colour = { code: string; label: string }
type Country = { code: string; name: string }
type PresenceUser = { id: string; name: string }

export default function Header() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingListingsCount, setPendingListingsCount] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [colours, setColours] = useState<Colour[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSexes, setSelectedSexes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [openPanel, setOpenPanel] = useState<'size' | 'sex' | 'colour' | 'location' | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [todayUsers, setTodayUsers] = useState<PresenceUser[]>([]);

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  const isStaff = isAdmin || isModerator;
  const canPostListing = role === "breeder" || role === "admin";

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", user.id)
          .single();
        setDisplayName(profile?.display_name ?? "Account");
        setRole(profile?.role ?? null);

        const { data: convos } = await supabase
          .from("conversations")
          .select("id")
          .or(`buyer_id.eq.${user.id},breeder_id.eq.${user.id}`);

        const convoIds = (convos ?? []).map((c) => c.id);

        if (convoIds.length > 0) {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", convoIds)
            .eq("read", false)
            .neq("sender_id", user.id);
          setUnreadCount(count ?? 0);
        } else {
          setUnreadCount(0);
        }

        if (profile?.role === "admin" || profile?.role === "moderator") {
          const { count: pendingListings } = await supabase
            .from("listings")
            .select("id", { count: "exact", head: true })
            .eq("status", "PENDING");
          setPendingListingsCount(pendingListings ?? 0);

          const { count: pendingReports } = await supabase
            .from("reports")
            .select("id", { count: "exact", head: true })
            .eq("status", "PENDING");
          setPendingReportsCount(pendingReports ?? 0);

          const { count: pendingRequests } = await supabase
            .from("role_change_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "PENDING");
          setPendingRequestsCount(pendingRequests ?? 0);

          const { count: pendingVerifications } = await supabase
            .from("breeder_profiles")
            .select("id", { count: "exact", head: true })
            .eq("verification_status", "pending");
          setPendingVerificationsCount(pendingVerifications ?? 0);
        }
      } else {
        setDisplayName(null);
        setRole(null);
        setUnreadCount(0);
        setPendingListingsCount(0);
        setPendingReportsCount(0);
        setPendingRequestsCount(0);
        setPendingVerificationsCount(0);
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const ping = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('user_presence').upsert({ user_id: user.id, last_seen: new Date().toISOString() });
    };

    ping();
    interval = setInterval(ping, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const loadPresence = async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: presenceRows } = await supabase
        .from('user_presence')
        .select('user_id, last_seen')
        .gte('last_seen', fiveMinAgo);

      const onlineIds = (presenceRows ?? []).map((p) => p.user_id);
      if (onlineIds.length > 0) {
        const { data: onlineProfiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', onlineIds);
        setOnlineUsers((onlineProfiles ?? []).map((p) => ({ id: p.id, name: p.display_name ?? 'Unnamed' })));
      } else {
        setOnlineUsers([]);
      }

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin-users?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const todayStr = new Date().toDateString();
        const todayList = (json.users ?? [])
          .filter((u: { last_sign_in_at: string | null }) => u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === todayStr)
          .map((u: { id: string; display_name: string | null }) => ({ id: u.id, name: u.display_name ?? 'Unnamed' }));
        setTodayUsers(todayList);
      }
    };

    loadPresence();
    const interval = setInterval(loadPresence, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_presence').delete().eq('user_id', user.id);
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const toggleSearchPanel = async () => {
    if (!searchOpen && !lookupsLoaded) {
      const { data: coloursData } = await supabase.from('poodle_colours').select('code, label').order('label');
      setColours(coloursData ?? []);
      const { data: countryData } = await supabase.from('countries').select('code, name').order('name');
      setCountries(countryData ?? []);
      setLookupsLoaded(true);
    }
    setSearchOpen((v) => !v);
    setOpenPanel(null);
  };

  const toggle = (list: string[], setList: (v: string[]) => void, code: string) => {
    setList(list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);
  };

  const summary = (list: string[], allLabels: { code: string; label: string }[], placeholder: string) => {
    if (list.length === 0) return placeholder;
    if (list.length === 1) {
      const found = allLabels.find((o) => o.code === list[0]);
      return found?.label ?? placeholder;
    }
    return `${list.length} selected`;
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (selectedSizes.length > 0) params.set('size', selectedSizes.join(','));
    if (selectedSexes.length > 0) params.set('sex', selectedSexes.join(','));
    if (selectedColours.length > 0) params.set('colour', selectedColours.join(','));
    if (selectedLocations.length > 0) params.set('location', selectedLocations.join(','));
    setSearchOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const locationOptions = [...REGION_OPTIONS, ...countries.map((c) => ({ code: c.code, label: c.name }))];

  return (
    <>
      <IdleTimeout />
      <header className="bg-pd-black text-white overflow-x-hidden">
        <div className="container-pd flex flex-wrap items-center justify-between gap-y-2 py-3 min-h-20 min-w-0">
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
              LISTINGS
            </Link>
            {canPostListing && (
              <Link href="/post-a-listing" className="hover:text-pd-gold">
                POST A LISTING
              </Link>
            )}
            <Link href="/about" className="hover:text-pd-gold">
              ABOUT US
            </Link>
            <button className="flex items-center gap-1 hover:text-pd-gold">
              RESOURCES <ChevronDown size={14} />
            </button>
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm">
            <button className="hidden sm:flex items-center gap-1 text-white/80 hover:text-white">
              EN <ChevronDown size={12} />
            </button>
            <button onClick={toggleSearchPanel} aria-label="Search filters">
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <Link href="/favorites" aria-label="Favorites">
              <Heart size={18} />
            </Link>

            {loading ? null : displayName ? (
              <>
                <Link href="/messages" aria-label="Messages" className="relative">
                  <MessageSquare size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pd-gold text-pd-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link
                    href="/breeders"
                    className="border border-white/30 px-3 py-1 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
                  >
                    BREEDERS
                  </Link>
                )}
                {isStaff && (
                  <>
                    <Link
                      href="/admin/listings"
                      className="relative border border-pd-gold text-pd-gold px-3 py-1 text-xs font-bold hover:bg-pd-gold hover:text-pd-black"
                    >
                      ADMIN
                      {pendingListingsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-pd-gold text-pd-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {pendingListingsCount > 9 ? '9+' : pendingListingsCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/admin/verifications"
                      className="relative border border-white/30 px-3 py-1 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
                    >
                      VERIFY
                      {pendingVerificationsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {pendingVerificationsCount > 9 ? '9+' : pendingVerificationsCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/admin/reports"
                      className="relative border border-white/30 px-3 py-1 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
                    >
                      REPORTS
                      {pendingReportsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {pendingReportsCount > 9 ? '9+' : pendingReportsCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/admin/breeder-requests"
                      className="relative border border-white/30 px-3 py-1 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
                    >
                      REQUESTS
                      {pendingRequestsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/admin/users"
                      className="border border-white/30 px-3 py-1 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
                    >
                      USERS
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/audit-log"
                        className="border border-white/30 px-3 py-1 text-xs font-bold hover:border-pd-gold hover:text-pd-gold"
                      >
                        LOG
                      </Link>
                    )}
                  </>
                )}
                <Link
                  href="/profile"
                  className="text-white/80 text-xs max-w-[110px] truncate"
                >
                  Woof, {displayName}
                </Link>
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

        {searchOpen && (
          <div className="bg-white text-pd-black border-t border-black/10 py-5">
            <div className="container-pd grid sm:grid-cols-2 md:grid-cols-5 gap-4 items-end relative">
              <HeaderFilterField
                label="SIZE"
                summary={summary(selectedSizes, SIZE_OPTIONS, 'All Sizes')}
                isOpen={openPanel === 'size'}
                onToggleOpen={() => setOpenPanel(openPanel === 'size' ? null : 'size')}
                options={SIZE_OPTIONS}
                selected={selectedSizes}
                onToggleOption={(code) => toggle(selectedSizes, setSelectedSizes, code)}
              />
              <HeaderFilterField
                label="SEX"
                summary={summary(selectedSexes, SEX_OPTIONS, 'Any')}
                isOpen={openPanel === 'sex'}
                onToggleOpen={() => setOpenPanel(openPanel === 'sex' ? null : 'sex')}
                options={SEX_OPTIONS}
                selected={selectedSexes}
                onToggleOption={(code) => toggle(selectedSexes, setSelectedSexes, code)}
              />
              <HeaderFilterField
                label="COLOUR"
                summary={summary(selectedColours, colours, 'Any Colour')}
                isOpen={openPanel === 'colour'}
                onToggleOpen={() => setOpenPanel(openPanel === 'colour' ? null : 'colour')}
                options={colours}
                selected={selectedColours}
                onToggleOption={(code) => toggle(selectedColours, setSelectedColours, code)}
              />
              <HeaderFilterField
                label="LOCATION"
                summary={summary(selectedLocations, locationOptions, 'Worldwide')}
                isOpen={openPanel === 'location'}
                onToggleOpen={() => setOpenPanel(openPanel === 'location' ? null : 'location')}
                options={locationOptions}
                selected={selectedLocations}
                onToggleOption={(code) => toggle(selectedLocations, setSelectedLocations, code)}
              />
              <button
                onClick={handleSearchSubmit}
                className="bg-pd-black text-white font-bold text-sm h-11 flex items-center justify-center gap-2 hover:bg-pd-black-2"
              >
                SEARCH <Search size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {isAdmin && (todayUsers.length > 0 || onlineUsers.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 bg-pd-black text-white/70 text-[11px] px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 z-30">
          <span>
            🟢 Online now ({onlineUsers.length}): {onlineUsers.map((u) => u.name).join(', ') || '—'}
          </span>
          <span>
            📅 Logged in today ({todayUsers.length}): {todayUsers.map((u) => u.name).join(', ') || '—'}
          </span>
        </div>
      )}
    </>
  );
}

function HeaderFilterField({
  label,
  summary,
  isOpen,
  onToggleOpen,
  options,
  selected,
  onToggleOption,
}: {
  label: string
  summary: string
  isOpen: boolean
  onToggleOpen: () => void
  options: { code: string; label: string }[]
  selected: string[]
  onToggleOption: (code: string) => void
}) {
  return (
    <div className="relative flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-wide text-pd-gray">{label}</span>
      <button
        type="button"
        onClick={onToggleOpen}
        className="border border-black/15 h-11 px-3 text-sm bg-white text-left truncate"
      >
        {summary}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white border border-black/15 shadow-lg z-20 p-2">
          {options.map((opt) => (
            <label key={opt.code} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.code)}
                onChange={() => onToggleOption(opt.code)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
