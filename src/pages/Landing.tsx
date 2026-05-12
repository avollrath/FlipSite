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
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import heroVideo from '@/assets/heroV2.mp4'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { demoAccountEmail } from '@/lib/demoMode'
import { fadeIn, fadeUp, gsap, ScrollTrigger } from '@/lib/animations'
import { cn } from '@/lib/utils'

const dashboardPreview = '/screenshots/dashboard-overview.png'
const itemsListPreview = '/screenshots/inventory-table.png'
const appPreview = '/screenshots/add-item-form.png'
const profitChartPreview = '/screenshots/profit-chart.png'
const inventoryGalleryPreview = '/screenshots/inventory-gallery.png'
const categoryBreakdownPreview = '/screenshots/category-breakdown.png'
const itemDetailPreview = '/screenshots/item-detail.png'
const mobileDashboardPreview = '/screenshots/mobile-dashboard.png'

const features: Array<{
  description: string
  icon: LucideIcon
  preview?: string
  previewAlt?: string
  title: string
}> = [
  {
    description:
      "Add anything you own or plan to sell. Where you got it, what you paid, what condition it's in. Photos, receipts, everything — right there when you need it.",
    icon: Package,
    preview: itemsListPreview,
    previewAlt: 'Items list showing each flip with buy price, sell price, and profit',
    title: 'Every item, all in one place',
  },
  {
    description:
      'Selling price minus what you paid — plus fees, shipping, and splits if one buy becomes multiple sales. The number you see is the number you actually made.',
    icon: TrendingUp,
    preview: itemDetailPreview,
    previewAlt: 'Item detail showing buy price, sell price, profit and ROI for one flip',
    title: 'Know your real profit',
  },
  {
    description:
      "Switch to gallery view and browse your items like a visual shelf. Upload photos straight from your phone — FlipSite handles the rest.",
    icon: Images,
    preview: inventoryGalleryPreview,
    previewAlt: 'Gallery view showing item photos in a visual grid',
    title: "See your inventory, don't just list it",
  },
  {
    description:
      "Filter by what's sold, what's listed, what's still sitting at home. Search by category, platform, or price range. No more scrolling through a spreadsheet to find one item.",
    icon: LayoutList,
    preview: itemsListPreview,
    previewAlt: 'Filtered items list showing sorted and searched results',
    title: 'Find anything in seconds',
  },
  {
    description:
      "Which categories make you the most? What's your best month? Where are you leaving money on the table? Your dashboard shows you at a glance.",
    icon: BarChart3,
    preview: categoryBreakdownPreview,
    previewAlt: 'Analytics page showing profit breakdown by category',
    title: "See where your money's actually going",
  },
  {
    description:
      "Pick the look that feels right and use it every day. It shouldn't feel like work — it should feel like yours.",
    icon: Palette,
    preview: dashboardPreview,
    previewAlt: 'Dashboard in light mode showing the clean, customisable interface',
    title: '8 themes. Light, dark, and everything between.',
  },
]

const stats = [
  { label: 'items tracked by real users', numericEnd: 100, prefix: '', suffix: '+', value: '100+' },
  { label: 'in sales logged so far', numericEnd: 16, prefix: '€', suffix: 'k+', value: '€16k+' },
  { label: 'themes to make it yours', numericEnd: 8, prefix: '', suffix: '', value: '8' },
  { label: 'spreadsheets needed', numericEnd: 0, prefix: '', suffix: '', value: '0' },
]

const steps = [
  {
    description:
      "Takes 30 seconds. Add a photo, what you paid, where you got it, and what condition it's in. Done.",
    image: appPreview,
    imageAlt: 'Add item form showing name, buy price, condition, and category fields',
    number: '01',
    title: 'Log what you buy',
  },
  {
    description:
      "Sold something? Tap sold, enter the price, and FlipSite instantly calculates your profit and ROI. That's it.",
    image: itemsListPreview,
    imageAlt: 'Items list showing name, buy price, sell price, profit and ROI for each flip',
    number: '02',
    title: 'Mark it when it sells',
  },
  {
    description:
      "Your dashboard shows what you've made, what you've got in stock, and which flips are actually worth your time.",
    image: profitChartPreview,
    imageAlt: 'Profit over time chart showing cumulative earnings across all flips',
    number: '03',
    title: 'See the full picture',
  },
]

export function Landing() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [navScrolled, setNavScrolled] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleScroll() {
      setNavScrolled(window.scrollY > 12)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar: slide down from top on load
      gsap.fromTo(
        '[data-anim="nav"]',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      )

      // Hero elements: staggered fade-up on load
      gsap.fromTo('[data-anim="hero-badge"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.1 })
      gsap.fromTo('[data-anim="hero-h1-1"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.2 })
      gsap.fromTo('[data-anim="hero-h1-2"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.35 })
      gsap.fromTo('[data-anim="hero-sub"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.5 })
      gsap.fromTo('[data-anim="hero-ctas"]', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.65 })
      gsap.fromTo(
        '[data-anim="hero-img"]',
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.9, ease: 'power1.out', delay: 0.8 },
      )

      // Stats: count-up animation
      document.querySelectorAll<HTMLElement>('[data-stat-end]').forEach((el, i) => {
        const end = Number(el.dataset.statEnd ?? 0)
        const prefix = el.dataset.statPrefix ?? ''
        const suffix = el.dataset.statSuffix ?? ''
        const obj = { val: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: end,
              duration: 1.5,
              delay: i * 0.15,
              ease: 'power2.out',
              snap: { val: 1 },
              onUpdate: () => {
                el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`
              },
            })
          },
        })
      })

      // Features section header
      fadeUp('[data-anim="features-header"]')

      // Each feature row
      document.querySelectorAll('[data-anim="feature-row"]').forEach((row) => {
        const img = row.querySelector('[data-anim="feature-img"]')
        const heading = row.querySelector('[data-anim="feature-heading"]')
        const body = row.querySelector('[data-anim="feature-body"]')
        const icon = row.querySelector('[data-anim="feature-icon"]')
        if (img) fadeIn(img, { trigger: row })
        if (icon) gsap.fromTo(icon, { opacity: 0, scale: 0.8 }, {
          opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)', delay: 0.1,
          scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'play none none none' },
        })
        if (heading) fadeUp(heading, { trigger: row })
        if (body) fadeUp(body, { trigger: row, delay: 0.15 })
      })

      // How-it-works steps
      document.querySelectorAll('[data-anim="step"]').forEach((step) => {
        fadeUp(step, { trigger: step, duration: 0.8 })
      })

      // Mobile callout
      fadeUp('[data-anim="mobile-callout"]')

      // CTA section
      const ctaSection = document.querySelector('[data-anim="cta-section"]')
      if (ctaSection) {
        fadeUp(ctaSection.querySelector('[data-anim="cta-heading"]') ?? ctaSection, { trigger: ctaSection })
        fadeUp(ctaSection.querySelector('[data-anim="cta-sub"]') ?? ctaSection, { trigger: ctaSection, delay: 0.1 })
        fadeUp(ctaSection.querySelector('[data-anim="cta-btns"]') ?? ctaSection, { trigger: ctaSection, delay: 0.2 })
      }
    }, mainRef)

    return () => ctx.revert()
  }, [])

  async function handleDemoLogin() {
    setDemoLoading(true)
    try {
      await signIn(demoAccountEmail, 'demo1234')
      toast.success('Demo mode ready')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (import.meta.env.DEV) console.error(error)
      toast.error('Unable to start demo mode. Please try again.')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <main ref={mainRef} className="lp-body min-h-screen" style={{ background: 'var(--lp-bg)', color: 'var(--lp-text)' }}>

      {/* ── Navbar ── */}
      <nav
        data-anim="nav"
        className={cn(
          'fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300',
          navScrolled ? 'border-[var(--lp-border)] shadow-sm' : 'border-transparent',
        )}
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" aria-label="FlipSite home"><Logo size={22} /></a>
          <div className="hidden items-center gap-8 text-base md:flex" style={{ color: 'var(--lp-muted)' }}>
            <a href="#features" className="transition-colors hover:text-[var(--lp-text)]">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-[var(--lp-text)]">How it works</a>
            <a href="#demo" className="transition-colors hover:text-[var(--lp-text)]">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-base font-medium transition-colors" style={{ color: 'var(--lp-accent)' }}>
              Log in
            </a>
            <a
              href="/login?tab=signup"
              className="lp-gradient-bg rounded-full px-5 py-2 text-base font-semibold text-white transition-opacity hover:opacity-90"
            >
              Try it free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="lp-dot-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 text-center"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          autoPlay loop muted playsInline aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.62) 0%, rgba(250,250,249,0.92) 100%)' }}
        />

        <div
          data-anim="hero-badge"
          className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium"
          style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.07)', color: 'var(--lp-accent)' }}
        >
          Built for flippers, by a flipper.
        </div>

        <h1 className="relative z-10 lp-display max-w-4xl font-extrabold tracking-tight" style={{ lineHeight: 1.05 }}>
          <span data-anim="hero-h1-1" className="block" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', color: 'var(--lp-text)' }}>
            You buy. You sell.
          </span>
          <span data-anim="hero-h1-2" className="block lp-gradient-text" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
            Finally know if you're<br className="hidden sm:block" /> actually making money.
          </span>
        </h1>

        <p
          data-anim="hero-sub"
          className="relative z-10 mt-8 max-w-2xl leading-relaxed"
          style={{ fontSize: '1.125rem', color: 'var(--lp-muted)' }}
        >
          FlipSite tracks every item you flip — what you paid, what you sold it for, and what you actually walked away with. No spreadsheets. No guessing. Just the truth.
        </p>

        <div data-anim="hero-ctas" className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/login?tab=signup"
            className="lp-gradient-bg lp-btn-primary text-white"
          >
            Start for free
          </a>
          <a href="#demo" className="lp-btn-outline">
            See how it works →
          </a>
        </div>

        <div data-anim="hero-img" className="relative z-10 mb-16 mt-16 w-full max-w-6xl">
          <PreviewImage
            alt="FlipSite dashboard showing total profit, inventory stats, and charts at a glance"
            src={dashboardPreview}
          />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y py-16" style={{ borderColor: 'var(--lp-border)', background: 'var(--lp-surface)' }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-0 px-6 text-center">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="lp-stat-cell px-10 py-4">
                <p
                  className="lp-display font-extrabold tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--lp-text)', lineHeight: 1 }}
                  data-stat-end={stat.numericEnd}
                  data-stat-prefix={stat.prefix}
                  data-stat-suffix={stat.suffix}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: 'var(--lp-muted)' }}>
                  {stat.label}
                </p>
              </div>
              {i < stats.length - 1 && (
                <div className="hidden h-16 w-px shrink-0 md:block" style={{ background: 'var(--lp-border)' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ background: 'var(--lp-bg)' }}>
        <div
          data-anim="features-header"
          className="mx-auto max-w-5xl px-6 pt-32 pb-16 text-center"
        >
          <h2
            className="lp-display font-bold"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--lp-text)', lineHeight: 1.15 }}
          >
            Everything you need.{' '}
            <span className="lp-gradient-text">Nothing you don't.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'var(--lp-muted)', lineHeight: 1.7 }}>
            Built around how buying and selling actually works in real life.
          </p>
        </div>

        <div className="lp-features-list">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              data-anim="feature-row"
              className={cn('lp-feature-row', index % 2 === 1 && 'lp-feature-row--reverse')}
              style={{ background: index % 2 === 0 ? 'var(--lp-bg)' : 'var(--lp-surface)' }}
            >
              <div className="lp-feature-row__image" data-anim="feature-img">
                {feature.preview && (
                  <img
                    src={feature.preview}
                    alt={feature.previewAlt ?? feature.title}
                    className="lp-feature-img"
                  />
                )}
              </div>
              <div className="lp-feature-row__text">
                <div data-anim="feature-icon" className="lp-gradient-bg lp-feature-icon">
                  <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <h3 data-anim="feature-heading" className="lp-display lp-feature-heading">
                  {feature.title}
                </h3>
                <p data-anim="feature-body" className="lp-feature-body">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="lp-dot-grid px-6"
        style={{ background: 'var(--lp-tint)', paddingTop: '140px', paddingBottom: '140px' }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <h2
              className="lp-display font-bold"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--lp-text)', lineHeight: 1.15 }}
            >
              Simple enough to{' '}
              <span className="lp-gradient-text">actually use.</span>
            </h2>
          </div>
          <div className="space-y-28 lg:space-y-36">
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-anim="step"
                className={cn(
                  'flex flex-col items-center gap-12 lg:flex-row lg:gap-20',
                  index % 2 === 1 && 'lg:flex-row-reverse',
                )}
              >
                <div className="flex-1">
                  <span
                    className="lp-display block font-extrabold leading-none select-none"
                    style={{ fontSize: '8rem', color: '#EDE9FE', lineHeight: 0.85, marginBottom: '0.25rem' }}
                  >
                    {step.number}
                  </span>
                  <h3
                    className="lp-display mt-4 font-bold"
                    style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: 'var(--lp-text)', lineHeight: 1.2 }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--lp-muted)', lineHeight: 1.7 }}>
                    {step.description}
                  </p>
                </div>
                <PreviewImage alt={step.imageAlt} src={step.image} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile callout ── */}
      <section
        className="px-6 py-28 text-center"
        style={{ background: 'var(--lp-surface)' }}
      >
        <div data-anim="mobile-callout" className="mx-auto" style={{ maxWidth: '300px' }}>
          <div
            className="relative mx-auto overflow-hidden"
            style={{
              width: '240px',
              borderRadius: '44px',
              border: '8px solid #1A1523',
              boxShadow: '0 32px 80px rgba(124,58,237,0.18), 0 8px 24px rgba(0,0,0,0.12), inset 0 0 0 2px rgba(255,255,255,0.1)',
              background: '#1A1523',
              padding: '10px',
            }}
          >
            <div
              className="absolute left-1/2 z-10 -translate-x-1/2"
              style={{ top: '10px', width: '72px', height: '20px', background: '#1A1523', borderRadius: '0 0 14px 14px' }}
            />
            <div style={{ borderRadius: '36px', overflow: 'hidden' }}>
              <img
                src={mobileDashboardPreview}
                alt="FlipSite dashboard on a phone showing inventory stats and total profit"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>
          <p
            className="lp-display mt-10 font-semibold"
            style={{ fontSize: '1.25rem', color: 'var(--lp-text)' }}
          >
            Works just as well on your phone.
          </p>
        </div>
      </section>

      {/* ── CTA / Demo ── */}
      <section id="demo" className="px-6" style={{ paddingTop: '140px', paddingBottom: '140px' }}>
        <div className="mx-auto max-w-2xl text-center" data-anim="cta-section">
          <div className="lp-gradient-bg rounded-3xl px-8 py-20 sm:px-16">
            <h2
              data-anim="cta-heading"
              className="lp-display font-bold text-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15 }}
            >
              Try it before you decide.
            </h2>
            <p data-anim="cta-sub" className="mt-5 text-lg text-white/80" style={{ lineHeight: 1.7 }}>
              Jump into a pre-filled demo — real items, real numbers, no sign-up needed. If it clicks, make a free account in 30 seconds.
            </p>
            <div data-anim="cta-btns" className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="lp-btn-white inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ color: 'var(--lp-accent)' }}
              >
                {demoLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Try the demo →
              </button>
              <a
                href="/login?tab=signup"
                className="lp-btn-ghost"
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
          <p className="text-base text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Track your flips. Know your numbers. Keep more of what you make.
          </p>
          <div className="flex items-center gap-6 text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <a href="/login" className="transition-colors hover:text-white">Log in</a>
            <a href="/login?tab=signup" className="transition-colors hover:text-white">Sign up</a>
            <a href="https://vollrath.dev" target="_blank" rel="noopener" className="transition-colors hover:text-white">vollrath.dev</a>
          </div>
        </div>
      </footer>

    </main>
  )
}

function PreviewImage({ alt, className, src }: { alt: string; className?: string; src: string }) {
  return (
    <div
      className={cn('w-full flex-1 overflow-hidden lp-screenshot', className)}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
    </div>
  )
}
