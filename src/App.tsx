import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout/Layout'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Analytics } from '@/pages/Analytics'
import { Categories } from '@/pages/Categories'
import { Dashboard } from '@/pages/Dashboard'
import { ImportExport } from '@/pages/ImportExport'
import { Items } from '@/pages/Items'
import { Login } from '@/pages/Login'
import { Settings } from '@/pages/Settings'

const queryClient = new QueryClient()

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <StartupLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function StartupLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 text-zinc-950 dark:bg-[#0a0a0f] dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid h-16 w-16 place-items-center rounded-xl bg-violet-600 text-white shadow-2xl shadow-violet-950/30">
          <div className="absolute inset-0 rounded-xl border border-white/20" />
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">FlipSite</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Checking your session
          </p>
        </div>
      </div>
    </main>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-right" theme="system" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/items" element={<Items />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/import-export" element={<ImportExport />} />
                <Route path="/settings" element={<Settings />} />
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
