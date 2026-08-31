# POODLES.DOG — MVP Information Architecture

## 1. User Roles & Auth

| Role | Capabilities |
|---|---|
| **Buyer** (default) | Browse, search, favorite, contact breeders, report listings |
| **Breeder** | All buyer capabilities + create/edit/deactivate listings, manage breeder profile, receive inquiries |
| **Admin** | Moderate listings (approve/reject), review verification documents, handle reports |

- Auth via Supabase Auth (email/password to start; social login can be added later without schema changes).
- A user starts as `buyer`. Upgrading to `breeder` creates a row in `breeder_profiles` linked 1:1 to `profiles`.
- `admin` is a manually-assigned role (not self-service signup).

## 2. Listing Lifecycle

```
PENDING → ACTIVE → SOLD / EXPIRED
            ↓
        REJECTED (admin) → breeder can edit & resubmit → PENDING
            ↓
       DEACTIVATED (breeder-initiated)
```

- All new listings start as `PENDING` and require admin approval before going `ACTIVE`.
- Breeders can deactivate their own active listings at any time (`DEACTIVATED`).
- `EXPIRED` can be automated later (e.g. 90 days of no update) — not required for MVP, but the schema supports it now.

## 3. Site Map (MVP)

```
/                          → Homepage (hero, search, featured listings)
/search                    → Results grid + advanced filters
/listing/[id]              → Individual listing page
/breeders/[id]             → Public breeder profile
/breeders                  → Breeder directory (searchable)
/post-a-listing             → Multi-step create-listing form (auth required, breeder role)
/dashboard                 → Breeder dashboard (my listings, inquiries, edit profile)
/dashboard/listings/[id]/edit
/favorites                 → Buyer's saved listings
/sign-in
/sign-up
/admin                     → Moderation queue, verification review, reports queue
/about, /resources, /terms, /privacy, /transport-guide  → static content
```

## 4. Create-Listing Form — Step Map

Matches the handoff spec exactly; each step maps to a section of the `listings` table:

1. **About the listing** → `listing_type`, `title`, `description`
2. **Dog/puppy info** → `size_id`, `date_of_birth`, `ready_from`, `sex`, `males_available`, `females_available`, `colour_id`
3. **Pedigree** → `has_pedigree`, `registry_id`, `kennel_registration_name`, `registration_number`
4. **Parents** → creates/links two `dogs` rows (`sire_id`, `dam_id`), each with their own health test entries in `dog_health_results`
5. **Health & care checklist** → the boolean fields on `listings` (microchipped, vaccinated, etc.)
6. **Location & transport** → `country_code`, `city`, `sell_scope`, `transport_assist`, `transport_options`
7. **Price** → `price`, `currency_code`, `price_public`, `deposit_required`, `deposit_amount`
8. **Photos** → up to 3 rows in `listing_photos`, client-side resize/compress before upload
9. **Review & submit** → sets `status = 'PENDING'`

## 5. Search / Filters → Query Mapping

All filters map directly to indexed columns on `listings`, so search stays fast without a separate search engine for MVP:

- `listing_type`, `size_id`, `sex`, `colour_id`, `country_code`, `has_pedigree`, `registry_id`
- Price range → `price between X and Y` (only where `price_public = true`)
- Age → derived from `date_of_birth`
- "Parents health tested" → `exists (select 1 from dog_health_results where dog_id in (sire_id, dam_id))`
- Sort: `created_at desc` (Newest), `price`, `date_of_birth`

A dedicated search service (e.g. Meilisearch/Algolia) isn't needed until listing volume is large — Postgres indexes are enough for MVP.

## 6. Badges — display logic (not stored, computed)

| Badge | Condition |
|---|---|
| Pedigree ✓ | `listings.has_pedigree = true` |
| Parents Health Tested ✓ | at least one `dog_health_results` row exists for sire or dam |
| Microchipped ✓ | `listings.microchipped = true` |
| Vaccinated ✓ | `listings.vaccinated = true` |
| Identity Verified ✓ | `breeder_profiles.identity_verified = true` |
| Health Documents Verified ✓ | `breeder_profiles.health_documents_verified = true` |

No badge is shown from a breeder's own claim alone where the spec requires verification — those badges only render when the corresponding `*_verified` boolean is `true`, which is only ever set by an admin reviewing `verification_documents`.

## 7. What's deliberately deferred past MVP

Kept out of schema/scope for now, but the design doesn't block adding them later:
- Payments / commission
- Internal messaging (inquiries are one-shot email-style for now)
- Multi-language content
- Featured/paid listings
- Saved searches / email alerts
- Reviews

## 8. Next steps (in build order)

1. ✅ Schema drafted (`schema.sql`)
2. ✅ Information architecture (this file)
3. → Next: seed data for lookup tables (countries, colours, sizes, registries, health test types)
4. → Frontend project scaffold (Next.js + Tailwind, design tokens in black/white/gold + Arial)
5. → Supabase project setup (you'll need to create the account — I'll walk you through it)
6. → Homepage build
7. → Search/results page
8. → Listing detail page
9. → Auth (sign up/sign in)
10. → Breeder dashboard + multi-step create-listing form
