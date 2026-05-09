import {
 ArrowRightLeft,
 BarChart3,
 CalendarRange,
 Gauge,
 LogOut,
 Package,
 Settings,
 Tags,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

const navItems = [
 { label: 'Dashboard', href: '/dashboard', icon: Gauge },
 { label: 'Items', href: '/items', icon: Package },
 { label: 'Analytics', href: '/analytics', icon: BarChart3 },
 { label: 'Period Report', href: '/report', icon: CalendarRange },
 { label: 'Categories', href: '/categories', icon: Tags },
 { label: 'Import / Export', href: '/import-export', icon: ArrowRightLeft },
 { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
 const { signOut, user } = useAuth()
 const { profile } = useProfile()
 const avatarUrl = getAvatarUrl(profile?.avatar_url, profile?.updated_at)
 const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'User'
 const fallbackInitial = (displayName || user?.email || 'U')[0].toUpperCase()

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
 <aside className="fixed inset-y-0 left-0 flex-col hidden p-5 border-r w-72 border-[hsl(var(--sidebar-border))] bg-sidebar md:flex">
 <div className="flex items-center justify-center px-4 py-6">
        <Logo size={96} />
 </div>

 <nav className="mt-10 space-y-2">
  {navItems.map(({ label, href, icon: Icon }) => (
  <NavLink
  key={href}
  to={href}
  end={href === '/dashboard'}
  className={({ isActive }) =>
   `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
   isActive
   ? 'bg-accent/25 font-medium text-sidebar-accent [&>svg]:opacity-100'
   : 'font-medium text-sidebar-text/90 hover:bg-sidebar-accent/15 hover:text-sidebar-accent [&>svg]:opacity-70 hover:[&>svg]:opacity-100'
   }`
  }
  >
  <Icon className="w-5 h-5 transition" aria-hidden="true" />
  {label}
  </NavLink>
  ))}
 </nav>

 <div className="flex flex-col items-center gap-2 pt-4 pb-2 mt-auto border-t border-[hsl(var(--sidebar-border))]">
  <div className="flex items-center justify-center overflow-hidden rounded-full h-14 w-14 shrink-0 bg-sidebar-accent/20 ring-2 ring-sidebar-text/10">
   {avatarUrl ? (
   <img
    src={avatarUrl}
    alt="avatar"
    className="object-cover w-full h-full"
   />
   ) : (
   <span className="text-lg font-semibold text-sidebar-accent">
    {fallbackInitial}
   </span>
   )}
  </div>
  <div className="flex w-full flex-col items-center gap-0.5 px-2">
   <p className="max-w-full text-sm font-semibold leading-tight text-center text-sidebar-text truncate">
   {displayName}
   </p>
   <p className="max-w-full truncate text-center text-[11px] leading-tight text-sidebar-text/50">
   {user?.email}
   </p>
  </div>
  <button
  type="button"
  className="mt-1 flex items-center gap-1.5 text-[11px] text-sidebar-text/60 transition-colors hover:text-sidebar-text/90"
  onClick={handleSignOut}
  >
  <LogOut className="w-3 h-3" aria-hidden="true" />
  Logout
  </button>
 </div>
 </aside>
 )
}

function getAvatarUrl(avatarUrl: string | null | undefined, updatedAt: string | null | undefined) {
 if (!avatarUrl) {
 return ''
 }

 return updatedAt ? `${avatarUrl}?t=${encodeURIComponent(updatedAt)}` : avatarUrl
}
