# FlipSite

A personal resale and inventory tracker built for the messy reality of buying, bundling, listing, and selling — where not every purchase is a clean one-item flip and a spreadsheet quietly stops being enough.

**Live app:** https://flipsite-three.vercel.app/

![FlipSite Dashboard](src/assets/dashboard.jpg)

---

## The Problem It Solves

Spreadsheets work fine when you buy one thing and sell one thing. They fall apart the moment you buy a camera bundle, sell three lenses separately, keep the body, and try to figure out your actual profit. FlipSite was built to handle that reality: multi-item bundles, kept inventory, partial sells, and finances that only make sense if the app understands relationships between purchases.

---

## What It Does

### Inventory Management
Every item you buy gets a full record — name, category, condition, buy price, sell price, buy platform, sell platform, status, dates, notes, and attached photos or files. Items can be in four states: **holding**, **listed**, **sold**, or **keeping** (personal items tracked separately from flipping inventory).

The list view gives you a sortable, filterable table with every metric visible at a glance. The gallery view turns your inventory into a visual grid backed by compressed thumbnails. Both views support the same filtering system: status, buy platform, sell platform, category, search, bundles only, and inventory-only modes.

### Bundle-Aware Accounting
Bundles are first-class citizens. When you buy a box of items for one price, you mark it as a bundle parent and add child items underneath it. Each child can be sold individually, kept, or listed separately. Profit calculations understand this structure — child sales contribute to the bundle's total without double-counting the purchase cost.

The dashboard tracks **active bundles** (parents with unsold children) as its own KPI, and bundle parents expand inline in the table to show their children.

### Dashboard
Nine KPI cards covering what actually matters for a resale operation:

- **Flipping Capital** — money spent on items to flip, excluding personal keeps
- **Total Revenue** — sum of all sales
- **Total Profit** — what you actually earned after costs
- **Avg ROI %** — average return across sold items
- **Best Flip** — your highest-ROI sale, clickable to the item
- **In Inventory** — count of items still held, clickable to filter
- **Keepers** — personal items tracked separately
- **Keeping Value** — total cost of items bought to keep
- **Active Bundles** — bundles with unsold children remaining

Four charts below the KPIs: cumulative profit over time, profit by category, top 8 flips by profit, and monthly buy vs sell volume.

### Analytics
A dedicated analytics page with date range and multi-select filters (category, buy platform, sell platform, status) that affect every number on the page simultaneously. Charts include monthly revenue, monthly profit with positive/negative bars, profit by category, profit by platform, best categories to flip by ROI, a scatter plot of hold time vs profit, and a cumulative profit curve with a linear pace comparison.

### Image Handling
Photos can be uploaded from disk or pasted directly from the clipboard — paste a screenshot from Telegram and it enters the same upload pipeline as a normal file. Images are compressed before upload (JPEG, max 1600px long edge, target 200KB), stored in a private Supabase Storage bucket, and served through signed URLs. List and gallery thumbnails use transformed image URLs so the app never loads full-size images unnecessarily. A lightbox with keyboard navigation handles full-size viewing.

### Item Detail Page
Every item has a dedicated full-page view at `/items/:id`. Left column shows the image gallery, file attachments, notes, and bundle children. Right column shows the financial summary, all metadata, and calculated hold time. Bundle children are listed with their individual contribution and are each clickable to their own detail page.

### Profile & Customization
- Avatar upload with in-app circular crop and WebP compression
- Username stored per-user in Supabase
- 8 color themes: Midnight Drop, Forest Glass, Golden Hour, Cold Brew, Neon Petal, Cyberpunk, Cassette Futurism, Colorful 80s
- Independent light/dark mode toggle
- 6 font options: Inter, DM Sans, Plus Jakarta Sans, JetBrains Mono, Michroma, Electrolize
- Per-item defaults (buy platform, category, condition, status) stored locally

### Categories & Import/Export
Bulk rename or merge categories across all items. Export your full inventory as CSV. Import from CSV with a validation preview before committing. The template download shows the expected format.

---

## Implementation Notes

### Why the Data Model Is Interesting

The `items` table carries a `bundle_id` foreign key back to itself and an `is_bundle_parent` flag. A database trigger enforces that bundle children can only reference parents owned by the same user — not just RLS, but a Postgres trigger that runs before insert and update. This means the cross-user bundle reference attack surface is closed at the database level, not just the application level.

### Keeper Separation

Keeper items (status = `keeper`) are tracked in total invested and keeping value but excluded from profit, revenue, ROI, and all sell-side calculations. This distinction runs through every aggregate in the app — dashboard KPIs, analytics summaries, chart data builders, and category stats. The `analytics.ts` module centralizes these calculations so dashboard and analytics stay consistent rather than drifting independently.

### Image Pipeline Details

The compression pipeline targets 200KB with a quality stepping loop: start at 0.82 quality, check size, step down if needed, stop at a minimum quality floor. Small images are not upscaled. Clipboard paste converts `ClipboardItem` blobs into real `File` objects with safe filenames before going through the same `uploadItemFile` path as selected files — same compression, same storage paths, same error handling.

### Financial Accuracy

All currency aggregates use a `sumCurrency` helper that rounds to cents after each operation (`Math.round(value * 100) / 100`) to avoid floating-point drift across many items. Month bucketing uses stable `yyyy-MM` string keys for grouping and sorting, with locale formatting applied only at render time.

### Theme Architecture

Themes are CSS custom properties set on `data-theme` on `<html>`. Dark mode is a separate `.dark` class, fully independent of theme. Font choice is a `data-font` attribute. All three are applied before first render from `localStorage` to eliminate flash. Recharts chart colors read CSS variables via `getComputedStyle` inside a `requestAnimationFrame` callback on theme change so they update immediately without a page reload.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, custom CSS variables |
| Data fetching | TanStack Query v5 |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Charts | Recharts |
| Deployment | Vercel |

---

## Running Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Create a Supabase project, enable Email/Password auth, and run `supabase/schema.sql` in the SQL editor. The schema includes all tables, RLS policies, storage bucket setup, and the bundle ownership trigger.

## Deploying

FlipSite deploys to Vercel with no configuration beyond environment variables:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`vercel.json` includes the SPA rewrite rule so React Router handles refreshes correctly.