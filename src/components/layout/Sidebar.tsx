import {
 ArrowRightLeft,
 BarChart3,
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
 { label: 'Dashboard', href: '/', icon: Gauge },
 { label: 'Items', href: '/items', icon: Package },
 { label: 'Analytics', href: '/analytics', icon: BarChart3 },
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
 <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border-base bg-sidebar p-5 md:flex">
 <div className="flex items-center justify-center px-4 py-6">
        <Logo size={68} />
 </div>

 <nav className="mt-10 space-y-2">
  {navItems.map(({ label, href, icon: Icon }) => (
  <NavLink
  key={href}
  to={href}
  end={href === '/'}
  className={({ isActive }) =>
   `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
   isActive
   ? 'bg-accent/25 font-medium text-sidebar-accent [&>svg]:opacity-100'
   : 'font-medium text-sidebar-text/90 hover:bg-white/10 hover:text-white [&>svg]:opacity-70 hover:[&>svg]:opacity-100'
   }`
  }
  >
  <Icon className="h-5 w-5 transition" aria-hidden="true" />
  {label}
  </NavLink>
  ))}
 </nav>

 <div className="mt-auto flex flex-col items-center gap-2 border-t border-white/10 pb-2 pt-4">
  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/20 ring-2 ring-white/10">
   {avatarUrl ? (
   <img
    src={avatarUrl}
    alt="avatar"
    className="h-full w-full object-cover"
   />
   ) : (
   <span className="text-lg font-semibold text-sidebar-accent">
    {fallbackInitial}
   </span>
   )}
  </div>
  <div className="flex w-full flex-col items-center gap-0.5 px-2">
   <p className="max-w-full truncate text-center text-sm font-semibold leading-tight text-white">
   {displayName}
   </p>
   <p className="max-w-full truncate text-center text-[11px] leading-tight text-white/40">
   {user?.email}
   </p>
  </div>
  <button
  type="button"
  className="mt-1 flex items-center gap-1.5 text-[11px] text-white/35 transition-colors hover:text-white/70"
  onClick={handleSignOut}
  >
  <LogOut className="h-3 w-3" aria-hidden="true" />
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
