import { Check, Clipboard, MonitorCog, ShieldAlert, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type FlipSiteSettings,
} from '@/lib/settings'
import { getStatusLabel } from '@/lib/utils'
import type { ItemStatus } from '@/types'

type Theme = 'light' | 'dark'

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const statuses: ItemStatus[] = ['holding', 'listed', 'sold', 'keeper']

export function Settings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<FlipSiteSettings>(() => loadSettings())
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  function updateSetting<K extends keyof FlipSiteSettings>(
    key: K,
    value: FlipSiteSettings[K],
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }))
  }

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    window.localStorage.setItem('flipsite-theme', nextTheme)
  }

  async function copyUserId() {
    if (!user?.id) {
      return
    }

    await navigator.clipboard.writeText(user.id)
    setCopied(true)
    toast.success('User id copied')
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          Settings
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">
          Account and defaults
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          icon={UserRound}
          title="Profile"
          description="Basic account information for this signed-in user."
        >
          <Field label="Email">
            <input className={inputClassName} value={user?.email ?? ''} readOnly />
          </Field>
          <Field label="User ID">
            <div className="flex gap-2">
              <input className={inputClassName} value={user?.id ?? ''} readOnly />
              <button
                type="button"
                className={secondaryIconButtonClassName}
                onClick={copyUserId}
                aria-label="Copy user id"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </Field>
        </Panel>

        <Panel
          icon={MonitorCog}
          title="Appearance"
          description="Choose the theme used by this browser."
        >
          <div className="grid h-11 grid-cols-2 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-[#0a0a0f]">
            {(['light', 'dark'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`rounded-md px-3 text-sm font-semibold capitalize transition ${
                  theme === option
                    ? 'bg-white text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-200'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
                onClick={() => updateTheme(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        icon={MonitorCog}
        title="Defaults"
        description="Stored locally in this browser. Defaults apply to new items only."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Default seller">
            <input
              className={inputClassName}
              value={settings.defaultPlatform}
              onChange={(event) =>
                updateSetting('defaultPlatform', event.target.value)
              }
              placeholder="Optional"
            />
          </Field>
          <Field label="Default category">
            <input
              className={inputClassName}
              value={settings.defaultCategory}
              onChange={(event) =>
                updateSetting('defaultCategory', event.target.value)
              }
              placeholder="Optional"
            />
          </Field>
          <Field label="Default condition">
            <select
              className={selectClassName}
              value={settings.defaultCondition}
              onChange={(event) =>
                updateSetting('defaultCondition', event.target.value)
              }
            >
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Default status">
            <select
              className={selectClassName}
              value={settings.defaultStatus}
              onChange={(event) =>
                updateSetting('defaultStatus', event.target.value as ItemStatus)
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          type="button"
          className="mt-4 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
          onClick={() => setSettings(defaultSettings)}
        >
          Reset defaults
        </button>
      </Panel>

      <Panel
        icon={ShieldAlert}
        title="Danger Zone"
        description="Account deletion is intentionally not available here."
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Export your inventory before deleting or migrating any data. Use the
          Import / Export page to download a CSV backup first.
        </p>
      </Panel>
    </section>
  )
}

function Panel({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: React.ReactNode
  description: string
  icon: typeof UserRound
  title: string
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#13131a]">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold text-zinc-950 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </article>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function getCurrentTheme(): Theme {
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

const inputClassName =
  'h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 read-only:bg-zinc-50 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-50 dark:read-only:bg-white/[0.03]'
const selectClassName = `${inputClassName} truncate pr-9`
const secondaryIconButtonClassName =
  'grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-200 dark:hover:bg-white/10'
