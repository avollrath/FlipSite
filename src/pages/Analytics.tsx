import { Activity, Banknote, Boxes, Percent, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { useItems } from '@/hooks/useItems'
import {
  buildAnalyticsSummary,
  buildMonthlyPerformance,
  buildProfitByCategory,
  buildProfitByPlatform,
  type ChartDatum,
} from '@/lib/analytics'
import { useTheme } from '@/lib/theme'
import { formatCurrency } from '@/lib/utils'

type TooltipPayload = {
  color?: string
  name: string
  value: number
}

type TooltipProps = {
  active?: boolean
  label?: string
  payload?: TooltipPayload[]
}

export function Analytics() {
  const { data: items = [], isLoading } = useItems()
  useTheme()
  const colors = getChartColors()
  const summary = useMemo(() => buildAnalyticsSummary(items), [items])
  const monthlyData = useMemo(() => buildMonthlyPerformance(items), [items])
  const profitByCategory = useMemo(() => buildProfitByCategory(items), [items])
  const profitByPlatform = useMemo(() => buildProfitByPlatform(items), [items])

  if (isLoading) {
    return <LoadingGrid />
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-accent">Analytics</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">
          Performance by the numbers
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
        />
        <SummaryCard
          icon={Banknote}
          label="Total Profit"
          value={formatCurrency(summary.totalProfit)}
        />
        <SummaryCard
          icon={Activity}
          label="Avg Profit / Sold"
          value={formatCurrency(summary.averageProfit)}
        />
        <SummaryCard
          icon={Percent}
          label="Average ROI"
          value={`${summary.averageRoi.toFixed(1)}%`}
        />
        <SummaryCard
          icon={Boxes}
          label="Sold Items"
          value={String(summary.soldItemsCount)}
        />
        <SummaryCard
          icon={Banknote}
          label="Active Inventory Value"
          value={formatCurrency(summary.activeInventoryValue)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          hasData={monthlyData.length > 0}
          legend={<DotLegend items={[{ color: colors.accent, label: 'Revenue' }]} />}
          title="Monthly Revenue"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <ChartGradients idSuffix="analytics-revenue" />
              <ChartGrid />
              <ChartXAxis dataKey="label" rotate={monthlyData.length > 6} />
              <ChartYAxis />
              <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                activeBar={{ fill: colors.accent, filter: 'brightness(1.15)', opacity: 1 }}
                animationDuration={600}
                animationEasing="ease-out"
                dataKey="revenue"
                fill="url(#gradientAccent-analytics-revenue)"
                isAnimationActive
                maxBarSize={28}
                name="Revenue"
                opacity={0.85}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          hasData={monthlyData.length > 0}
          legend={<DotLegend items={[{ color: colors.positive, label: 'Positive' }, { color: colors.negative, label: 'Negative' }]} />}
          title="Monthly Profit"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <ChartGradients idSuffix="analytics-monthly-profit" />
              <ChartGrid />
              <ChartXAxis dataKey="label" rotate={monthlyData.length > 6} />
              <ChartYAxis />
              <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                activeBar={{ filter: 'brightness(1.15)', opacity: 1 }}
                animationDuration={600}
                animationEasing="ease-out"
                dataKey="profit"
                isAnimationActive
                maxBarSize={28}
                name="Profit"
                radius={[4, 4, 0, 0]}
              >
                {monthlyData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      (entry.profit ?? 0) >= 0
                        ? 'url(#gradientPositive-analytics-monthly-profit)'
                        : 'url(#gradientNegative-analytics-monthly-profit)'
                    }
                    opacity={0.85}
                    stroke="none"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ProfitBarChart
          colors={colors}
          data={profitByCategory}
          title="Profit by Category"
        />
        <ProfitBarChart
          colors={colors}
          data={profitByPlatform}
          title="Profit by Platform"
        />
      </div>
    </section>
  )
}

function ProfitBarChart({
  colors,
  data,
  title,
}: {
  colors: ReturnType<typeof getChartColors>
  data: ChartDatum[]
  title: string
}) {
  return (
    <ChartCard
      hasData={data.length > 0}
      legend={<DotLegend items={[{ color: colors.accent, label: 'Profit' }, { color: colors.negative, label: 'Loss' }]} />}
      title={title}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <ChartGradients idSuffix={`analytics-${title.toLowerCase().replaceAll(' ', '-')}`} />
          <ChartGrid />
          <ChartXAxis dataKey="label" rotate={data.length > 6} />
          <ChartYAxis />
          <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar
            activeBar={{ fill: colors.accent, filter: 'brightness(1.15)', opacity: 1 }}
            animationDuration={600}
            animationEasing="ease-out"
            dataKey="profit"
            isAnimationActive
            maxBarSize={28}
            name="Profit"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={
                  (entry.profit ?? 0) >= 0
                    ? `url(#gradientAccent-analytics-${title.toLowerCase().replaceAll(' ', '-')})`
                    : `url(#gradientNegative-analytics-${title.toLowerCase().replaceAll(' ', '-')})`
                }
                opacity={0.85}
                stroke="none"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
}) {
  return (
    <article className="rounded-lg border border-border-base bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 truncate text-2xl font-semibold text-base">{value}</p>
    </article>
  )
}

function ChartGrid() {
  return (
    <CartesianGrid
      stroke="hsl(var(--border))"
      strokeDasharray="2 4"
      strokeOpacity={0.5}
      vertical={false}
    />
  )
}

function ChartGradients({ idSuffix }: { idSuffix: string }) {
  return (
    <defs>
      <linearGradient id={`gradientAccent-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.95} />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id={`gradientPositive-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--positive))" stopOpacity={0.95} />
        <stop offset="100%" stopColor="hsl(var(--positive))" stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id={`gradientNegative-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--negative))" stopOpacity={0.95} />
        <stop offset="100%" stopColor="hsl(var(--negative))" stopOpacity={0.5} />
      </linearGradient>
    </defs>
  )
}

function ChartXAxis({ dataKey, rotate }: { dataKey: string; rotate: boolean }) {
  return (
    <XAxis
      axisLine={false}
      dataKey={dataKey}
      fontSize={11}
      height={rotate ? 54 : 28}
      interval="preserveStartEnd"
      stroke="hsl(var(--text-muted))"
      textAnchor={rotate ? 'end' : 'middle'}
      tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
      tickLine={false}
      tickMargin={8}
      angle={rotate ? -35 : 0}
    />
  )
}

function ChartYAxis() {
  return (
    <YAxis
      axisLine={false}
      fontSize={11}
      stroke="hsl(var(--text-muted))"
      tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
      tickFormatter={(value) => compactCurrency(Number(value))}
      tickLine={false}
      width={48}
    />
  )
}

function CurrencyTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-border-base bg-card px-3 py-2 text-xs text-muted shadow-lg">
      {label ? <p className="mb-1 text-xs text-muted">{label}</p> : null}
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <span className="text-xs font-bold text-base">
            {formatCurrency(entry.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

function DotLegend({ items }: { items: Array<{ color: string; label: string }> }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-lg border border-border-base bg-card"
        />
      ))}
    </div>
  )
}

function compactCurrency(value: number) {
  const formatted = new Intl.NumberFormat('fi-FI', {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
    notation: Math.abs(value) >= 1000 ? 'compact' : 'standard',
  }).format(value)

  return `${formatted}€`
}

function getChartColors() {
  const styles = getComputedStyle(document.documentElement)

  return {
    accent: `hsl(${styles.getPropertyValue('--accent')})`,
    negative: `hsl(${styles.getPropertyValue('--negative')})`,
    positive: `hsl(${styles.getPropertyValue('--positive')})`,
  }
}
