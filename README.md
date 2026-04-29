# FlipSite

FlipSite is a resale inventory and profit-tracking app for tracking buys, listings, sold items, profit, ROI, and resale performance over time.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS with class-based dark mode
- Supabase Auth and Postgres
- TanStack Query
- React Router
- Recharts
- Sonner toasts
- Lucide React icons
- date-fns

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your Supabase project values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor in the Supabase dashboard.
3. Run the SQL in `supabase/schema.sql`.
4. In Authentication settings, enable Email/Password signups.
5. Copy your project URL and anon/publishable key into `.env`.
6. Restart the dev server after changing environment variables.

The `items` table uses Row Level Security. Authenticated users can only select, insert, update, and delete rows where `user_id` matches their Supabase user id.

## Vercel Deployment

The project includes `vercel.json` with an SPA rewrite so React Router routes work on refresh:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Set these environment variables in Vercel:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use the default Vite build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## Project Structure

- `src/components/ui`: shared UI primitives
- `src/components/charts`: KPI and chart components
- `src/components/items`: item drawer and item-specific UI
- `src/components/layout`: app shell navigation
- `src/pages`: route-level pages
- `src/hooks`: auth and item data hooks
- `src/lib`: Supabase client and utilities
- `src/types`: shared TypeScript types
- `supabase/schema.sql`: database schema and RLS policies
