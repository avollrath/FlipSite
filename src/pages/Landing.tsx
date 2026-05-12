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
import heroVideo from '@/assets/heroV2.mp4'

const dashboardPreview = '/screenshots/dashboard-overview.png'
const itemsListPreview = '/screenshots/inventory-table.png'
const appPreview = '/screenshots/add-item-form.png'
const profitChartPreview = '/screenshots/profit-chart.png'
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
      'Add anything you own or plan to sell. Where you got it, what you paid, what condition it\'s in. Photos, receipts, everything — right there when you need it.',
    icon: Package,
    title: 'Every item, all in one place',
  },
  {
    description:
      'Selling price minus what you paid — plus fees, shipping, and splits if one buy becomes multiple sales. The number you see is the number you actually made.',
    icon: TrendingUp,
    title: 'Know your real profit',
  },
  {
    description:
      'Switch to gallery view and browse your items like a visual shelf. Upload photos straight from your phone — FlipSite handles the rest.',
    icon: Images,
    title: 'See your inventory, don\'t just list it',
  },
  {
    description:
      'Filter by what\'s sold, what\'s listed, what\'s still sitting at home. Search by category, platform, or price range. No more scrolling through a spreadsheet to find one item.',
    icon: LayoutList,
    title: 'Find anything in seconds',
  },
  {
    description:
      'Which categories make you the most? What\'s your best month? Where are you leaving money on the table? Your dashboard shows you at a glance.',
    icon: BarChart3,
    title: "See where your money's actually going",
  },
  {
    description:
      'Pick the look that feels right and use it every day. It shouldn\'t feel like work — it should feel like yours.',
    icon: Palette,
    title: '8 themes. Light, dark, and everything between.',
  },
]

const stats = [
  { label: 'items tracked by real users', value: '100+' },
  { label: 'in sales logged so far', value: '€16k+' },
  { label: 'themes to make it yours', value: '8' },
  { label: 'spreadsheets needed', value: '0' },
]

const steps = [
  {
    description:
      'Takes 30 seconds. Add a photo, what you paid, where you got it, and what condition it\'s in. Done.',
    image: appPreview,
    number: '01',
    title: 'Log what you buy',
  },
  {
    description:
      'Sold something? Tap sold, enter the price, and FlipSite instantly calculates your profit and ROI. That\'s it.',
    image: itemsListPreview,
    number: '02',
    title: 'Mark it when it sells',
  },
  {
    description:
      "Your dashboard shows what you've made, what you've got in stock, and which flips are actually worth your time.",
    image: profitChartPreview,
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
    <main className="lp-body min-h-screen" style={{ background: 'var(--lp-bg)', color: 'var(--lp-text)' }}>
      {/* ── Navbar ── */}
      <nav
        className={cn(
          'fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300',
          navScrolled
            ? 'border-[var(--lp-border)] shadow-sm'
            : 'border-transparent',
        )}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" aria-label="FlipSite home">
            <Logo size={22} />
          </a>

          <div className="hidden items-center gap-8 text-base md:flex" style={{ color: 'var(--lp-muted)' }}>
            <a href="#features" className="transition-colors hover:text-[var(--lp-text)]">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-[var(--lp-text)]">
              How it works
            </a>
            <a href="#demo" className="transition-colors hover:text-[var(--lp-text)]">
              Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-base font-medium transition-colors"
              style={{ color: 'var(--lp-accent)' }}
            >
              Log in
            </a>
            <a
              href="/login?tab=signup"
              className="lp-gradient-bg rounded-full px-5 py-2 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: 'var(--lp-accent)' }}
            >
              Try it free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 text-center">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        {/* Light semi-transparent overlay so text stays readable */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.85) 100%)',
          }}
        />
        {/* Subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '128px',
          }}
        />

        <div
          className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium"
          style={{
            borderColor: 'rgba(124,58,237,0.3)',
            background: 'rgba(124,58,237,0.07)',
            color: 'var(--lp-accent)',
          }}
        >
          Built for flippers, by a flipper.
        </div>

        <h1
          className="lp-display lp-gradient-text relative z-10 max-w-3xl font-bold leading-[1.1] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          You buy. You sell.
          <br />
          Finally know if you're actually making money.
        </h1>

        <p
          className="relative z-10 mt-6 max-w-2xl text-xl leading-relaxed"
          style={{ color: 'var(--lp-muted)' }}
        >
          FlipSite tracks every item you flip — what you paid, what you sold it for, and what you actually walked away with. No spreadsheets. No guessing. Just the truth.
        </p>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/login?tab=signup"
            className="lp-gradient-bg rounded-full px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              outlineColor: 'var(--lp-accent)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            }}
          >
            Start for free
          </a>
          <a
            href="#demo"
            className="rounded-full border px-7 py-3.5 text-base font-medium transition-colors hover:bg-[var(--lp-tint)]"
            style={{
              borderColor: 'var(--lp-accent)',
              color: 'var(--lp-accent)',
            }}
          >
            See how it works →
          </a>
        </div>

        <PreviewImage
          alt="FlipSite dashboard showing total profit, inventory stats, and charts at a glance"
          className="relative z-10 mb-16 mt-16 max-w-7xl"
          src={dashboardPreview}
        />
      </section>

      {/* ── Stats bar ── */}
      <section
        className="border-y py-12"
        style={{ borderColor: 'var(--lp-border)', background: 'var(--lp-tint)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-14 px-6 text-center md:gap-20">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-14">
              <div>
                <p
                  className="lp-display text-4xl font-bold tracking-tight md:text-5xl"
                  style={{ color: 'var(--lp-text)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-base" style={{ color: 'var(--lp-muted)' }}>
                  {stat.label}
                </p>
              </div>
              {i < stats.length - 1 && (
                <div
                  className="hidden h-10 w-px md:block"
                  style={{ background: 'var(--lp-gradient)' }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-32" style={{ background: 'var(--lp-bg)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2
              className="lp-display font-bold"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--lp-text)' }}
            >
              Everything you need. Nothing you don't.
            </h2>
            <p className="mt-3 text-xl" style={{ color: 'var(--lp-muted)' }}>
              Built around how buying and selling actually works in real life.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'var(--lp-surface)',
                  borderColor: 'var(--lp-border)',
                  borderRadius: '14px',
                  boxShadow: '0 2px 12px rgba(124,58,237,0.07)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 8px 24px rgba(124,58,237,0.13)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 2px 12px rgba(124,58,237,0.07)'
                }}
              >
                <div
                  className="lp-gradient-bg mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                >
                  <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--lp-text)' }}>
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-6 py-32" style={{ background: 'var(--lp-surface)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <h2
              className="lp-display font-bold"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--lp-text)' }}
            >
              Simple enough to actually use.
            </h2>
          </div>
        </div>
        <div className="mx-auto max-w-6xl space-y-32">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={cn(
                'flex flex-col items-center gap-16 lg:flex-row',
                index % 2 === 1 && 'lg:flex-row-reverse',
              )}
              style={{ background: index % 2 === 1 ? 'var(--lp-bg)' : 'var(--lp-surface)' }}
            >
              <div className="flex-1">
                <span
                  className="lp-display text-5xl font-bold"
                  style={{ color: '#EDE9FE' }}
                >
                  {step.number}
                </span>
                <h3
                  className="lp-display mt-3 font-bold"
                  style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--lp-text)' }}
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-xl leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
                  {step.description}
                </p>
              </div>
              <PreviewImage
                alt={
                  index === 0
                    ? 'Add item form showing name, buy price, condition, and category fields'
                    : index === 1
                    ? 'Items list showing name, buy price, sell price, profit and ROI for each flip'
                    : 'Profit over time chart showing cumulative earnings across all flips'
                }
                src={step.image}
                light
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA / Demo ── */}
      <section id="demo" className="px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="lp-gradient-bg rounded-3xl px-8 py-16 sm:px-12"
          >
            <h2
              className="lp-display text-4xl font-bold text-white"
            >
              Try it before you decide.
            </h2>
            <p className="mt-4 text-xl text-white/80">
              Jump into a pre-filled demo — real items, real numbers, no sign-up needed. If it clicks, make a free account in 30 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--lp-accent)', outlineColor: 'var(--lp-accent)' }}
              >
                {demoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                Try the demo →
              </button>
              <a
                href="/login?tab=signup"
                className="w-full rounded-full border border-white/40 px-8 py-3.5 text-center text-base text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create free account
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-6 py-12"
        style={{ background: '#1A1523', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo size={19} />
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Track your flips. Know your numbers. Keep more of what you make.
          </p>
          <div className="flex items-center gap-6 text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <a href="/login" className="transition-colors hover:text-white">
              Log in
            </a>
            <a
              href="/login?tab=signup"
              className="transition-colors hover:text-white"
            >
              Sign up
            </a>
            <a
              href="https://vollrath.dev"
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-white"
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
  light,
  src,
}: {
  alt: string
  className?: string
  light?: boolean
  src: string
}) {
  return (
    <div
      className={cn(
        'w-full flex-1 overflow-hidden',
        className,
      )}
      style={{
        borderRadius: '16px',
        border: light ? '1px solid var(--lp-border)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: light
          ? '0 4px 24px rgba(124,58,237,0.08)'
          : '0 20px 60px rgba(0,0,0,0.4)',
      }}
    >
      <img
        src={src}
        alt={alt}
        className="aspect-video h-full w-full object-cover object-top"
      />
    </div>
  )
}
