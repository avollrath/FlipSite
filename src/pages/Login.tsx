import { useState, type FormEvent } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'signup'

export function Login() {
 const { user, loading, signIn, signUp } = useAuth()
 const [mode, setMode] = useState<AuthMode>('login')
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [submitting, setSubmitting] = useState(false)
 const navigate = useNavigate()
 const location = useLocation()

 const destination =
 (location.state as { from?: { pathname?: string } } | null)?.from
 ?.pathname ?? '/'

 function changeMode(nextMode: AuthMode) {
 setMode(nextMode)
 setPassword('')
 }

 const tabClass = (active: boolean) =>
 cn(
 'flex-1 py-2 text-sm font-medium transition-colors',
 active
  ? 'text-accent border-b-2 border-accent'
  : 'text-muted hover:text-[hsl(var(--text))]',
 )

 if (!loading && user) {
 return <Navigate to={destination} replace />
 }

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
 event.preventDefault()
 setSubmitting(true)

 try {
 if (mode === 'login') {
  await signIn(email, password)
  toast.success('Welcome back to FlipSite')
 } else {
  await signUp(email, password)
  toast.success('Account created')
 }

 navigate(destination, { replace: true })
 } catch (error) {
 if (import.meta.env.DEV) {
  console.error(error)
 }
 const message =
  mode === 'login'
  ? 'Invalid email or password'
  : 'Unable to create account. Please try again.'
 toast.error(message)
 } finally {
 setSubmitting(false)
 }
 }

 return (
 <main className="grid min-h-screen px-6 py-10 text-base place-items-center bg-surface ">
 <section className="w-full max-w-md animate-auth-card">
  <div className="flex flex-col items-center mb-8 text-center">
  <div className="mb-6">
   <Logo size={96} />
  </div>
  <p className="text-3xl font-semibold">FlipSite</p>
  <p className="mt-2 text-sm text-muted ">
  Track buys, listings, and flips from one clean workspace.
  </p>
  </div>

  <div className="p-6 border rounded-lg shadow-xl border-border-base bg-card shadow-border-base/40 ">
  <div className="flex min-h-[36px] mb-6 border-b border-border-base">
  <button
   type="button"
   className={tabClass(mode === 'login')}
   onClick={() => changeMode('login')}
  >
   Login
  </button>
  <button
   type="button"
   className={tabClass(mode === 'signup')}
   onClick={() => changeMode('signup')}
  >
   Sign Up
  </button>
  </div>

  <form className="space-y-4 animate-auth-form" onSubmit={handleSubmit}>
  <div>
   <label
   className="text-sm text-base font-medium "
   htmlFor="email"
   >
   Email
   </label>
   <input
   id="email"
   type="email"
   autoComplete="email"
   className="w-full px-4 py-3 mt-2 text-sm transition border rounded-lg outline-none border-border-base bg-card focus:border-accent focus:ring-4 focus:ring-accent/10 "
   value={email}
   onChange={(event) => setEmail(event.target.value)}
   required
   />
  </div>

  <div>
   <label
   className="text-sm text-base font-medium "
   htmlFor="password"
   >
   Password
   </label>
   <input
   id="password"
   type="password"
   autoComplete={
   mode === 'login' ? 'current-password' : 'new-password'
   }
   className="w-full px-4 py-3 mt-2 text-sm transition border rounded-lg outline-none border-border-base bg-card focus:border-accent focus:ring-4 focus:ring-accent/10 "
   value={password}
   onChange={(event) => setPassword(event.target.value)}
   required
   minLength={6}
   />
  </div>

  <button
   type="submit"
   disabled={submitting}
   className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-semibold transition rounded-lg shadow-lg bg-accent text-accent-fg shadow-accent/20 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
  >
   {submitting ? (
   <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
   ) : (
   <ArrowRight className="w-4 h-4" aria-hidden="true" />
   )}
   {mode === 'login' ? 'Login' : 'Create Account'}
  </button>
  </form>
  </div>
 </section>
 </main>
 )
}
