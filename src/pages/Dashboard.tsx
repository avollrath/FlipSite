import {
  Banknote,
  Boxes,
  Crown,
  Heart,
  Layers3,
  Package,
  Percent,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { KPICard } from '@/components/charts/KPICard'
import { useItems } from '@/hooks/useItems'
import { useTheme } from '@/lib/theme'
import {
  calculateItemProfit,
  calculateItemROI,
  calculateItemSellValue,
  formatCurrency,
  getEffectiveItemStatus,
  isAggregateItem,
  isKeepingItem,
} from '@/lib/utils'
import type { Item } from '@/types'

type ChartTooltipPayload = {
  color?: string
  name: string
  value: number
}

type ChartTooltipProps = {
  active?: boolean
  label?: string
  payload?: ChartTooltipPayload[]
}

type ChartColors = ReturnType<typeof getChartColors>

export function Dashboard() {
  const { data: items = [], isLoading } = useItems()
  const navigate = useNavigate()
  const { mode, theme } = useTheme()
  const [selectedYear, setSelectedYear] = useState('all')
  const chartColors = useMemo(() => {
    void mode
    void theme
    return getChartColors()
  }, [mode, theme])

  const years = useMemo(() => getAvailableYears(items), [items])
  const dashboardItems = useMemo(
    () => getItemsForYear(items, selectedYear),
    [items, selectedYear],
  )
  const kpis = useMemo(() => buildKpis(dashboardItems), [dashboardItems])
  const chartData = useMemo(() => buildChartData(dashboardItems), [dashboardItems])
  const hasChartData = chartData.soldItems.length >= 2
  const totalPlatformRevenue = chartData.salesByPlatform.reduce(
    (sum, item) => sum + item.revenue,
    0,
  )

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Inventory at a glance
          </h1>
        </div>
        <label className="w-full sm:w-44">
          <span className="sr-only">Filter dashboard by year</span>
          <select
            className="h-11 w-full rounded-lg border border-border-base bg-card px-3 text-sm text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
          >
            <option value="all">All years</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </label>
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
            onClick={
              kpis.bestFlip
                ? () => navigate(`/items?item=${kpis.bestFlip?.tsid}`)
                : undefined
            }
          />
          <KPICard
            title="In Inventory"
            value={kpis.inventoryCount}
            subtitle="Items held or listed for resale"
            icon={Boxes}
            trend="neutral"
            color="violet"
            onClick={() => navigate('/items?inventory=1')}
          />
          <KPICard
            title="Keepers"
            value={kpis.keeperCount}
            subtitle="Items bought to keep"
            icon={Heart}
            trend="neutral"
            color="indigo"
            onClick={() => navigate('/items?status=keeper')}
          />
          <KPICard
            title="Keeping Value"
            value={kpis.keepingValue}
            subtitle="Purchase value kept for yourself"
            icon={Heart}
            trend="neutral"
            color="green"
            formatter={formatCurrency}
          />
          <KPICard
            title="Active Bundles"
            value={kpis.activeBundles}
            subtitle="Bundles with unsold child items"
            icon={Layers3}
            trend="neutral"
            color="amber"
            onClick={() => navigate('/items?bundles=active')}
          />
        </div>
      )}

      {isLoading ? (
        <ChartLoadingGrid />
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          <ChartCard
            hasData={hasChartData}
            legend={<DotLegend items={[{ color: chartColors.accent, label: 'Running Profit' }]} />}
            title="Cumulative Profit Over Time"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData.cumulativeProfit}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ChartGrid />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <ChartXAxis dataKey="date" preserve />
                <ChartYAxis />
                <Tooltip content={<CurrencyTooltip />} cursor={{ stroke: chartColors.accent, strokeOpacity: 0.18 }} />
                <Area
                  activeDot={{ fill: chartColors.accent, r: 4, strokeWidth: 0 }}
                  animationDuration={600}
                  animationEasing="ease-out"
                  dataKey="profit"
                  dot={false}
                  fill="url(#profitGradient)"
                  isAnimationActive
                  name="Running Profit"
                  stroke={chartColors.accent}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ProfitBarChart
            colors={chartColors}
            data={chartData.profitByCategory}
            title="Profit by Category"
          />

          <ChartCard
            hasData={hasChartData}
            legend={
              <DonutLegend
                colors={chartColors.pie}
                data={chartData.salesByPlatform}
                total={totalPlatformRevenue}
              />
            }
            title="Sales by Platform"
          >
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {chartData.salesByPlatform.map((entry, index) => (
                      <radialGradient key={entry.platform} id={`radialGradient-platform-${index}`}>
                        <stop
                          offset="45%"
                          stopColor={chartColors.pie[index % chartColors.pie.length]}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={chartColors.pie[index % chartColors.pie.length]}
                          stopOpacity={0.7}
                        />
                      </radialGradient>
                    ))}
                  </defs>
                  <Tooltip content={<CurrencyTooltip />} />
                  <Pie
                    animationDuration={600}
                    animationEasing="ease-out"
                    data={chartData.salesByPlatform}
                    dataKey="revenue"
                    innerRadius="62%"
                    isAnimationActive
                    nameKey="platform"
                    outerRadius="85%"
                    paddingAngle={3}
                    stroke="none"
                    strokeWidth={0}
                  >
                    {chartData.salesByPlatform.map((entry, index) => (
                      <Cell
                        key={entry.platform}
                        fill={`url(#radialGradient-platform-${index})`}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-base font-semibold text-base">
                    {compactCurrency(totalPlatformRevenue)}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                    revenue
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard
            hasData={hasChartData}
            legend={
              <DotLegend
                items={[
                  { color: chartColors.accent, label: 'Buy Volume' },
                  { color: chartColors.positive, label: 'Sell Volume' },
                ]}
              />
            }
            title="Monthly Buy vs Sell Volume"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart barCategoryGap="30%" barGap={2} data={chartData.monthlyVolume}>
                <ChartGradients colors={chartColors} idSuffix="dashboard-monthly-volume" />
                <ChartGrid />
                <ChartXAxis dataKey="month" rotate={chartData.monthlyVolume.length > 6} />
                <ChartYAxis />
                <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar
                  activeBar={{ fill: chartColors.accent, filter: 'brightness(1.15)', opacity: 1 }}
                  animationDuration={600}
                  animationEasing="ease-out"
                  dataKey="buy"
                  fill="url(#gradientAccent-dashboard-monthly-volume)"
                  isAnimationActive
                  maxBarSize={14}
                  name="Buy Volume"
                  opacity={0.7}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  activeBar={{ fill: chartColors.positive, filter: 'brightness(1.15)', opacity: 1 }}
                  animationDuration={600}
                  animationEasing="ease-out"
                  dataKey="sell"
                  fill="url(#gradientPositive-dashboard-monthly-volume)"
                  isAnimationActive
                  maxBarSize={14}
                  name="Sell Volume"
                  opacity={0.85}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </section>
  )
}

function ProfitBarChart({
  colors,
  data,
  title,
}: {
  colors: ChartColors
  data: Array<{ category: string; profit: number }>
  title: string
}) {
  const gradientSuffix = `dashboard-${title.toLowerCase().replaceAll(' ', '-')}`

  return (
    <ChartCard
      hasData={data.length > 0}
      legend={<DotLegend items={[{ color: colors.accent, label: 'Profit' }, { color: colors.negative, label: 'Loss' }]} />}
      title={title}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <ChartGradients colors={colors} idSuffix={gradientSuffix} />
          <ChartGrid />
          <ChartXAxis dataKey="category" rotate={data.length > 6} />
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
                key={entry.category}
                fill={
                  entry.profit >= 0
                    ? `url(#gradientAccent-${gradientSuffix})`
                    : `url(#gradientNegative-${gradientSuffix})`
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

function KPILoadingGrid() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-lg border border-border-base bg-card/70 shadow-xl shadow-border-base/40"
        />
      ))}
    </div>
  )
}

function ChartLoadingGrid() {
  return (
    <div className="mt-8 grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[300px] animate-pulse rounded-xl border border-border-base bg-card"
        />
      ))}
    </div>
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

function ChartGradients({
  colors,
  idSuffix,
}: {
  colors: ChartColors
  idSuffix: string
}) {
  return (
    <defs>
      <linearGradient id={`gradientAccent-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={colors.accent} stopOpacity={0.95} />
        <stop offset="100%" stopColor={colors.accent} stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id={`gradientPositive-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={colors.positive} stopOpacity={0.95} />
        <stop offset="100%" stopColor={colors.positive} stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id={`gradientNegative-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={colors.negative} stopOpacity={0.95} />
        <stop offset="100%" stopColor={colors.negative} stopOpacity={0.5} />
      </linearGradient>
    </defs>
  )
}

function ChartXAxis({
  dataKey,
  preserve,
  rotate = false,
}: {
  dataKey: string
  preserve?: boolean
  rotate?: boolean
}) {
  return (
    <XAxis
      angle={rotate ? -35 : 0}
      axisLine={false}
      dataKey={dataKey}
      fontSize={11}
      height={rotate ? 54 : 28}
      interval={preserve ? 'preserveStartEnd' : 0}
      stroke="hsl(var(--text-muted))"
      textAnchor={rotate ? 'end' : 'middle'}
      tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
      tickLine={false}
      tickMargin={8}
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

function CurrencyTooltip({ active, label, payload }: ChartTooltipProps) {
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

function DonutLegend({
  colors,
  data,
  total,
}: {
  colors: string[]
  data: Array<{ platform: string; revenue: number }>
  total: number
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {data.map((entry, index) => (
        <span key={entry.platform} className="inline-flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          {entry.platform}
          <span className="text-muted/75">
            {total > 0 ? `${Math.round((entry.revenue / total) * 100)}%` : '0%'}
          </span>
        </span>
      ))}
    </div>
  )
}

function buildKpis(dashboardItems: Item[]) {
  const aggregateItems = dashboardItems.filter(isAggregateItem)
  const flippingItems = aggregateItems.filter((item) => !isKeepingItem(item))
  const keepingItems = aggregateItems.filter(isKeepingItem)
  const soldItems = flippingItems.filter(
    (item) => calculateItemSellValue(item, dashboardItems) > 0,
  )
  const childrenByBundle = getChildrenByBundle(dashboardItems)
  const totalInvested = aggregateItems.reduce(
    (sum, item) => sum + item.buy_price,
    0,
  )
  const totalRevenue = soldItems.reduce(
    (sum, item) => sum + calculateItemSellValue(item, dashboardItems),
    0,
  )
  const totalProfit = soldItems.reduce(
    (sum, item) => sum + calculateItemProfit(item, dashboardItems),
    0,
  )
  const keepingValue = keepingItems.reduce(
    (sum, item) => sum + item.buy_price,
    0,
  )
  const soldRois = soldItems
    .map((item) => calculateItemROI(item, dashboardItems))
    .filter((roi): roi is number => roi !== null)
  const avgRoi =
    soldRois.length > 0
      ? soldRois.reduce((sum, roi) => sum + roi, 0) / soldRois.length
      : 0
  const bestFlip = soldItems.reduce<{
    name: string
    roi: number
    profit: number
    tsid: string
  } | null>((best, item) => {
    const roi = calculateItemROI(item, dashboardItems)
    const profit = calculateItemProfit(item, dashboardItems)

    if (roi === null || profit === null) {
      return best
    }

    if (!best || roi > best.roi) {
      return { name: item.name, profit, roi, tsid: item.tsid }
    }

    return best
  }, null)
  const inventoryCount = dashboardItems.filter(
    (item) =>
      ['holding', 'listed'].includes(getEffectiveItemStatus(item, dashboardItems)) &&
      !isKeepingItem(item),
  ).length
  const keeperCount = dashboardItems.filter((item) => isKeepingItem(item)).length
  const activeBundles = dashboardItems.filter((item) => {
    if (!item.is_bundle_parent || isKeepingItem(item)) {
      return false
    }

    return (childrenByBundle.get(item.tsid) ?? []).some(
      (child) =>
        !isKeepingItem(child) &&
        getEffectiveItemStatus(child, dashboardItems) !== 'sold',
    )
  }).length

  return {
    activeBundles,
    avgRoi,
    bestFlip,
    inventoryCount,
    keeperCount,
    keepingValue,
    totalInvested,
    totalProfit,
    totalRevenue,
  }
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

function buildChartData(items: Item[]) {
  const aggregateItems = items.filter(isAggregateItem)
  const flippingItems = aggregateItems.filter((item) => !isKeepingItem(item))
  const soldItems = flippingItems
    .filter((item) => calculateItemSellValue(item, items) > 0)
    .sort(
      (a, b) =>
        dateValue(getEffectiveSoldAt(a, items)) -
        dateValue(getEffectiveSoldAt(b, items)),
    )

  let runningProfit = 0
  const cumulativeProfit = soldItems.map((item) => {
    runningProfit += calculateItemProfit(item, items)

    return {
      date: shortDate(getEffectiveSoldAt(item, items)),
      profit: runningProfit,
    }
  })

  const profitByCategory = Array.from(
    soldItems.reduce((map, item) => {
      const category = item.category || 'Uncategorized'
      const current = map.get(category) ?? 0
      map.set(category, current + calculateItemProfit(item, items))
      return map
    }, new Map<string, number>()),
    ([category, profit]) => ({ category, profit }),
  ).sort((a, b) => b.profit - a.profit)

  const salesByPlatform = Array.from(
    soldItems.reduce((map, item) => {
      const platform = item.platform || 'Other'
      const current = map.get(platform) ?? 0
      map.set(platform, current + calculateItemSellValue(item, items))
      return map
    }, new Map<string, number>()),
    ([platform, revenue]) => ({ platform, revenue }),
  ).sort((a, b) => b.revenue - a.revenue)

  const monthlyVolume = Array.from(
    aggregateItems.reduce((map, item) => {
      const boughtMonth = monthLabel(item.bought_at)
      const buyBucket = map.get(boughtMonth) ?? {
        buy: 0,
        month: boughtMonth,
        sell: 0,
      }
      buyBucket.buy += item.buy_price
      map.set(boughtMonth, buyBucket)

      const sellValue = isKeepingItem(item) ? 0 : calculateItemSellValue(item, items)
      const soldAt = getEffectiveSoldAt(item, items)

      if (sellValue > 0 && soldAt) {
        const soldMonth = monthLabel(soldAt)
        const sellBucket = map.get(soldMonth) ?? {
          buy: 0,
          month: soldMonth,
          sell: 0,
        }
        sellBucket.sell += sellValue
        map.set(soldMonth, sellBucket)
      }

      return map
    }, new Map<string, { buy: number; month: string; sell: number }>()),
    ([, value]) => value,
  ).sort((a, b) => monthValue(a.month) - monthValue(b.month))

  return {
    cumulativeProfit,
    monthlyVolume,
    profitByCategory,
    salesByPlatform,
    soldItems,
  }
}

function getAvailableYears(items: Item[]) {
  return Array.from(
    items.reduce((years, item) => {
      addYear(years, item.bought_at)
      addYear(years, item.sold_at)
      return years
    }, new Set<number>()),
  ).sort((a, b) => b - a)
}

function getItemsForYear(items: Item[], selectedYear: string) {
  if (selectedYear === 'all') {
    return items
  }

  const year = Number(selectedYear)
  const parentIdsToInclude = new Set<string>()
  const matchingIds = new Set<string>()

  for (const item of items) {
    if (itemMatchesYear(item, year)) {
      matchingIds.add(item.tsid)

      if (item.bundle_id) {
        parentIdsToInclude.add(item.bundle_id)
      }
    }
  }

  return items.filter((item) => {
    if (matchingIds.has(item.tsid) || parentIdsToInclude.has(item.tsid)) {
      return true
    }

    return Boolean(item.bundle_id && parentIdsToInclude.has(item.bundle_id))
  })
}

function itemMatchesYear(item: Item, year: number) {
  return dateYear(item.bought_at) === year || dateYear(item.sold_at) === year
}

function addYear(years: Set<number>, value: string | null | undefined) {
  const year = dateYear(value)

  if (year) {
    years.add(year)
  }
}

function dateYear(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const year = new Date(value).getFullYear()
  return Number.isNaN(year) ? null : year
}

function getChildrenByBundle(items: Item[]) {
  return items.reduce((map, item) => {
    if (!item.bundle_id) {
      return map
    }

    const children = map.get(item.bundle_id) ?? []
    children.push(item)
    map.set(item.bundle_id, children)
    return map
  }, new Map<string, Item[]>())
}

function getEffectiveSoldAt(item: Item, items: Item[]) {
  if (!item.is_bundle_parent) {
    return item.sold_at
  }

  const childSoldDates = items
    .filter((child) => child.bundle_id === item.tsid && child.sell_price)
    .map((child) => child.sold_at)
    .filter((value): value is string => Boolean(value))

  if (item.sold_at) {
    childSoldDates.push(item.sold_at)
  }

  return childSoldDates.sort((a, b) => dateValue(b) - dateValue(a))[0] ?? null
}

function shortDate(value: string | null) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function monthValue(value: string) {
  return new Date(`${value} 1`).getTime()
}

function dateValue(value: string | null) {
  return value ? new Date(value).getTime() : 0
}

function compactCurrency(value: number) {
  const formatted = new Intl.NumberFormat('fi-FI', {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
    notation: Math.abs(value) >= 1000 ? 'compact' : 'standard',
  }).format(value)

  return `${formatted}€`
}

function getChartColors() {
  const accent = getCSSVar('--accent')
  const positive = getCSSVar('--positive')
  const negative = getCSSVar('--negative')
  const accentHsl = parseHsl(
    getComputedStyle(document.documentElement).getPropertyValue('--accent'),
  )
  const pie = Array.from({ length: 6 }, (_, index) =>
    accentHsl
      ? `hsl(${(accentHsl.h + index * 40) % 360} ${accentHsl.s}% ${accentHsl.l}%)`
      : accent,
  )

  return {
    accent,
    negative,
    pie,
    positive,
  }
}

const getCSSVar = (variable: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(variable).trim()})`

function parseHsl(value: string) {
  const match = /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/.exec(
    value.trim(),
  )

  if (!match) {
    return null
  }

  return {
    h: Number(match[1]),
    l: Number(match[3]),
    s: Number(match[2]),
  }
}
