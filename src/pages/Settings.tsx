import {
 Camera,
 Check,
 LogOut,
 MonitorCog,
 ShieldAlert,
 Type as TypeIcon,
 UserRound,
} from 'lucide-react'
import {
 useEffect,
 useMemo,
 useRef,
 useState,
 type ChangeEvent,
} from 'react'
import { toast } from 'sonner'
import { AvatarCropper } from '@/components/ui/AvatarCropper'
import { useAuth } from '@/hooks/useAuth'
import { useItems } from '@/hooks/useItems'
import { useProfile } from '@/hooks/useProfile'
import {
 clearSettings,
 defaultSettings,
 loadSettings,
 saveSetting,
 type FlipSiteSettings,
} from '@/lib/settings'
import {
 fontOptions,
 themeOptions,
 useTheme,
 type ThemeName,
} from '@/lib/theme'
import { getBuyPlatform, getSellPlatform, getStatusLabel } from '@/lib/utils'
import type { ItemStatus } from '@/types'

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const statuses: ItemStatus[] = ['holding', 'listed', 'sold', 'keeper']

export function Settings() {
 const { signOut, user } = useAuth()
 const {
 profile,
 updateProfile,
 uploadAvatar,
 isSaving: isProfileSaving,
 isUploading: isAvatarUploading,
 } = useProfile()
 const { font, mode, setFont, setMode, setTheme, theme } = useTheme()
 const { data: items = [] } = useItems()
 const [settings, setSettings] = useState<FlipSiteSettings>(() => loadSettings())
 const [saved, setSaved] = useState(false)
 const [profileSaved, setProfileSaved] = useState(false)
 const [draftUsername, setDraftUsername] = useState<string | null>(null)
 const [cropImageSrc, setCropImageSrc] = useState('')
 const avatarInputRef = useRef<HTMLInputElement | null>(null)
 const savedTimerRef = useRef<number | null>(null)
 const profileSavedTimerRef = useRef<number | null>(null)

 const platforms = useMemo(
 () =>
 uniqueValues(
  items.flatMap((item) => [getBuyPlatform(item), getSellPlatform(item)]),
 ),
 [items],
 )
 const categories = useMemo(
 () => uniqueValues(items.map((item) => item.category)),
 [items],
 )
 const username = draftUsername ?? profile?.username ?? ''
 const avatarUrl = getAvatarUrl(profile?.avatar_url, profile?.updated_at)
 const fallbackInitial = (username || user?.email || 'U')[0].toUpperCase()

 useEffect(
 () => () => {
  if (cropImageSrc) {
  URL.revokeObjectURL(cropImageSrc)
  }
 },
 [cropImageSrc],
 )

 function updateSetting<K extends keyof FlipSiteSettings>(
 key: K,
 value: FlipSiteSettings[K],
 ) {
 const nextSettings = {
 ...settings,
 [key]: value,
 }

 setSettings(nextSettings)
 saveSetting(key, value)
 showSaved()
 }

 function resetDefaults() {
 clearSettings()
 setSettings(defaultSettings)
 showSaved()
 }

 function showSaved() {
 setSaved(true)

 if (savedTimerRef.current) {
 window.clearTimeout(savedTimerRef.current)
 }

 savedTimerRef.current = window.setTimeout(() => {
 setSaved(false)
 savedTimerRef.current = null
 }, 1500)
 }

 function showProfileSaved() {
 setProfileSaved(true)

 if (profileSavedTimerRef.current) {
 window.clearTimeout(profileSavedTimerRef.current)
 }

 profileSavedTimerRef.current = window.setTimeout(() => {
 setProfileSaved(false)
 profileSavedTimerRef.current = null
 }, 1500)
 }

 async function saveProfile() {
 try {
 await updateProfile({ username: username.trim() || null })
 setDraftUsername(null)
 showProfileSaved()
 toast.success('Profile saved')
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Unable to save profile')
 }
 }

 function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
 const file = event.target.files?.[0]
 event.target.value = ''

 if (!file) {
 return
 }

 if (cropImageSrc) {
 URL.revokeObjectURL(cropImageSrc)
 }

 setCropImageSrc(URL.createObjectURL(file))
 }

 function closeCropper() {
 if (cropImageSrc) {
 URL.revokeObjectURL(cropImageSrc)
 }

 setCropImageSrc('')
 }

 async function handleCropComplete(blob: Blob) {
 try {
 await uploadAvatar(blob)
 closeCropper()
 showProfileSaved()
 toast.success('Avatar updated')
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Unable to upload avatar')
 }
 }

 async function handleSignOut() {
 try {
 await signOut()
 toast.success('Signed out')
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Unable to sign out')
 }
 }

 return (
 <section className="space-y-6">
 <div>
  <h1 className="text-4xl font-semibold tracking-tight">
  Settings
  </h1>
 </div>

  <Panel
  icon={UserRound}
  title="Profile & Account"
  description="Your identity and login details."
  >
  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
   <button
   type="button"
   className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-accent/20 text-accent transition hover:opacity-80"
   onClick={() => avatarInputRef.current?.click()}
   aria-label="Upload profile image"
   >
   {avatarUrl ? (
    <img
    src={avatarUrl}
    alt="Profile avatar"
    className="h-full w-full object-cover"
    />
   ) : (
    <span className="grid h-full w-full place-items-center text-2xl font-semibold">
    {fallbackInitial}
    </span>
   )}
   <span className="absolute inset-0 grid place-items-center bg-black/35 text-white opacity-0 transition group-hover:opacity-100">
    <Camera className="h-6 w-6" aria-hidden="true" />
   </span>
   </button>
   <input
   ref={avatarInputRef}
   className="sr-only"
   type="file"
   accept="image/*"
   onChange={handleAvatarFileChange}
   />
   <div className="min-w-0 flex-1 space-y-4">
   <Field label="Username">
    <input
    className={inputClassName}
    value={username}
    maxLength={30}
    onChange={(event) => setDraftUsername(event.target.value)}
    placeholder="Your display name"
    />
   </Field>
   <div>
    <span className="text-sm font-medium text-base ">Email</span>
    <p className="mt-2 truncate text-sm text-muted">{user?.email ?? ''}</p>
   </div>
   <div className="flex items-center gap-3">
    <button
    type="button"
    className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    onClick={saveProfile}
    disabled={isProfileSaving || isAvatarUploading}
    >
    {isProfileSaving ? 'Saving...' : 'Save'}
    </button>
    {profileSaved ? <span className="text-xs text-muted">✓ Saved</span> : null}
   </div>
   </div>
  </div>
  <div className="mt-5 border-t border-border-base pt-5">
   <p className="text-sm text-muted">
   Signed in as <span className="font-medium text-base">{user?.email}</span>
   </p>
   <button
   type="button"
   className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-accent/80"
   onClick={handleSignOut}
   >
   <LogOut className="h-4 w-4" aria-hidden="true" />
   Sign out
   </button>
  </div>
  </Panel>

 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <Panel
  icon={MonitorCog}
  title="Appearance"
  description="Light/dark mode and palette are saved separately."
  className="h-full"
  >
  <div className="grid h-11 grid-cols-2 rounded-lg border border-border-base bg-surface-2 p-1">
  {(['light', 'dark'] as const).map((option) => (
   <button
   key={option}
   type="button"
   className={`rounded-md px-3 text-sm font-semibold capitalize transition ${
   mode === option
    ? 'bg-card text-accent shadow-sm'
    : 'text-muted hover:text-base'
   }`}
   onClick={() => setMode(option)}
   >
   {option}
   </button>
  ))}
  </div>
  <div className="mt-5 grid grid-cols-4 gap-3">
  {themeOptions.map((option) => (
             <ThemeSwatch
              key={option.value}
              active={theme === option.value}
              label={option.label}
              mode={mode}
              theme={option.value}
              onSelect={() => setTheme(option.value)}
             />
  ))}
  </div>
  </Panel>

  <Panel
  icon={TypeIcon}
  title="Typography"
  description="Choose the font used throughout the app."
  className="h-full"
  >
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
  {fontOptions.map((option) => (
   <FontSwatch
   key={option.value}
   active={font === option.value}
   family={option.family}
   label={option.label}
   onSelect={() => setFont(option.value)}
   />
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
  <Field label="Default buy platform">
  <SettingsCombobox
   id="default-platform"
   options={platforms}
   placeholder="Optional"
   value={settings.defaultPlatform}
   onChange={(value) => updateSetting('defaultPlatform', value)}
  />
  </Field>
  <Field label="Default category">
  <SettingsCombobox
   id="default-category"
   options={categories}
   placeholder="Optional"
   value={settings.defaultCategory}
   onChange={(value) => updateSetting('defaultCategory', value)}
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
  <div className="mt-4 flex items-center gap-3">
  <button
   type="button"
   className="rounded-lg border border-border-base px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-surface-2"
   onClick={resetDefaults}
  >
   Reset defaults
  </button>
  {saved ? (
   <span className="text-xs text-muted transition-opacity">✓ Saved</span>
  ) : null}
  </div>
 </Panel>

 <Panel
  icon={ShieldAlert}
  title="Danger Zone"
  description="Account deletion is intentionally not available here."
 >
  <p className="text-sm text-muted ">
  Export your inventory before deleting or migrating any data. Use the
  Import / Export page to download a CSV backup first.
  </p>
 </Panel>

 {cropImageSrc ? (
 <AvatarCropper
  imageSrc={cropImageSrc}
  onCancel={closeCropper}
  onComplete={handleCropComplete}
 />
 ) : null}
 </section>
 )
}

function Panel({
 children,
 className = '',
 description,
 icon: Icon,
 title,
}: {
 children: React.ReactNode
 className?: string
 description: string
 icon: typeof UserRound
 title: string
}) {
 return (
 <article className={`rounded-lg border border-border-base bg-card p-5 shadow-sm ${className}`}>
 <div className="mb-5 flex items-start gap-3">
  <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent bg-accent/15 ">
  <Icon className="h-5 w-5" aria-hidden="true" />
  </span>
  <div>
  <h3 className="font-semibold text-base ">{title}</h3>
  <p className="mt-1 text-sm text-muted ">
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
 <span className="text-sm font-medium text-base ">
  {label}
 </span>
 <span className="mt-2 block">{children}</span>
 </label>
 )
}

function SettingsCombobox({
 id,
 onChange,
 options,
 placeholder,
 value,
}: {
 id: string
 onChange: (value: string) => void
 options: string[]
 placeholder: string
 value: string
}) {
 return (
 <>
 <input
  className={inputClassName}
  list={`${id}-options`}
  value={value}
  onChange={(event) => onChange(event.target.value)}
  placeholder={placeholder}
 />
 <datalist id={`${id}-options`}>
  {options.map((option) => (
  <option key={option} value={option} />
  ))}
 </datalist>
 </>
 )
}

function ThemeSwatch({
 active,
 label,
 mode,
 onSelect,
 theme,
}: {
 active: boolean
 label: string
 mode: 'light' | 'dark'
 onSelect: () => void
 theme: ThemeName
}) {
 return (
 <button
 type="button"
 className={`rounded-lg border p-2 text-left transition ${
  active
  ? 'border-accent ring-4 ring-accent/15'
  : 'border-border-base hover:border-accent/50'
 }`}
 onClick={onSelect}
 aria-pressed={active}
 >
      <span
      className={`grid h-14 overflow-hidden rounded-md border border-border-base ${
       mode === 'dark' ? 'dark' : ''
      }`}
      data-theme={theme}
      >
  <span className="flex bg-surface">
  <span className="w-4 bg-sidebar" />
  <span className="flex flex-1 items-center justify-center bg-card">
  <span className="h-2 w-8 rounded-full bg-accent" />
  </span>
  </span>
 </span>
 <span className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-base">
  {label}
  {active ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> : null}
 </span>
 </button>
 )
}

function FontSwatch({
 active,
 family,
 label,
 onSelect,
}: {
 active: boolean
 family: string
 label: string
 onSelect: () => void
}) {
 return (
 <button
 type="button"
 className={`relative rounded-lg border p-3 text-left transition hover:bg-surface-2 ${
  active
  ? 'border-accent ring-2 ring-accent'
  : 'border-border-base hover:border-accent/50'
 }`}
 onClick={onSelect}
 aria-pressed={active}
 >
 {active ? (
  <Check
  className="absolute right-2 top-2 h-3.5 w-3.5 text-accent"
  aria-hidden="true"
  />
 ) : null}
 <span className="block pr-5 text-xs font-medium text-muted">{label}</span>
 <span
  className="mt-3 block text-xl font-medium text-base"
  style={{ fontFamily: family }}
 >
  AaBbCc
 </span>
 <span
  className="mt-1 block text-sm text-muted"
  style={{ fontFamily: family }}
 >
  12345
 </span>
 </button>
 )
}

const inputClassName =
 'h-11 w-full rounded-lg border border-border-base bg-card px-3 text-sm text-base outline-none transition placeholder:text-muted read-only:bg-surface-2 focus:border-accent focus:ring-4 focus:ring-accent/10'
const selectClassName = `${inputClassName} truncate pr-10`

function uniqueValues(values: Array<string | null | undefined>) {
 return Array.from(
 new Map(
  values
  .map((value) => value?.trim())
  .filter((value): value is string => Boolean(value))
  .map((value) => [value.toLowerCase(), value]),
 ).values(),
 ).sort((first, second) => first.localeCompare(second))
}

function getAvatarUrl(avatarUrl: string | null | undefined, updatedAt: string | null | undefined) {
 if (!avatarUrl) {
 return ''
 }

 return updatedAt ? `${avatarUrl}?t=${encodeURIComponent(updatedAt)}` : avatarUrl
}
