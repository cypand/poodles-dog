-- POODLES.DOG schema - generated from the live Supabase database on 2026-11-09
-- The live database is the source of truth. Regenerate with the same query after schema changes.
-- To regenerate: Supabase → SQL Editor → run the query in the README or the last handoff.

-- ===== TABLES =====

create table public.admin_audit_log (
  id uuid default gen_random_uuid() not null,
  actor_id uuid,
  actor_name text,
  action text not null,
  target_type text not null,
  target_id text,
  target_label text,
  details text,
  created_at timestamp with time zone default now() not null,
  constraint admin_audit_log_pkey PRIMARY KEY (id)
);

create table public.admin_digest_state (
  id integer default 1 not null,
  last_sent_at timestamp with time zone,
  constraint admin_digest_state_pkey PRIMARY KEY (id),
  constraint single_row CHECK ((id = 1))
);

create table public.blocked_users (
  id uuid default gen_random_uuid() not null,
  blocker_id uuid,
  blocked_id uuid,
  created_at timestamp with time zone default now() not null,
  constraint blocked_users_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id),
  constraint blocked_users_pkey PRIMARY KEY (id)
);

create table public.breeder_profiles (
  id uuid not null,
  kennel_name text not null,
  logo_url text,
  about text,
  years_breeding integer,
  website_url text,
  instagram_url text,
  facebook_url text,
  registry_id integer,
  identity_verified boolean default false not null,
  kennel_registration_verified boolean default false not null,
  health_documents_verified boolean default false not null,
  created_at timestamp with time zone default now() not null,
  registry_number text,
  certificate_path text,
  verification_status text default 'unverified'::text not null,
  verification_submitted_at timestamp with time zone,
  constraint breeder_profiles_pkey PRIMARY KEY (id)
);

create table public.breeder_sizes_bred (
  breeder_id uuid not null,
  size_id integer not null,
  constraint breeder_sizes_bred_pkey PRIMARY KEY (breeder_id, size_id)
);

create table public.conversations (
  id uuid default gen_random_uuid() not null,
  listing_id uuid,
  buyer_id uuid,
  breeder_id uuid,
  created_at timestamp with time zone default now() not null,
  last_message_at timestamp with time zone default now() not null,
  constraint conversations_pkey PRIMARY KEY (id)
);

create table public.countries (
  code text not null,
  name text not null,
  continent text,
  constraint countries_pkey PRIMARY KEY (code)
);

create table public.currencies (
  code text not null,
  symbol text not null,
  constraint currencies_pkey PRIMARY KEY (code)
);

create table public.dog_health_results (
  id uuid default gen_random_uuid() not null,
  dog_id uuid not null,
  test_type_id integer not null,
  result_value text not null,
  tested_date date,
  certificate_url text,
  verified boolean default false not null,
  constraint dog_health_results_pkey PRIMARY KEY (id)
);

create table public.dogs (
  id uuid default gen_random_uuid() not null,
  registered_name text,
  call_name text,
  pedigree_number text,
  colour_id integer,
  size_id integer,
  titles text,
  registry_id integer,
  owner_breeder_id uuid,
  created_at timestamp with time zone default now() not null,
  constraint dogs_pkey PRIMARY KEY (id)
);

create table public.favorites (
  user_id uuid not null,
  listing_id uuid not null,
  created_at timestamp with time zone default now() not null,
  constraint favorites_pkey PRIMARY KEY (user_id, listing_id)
);

create table public.health_test_types (
  id integer default nextval('health_test_types_id_seq'::regclass) not null,
  code text not null,
  label text not null,
  result_type text not null,
  constraint health_test_types_code_key UNIQUE (code),
  constraint health_test_types_pkey PRIMARY KEY (id),
  constraint health_test_types_result_type_check CHECK ((result_type = ANY (ARRAY['DNA'::text, 'SCORE'::text, 'EXAM'::text])))
);

create table public.inquiries (
  id uuid default gen_random_uuid() not null,
  listing_id uuid not null,
  breeder_id uuid not null,
  sender_name text not null,
  sender_email text not null,
  sender_country text,
  message text not null,
  created_at timestamp with time zone default now() not null,
  read boolean default false not null,
  constraint inquiries_pkey PRIMARY KEY (id)
);

-- NOTE: listing_alerts was missing from the old schema.sql even though it existed in the database.
-- This caused a silent bug (GRANT missing for service_role) that was fixed on 2026-11-09.
create table public.listing_alerts (
  id uuid default gen_random_uuid() not null,
  email text not null,
  size_code text,
  sex text,
  colour_code text,
  location_code text,
  created_at timestamp with time zone default now(),
  constraint listing_alerts_pkey PRIMARY KEY (id)
);

create table public.listing_photos (
  id uuid default gen_random_uuid() not null,
  listing_id uuid not null,
  url text not null,
  sort_order integer default 0 not null,
  constraint listing_photos_pkey PRIMARY KEY (id),
  constraint max_three_photos CHECK (((sort_order >= 0) AND (sort_order <= 2)))
);

create table public.listings (
  id uuid default gen_random_uuid() not null,
  breeder_id uuid not null,
  listing_type text not null,
  title text not null,
  description text,
  size_id integer,
  colour_id integer,
  sex text,
  date_of_birth date,
  ready_from date,
  males_available integer,
  females_available integer,
  total_available integer,
  has_pedigree boolean default false not null,
  registry_id integer,
  kennel_registration_name text,
  registration_number text,
  sire_id uuid,
  dam_id uuid,
  price numeric(10,2),
  currency_code text,
  price_public boolean default true not null,
  deposit_required boolean default false not null,
  deposit_amount numeric(10,2),
  country_code text,
  city text,
  sell_scope text[],
  transport_assist boolean default false not null,
  transport_options text[],
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
  status text default 'PENDING'::text not null,
  admin_notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  purpose text[] default '{}'::text[],
  expires_at timestamp with time zone,
  rejection_reason text,
  view_count integer default 0 not null,
  constraint listings_listing_type_check CHECK ((listing_type = ANY (ARRAY['LITTER'::text, 'PUPPY'::text, 'YOUNG_DOG'::text, 'ADULT_DOG'::text]))),
  constraint listings_pkey PRIMARY KEY (id),
  constraint listings_sex_check CHECK ((sex = ANY (ARRAY['MALE'::text, 'FEMALE'::text, 'MIXED'::text]))),
  constraint listings_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'ACTIVE'::text, 'SOLD'::text, 'EXPIRED'::text, 'REJECTED'::text, 'DEACTIVATED'::text])))
);

create table public.messages (
  id uuid default gen_random_uuid() not null,
  conversation_id uuid,
  sender_id uuid,
  body text not null,
  created_at timestamp with time zone default now() not null,
  read boolean default false not null,
  reminder_sent_at timestamp with time zone,
  constraint messages_pkey PRIMARY KEY (id)
);

create table public.notifications (
  id uuid default gen_random_uuid() not null,
  user_id uuid,
  listing_id uuid,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now(),
  constraint notifications_pkey PRIMARY KEY (id)
);

create table public.poodle_colours (
  id integer default nextval('poodle_colours_id_seq'::regclass) not null,
  code text not null,
  label text not null,
  constraint poodle_colours_code_key UNIQUE (code),
  constraint poodle_colours_pkey PRIMARY KEY (id)
);

create table public.poodle_sizes (
  id integer default nextval('poodle_sizes_id_seq'::regclass) not null,
  code text not null,
  label text not null,
  constraint poodle_sizes_code_key UNIQUE (code),
  constraint poodle_sizes_pkey PRIMARY KEY (id)
);

create table public.profiles (
  id uuid not null,
  role text default 'buyer'::text not null,
  display_name text,
  country_code text,
  city text,
  created_at timestamp with time zone default now() not null,
  banned boolean default false,
  suspended_until timestamp with time zone,
  terms_accepted_at timestamp with time zone,
  constraint profiles_pkey PRIMARY KEY (id),
  constraint profiles_role_check CHECK ((role = ANY (ARRAY['buyer'::text, 'breeder'::text, 'admin'::text, 'moderator'::text])))
);

create table public.registries (
  id integer default nextval('registries_id_seq'::regclass) not null,
  code text not null,
  name text not null,
  constraint registries_code_key UNIQUE (code),
  constraint registries_pkey PRIMARY KEY (id)
);

create table public.reports (
  id uuid default gen_random_uuid() not null,
  listing_id uuid not null,
  reporter_email text,
  reason text not null,
  details text,
  status text default 'OPEN'::text not null,
  created_at timestamp with time zone default now() not null,
  constraint reports_pkey PRIMARY KEY (id),
  constraint reports_status_check CHECK ((status = ANY (ARRAY['OPEN'::text, 'REVIEWING'::text, 'RESOLVED'::text, 'DISMISSED'::text])))
);

create table public.role_change_requests (
  id uuid default gen_random_uuid() not null,
  user_id uuid,
  kennel_name text,
  litter_parents text,
  litter_size text,
  message text,
  status text default 'PENDING'::text not null,
  created_at timestamp with time zone default now() not null,
  constraint role_change_requests_pkey PRIMARY KEY (id)
);

create table public.user_presence (
  user_id uuid not null,
  last_seen timestamp with time zone default now() not null,
  constraint user_presence_pkey PRIMARY KEY (user_id)
);

create table public.verification_documents (
  id uuid default gen_random_uuid() not null,
  breeder_id uuid not null,
  doc_type text not null,
  file_url text not null,
  status text default 'PENDING'::text not null,
  submitted_at timestamp with time zone default now() not null,
  reviewed_at timestamp with time zone,
  constraint verification_documents_doc_type_check CHECK ((doc_type = ANY (ARRAY['IDENTITY'::text, 'KENNEL_REGISTRATION'::text, 'HEALTH_DOCUMENT'::text]))),
  constraint verification_documents_pkey PRIMARY KEY (id),
  constraint verification_documents_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])))
);

-- ===== FOREIGN KEYS =====

alter table public.admin_audit_log add constraint admin_audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id);
alter table public.blocked_users add constraint blocked_users_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.blocked_users add constraint blocked_users_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.breeder_profiles add constraint breeder_profiles_id_fkey FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.breeder_profiles add constraint breeder_profiles_registry_id_fkey FOREIGN KEY (registry_id) REFERENCES registries(id);
alter table public.breeder_sizes_bred add constraint breeder_sizes_bred_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES breeder_profiles(id) ON DELETE CASCADE;
alter table public.breeder_sizes_bred add constraint breeder_sizes_bred_size_id_fkey FOREIGN KEY (size_id) REFERENCES poodle_sizes(id);
alter table public.conversations add constraint conversations_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.conversations add constraint conversations_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.conversations add constraint conversations_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL;
alter table public.dog_health_results add constraint dog_health_results_dog_id_fkey FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE;
alter table public.dog_health_results add constraint dog_health_results_test_type_id_fkey FOREIGN KEY (test_type_id) REFERENCES health_test_types(id);
alter table public.dogs add constraint dogs_colour_id_fkey FOREIGN KEY (colour_id) REFERENCES poodle_colours(id);
alter table public.dogs add constraint dogs_owner_breeder_id_fkey FOREIGN KEY (owner_breeder_id) REFERENCES breeder_profiles(id);
alter table public.dogs add constraint dogs_registry_id_fkey FOREIGN KEY (registry_id) REFERENCES registries(id);
alter table public.dogs add constraint dogs_size_id_fkey FOREIGN KEY (size_id) REFERENCES poodle_sizes(id);
alter table public.favorites add constraint favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
alter table public.favorites add constraint favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.inquiries add constraint inquiries_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES breeder_profiles(id);
alter table public.inquiries add constraint inquiries_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
alter table public.listing_photos add constraint listing_photos_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
alter table public.listings add constraint listings_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES breeder_profiles(id) ON DELETE CASCADE;
alter table public.listings add constraint listings_colour_id_fkey FOREIGN KEY (colour_id) REFERENCES poodle_colours(id);
alter table public.listings add constraint listings_country_code_fkey FOREIGN KEY (country_code) REFERENCES countries(code);
alter table public.listings add constraint listings_currency_code_fkey FOREIGN KEY (currency_code) REFERENCES currencies(code);
alter table public.listings add constraint listings_dam_id_fkey FOREIGN KEY (dam_id) REFERENCES dogs(id);
alter table public.listings add constraint listings_registry_id_fkey FOREIGN KEY (registry_id) REFERENCES registries(id);
alter table public.listings add constraint listings_sire_id_fkey FOREIGN KEY (sire_id) REFERENCES dogs(id);
alter table public.listings add constraint listings_size_id_fkey FOREIGN KEY (size_id) REFERENCES poodle_sizes(id);
alter table public.messages add constraint messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
alter table public.messages add constraint messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.notifications add constraint notifications_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
alter table public.notifications add constraint notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.profiles add constraint profiles_country_code_fkey FOREIGN KEY (country_code) REFERENCES countries(code);
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.reports add constraint reports_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
alter table public.role_change_requests add constraint role_change_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.user_presence add constraint user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.verification_documents add constraint verification_documents_breeder_id_fkey FOREIGN KEY (breeder_id) REFERENCES breeder_profiles(id) ON DELETE CASCADE;

-- ===== INDEXES =====

CREATE INDEX idx_listings_colour ON public.listings USING btree (colour_id);
CREATE INDEX idx_listings_country ON public.listings USING btree (country_code);
CREATE INDEX idx_listings_created ON public.listings USING btree (created_at DESC);
CREATE INDEX idx_listings_size ON public.listings USING btree (size_id);
CREATE INDEX idx_listings_status ON public.listings USING btree (status);
CREATE INDEX idx_listings_type ON public.listings USING btree (listing_type);
CREATE UNIQUE INDEX profiles_display_name_unique_idx ON public.profiles USING btree (lower(display_name));

-- ===== FUNCTIONS =====

CREATE OR REPLACE FUNCTION public.get_admin_user_list()
 RETURNS TABLE(id uuid, email text, display_name text, role text, banned boolean, created_at timestamp with time zone, last_sign_in_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Not authorized';
  end if;

  return query
  select
    p.id,
    u.email::text,
    p.display_name,
    p.role,
    p.banned,
    p.created_at,
    u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by u.last_sign_in_at desc nulls last;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, display_name, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'display_name', 'Account'),
      coalesce(new.raw_user_meta_data->>'role', 'buyer')
    );

  if coalesce(new.raw_user_meta_data->>'role', 'buyer') = 'breeder' then
    insert into public.breeder_profiles (id, kennel_name)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'display_name', 'Kennel')
      );
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.increment_listing_view(listing_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE listings SET view_count = view_count + 1 WHERE id = listing_id_input;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$function$;

-- ===== TRIGGERS =====

-- (none currently defined in public schema)

-- ===== ROW LEVEL SECURITY =====

alter table public.admin_audit_log enable row level security;
alter table public.blocked_users enable row level security;
alter table public.breeder_profiles enable row level security;
alter table public.breeder_sizes_bred enable row level security;
alter table public.conversations enable row level security;
alter table public.countries enable row level security;
alter table public.currencies enable row level security;
alter table public.dog_health_results enable row level security;
alter table public.dogs enable row level security;
alter table public.favorites enable row level security;
alter table public.health_test_types enable row level security;
alter table public.inquiries enable row level security;
alter table public.listing_alerts enable row level security;
alter table public.listing_photos enable row level security;
alter table public.listings enable row level security;
alter table public.messages enable row level security;
alter table public.poodle_colours enable row level security;
alter table public.poodle_sizes enable row level security;
alter table public.profiles enable row level security;
alter table public.registries enable row level security;
alter table public.reports enable row level security;
alter table public.role_change_requests enable row level security;
alter table public.user_presence enable row level security;
alter table public.verification_documents enable row level security;

-- ===== POLICIES =====

create policy "Admins can view audit log" on public.admin_audit_log as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));

create policy "Staff can insert audit log" on public.admin_audit_log as PERMISSIVE for INSERT to public
  with check ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text]))))));

create policy "Users can see if they are blocked" on public.blocked_users as PERMISSIVE for SELECT to public
  using ((auth.uid() = blocked_id));

create policy "Users manage own blocks" on public.blocked_users as PERMISSIVE for ALL to public
  using ((auth.uid() = blocker_id));

create policy "Admins can update verification status" on public.breeder_profiles as PERMISSIVE for UPDATE to authenticated
  using ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text]))))));

create policy "Breeders can insert own profile" on public.breeder_profiles as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "Breeders can read own profile" on public.breeder_profiles as PERMISSIVE for SELECT to public
  using ((auth.uid() = id));

create policy "Breeders can update own profile" on public.breeder_profiles as PERMISSIVE for UPDATE to public
  using ((auth.uid() = id));

create policy "Public read breeder profiles" on public.breeder_profiles as PERMISSIVE for SELECT to public
  using (true);

create policy "Participants can create conversations" on public.conversations as PERMISSIVE for INSERT to public
  with check (((auth.uid() = buyer_id) OR (auth.uid() = breeder_id)));

create policy "Participants can delete conversations" on public.conversations as PERMISSIVE for DELETE to public
  using (((auth.uid() = buyer_id) OR (auth.uid() = breeder_id)));

create policy "Participants can view conversations" on public.conversations as PERMISSIVE for SELECT to public
  using (((auth.uid() = buyer_id) OR (auth.uid() = breeder_id)));

create policy "Public read countries" on public.countries as PERMISSIVE for SELECT to public
  using (true);

create policy "Public read currencies" on public.currencies as PERMISSIVE for SELECT to public
  using (true);

create policy "Breeders can insert dog health results" on public.dog_health_results as PERMISSIVE for INSERT to public
  with check ((EXISTS ( SELECT 1 FROM dogs WHERE ((dogs.id = dog_health_results.dog_id) AND (dogs.owner_breeder_id = auth.uid())))));

create policy "Public read dog health results" on public.dog_health_results as PERMISSIVE for SELECT to public
  using (true);

create policy "Breeders can insert own dogs" on public.dogs as PERMISSIVE for INSERT to public
  with check ((auth.uid() = owner_breeder_id));

create policy "Public read dogs" on public.dogs as PERMISSIVE for SELECT to public
  using (true);

create policy "Users can delete own favorites" on public.favorites as PERMISSIVE for DELETE to public
  using ((auth.uid() = user_id));

create policy "Users can insert own favorites" on public.favorites as PERMISSIVE for INSERT to public
  with check ((auth.uid() = user_id));

create policy "Users can read own favorites" on public.favorites as PERMISSIVE for SELECT to public
  using ((auth.uid() = user_id));

create policy "Public read health test types" on public.health_test_types as PERMISSIVE for SELECT to public
  using (true);

create policy "Anyone can insert inquiries" on public.inquiries as PERMISSIVE for INSERT to public
  with check (true);

create policy "Breeders can read own inquiries" on public.inquiries as PERMISSIVE for SELECT to public
  using ((auth.uid() = breeder_id));

create policy "Breeders can update their own inquiries" on public.inquiries as PERMISSIVE for UPDATE to public
  using ((auth.uid() = breeder_id));

create policy "Anyone can insert an alert" on public.listing_alerts as PERMISSIVE for INSERT to public
  with check (true);

create policy "Anyone can view listing photo rows" on public.listing_photos as PERMISSIVE for SELECT to public
  using (true);

create policy "Authenticated users can insert listing photos" on public.listing_photos as PERMISSIVE for INSERT to authenticated
  with check (true);

create policy "Breeders can insert own listing photos" on public.listing_photos as PERMISSIVE for INSERT to public
  with check ((EXISTS ( SELECT 1 FROM listings WHERE ((listings.id = listing_photos.listing_id) AND (listings.breeder_id = auth.uid())))));

create policy "Public read listing photos" on public.listing_photos as PERMISSIVE for SELECT to public
  using (true);

create policy "Admins can delete any listing" on public.listings as PERMISSIVE for DELETE to public
  using ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));

create policy "Admins can read all listings" on public.listings as PERMISSIVE for SELECT to public
  using (((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) OR true));

create policy "Admins can update any listing" on public.listings as PERMISSIVE for UPDATE to public
  using ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));

create policy "Breeders can delete their own listings" on public.listings as PERMISSIVE for DELETE to public
  using ((auth.uid() = breeder_id));

create policy "Breeders can insert own listings" on public.listings as PERMISSIVE for INSERT to public
  with check ((auth.uid() = breeder_id));

create policy "Breeders can update own listings" on public.listings as PERMISSIVE for UPDATE to public
  using ((auth.uid() = breeder_id));

create policy "Public read active listings" on public.listings as PERMISSIVE for SELECT to public
  using (true);

create policy "Participants can mark read" on public.messages as PERMISSIVE for UPDATE to public
  using ((EXISTS ( SELECT 1 FROM conversations c WHERE ((c.id = messages.conversation_id) AND ((c.buyer_id = auth.uid()) OR (c.breeder_id = auth.uid()))))));

create policy "Participants can send messages" on public.messages as PERMISSIVE for INSERT to public
  with check (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1 FROM conversations c WHERE ((c.id = messages.conversation_id) AND ((c.buyer_id = auth.uid()) OR (c.breeder_id = auth.uid())))))));

create policy "Participants can view messages" on public.messages as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1 FROM conversations c WHERE ((c.id = messages.conversation_id) AND ((c.buyer_id = auth.uid()) OR (c.breeder_id = auth.uid()))))));

create policy "Public read colours" on public.poodle_colours as PERMISSIVE for SELECT to public
  using (true);

create policy "Public read sizes" on public.poodle_sizes as PERMISSIVE for SELECT to public
  using (true);

create policy "Admins can read any profile" on public.profiles as PERMISSIVE for SELECT to public
  using (is_admin());

create policy "Admins can update any profile" on public.profiles as PERMISSIVE for UPDATE to public
  using (is_admin())
  with check (is_admin());

create policy "Authenticated users can view display names" on public.profiles as PERMISSIVE for SELECT to authenticated
  using (true);

create policy "Users can insert own profile" on public.profiles as PERMISSIVE for INSERT to public
  with check ((auth.uid() = id));

create policy "Users can read own profile" on public.profiles as PERMISSIVE for SELECT to public
  using ((auth.uid() = id));

create policy "Users can update own profile" on public.profiles as PERMISSIVE for UPDATE to public
  using ((auth.uid() = id));

create policy "Public read registries" on public.registries as PERMISSIVE for SELECT to public
  using (true);

create policy "Anyone can submit a report" on public.reports as PERMISSIVE for INSERT to public
  with check (true);

create policy "Admins can view all requests" on public.role_change_requests as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));

create policy "Users can insert own request" on public.role_change_requests as PERMISSIVE for INSERT to public
  with check ((auth.uid() = user_id));

create policy "Users can view own request" on public.role_change_requests as PERMISSIVE for SELECT to public
  using ((auth.uid() = user_id));

create policy "Admins can view all presence" on public.user_presence as PERMISSIVE for SELECT to public
  using ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));

create policy "Users can upsert own presence" on public.user_presence as PERMISSIVE for ALL to public
  using ((auth.uid() = user_id))
  with check ((auth.uid() = user_id));

-- ===== GRANTS =====
-- Required for every new table since the Supabase policy change on 2026-10-30.
-- Without these, server-side queries via the Data API / service_role fail silently.
-- Template for new tables:
--   grant select on public.<table> to anon;
--   grant select, insert, update, delete on public.<table> to authenticated;
--   grant select, insert, update, delete on public.<table> to service_role;

grant insert, select on public.admin_audit_log to authenticated;
grant delete, insert, select, update on public.admin_audit_log to service_role;
grant delete, insert, select, update on public.admin_digest_state to service_role;
grant delete, insert, select on public.blocked_users to authenticated;
grant delete, insert, select, update on public.blocked_users to service_role;
grant delete, insert, select, update on public.breeder_profiles to anon;
grant delete, insert, select, update on public.breeder_profiles to authenticated;
grant delete, insert, select, update on public.breeder_profiles to service_role;
grant delete, insert, select, update on public.breeder_sizes_bred to anon;
grant delete, insert, select, update on public.breeder_sizes_bred to authenticated;
grant delete, insert, select, update on public.breeder_sizes_bred to service_role;
grant delete, insert, select, update on public.conversations to authenticated;
grant delete, insert, select, update on public.conversations to service_role;
grant delete, insert, select, update on public.countries to anon;
grant delete, insert, select, update on public.countries to authenticated;
grant delete, insert, select, update on public.countries to service_role;
grant delete, insert, select, update on public.currencies to anon;
grant delete, insert, select, update on public.currencies to authenticated;
grant delete, insert, select, update on public.currencies to service_role;
grant delete, insert, select, update on public.dog_health_results to anon;
grant delete, insert, select, update on public.dog_health_results to authenticated;
grant delete, insert, select, update on public.dog_health_results to service_role;
grant delete, insert, select, update on public.dogs to anon;
grant delete, insert, select, update on public.dogs to authenticated;
grant delete, insert, select, update on public.dogs to service_role;
grant delete, insert, select, update on public.favorites to anon;
grant delete, insert, select, update on public.favorites to authenticated;
grant delete, insert, select, update on public.favorites to service_role;
grant delete, insert, select, update on public.health_test_types to anon;
grant delete, insert, select, update on public.health_test_types to authenticated;
grant delete, insert, select, update on public.health_test_types to service_role;
grant delete, insert, select, update on public.inquiries to anon;
grant delete, insert, select, update on public.inquiries to authenticated;
grant delete, insert, select, update on public.inquiries to service_role;
grant insert on public.listing_alerts to anon;
grant insert on public.listing_alerts to authenticated;
grant delete, insert, select, update on public.listing_alerts to service_role;
grant delete, insert, select, update on public.listing_photos to anon;
grant delete, insert, select, update on public.listing_photos to authenticated;
grant delete, insert, select, update on public.listing_photos to service_role;
grant delete, insert, select, update on public.listings to anon;
grant delete, insert, select, update on public.listings to authenticated;
grant delete, insert, select, update on public.listings to service_role;
grant insert, select, update on public.messages to authenticated;
grant delete, insert, select, update on public.messages to service_role;
grant delete, insert, select, update on public.notifications to service_role;
grant delete, insert, select, update on public.poodle_colours to anon;
grant delete, insert, select, update on public.poodle_colours to authenticated;
grant delete, insert, select, update on public.poodle_colours to service_role;
grant delete, insert, select, update on public.poodle_sizes to anon;
grant delete, insert, select, update on public.poodle_sizes to authenticated;
grant delete, insert, select, update on public.poodle_sizes to service_role;
grant delete, insert, select, update on public.profiles to anon;
grant delete, insert, select, update on public.profiles to authenticated;
grant delete, insert, select, update on public.profiles to service_role;
grant delete, insert, select, update on public.registries to anon;
grant delete, insert, select, update on public.registries to authenticated;
grant delete, insert, select, update on public.registries to service_role;
grant delete, insert, select, update on public.reports to anon;
grant delete, insert, select, update on public.reports to authenticated;
grant delete, insert, select, update on public.reports to service_role;
grant delete, insert, select, update on public.role_change_requests to authenticated;
grant delete, insert, select, update on public.role_change_requests to service_role;
grant insert, select, update on public.user_presence to authenticated;
grant delete, insert, select, update on public.user_presence to service_role;
grant delete, insert, select, update on public.verification_documents to anon;
grant delete, insert, select, update on public.verification_documents to authenticated;
grant delete, insert, select, update on public.verification_documents to service_role;
