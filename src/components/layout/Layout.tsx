import { Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'

type Theme = 'light' | 'dark'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/items': 'Items',
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem('flipsite-theme')

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function Layout() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const location = useLocation()

  const pageTitle = useMemo(
    () => pageTitles[location.pathname] ?? 'FlipSite',
    [location.pathname],
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('flipsite-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#0a0a0f] dark:text-zinc-50">
      <Sidebar />
      <div className="min-h-screen md:pl-72">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-[#0a0a0f]/85">
          <div className="flex h-16 items-center justify-between px-5 md:px-8">
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-[#13131a] dark:text-zinc-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>
        <main className="px-5 py-8 pb-28 md:px-8 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
