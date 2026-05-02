import {
 Banknote,
 Boxes,
 Crown,
 Layers3,
 Heart,
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
 name: string
 value: number
 color?: string
}

type ChartTooltipProps = {
 active?: boolean
 label?: string
 payload?: ChartTooltipPayload[]
}

export function Dashboard() {
 const { data: items = [], isLoading } = useItems()
 const navigate = useNavigate()
 useTheme()
 const [selectedYear, setSelectedYear] = useState('all')
 const chartColors = getChartColors()

 const years = useMemo(() => getAvailableYears(items), [items])
 const dashboardItems = useMemo(
 () => getItemsForYear(items, selectedYear),
 [items, selectedYear],
 )

 const kpis = useMemo(() => {
 const aggregateItems = dashboardItems.filter(isAggregateItem)
 const flippingItems = aggregateItems.filter((item) => !isKeepingItem(item))
 const keepingItems = aggregateItems.filter(isKeepingItem)
 const soldItems = flippingItems.filter(
 (item) => calculateItemSellValue(item, dashboardItems) > 0,
 )
 const childrenByBundle = getChildrenByBundle(dashboardItems)
 const totalInvested = flippingItems.reduce(
 (sum, item) => sum + item.buy_price,
 0,
 )
 const totalRevenue = flippingItems.reduce(
 (sum, item) => sum + calculateItemSellValue(item, dashboardItems),
 0,
 )
 const totalProfit = flippingItems.reduce(
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
 const inventoryCount = dashboardItems.filter((item) =>
 ['holding', 'listed'].includes(
  getEffectiveItemStatus(item, dashboardItems),
 ) && !isKeepingItem(item),
 ).length
 const keeperCount = dashboardItems.filter(
 (item) => isKeepingItem(item),
 ).length
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
 }, [dashboardItems])

 const chartData = useMemo(() => buildChartData(dashboardItems), [dashboardItems])
 const hasChartData = chartData.soldItems.length >= 2

 return (
 <section>
 <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
  <div>
  <p className="text-sm font-medium text-accent ">
  Dashboard
  </p>
  <h2 className="mt-2 text-4xl font-semibold tracking-tight">
  Inventory at a glance
  </h2>
  </div>
  <label className="w-full sm:w-44">
  <span className="sr-only">Filter dashboard by year</span>
  <select
  className="h-11 w-full rounded-lg border border-border-base bg-card px-3 text-sm text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 "
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
  subtitle="Purchase cost in flipping inventory"
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
  <ChartCard title="Cumulative Profit Over Time" hasData={hasChartData}>
  <ResponsiveContainer width="100%" height={300}>
   <AreaChart data={chartData.cumulativeProfit}>
   <defs>
   <linearGradient id="profitGradient" x1="0" x2="0" y1="0" y2="1">
    <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.45} />
    <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0.02} />
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
   stroke={chartColors.accent}
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
   fill={chartColors.accent}
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
    fill={chartColors.pie[index % chartColors.pie.length]}
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
   fill={chartColors.accent}
   radius={[8, 8, 0, 0]}
   isAnimationActive
   animationDuration={850}
   />
   <Bar
   dataKey="sell"
   name="Sell Volume"
   fill={chartColors.positive}
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
 {Array.from({ length: 9 }).map((_, index) => (
  <div
  key={index}
  className="h-40 animate-pulse rounded-lg border border-border-base bg-card/70 shadow-xl shadow-border-base/40 "
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
 <article className="rounded-lg border border-border-base bg-card/75 p-5 shadow-xl shadow-border-base/40 backdrop-blur ">
 <div className="mb-5 flex items-center justify-between gap-3">
  <h3 className="text-lg font-semibold text-base ">
  {title}
  </h3>
 </div>
 {hasData ? (
  <div className="h-[300px] text-muted ">
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
 <div className="grid h-[300px] place-items-center rounded-lg border border-dashed border-border-base bg-surface text-center bg-surface-2/60">
 <div>
  <p className="text-sm font-semibold text-base ">
  No data yet
  </p>
  <p className="mt-1 max-w-xs text-sm text-muted ">
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
  className="h-[376px] animate-pulse rounded-lg border border-border-base bg-card/70 shadow-xl shadow-border-base/40 "
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
 <div className="rounded-lg border border-border-base bg-card/95 p-3 shadow-xl backdrop-blur">
 {label ? (
  <p className="mb-2 text-sm font-semibold text-base ">
  {label}
  </p>
 ) : null}
 <div className="space-y-1">
  {payload.map((entry) => (
  <p key={entry.name} className="text-sm text-muted ">
  <span style={{ color: entry.color }}>{entry.name}: </span>
  <span className="font-semibold">{formatCurrency(entry.value)}</span>
  </p>
  ))}
 </div>
 </div>
 )
}

function buildChartData(items: Item[]) {
 const aggregateItems = items
 .filter(isAggregateItem)
 .filter((item) => !isKeepingItem(item))
 const soldItems = aggregateItems
 .filter((item) => calculateItemSellValue(item, items) > 0)
 .sort((a, b) => dateValue(getEffectiveSoldAt(a, items)) - dateValue(getEffectiveSoldAt(b, items)))

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
 const buyBucket = map.get(boughtMonth) ?? { month: boughtMonth, buy: 0, sell: 0 }
 buyBucket.buy += item.buy_price
 map.set(boughtMonth, buyBucket)

 const sellValue = calculateItemSellValue(item, items)
 const soldAt = getEffectiveSoldAt(item, items)

 if (sellValue > 0 && soldAt) {
  const soldMonth = monthLabel(soldAt)
  const sellBucket = map.get(soldMonth) ?? {
  month: soldMonth,
  buy: 0,
  sell: 0,
  }
  sellBucket.sell += sellValue
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

function getChartColors() {
 const styles = getComputedStyle(document.documentElement)
 const accent = `hsl(${styles.getPropertyValue('--accent')})`
 const positive = `hsl(${styles.getPropertyValue('--positive')})`
 const negative = `hsl(${styles.getPropertyValue('--negative')})`
 const sidebarAccent = `hsl(${styles.getPropertyValue('--sidebar-accent')})`

 return {
 accent,
 pie: [accent, positive, negative, sidebarAccent],
 positive,
 }
}
