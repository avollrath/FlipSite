import { BarChart3, LogOut, Package, Plus } from 'lucide-react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import type { Item } from '@/types'

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
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">
        <p className="text-sm font-medium">Loading FlipSite...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function Shell() {
  const { signOut, user } = useAuth()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed'
      toast.error(message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 text-white">
              <Package className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold">FlipSite</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              to="/items"
              className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Items
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-6 text-sm text-slate-500">{user?.email}</p>
        <Outlet />
      </div>
    </main>
  )
}

function Dashboard() {
  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-teal-700">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold">Inventory at a glance</h1>
        </div>
        <Link
          to="/items"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800"
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
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
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
          <p className="text-sm font-medium text-teal-700">Items</p>
          <h1 className="mt-2 text-4xl font-semibold">Resale inventory</h1>
        </div>
        <BarChart3 className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>

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
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Shell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/items" element={<ItemsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
