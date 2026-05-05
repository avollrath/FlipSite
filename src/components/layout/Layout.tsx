import { Moon, Sun } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/theme'

export function Layout() {
 const { isDemoMode } = useAuth()
 const { mode, toggleMode } = useTheme()
 const location = useLocation()
 const navigate = useNavigate()

 return (
 <div className="min-h-screen bg-surface text-base transition-colors">
 <Sidebar />
 <div className="min-h-screen md:pl-72">
  <header className="sticky top-0 z-30 border-b border-border-base bg-surface/85 backdrop-blur">
  <div className="flex h-16 items-center justify-between px-5 md:px-8">
          <div aria-hidden="true" />
  <button
   type="button"
   className="grid h-10 w-10 place-items-center rounded-lg border border-border-base bg-card text-muted shadow-sm transition hover:border-accent/40 hover:text-accent"
   onClick={toggleMode}
   aria-label="Toggle dark mode"
  >
   {mode === 'dark' ? (
   <Sun className="h-5 w-5" aria-hidden="true" />
   ) : (
   <Moon className="h-5 w-5" aria-hidden="true" />
   )}
  </button>
  </div>
  </header>
  {isDemoMode && (
  <div className="flex w-full items-center justify-between gap-3 border-b border-accent/20 bg-accent/10 px-4 py-2 text-xs md:px-8">
  <span className="font-medium text-accent">
   You are in demo mode - data is read-only
  </span>
  <button
   type="button"
   onClick={() => navigate('/login?tab=signup')}
   className="font-semibold text-accent hover:underline"
  >
   Create your account →
  </button>
  </div>
  )}
  <main className="px-5 py-8 pb-28 md:px-8 md:pb-8">
  <div key={location.pathname} className="animate-page-transition">
  <Outlet />
  </div>
  </main>
 </div>
 <MobileNav />
 </div>
 )
}
