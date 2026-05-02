import {
 Bar,
 BarChart,
 CartesianGrid,
 ResponsiveContainer,
 Tooltip,
 XAxis,
 YAxis,
} from 'recharts'
import { Activity, Banknote, Boxes, Percent, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
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
 const chartColors = getChartColors()
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
  <p className="text-sm font-medium text-accent ">
  Analytics
  </p>
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
  <ChartCard data={monthlyData} title="Monthly Revenue">
  <BarChart data={monthlyData}>
  <ChartScaffold />
            <Bar dataKey="revenue" fill={chartColors.accent} name="Revenue" radius={[8, 8, 0, 0]} />
  </BarChart>
  </ChartCard>
  <ChartCard data={monthlyData} title="Monthly Profit">
  <BarChart data={monthlyData}>
  <ChartScaffold />
            <Bar dataKey="profit" fill={chartColors.positive} name="Profit" radius={[8, 8, 0, 0]} />
  </BarChart>
  </ChartCard>
  <ChartCard data={profitByCategory} title="Profit by Category">
  <BarChart data={profitByCategory}>
  <ChartScaffold />
            <Bar dataKey="profit" fill={chartColors.accent} name="Profit" radius={[8, 8, 0, 0]} />
  </BarChart>
  </ChartCard>
  <ChartCard data={profitByPlatform} title="Profit by Platform">
  <BarChart data={profitByPlatform}>
  <ChartScaffold />
            <Bar dataKey="profit" fill={chartColors.accent} name="Profit" radius={[8, 8, 0, 0]} />
  </BarChart>
  </ChartCard>
 </div>
 </section>
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
 <article className="rounded-lg border border-border-base bg-card p-5 shadow-sm ">
 <div className="flex items-center justify-between gap-4">
  <p className="text-sm font-medium text-muted ">
  {label}
  </p>
  <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent bg-accent/15 ">
  <Icon className="h-5 w-5" aria-hidden="true" />
  </span>
 </div>
 <p className="mt-4 truncate text-2xl font-semibold text-base ">
  {value}
 </p>
 </article>
 )
}

function ChartCard({
 children,
 data,
 title,
}: {
 children: React.ReactElement
 data: ChartDatum[]
 title: string
}) {
 return (
 <article className="rounded-lg border border-border-base bg-card p-5 shadow-sm ">
 <h3 className="text-lg font-semibold text-base ">
  {title}
 </h3>
 {data.length > 0 ? (
  <div className="mt-4 h-[300px] text-muted ">
  <ResponsiveContainer width="100%" height="100%">
  {children}
  </ResponsiveContainer>
  </div>
 ) : (
  <NoData />
 )}
 </article>
 )
}

function ChartScaffold() {
 return (
 <>
 <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
 <XAxis dataKey="label" stroke="currentColor" tickLine={false} axisLine={false} />
 <YAxis
  stroke="currentColor"
  tickLine={false}
  axisLine={false}
  tickFormatter={(value) => compactCurrency(Number(value))}
 />
 <Tooltip content={<CurrencyTooltip />} />
 </>
 )
}

function CurrencyTooltip({ active, label, payload }: TooltipProps) {
 if (!active || !payload?.length) {
 return null
 }

 return (
 <div className="rounded-lg border border-border-base bg-card/95 p-3 shadow-xl backdrop-blur">
 {label ? (
  <p className="mb-2 text-sm font-semibold text-base ">
  {label}
  </p>
 ) : null}
 {payload.map((entry) => (
  <p key={entry.name} className="text-sm text-muted ">
  <span style={{ color: entry.color }}>{entry.name}: </span>
  <span className="font-semibold">{formatCurrency(entry.value)}</span>
  </p>
 ))}
 </div>
 )
}

function NoData() {
 return (
 <div className="mt-4 grid h-[300px] place-items-center rounded-lg border border-dashed border-border-base bg-surface text-center bg-surface-2/60">
 <div>
  <p className="text-sm font-semibold text-base ">
  No data yet
  </p>
  <p className="mt-1 text-sm text-muted ">
  Sold items will unlock this chart.
  </p>
 </div>
 </div>
 )
}

function LoadingGrid() {
 return (
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
 {Array.from({ length: 6 }).map((_, index) => (
  <div
  key={index}
  className="h-36 animate-pulse rounded-lg border border-border-base bg-card "
  />
 ))}
 </div>
 )
}

function compactCurrency(value: number) {
 return new Intl.NumberFormat('fi-FI', {
 currency: 'EUR',
 notation: 'compact',
 style: 'currency',
 }).format(value)
}

function getChartColors() {
 const styles = getComputedStyle(document.documentElement)

 return {
 accent: `hsl(${styles.getPropertyValue('--accent')})`,
 positive: `hsl(${styles.getPropertyValue('--positive')})`,
 }
}
