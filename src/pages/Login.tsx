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
      const message =
        error instanceof Error ? error.message : 'Authentication failed'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-[#0a0a0f] dark:text-zinc-50">
      <section className="w-full max-w-md animate-auth-card">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-violet-600 text-white shadow-lg shadow-violet-950/30">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-3xl font-semibold">FlipSite</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track buys, listings, and flips from one clean workspace.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70 dark:border-white/10 dark:bg-[#13131a] dark:shadow-black/30">
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-zinc-100 p-1 dark:bg-white/5">
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-violet-600 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
              onClick={() => changeMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-violet-600 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
              onClick={() => changeMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="animate-auth-form space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-50"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-50"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/25 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
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
