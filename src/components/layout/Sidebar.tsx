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
    <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/10 bg-[#0a0a0f] p-5 text-white md:flex">
      <NavLink to="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-600 shadow-lg shadow-violet-950/40">
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
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/30'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="truncate text-sm font-medium text-white">{user?.email}</p>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/15 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  )
}
