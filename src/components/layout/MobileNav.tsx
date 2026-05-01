import {
  ArrowRightLeft,
  BarChart3,
  Gauge,
  Package,
  Settings,
  Tags,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', href: '/', icon: Gauge },
  { label: 'Items', href: '/items', icon: Package },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Categories', href: '/categories', icon: Tags },
  { label: 'Import', href: '/import-export', icon: ArrowRightLeft },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-2 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-[#0a0a0f]/95 md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
