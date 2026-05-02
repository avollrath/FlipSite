import {
 ArrowRightLeft,
 BarChart3,
 Gauge,
 LogOut,
 Package,
 Repeat2,
 Settings,
 Tags,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
 { label: 'Dashboard', href: '/', icon: Gauge },
 { label: 'Items', href: '/items', icon: Package },
 { label: 'Analytics', href: '/analytics', icon: BarChart3 },
 { label: 'Categories', href: '/categories', icon: Tags },
 { label: 'Import / Export', href: '/import-export', icon: ArrowRightLeft },
 { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
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
 <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border-base bg-sidebar p-5 text-accent-fg md:flex">
 <NavLink to="/" className="flex items-center gap-3">
  <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent shadow-lg shadow-accent/20">
  <Repeat2 className="h-5 w-5" aria-hidden="true" />
  </span>
  <span className="text-xl font-semibold">FlipSite</span>
 </NavLink>

 <nav className="mt-10 space-y-2">
  {navItems.map(({ label, href, icon: Icon }) => (
  <NavLink
  key={href}
  to={href}
  end={href === '/'}
  className={({ isActive }) =>
   `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
   isActive
   ? 'bg-accent text-accent-fg shadow-lg shadow-accent/20'
   : 'text-muted hover:bg-card/5 hover:text-accent-fg'
   }`
  }
  >
  <Icon className="h-5 w-5" aria-hidden="true" />
  {label}
  </NavLink>
  ))}
 </nav>

 <div className="mt-auto rounded-lg border border-border-base bg-card/[0.04] p-4">
  <p className="truncate text-sm font-medium text-accent-fg">{user?.email}</p>
  <button
  type="button"
  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-card/10 px-3 py-2 text-sm font-medium text-base transition hover:bg-card/15 hover:text-accent-fg"
  onClick={handleSignOut}
  >
  <LogOut className="h-4 w-4" aria-hidden="true" />
  Logout
  </button>
 </div>
 </aside>
 )
}
