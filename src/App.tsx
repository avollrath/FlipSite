import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BarChart3, Plus } from 'lucide-react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout/Layout'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import type { Item } from '@/types'

const queryClient = new QueryClient()

const exampleItem: Item = {
  tsid: '3f8c8c89-7f22-4f7f-86ff-058ed85876ec',
  user_id: '8a6b8c87-4e33-4d64-9c35-8d2e7ddf04b2',
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

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-50 text-zinc-600 dark:bg-[#0a0a0f] dark:text-zinc-300">
        <p className="text-sm font-medium">Loading FlipSite...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function Dashboard() {
  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Dashboard
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">
            Inventory at a glance
          </h2>
        </div>
        <Link
          to="/items"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          View Items
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ['Holding', '12'],
          ['Listed', '8'],
          ['Sold', '24'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#13131a]"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ItemsPage() {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Items
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">
            Resale inventory
          </h2>
        </div>
        <BarChart3 className="h-8 w-8 text-zinc-400" aria-hidden="true" />
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#13131a]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Example item
        </p>
        <h3 className="mt-2 text-2xl font-semibold">{exampleItem.name}</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="font-medium capitalize">{exampleItem.status}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              Platform
            </dt>
            <dd className="font-medium">{exampleItem.platform}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              Buy price
            </dt>
            <dd className="font-medium">${exampleItem.buy_price}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/items" element={<ItemsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
