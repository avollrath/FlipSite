import { Moon, Sun } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { useTheme } from '@/lib/theme'

export function Layout() {
 const { mode, toggleMode } = useTheme()
 const location = useLocation()

 return (
 <div className="min-h-screen bg-surface text-base transition-colors">
 <Sidebar />
 <div className="min-h-screen md:pl-72">
  <header className="sticky top-0 z-30 border-b border-border-base bg-surface/85 backdrop-blur">
  <div className="flex h-16 items-center justify-between px-5 md:px-8">
  <div className="text-xl font-semibold">FlipSite</div>
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
