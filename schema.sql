-- ============================================================
-- POODLES.DOG — Core Database Schema (PostgreSQL / Supabase)
-- Draft v1 — MVP scope
-- ============================================================

-- ---------- Reference / lookup tables ----------

create table countries (
  code text primary key,          -- ISO 3166-1 alpha-2, e.g. 'CY', 'DE'
  name text not null
);

create table currencies (
  code text primary key,          -- ISO 4217, e.g. 'EUR', 'USD'
  symbol text not null
);

create table registries (
  id serial primary key,
  code text unique not null,      -- 'FCI', 'AKC', 'TKC', 'CKC', 'ANKC', 'OTHER'
  name text not null
);

create table poodle_sizes (
  id serial primary key,
  code text unique not null,      -- 'TOY','MINIATURE','MEDIUM','STANDARD'
  label text not null
);

create table poodle_colours (
  id serial primary key,
  code text unique not null,
  label text not null
);

create table health_test_types (
  id serial primary key,
  code text unique not null,      -- 'PATELLA','HIPS','EYES','PRA_PRCD','VWD1','NEWS','DM', ...
  label text not null,
  result_type text not null       -- 'DNA' | 'SCORE' | 'EXAM'
  check (result_type in ('DNA','SCORE','EXAM'))
);

-- ---------- Users & profiles ----------

-- Assumes Supabase Auth manages auth.users; this extends it.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','breeder','admin')),
  display_name text,
  country_code text references countries(code),
  city text,
  created_at timestamptz not null default now()
);

create table breeder_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  kennel_name text not null,
  logo_url text,
  about text,
  years_breeding int,
  website_url text,
  instagram_url text,
  facebook_url text,
  registry_id int references registries(id),
  identity_verified boolean not null default false,
  kennel_registration_verified boolean not null default false,
  health_documents_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table breeder_sizes_bred (
  breeder_id uuid references breeder_profiles(id) on delete cascade,
  size_id int references poodle_sizes(id),
  primary key (breeder_id, size_id)
);

-- ---------- Dogs (parents) ----------

create table dogs (
  id uuid primary key default gen_random_uuid(),
  registered_name text,
  call_name text,
  pedigree_number text,
  colour_id int references poodle_colours(id),
  size_id int references poodle_sizes(id),
  titles text,                    -- free text, e.g. "CH, INT CH"
  registry_id int references registries(id),
  owner_breeder_id uuid references breeder_profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- Listings ----------

create table listings (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeder_profiles(id) on delete cascade,

  listing_type text not null check (listing_type in ('LITTER','PUPPY','YOUNG_DOG','ADULT_DOG')),
  title text not null,
  description text,

  size_id int references poodle_sizes(id),
  colour_id int references poodle_colours(id),
  sex text check (sex in ('MALE','FEMALE','MIXED')),  -- MIXED for litters w/ both

  date_of_birth date,
  ready_from date,

  males_available int,
  females_available int,
  total_available int,

  has_pedigree boolean not null default false,
  registry_id int references registries(id),
  kennel_registration_name text,
  registration_number text,

  sire_id uuid references dogs(id),
  dam_id uuid references dogs(id),

  price numeric(10,2),
  currency_code text references currencies(code),
  price_public boolean not null default true,
  deposit_required boolean not null default false,
  deposit_amount numeric(10,2),

  country_code text references countries(code),
  city text,
  sell_scope text check (sell_scope in ('LOCAL','EU','EUROPE','NORTH_AMERICA','WORLDWIDE','SELECTED_COUNTRIES')),
  transport_assist boolean not null default false,
  transport_options text[],       -- e.g. {'BUYER_COLLECTION','GROUND','FLIGHT_NANNY','AIR_CARGO'}

  microchipped boolean,
  vaccinated boolean,
  dewormed boolean,
  vet_examined boolean,
  pet_passport boolean,
  dna_parentage_verified boolean,
  contract_provided boolean,
  health_guarantee boolean,
  starter_pack boolean,
  socialised_children boolean,
  socialised_dogs boolean,
  raised_in_home boolean,

  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','SOLD','EXPIRED','REJECTED','DEACTIVATED')),
  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  constraint max_three_photos check (sort_order between 0 and 2)
);

-- ---------- Health test results (parents) ----------

create table dog_health_results (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references dogs(id) on delete cascade,
  test_type_id int not null references health_test_types(id),
  result_value text not null,     -- 'CLEAR'/'CARRIER'/'AFFECTED' or score e.g. '0/0', 'A/A'
  tested_date date,
  certificate_url text,
  verified boolean not null default false
);

-- ---------- Favorites ----------

create table favorites (
  user_id uuid references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------- Inquiries (contact breeder) ----------

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  breeder_id uuid not null references breeder_profiles(id),
  sender_name text not null,
  sender_email text not null,
  sender_country text,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

-- ---------- Reports (safety) ----------

create table reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  reporter_email text,
  reason text not null check (reason in (
    'SCAM','FALSE_INFO','STOLEN_PHOTOS','WELFARE_CONCERN',
    'MISLEADING_PEDIGREE','INCORRECT_HEALTH_CLAIMS','DUPLICATE','OTHER'
  )),
  details text,
  status text not null default 'OPEN' check (status in ('OPEN','REVIEWING','RESOLVED','DISMISSED')),
  created_at timestamptz not null default now()
);

-- ---------- Verification documents ----------

create table verification_documents (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references breeder_profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('IDENTITY','KENNEL_REGISTRATION','HEALTH_DOCUMENT')),
  file_url text not null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------- Indexes for search performance ----------

create index idx_listings_status on listings(status);
create index idx_listings_size on listings(size_id);
create index idx_listings_colour on listings(colour_id);
create index idx_listings_country on listings(country_code);
create index idx_listings_type on listings(listing_type);
create index idx_listings_created on listings(created_at desc);
