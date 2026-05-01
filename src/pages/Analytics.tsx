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
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
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
            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard data={monthlyData} title="Monthly Profit">
          <BarChart data={monthlyData}>
            <ChartScaffold />
            <Bar dataKey="profit" fill="#22c55e" name="Profit" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard data={profitByCategory} title="Profit by Category">
          <BarChart data={profitByCategory}>
            <ChartScaffold />
            <Bar dataKey="profit" fill="#6366f1" name="Profit" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard data={profitByPlatform} title="Profit by Platform">
          <BarChart data={profitByPlatform}>
            <ChartScaffold />
            <Bar dataKey="profit" fill="#f59e0b" name="Profit" radius={[8, 8, 0, 0]} />
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
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#13131a]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 truncate text-2xl font-semibold text-zinc-950 dark:text-white">
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
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#13131a]">
      <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
        {title}
      </h3>
      {data.length > 0 ? (
        <div className="mt-4 h-[300px] text-zinc-500 dark:text-zinc-400">
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
    <div className="rounded-lg border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#0a0a0f]/95">
      {label ? (
        <p className="mb-2 text-sm font-semibold text-zinc-950 dark:text-white">
          {label}
        </p>
      ) : null}
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm text-zinc-600 dark:text-zinc-300">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

function NoData() {
  return (
    <div className="mt-4 grid h-[300px] place-items-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          No data yet
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
          className="h-36 animate-pulse rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#13131a]"
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
