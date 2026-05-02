import { useState, type FormEvent } from 'react'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

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
 <main className="grid min-h-screen place-items-center bg-surface px-6 py-10 text-base ">
 <section className="w-full max-w-md animate-auth-card">
  <div className="mb-8 flex flex-col items-center text-center">
  <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-accent text-accent-fg shadow-lg shadow-accent/20">
  <Sparkles className="h-7 w-7" aria-hidden="true" />
  </div>
  <p className="text-3xl font-semibold">FlipSite</p>
  <p className="mt-2 text-sm text-muted ">
  Track buys, listings, and flips from one clean workspace.
  </p>
  </div>

  <div className="rounded-lg border border-border-base bg-card p-6 shadow-xl shadow-border-base/40 ">
  <div className="mb-6 grid grid-cols-2 rounded-lg bg-surface-2 p-1 bg-surface-2/50">
  <button
   type="button"
   className={`rounded-md px-4 py-2 text-sm font-medium transition ${
   mode === 'login'
   ? 'bg-card text-accent shadow-sm'
   : 'text-muted hover:text-base hover:text-accent-fg'
   }`}
   onClick={() => changeMode('login')}
  >
   Login
  </button>
  <button
   type="button"
   className={`rounded-md px-4 py-2 text-sm font-medium transition ${
   mode === 'signup'
   ? 'bg-card text-accent shadow-sm'
   : 'text-muted hover:text-base hover:text-accent-fg'
   }`}
   onClick={() => changeMode('signup')}
  >
   Sign Up
  </button>
  </div>

  <form className="animate-auth-form space-y-4" onSubmit={handleSubmit}>
  <div>
   <label
   className="text-sm font-medium text-base "
   htmlFor="email"
   >
   Email
   </label>
   <input
   id="email"
   type="email"
   autoComplete="email"
   className="mt-2 w-full rounded-lg border border-border-base bg-card px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 "
   value={email}
   onChange={(event) => setEmail(event.target.value)}
   required
   />
  </div>

  <div>
   <label
   className="text-sm font-medium text-base "
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
   className="mt-2 w-full rounded-lg border border-border-base bg-card px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 "
   value={password}
   onChange={(event) => setPassword(event.target.value)}
   required
   minLength={6}
   />
  </div>

  <button
   type="submit"
   disabled={submitting}
   className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/20 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
  >
   {submitting ? (
   <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
   ) : (
   <ArrowRight className="h-4 w-4" aria-hidden="true" />
   )}
   {mode === 'login' ? 'Login' : 'Create Account'}
  </button>
  </form>
  </div>
 </section>
 </main>
 )
}
