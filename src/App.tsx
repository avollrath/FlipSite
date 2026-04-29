import type { Item } from '@/types'

const exampleItem: Item = {
  tsid: 'item_01',
  user_id: 'user_01',
  name: 'Vintage denim jacket',
  category: 'Apparel',
  condition: 'Good',
  buy_price: 18,
  sell_price: null,
  platform: 'eBay',
  status: 'listed',
  bought_at: new Date().toISOString(),
  sold_at: null,
  notes: 'Ready for photos',
  created_at: new Date().toISOString(),
}

function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          FlipSite
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Resale inventory, pricing, and profit tracking.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          A React, TypeScript, Vite, Tailwind, and Supabase scaffold ready for
          the item workflows that come next.
        </p>
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Example item</p>
          <h2 className="mt-2 text-2xl font-semibold">{exampleItem.name}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="font-medium capitalize">{exampleItem.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Platform</dt>
              <dd className="font-medium">{exampleItem.platform}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Buy price</dt>
              <dd className="font-medium">${exampleItem.buy_price}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  )
}

export default App
