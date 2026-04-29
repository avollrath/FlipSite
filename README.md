# FlipSite

FlipSite is a resale inventory and profit-tracking app scaffolded with React, TypeScript, Vite, Tailwind CSS, Supabase, React Query, React Router, Recharts, Sonner, Lucide React, and date-fns.

## Setup

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
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

- `src/components/ui`: shared UI primitives
- `src/components/charts`: chart components
- `src/components/items`: item-specific components
- `src/components/layout`: layout components
- `src/pages`: route-level pages
- `src/hooks`: reusable React hooks
- `src/lib`: clients and utilities
- `src/types`: shared TypeScript types
