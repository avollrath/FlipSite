import {
  Banknote,
  Boxes,
  Crown,
  Heart,
  Package,
  Percent,
  TrendingUp,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KPICard } from '@/components/charts/KPICard'
import { useItems } from '@/hooks/useItems'
import { calcProfit, calcROI, formatCurrency } from '@/lib/utils'
import type { Item } from '@/types'

type ChartTooltipPayload = {
  name: string
  value: number
  color?: string
}

type ChartTooltipProps = {
  active?: boolean
  label?: string
  payload?: ChartTooltipPayload[]
}

const chartColors = ['#8b5cf6', '#6366f1', '#22c55e', '#f59e0b', '#06b6d4', '#f43f5e']

export function Dashboard() {
  const { data: items = [], isLoading } = useItems()

  const kpis = useMemo(() => {
    const soldItems = items.filter((item) => item.status === 'sold')
    const totalInvested = items.reduce((sum, item) => sum + item.buy_price, 0)
    const totalRevenue = soldItems.reduce(
      (sum, item) => sum + (item.sell_price ?? 0),
      0,
    )
    const soldCost = soldItems.reduce((sum, item) => sum + item.buy_price, 0)
    const totalProfit = totalRevenue - soldCost
    const soldRois = soldItems
      .map((item) => calcROI(item.buy_price, item.sell_price))
      .filter((roi): roi is number => roi !== null)
    const avgRoi =
      soldRois.length > 0
        ? soldRois.reduce((sum, roi) => sum + roi, 0) / soldRois.length
        : 0
    const bestFlip = soldItems.reduce<{
      name: string
      roi: number
      profit: number
    } | null>((best, item) => {
      const roi = calcROI(item.buy_price, item.sell_price)
      const profit = calcProfit(item.buy_price, item.sell_price)

      if (roi === null || profit === null) {
        return best
      }

      if (!best || roi > best.roi) {
        return { name: item.name, roi, profit }
      }

      return best
    }, null)
    const inventoryCount = items.filter((item) =>
      ['holding', 'keeper', 'listed'].includes(item.status),
    ).length
    const keeperCount = items.filter((item) => item.status === 'keeper').length

    return {
      avgRoi,
      bestFlip,
      inventoryCount,
      keeperCount,
      totalInvested,
      totalProfit,
      totalRevenue,
    }
  }, [items])

  const chartData = useMemo(() => buildChartData(items), [items])
  const hasChartData = chartData.soldItems.length >= 2

  return (
    <section>
      <div>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          Dashboard
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">
          Inventory at a glance
        </h2>
      </div>

      {isLoading ? (
        <KPILoadingGrid />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KPICard
            title="Total Invested"
            value={kpis.totalInvested}
            subtitle="Purchase cost across all items"
            icon={Banknote}
            trend="neutral"
            color="violet"
            formatter={formatCurrency}
          />
          <KPICard
            title="Total Revenue"
            value={kpis.totalRevenue}
            subtitle="Sell price from sold items"
            icon={TrendingUp}
            trend={kpis.totalRevenue > 0 ? 'up' : 'neutral'}
            color="indigo"
            formatter={formatCurrency}
          />
          <KPICard
            title="Total Profit"
            value={kpis.totalProfit}
            subtitle="Revenue minus sold item costs"
            icon={Crown}
            trend={profitTrend(kpis.totalProfit)}
            color={kpis.totalProfit < 0 ? 'rose' : 'green'}
            formatter={formatCurrency}
          />
          <KPICard
            title="Avg ROI %"
            value={kpis.avgRoi}
            subtitle="Average return across sold items"
            icon={Percent}
            trend={profitTrend(kpis.avgRoi)}
            color="blue"
            formatter={(value) => `${value.toFixed(1)}%`}
          />
          <KPICard
            title="Best Flip"
            value={kpis.bestFlip?.name ?? 'No sales yet'}
            subtitle={
              kpis.bestFlip
                ? `${kpis.bestFlip.roi.toFixed(1)}% ROI, ${formatCurrency(
                    kpis.bestFlip.profit,
                  )} profit`
                : 'Sell an item to unlock this'
            }
            icon={Package}
            trend={kpis.bestFlip ? 'up' : 'neutral'}
            color="amber"
          />
          <KPICard
            title="In Inventory"
            value={kpis.inventoryCount}
            subtitle="Items held, listed, or kept"
            icon={Boxes}
            trend="neutral"
            color="violet"
          />
          <KPICard
            title="Keepers"
            value={kpis.keeperCount}
            subtitle="Items bought to keep"
            icon={Heart}
            trend="neutral"
            color="indigo"
          />
        </div>
      )}

      {isLoading ? (
        <ChartLoadingGrid />
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          <ChartCard title="Cumulative Profit Over Time" hasData={hasChartData}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.cumulativeProfit}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="date" stroke="currentColor" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="currentColor"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => compactCurrency(value)}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Running Profit"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#profitGradient)"
                  isAnimationActive
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Profit by Category" hasData={hasChartData}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.profitByCategory}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="category" stroke="currentColor" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="currentColor"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => compactCurrency(value)}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive
                  animationDuration={850}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sales by Platform" hasData={hasChartData}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip content={<CurrencyTooltip />} />
                <Legend iconType="circle" />
                <Pie
                  data={chartData.salesByPlatform}
                  dataKey="revenue"
                  nameKey="platform"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={4}
                  isAnimationActive
                  animationDuration={900}
                >
                  {chartData.salesByPlatform.map((entry, index) => (
                    <Cell
                      key={entry.platform}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Buy vs Sell Volume" hasData={hasChartData}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyVolume}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="month" stroke="currentColor" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="currentColor"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => compactCurrency(value)}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar
                  dataKey="buy"
                  name="Buy Volume"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive
                  animationDuration={850}
                />
                <Bar
                  dataKey="sell"
                  name="Sell Volume"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive
                  animationDuration={850}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </section>
  )
}

function KPILoadingGrid() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-white/70 shadow-xl shadow-zinc-200/60 dark:border-white/10 dark:bg-[#13131a]/75 dark:shadow-black/30"
        />
      ))}
    </div>
  )
}

function profitTrend(value: number) {
  if (value > 0) {
    return 'up'
  }

  if (value < 0) {
    return 'down'
  }

  return 'neutral'
}

function ChartCard({
  children,
  hasData,
  title,
}: {
  children: React.ReactNode
  hasData: boolean
  title: string
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white/75 p-5 shadow-xl shadow-zinc-200/60 backdrop-blur dark:border-white/10 dark:bg-[#13131a]/75 dark:shadow-black/30">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
          {title}
        </h3>
      </div>
      {hasData ? (
        <div className="h-[300px] text-zinc-500 dark:text-zinc-400">
          {children}
        </div>
      ) : (
        <NoChartData />
      )}
    </article>
  )
}

function NoChartData() {
  return (
    <div className="grid h-[300px] place-items-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          No data yet
        </p>
        <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          Add at least two sold items to unlock this chart.
        </p>
      </div>
    </div>
  )
}

function ChartLoadingGrid() {
  return (
    <div className="mt-8 grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[376px] animate-pulse rounded-lg border border-zinc-200 bg-white/70 shadow-xl shadow-zinc-200/60 dark:border-white/10 dark:bg-[#13131a]/75 dark:shadow-black/30"
        />
      ))}
    </div>
  )
}

function CurrencyTooltip({ active, label, payload }: ChartTooltipProps) {
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
      <div className="space-y-1">
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm text-zinc-600 dark:text-zinc-300">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-semibold">{formatCurrency(entry.value)}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function buildChartData(items: Item[]) {
  const soldItems = items
    .filter((item) => item.status === 'sold' && item.sell_price !== null)
    .sort((a, b) => dateValue(a.sold_at) - dateValue(b.sold_at))

  let runningProfit = 0
  const cumulativeProfit = soldItems.map((item) => {
    runningProfit += calcProfit(item.buy_price, item.sell_price) ?? 0

    return {
      date: shortDate(item.sold_at),
      profit: runningProfit,
    }
  })

  const profitByCategory = Array.from(
    soldItems.reduce((map, item) => {
      const category = item.category || 'Uncategorized'
      const current = map.get(category) ?? 0
      map.set(category, current + (calcProfit(item.buy_price, item.sell_price) ?? 0))
      return map
    }, new Map<string, number>()),
    ([category, profit]) => ({ category, profit }),
  ).sort((a, b) => b.profit - a.profit)

  const salesByPlatform = Array.from(
    soldItems.reduce((map, item) => {
      const platform = item.platform || 'Other'
      const current = map.get(platform) ?? 0
      map.set(platform, current + (item.sell_price ?? 0))
      return map
    }, new Map<string, number>()),
    ([platform, revenue]) => ({ platform, revenue }),
  ).sort((a, b) => b.revenue - a.revenue)

  const monthlyVolume = Array.from(
    items.reduce((map, item) => {
      const boughtMonth = monthLabel(item.bought_at)
      const buyBucket = map.get(boughtMonth) ?? { month: boughtMonth, buy: 0, sell: 0 }
      buyBucket.buy += item.buy_price
      map.set(boughtMonth, buyBucket)

      if (item.status === 'sold' && item.sold_at && item.sell_price !== null) {
        const soldMonth = monthLabel(item.sold_at)
        const sellBucket = map.get(soldMonth) ?? {
          month: soldMonth,
          buy: 0,
          sell: 0,
        }
        sellBucket.sell += item.sell_price
        map.set(soldMonth, sellBucket)
      }

      return map
    }, new Map<string, { month: string; buy: number; sell: number }>()),
    ([, value]) => value,
  ).sort((a, b) => new Date(`${a.month} 1`).getTime() - new Date(`${b.month} 1`).getTime())

  return {
    cumulativeProfit,
    monthlyVolume,
    profitByCategory,
    salesByPlatform,
    soldItems,
  }
}

function shortDate(value: string | null) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function dateValue(value: string | null) {
  return value ? new Date(value).getTime() : 0
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat('fi-FI', {
    currency: 'EUR',
    notation: 'compact',
    style: 'currency',
  }).format(value)
}
