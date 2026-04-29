# FlipSite

FlipSite is a personal inventory and resale dashboard I built from a very familiar habit: keeping Google Sheets for budgeting, purchases, and flips. I wanted something that felt more intentional than a spreadsheet, but still kept the practical workflow that makes spreadsheets useful: write down what I bought, what I paid, where it came from, whether I am keeping it, listing it, or selling it, and what the final result was.

The project started as a flipping tracker, but it has grown into a broader inventory tool for everything I buy. Some things are bought to resell quickly. Some become long-term keepers. Some are part of bundles where one purchase contains several separate items. FlipSite is meant to handle that messier real-life version of buying and selling, not only the clean version where every item is a neat one-line flip.

## What It Does

- Tracks items from purchase through inventory, listing, sale, or keeping
- Supports bundles, where one purchase price can cover several child items
- Calculates profit and ROI, including bundle parent profit from child sales
- Shows dashboard KPIs for invested money, revenue, profit, keepers, inventory, and active bundles
- Visualizes sales and profit over time with charts
- Filters inventory by status, platform, category, bundles, and dashboard drilldowns
- Uses Euro formatting and inventory language that fits my own workflow
- Stores data per user with Supabase Auth and Row Level Security

## Why I Built It

My budgeting and flipping spreadsheets worked, but they were starting to stretch beyond what a sheet is best at. I wanted a project that could keep the speed of entering purchases while adding a better interface for reviewing inventory, seeing profit, and understanding what is still sitting around waiting for a decision.

FlipSite is also a portfolio piece: a practical app built around a real personal workflow, with authentication, database rules, data tables, charts, responsive UI, dark mode, and the kind of edge cases that only show up when a tool is actually used.

## Tech

Built with React, TypeScript, Vite, Tailwind CSS, Supabase, TanStack Query, React Router, Recharts, Sonner, and Lucide icons.

## Running Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Add Supabase values to `.env`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

To set up the database, create a Supabase project, enable Email/Password auth, and run `supabase/schema.sql` in the Supabase SQL editor. The schema includes RLS so users only access their own inventory.

Useful checks:

```bash
npm run lint
npm run build
```

## Deployment

The app is ready for Vercel. `vercel.json` includes the SPA rewrite needed for React Router refreshes.

Set these Vercel environment variables:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```
