# POODLES.DOG — Project Scaffold

## Τι είναι αυτό
Το αρχικό σκελετό (scaffold) του homepage σε Next.js + Tailwind, πιστό στο εγκεκριμένο mockup — μαύρο/λευκό/χρυσό, Arial, header/hero/search/featured listings/why-choose/newsletter/footer. Περιλαμβάνει και το πραγματικό σου λογότυπο (`public/logo-black-bg.png`, `public/logo-white-bg.png`).

Μαζί με το `schema.sql` και `architecture.md` που έφτιαξα νωρίτερα — αυτά τα τρία μαζί είναι η βάση του project.

## Τι ΔΕΝ κάνει ακόμα
- Δεν είναι συνδεδεμένο σε πραγματική βάση δεδομένων (Supabase) — τα listings στο homepage είναι sample/placeholder data.
- Δεν έχει sign in/up, search, listing pages, dashboard — αυτά είναι στα επόμενα βήματα.
- Δεν είναι ακόμα deployed πουθενά — τρέχει μόνο τοπικά προς το παρόν, ή μετά από deploy στο Vercel.

## Βήμα 1 — Δες το τοπικά στον υπολογιστή σου (προαιρετικό, αλλά καλό για preview)

Χρειάζεσαι υπολογιστή (όχι κινητό) με [Node.js](https://nodejs.org) εγκατεστημένο.

```bash
cd poodles-dog
npm install
npm run dev
```

Μετά άνοιξε `http://localhost:3000` στον browser σου.

## Βήμα 2 — GitHub (χρειάζεται πριν το Vercel)

1. Δημιούργησε δωρεάν λογαριασμό στο **github.com**
2. Δημιούργησε νέο repository, π.χ. `poodles-dog`
3. Ανέβασε όλο αυτό τον φάκελο εκεί (μέσω GitHub Desktop app αν δεν ξέρεις command line — είναι πιο εύκολο οπτικά)

## Βήμα 3 — Vercel (hosting/deployment, δωρεάν tier)

1. Δημιούργησε λογαριασμό στο **vercel.com** (μπορείς να συνδεθείς απευθείας με το GitHub σου)
2. "Add New Project" → επίλεξε το repository `poodles-dog`
3. Το Vercel αναγνωρίζει αυτόματα ότι είναι Next.js — απλά πάτα Deploy
4. Θα σου δώσει ένα δωρεάν link τύπου `poodles-dog.vercel.app`
5. Αργότερα, όταν εγκριθεί το poodles.dog στο Porkbun, θα συνδέσουμε το domain εκεί (ίδια λογική με το DNS που κάναμε στο GoDaddy/Netlify)

## Βήμα 4 — Supabase (βάση δεδομένων + auth, δωρεάν tier)

1. Δημιούργησε λογαριασμό στο **supabase.com**
2. "New Project" → δώσε όνομα π.χ. `poodles-dog`
3. Μέσα στο project, πήγαινε στο **SQL Editor**
4. Άνοιξε το `schema.sql` που σου έδωσα, copy-paste όλο το περιεχόμενο, και πάτα **Run**
5. Αυτό θα δημιουργήσει όλους τους πίνακες (users, listings, dogs, health tests, κλπ.)

Μετά θα χρειαστεί να συνδέσουμε το Next.js app με το Supabase (API keys σε environment variables) — αυτό είναι το επόμενο βήμα ανάπτυξης μετά το αρχικό deploy.

## Δομή φακέλων

```
poodles-dog/
├── app/
│   ├── layout.tsx       ← root layout, fonts, metadata
│   ├── page.tsx         ← homepage
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── TrustStrip.tsx
│   ├── FeaturedListings.tsx
│   ├── WhyChoose.tsx
│   ├── Newsletter.tsx
│   └── Footer.tsx
├── public/
│   ├── logo-black-bg.png
│   └── logo-white-bg.png
├── schema.sql            ← database schema (Supabase/PostgreSQL)
├── architecture.md        ← information architecture doc
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
