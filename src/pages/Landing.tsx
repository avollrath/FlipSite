import {
  BarChart3,
  Images,
  LayoutList,
  Loader2,
  Package,
  Palette,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import dashboardPreview from '@/assets/dashboard.jpg'
import itemsListPreview from '@/assets/items_list.jpg'
import appPreview from '@/assets/preview.jpg'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { demoAccountEmail } from '@/lib/demoMode'
import { cn } from '@/lib/utils'

const features: Array<{
  description: string
  icon: LucideIcon
  title: string
}> = [
  {
    description:
      'Every item you own in one place - what you paid, where you bought it, condition, photos, receipts, and manuals all attached.',
    icon: Package,
    title: 'Full inventory tracking',
  },
  {
    description:
      'Not just sell minus buy. Bundle-aware calculations handle complex purchases where one buy splits into multiple sells.',
    icon: TrendingUp,
    title: 'Real profit numbers',
  },
  {
    description:
      'Browse your inventory visually. Upload photos or paste screenshots directly - images are compressed automatically.',
    icon: Images,
    title: 'Photo gallery view',
  },
  {
    description:
      'Filter by status, platform, category, and search. Switch between a detailed table and a visual gallery instantly.',
    icon: LayoutList,
    title: 'Powerful filtering',
  },
  {
    description:
      'Profit over time, ROI by category, top flips, monthly buy vs sell volume - all on one screen.',
    icon: BarChart3,
    title: 'Dashboard analytics',
  },
  {
    description:
      '8 color themes, light and dark mode, 6 font options. The app should feel good to use every day.',
    icon: Palette,
    title: 'Built to feel like yours',
  },
]

const stats = [
  { label: 'Items tracked', value: '100+' },
  { label: 'Revenue logged', value: '€16k+' },
  { label: 'Color themes', value: '8' },
  { label: 'Spreadsheets needed', value: '0' },
]

const steps = [
  {
    description:
      'Log each purchase with a photo, price, platform, and condition. Takes 30 seconds.',
    image: appPreview,
    number: '01',
    title: 'Add what you buy',
  },
  {
    description:
      'Mark items as sold, listed, or keeping. Profit and ROI calculate automatically.',
    image: itemsListPreview,
    number: '02',
    title: 'Track what you sell',
  },
  {
    description:
      "Dashboard and analytics show what you've made, what's still sitting, and where you do best.",
    image: dashboardPreview,
    number: '03',
    title: 'See the full picture',
  },
]

export function Landing() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [navScrolled, setNavScrolled] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setNavScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleDemoLogin() {
    setDemoLoading(true)

    try {
      await signIn(demoAccountEmail, 'demo1234')
      toast.success('Demo mode ready')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error)
      }
      toast.error('Unable to start demo mode. Please try again.')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080810] text-white">
      <nav
        className={cn(
          'fixed left-0 right-0 top-0 z-50 border-b bg-black/40 backdrop-blur-md transition-colors',
          navScrolled ? 'border-white/15 bg-black/55' : 'border-white/[0.08]',
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" aria-label="FlipSite home">
            <Logo size={36} />
          </a>

          <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-white">
              How it works
            </a>
            <a href="#demo" className="transition-colors hover:text-white">
              Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              Log in
            </a>
            <a
              href="/login?tab=signup"
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent/90"
            >
              Sign up
            </a>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, hsl(var(--accent) / 0.18) 0%, transparent 70%)',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080810] to-transparent" />

        <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
          Personal inventory & resale tracker
        </div>

        <h1 className="relative z-10 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
          Know what you own.
          <br />
          Know what you made.
        </h1>

        <p className="relative z-10 mt-6 max-w-xl text-lg text-white/50">
          FlipSite replaces the spreadsheet you've been maintaining for your
          inventory and resale activity - with actual structure, real numbers,
          and everything in one place.
        </p>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/login?tab=signup"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent/90"
          >
            Get started free
          </a>
          <a
            href="#demo"
            className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            See a demo -&gt;
          </a>
        </div>

        <PreviewImage
          alt="FlipSite dashboard preview"
          className="relative z-10 mt-16 max-w-5xl"
          src={dashboardPreview}
        />
      </section>

      <section className="border-y border-white/[0.08] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-12 px-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-0.5 text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-white">
              Everything in one place
            </h2>
            <p className="mt-3 text-lg text-white/40">
              Built for how buying and selling actually works
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-white/15"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                  <feature.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/45">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-32">
        <div className="mx-auto max-w-6xl space-y-32">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={cn(
                'flex flex-col items-center gap-16 lg:flex-row',
                index % 2 === 1 && 'lg:flex-row-reverse',
              )}
            >
              <div className="flex-1">
                <span className="text-5xl font-bold text-accent/20">
                  {step.number}
                </span>
                <h3 className="mt-3 text-3xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-white/45">
                  {step.description}
                </p>
              </div>
              <PreviewImage alt={`${step.title} preview`} src={step.image} />
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 sm:px-12"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--accent) / 0.12) 0%, transparent 70%)',
            }}
          >
            <h2 className="text-4xl font-bold text-white">See it in action</h2>
            <p className="mt-4 text-lg text-white/45">
              Try the demo with a pre-filled inventory - no sign up needed.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {demoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                Try demo -&gt;
              </button>
              <a
                href="/login?tab=signup"
                className="w-full rounded-full border border-white/15 px-8 py-3 text-center text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white sm:w-auto"
              >
                Create free account
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo size={32} />
          <p className="text-sm text-white/30">
            Personal inventory and resale tracker. Built by André Vollrath.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="/login" className="transition-colors hover:text-white/70">
              Log in
            </a>
            <a
              href="/login?tab=signup"
              className="transition-colors hover:text-white/70"
            >
              Sign up
            </a>
            <a
              href="https://vollrath.dev"
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-white/70"
            >
              vollrath.dev
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

function PreviewImage({
  alt,
  className,
  src,
}: {
  alt: string
  className?: string
  src: string
}) {
  return (
    <div
      className={cn(
        'w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="aspect-video h-full w-full object-cover object-top opacity-90"
      />
    </div>
  )
}
