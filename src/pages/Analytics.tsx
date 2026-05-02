import {
  Activity,
  Banknote,
  Boxes,
  ChevronDown,
  FilterX,
  PackageSearch,
  Percent,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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
  getBuyPlatform,
  getEffectiveItemStatus,
  getSellPlatform,
  isAggregateItem,
  isKeepingItem,
  sumCurrency,
} from '@/lib/utils'
import type { Item } from '@/types'

type DatePreset = 'all' | 'year' | '12m' | '6m' | '3m' | 'custom'
type FilterStatus = 'sold' | 'holding' | 'listed' | 'keeper'

type ChartDatum = {
  label: string
  profit?: number
  revenue?: number
  roi?: number
}

type TooltipPayload = {
  color?: string
  name: string
  payload?: Record<string, unknown>
  value: number
}

type TooltipProps = {
  active?: boolean
  label?: string
  payload?: TooltipPayload[]
}

const datePresetLabels: Record<DatePreset, string> = {
  '12m': 'Last 12 months',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
  all: 'All time',
  custom: 'Custom range',
  year: 'This year',
}

const statusOptions: Array<{ label: string; value: FilterStatus }> = [
  { label: 'Sold', value: 'sold' },
  { label: 'Holding', value: 'holding' },
  { label: 'Listed', value: 'listed' },
  { label: 'Keeping', value: 'keeper' },
]

export function Analytics() {
  const { data: items = [], isLoading } = useItems()
  const { mode, theme } = useTheme()
  const colors = useMemo(() => {
    void mode
    void theme
    return getChartColors()
  }, [mode, theme])
  const [datePreset, setDatePreset] = useState<DatePreset>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [buyPlatforms, setBuyPlatforms] = useState<string[]>([])
  const [sellPlatforms, setSellPlatforms] = useState<string[]>([])
  const [statuses, setStatuses] = useState<FilterStatus[]>([])

  const categoryOptions = useMemo(
    () => uniqueValues(items.map((item) => item.category)),
    [items],
  )
  const buyPlatformOptions = useMemo(
    () => uniqueValues(items.map((item) => getBuyPlatform(item))),
    [items],
  )
  const sellPlatformOptions = useMemo(
    () => uniqueValues(items.map((item) => getSellPlatform(item))),
    [items],
  )
  const dateRange = useMemo(
    () => getDateRange(datePreset, customFrom, customTo),
    [customFrom, customTo, datePreset],
  )
  const filteredItems = useMemo(
    () =>
      getFilteredCalculationItems(items, {
        categories,
        dateRange,
        buyPlatforms,
        statuses,
        sellPlatforms,
      }),
    [buyPlatforms, categories, dateRange, items, sellPlatforms, statuses],
  )
  const summary = useMemo(() => buildSummary(filteredItems), [filteredItems])
  const monthlyData = useMemo(() => buildMonthlyPerformance(filteredItems), [filteredItems])
  const profitByCategory = useMemo(
    () => buildProfitBreakdown(filteredItems, (item) => item.category || 'Uncategorized'),
    [filteredItems],
  )
  const profitByPlatform = useMemo(
    () => buildProfitBreakdown(filteredItems, (item) => getBuyPlatform(item) || 'Unknown'),
    [filteredItems],
  )
  const roiDistribution = useMemo(() => buildRoiDistribution(filteredItems), [filteredItems])
  const durationProfit = useMemo(() => buildDurationProfit(filteredItems), [filteredItems])
  const cumulativeProfit = useMemo(() => buildCumulativeProfit(filteredItems), [filteredItems])
  const activeFilterCount =
    (datePreset === 'all' ? 0 : 1) +
    categories.length +
    buyPlatforms.length +
    sellPlatforms.length +
    statuses.length

  function clearFilters() {
    setDatePreset('all')
    setCustomFrom('')
    setCustomTo('')
    setCategories([])
    setBuyPlatforms([])
    setSellPlatforms([])
    setStatuses([])
  }

  if (isLoading) {
    return <LoadingGrid />
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">
          Performance
        </h1>
        <p className="mt-2 text-sm text-muted">
          Performance by the numbers
        </p>
      </div>

      <FilterBar
        activeFilterCount={activeFilterCount}
        categories={categories}
        categoryOptions={categoryOptions}
        customFrom={customFrom}
        customTo={customTo}
        datePreset={datePreset}
        buyPlatformOptions={buyPlatformOptions}
        buyPlatforms={buyPlatforms}
        statuses={statuses}
        onCategoriesChange={setCategories}
        onClear={clearFilters}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onDatePresetChange={setDatePreset}
        sellPlatformOptions={sellPlatformOptions}
        sellPlatforms={sellPlatforms}
        onBuyPlatformsChange={setBuyPlatforms}
        onSellPlatformsChange={setSellPlatforms}
        onStatusesChange={setStatuses}
      />

      <SectionHeading>Performance by the numbers</SectionHeading>
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          icon={TrendingUp}
          title="Total Revenue"
          value={summary.totalRevenue}
          subtitle="Total from all your sales"
          trend="neutral"
          color="green"
          formatter={formatCurrency}
        />
        <KPICard
          icon={Banknote}
          title="Total Profit"
          value={summary.totalProfit}
          subtitle="What you earned after costs"
          trend={profitTrend(summary.totalProfit)}
          color={summary.totalProfit < 0 ? 'rose' : 'green'}
          formatter={formatCurrency}
        />
        <KPICard
          icon={Activity}
          title="Profit per Flip"
          value={summary.averageProfit}
          subtitle={`${summary.soldItemsCount} sold items`}
          trend={profitTrend(summary.averageProfit)}
          color={summary.averageProfit < 0 ? 'rose' : 'green'}
          formatter={formatCurrency}
        />
      </div>

      <SectionHeading>What's Sitting Unsold</SectionHeading>
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          icon={Percent}
          title="Average ROI %"
          value={summary.averageRoi}
          subtitle="Average return on each sale"
          trend={profitTrend(summary.averageRoi)}
          color={summary.averageRoi < 0 ? 'rose' : 'green'}
          formatter={(value) => `${value.toFixed(1)}%`}
        />
        <KPICard
          icon={TrendingUp}
          title="Best Flip"
          value={truncateText(summary.bestFlip?.name ?? 'No sold items', 22)}
          valueTitle={summary.bestFlip?.name}
          subtitle={
            summary.bestFlip
              ? `${formatCurrency(summary.bestFlip.profit)} profit · ${summary.bestFlip.roi.toFixed(1)}% ROI`
              : 'No profit data yet'
          }
          trend="up"
          color="green"
        />
        <KPICard
          icon={TrendingDown}
          title="Biggest Loss"
          value={truncateText(summary.worstFlip?.name ?? 'No sold items', 22)}
          valueTitle={summary.worstFlip?.name}
          subtitle={
            summary.worstFlip
              ? (
                <span className="text-negative">
                  {formatCurrency(Math.abs(summary.worstFlip.profit))} loss
                </span>
              )
              : 'No loss data yet'
          }
          trend="down"
          color="rose"
        />
        <KPICard
          icon={Boxes}
          title="Sold Items"
          value={summary.soldItemsCount}
          subtitle="Items successfully sold"
          trend="neutral"
          color="blue"
        />
        <KPICard
          icon={Banknote}
          title="Tied-Up Cash"
          value={summary.activeInventoryValue}
          subtitle="Money tied up in unsold items"
          trend="neutral"
          color="amber"
          formatter={formatCurrency}
        />
        <KPICard
          icon={PackageSearch}
          title="Unsold Items"
          value={summary.unrealisedItemsCount}
          subtitle={`Spent ${formatCurrency(summary.unrealisedBuyCost)}, not sold yet`}
          trend="neutral"
          color="indigo"
        />
      </div>

      <SectionHeading>Monthly Breakdown</SectionHeading>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartShell
          hasData={monthlyData.length > 0}
          legend={<DotLegend items={[{ color: colors.accent, label: 'Revenue' }]} />}
          title="Monthly Revenue"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <ChartGradients colors={colors} idSuffix="analytics-revenue" />
              <ChartGrid />
              <ChartXAxis dataKey="label" rotate={monthlyData.length > 6} />
              <ChartYAxis />
              <ReferenceLine
                y={average(monthlyData.map((entry) => entry.revenue ?? 0))}
                stroke={colors.muted}
                strokeDasharray="4 4"
                label={referenceLabel('avg')}
              />
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
        </ChartShell>

        <ChartShell
          hasData={monthlyData.length > 0}
          legend={<DotLegend items={[{ color: colors.positive, label: 'Positive' }, { color: colors.negative, label: 'Negative' }]} />}
          title="Monthly Profit"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <ChartGradients colors={colors} idSuffix="analytics-monthly-profit" />
              <ChartGrid />
              <ChartXAxis dataKey="label" rotate={monthlyData.length > 6} />
              <ChartYAxis />
              <ReferenceLine
                y={average(monthlyData.map((entry) => entry.profit ?? 0))}
                stroke={colors.muted}
                strokeDasharray="4 4"
                label={referenceLabel('avg')}
              />
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
        </ChartShell>

        <ProfitBarChart colors={colors} data={profitByCategory} title="Profit by Category" />
        <ProfitBarChart colors={colors} data={profitByPlatform} title="Profit by Platform" />
      </div>

      <SectionHeading>Digging Deeper</SectionHeading>
      <div className="grid gap-4 xl:grid-cols-2">
        <RoiDistributionChart colors={colors} data={roiDistribution} />
        <DurationProfitChart colors={colors} data={durationProfit} />
        <CumulativeProfitChart colors={colors} data={cumulativeProfit} />
      </div>
    </section>
  )
}

function FilterBar({
  activeFilterCount,
  buyPlatformOptions,
  buyPlatforms,
  categories,
  categoryOptions,
  customFrom,
  customTo,
  datePreset,
  sellPlatformOptions,
  sellPlatforms,
  statuses,
  onBuyPlatformsChange,
  onCategoriesChange,
  onClear,
  onCustomFromChange,
  onCustomToChange,
  onDatePresetChange,
  onSellPlatformsChange,
  onStatusesChange,
}: {
  activeFilterCount: number
  buyPlatformOptions: string[]
  buyPlatforms: string[]
  categories: string[]
  categoryOptions: string[]
  customFrom: string
  customTo: string
  datePreset: DatePreset
  sellPlatformOptions: string[]
  sellPlatforms: string[]
  statuses: FilterStatus[]
  onBuyPlatformsChange: (values: string[]) => void
  onCategoriesChange: (values: string[]) => void
  onClear: () => void
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
  onDatePresetChange: (value: DatePreset) => void
  onSellPlatformsChange: (values: string[]) => void
  onStatusesChange: (values: FilterStatus[]) => void
}) {
  return (
    <div className="sticky top-0 z-20 rounded-xl border border-border-base bg-card/95 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs font-medium text-muted">
          Date range
          <select
            className={filterControlClassName}
            value={datePreset}
            onChange={(event) => onDatePresetChange(event.target.value as DatePreset)}
          >
            {Object.entries(datePresetLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {datePreset === 'custom' ? (
          <>
            <label className="grid gap-1 text-xs font-medium text-muted">
              From
              <input
                className={filterControlClassName}
                type="date"
                value={customFrom}
                onChange={(event) => onCustomFromChange(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted">
              To
              <input
                className={filterControlClassName}
                type="date"
                value={customTo}
                onChange={(event) => onCustomToChange(event.target.value)}
              />
            </label>
          </>
        ) : null}
        <MultiSelect
          label="Category"
          allLabel="All categories"
          options={categoryOptions}
          values={categories}
          onChange={onCategoriesChange}
        />
        <MultiSelect
          label="Bought from"
          allLabel="All sources"
          options={buyPlatformOptions}
          values={buyPlatforms}
          onChange={onBuyPlatformsChange}
        />
        <MultiSelect
          label="Sold on"
          allLabel="All channels"
          options={sellPlatformOptions}
          values={sellPlatforms}
          onChange={onSellPlatformsChange}
        />
        <MultiSelect
          label="Status"
          allLabel="All statuses"
          options={statusOptions.map((status) => status.label)}
          values={statuses.map((status) => statusOptions.find((option) => option.value === status)?.label ?? status)}
          onChange={(labels) =>
            onStatusesChange(
              labels
                .map((label) => statusOptions.find((option) => option.label === label)?.value)
                .filter((value): value is FilterStatus => Boolean(value)),
            )
          }
        />
        {activeFilterCount > 0 ? (
          <div className="mb-0.5 flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-xs font-semibold text-accent">
            {activeFilterCount} active filters
            <button
              type="button"
              className="inline-flex items-center gap-1 text-muted transition hover:text-base"
              onClick={onClear}
            >
              <FilterX className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function MultiSelect({
  allLabel,
  label,
  onChange,
  options,
  values,
}: {
  allLabel: string
  label: string
  onChange: (values: string[]) => void
  options: string[]
  values: string[]
}) {
  const summary = values.length === 0 ? allLabel : values.join(', ')

  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return (
    <details className="group relative">
      <summary className="grid cursor-pointer list-none gap-1 text-xs font-medium text-muted [&::-webkit-details-marker]:hidden">
        {label}
        <span className={`${filterControlClassName} flex items-center justify-between gap-2 pr-10`}>
          <span className="truncate">{summary}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </span>
      </summary>
      <div className="absolute left-0 top-full z-30 mt-2 w-60 rounded-lg border border-border-base bg-card p-2 shadow-lg">
        <button
          type="button"
          className="mb-1 w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-muted transition hover:bg-surface-2"
          onClick={() => onChange([])}
        >
          {allLabel}
        </button>
        <div className="max-h-56 overflow-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-base transition hover:bg-surface-2"
            >
              <input
                className="h-4 w-4 accent-[hsl(var(--accent))]"
                type="checkbox"
                checked={values.includes(option)}
                onChange={() => toggle(option)}
              />
              <span className="truncate">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </details>
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
  const gradientSuffix = `analytics-${title.toLowerCase().replaceAll(' ', '-')}`

  return (
    <ChartShell
      hasData={data.length > 0}
      legend={<DotLegend items={[{ color: colors.accent, label: 'Profit' }, { color: colors.negative, label: 'Loss' }]} />}
      title={title}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <ChartGradients colors={colors} idSuffix={gradientSuffix} />
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
    </ChartShell>
  )
}

function RoiDistributionChart({
  colors,
  data,
}: {
  colors: ReturnType<typeof getChartColors>
  data: ChartDatum[]
}) {
  return (
    <ChartShell
      hasData={data.length > 0}
      legend={<DotLegend items={[{ color: colors.accent, label: 'Average ROI' }]} />}
      title="Best Categories to Flip"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ right: 32 }}>
          <ChartGradients colors={colors} idSuffix="analytics-roi" />
          <ChartGrid />
          <XAxis
            axisLine={false}
            fontSize={11}
            stroke="hsl(var(--text-muted))"
            tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
            tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            fontSize={11}
            stroke="hsl(var(--text-muted))"
            tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
            tickLine={false}
            type="category"
            width={92}
          />
          <Tooltip content={<PercentTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar
            animationDuration={600}
            animationEasing="ease-out"
            dataKey="roi"
            fill="url(#gradientAccent-analytics-roi)"
            isAnimationActive
            maxBarSize={18}
            name="Average ROI"
            radius={[0, 4, 4, 0]}
          >
            <LabelList
              dataKey="roi"
              fill="hsl(var(--text-muted))"
              fontSize={11}
              formatter={(value) => `${Number(value ?? 0).toFixed(0)}%`}
              position="right"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

function DurationProfitChart({
  colors,
  data,
}: {
  colors: ReturnType<typeof getChartColors>
  data: Array<{ days: number; name: string; profit: number }>
}) {
  return (
    <ChartShell
      hasData={data.length > 0}
      legend={<DotLegend items={[{ color: colors.accent, label: 'Sold item' }]} />}
      title="Does Waiting Pay Off?"
    >
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart>
          <ChartGrid />
          <XAxis
            axisLine={false}
            dataKey="days"
            fontSize={11}
            label={{
              fill: 'hsl(var(--text-muted))',
              fontSize: 11,
              offset: -2,
              position: 'insideBottom',
              value: 'Days held before selling',
            }}
            name="Days held before selling"
            stroke="hsl(var(--text-muted))"
            tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="profit"
            fontSize={11}
            label={{
              angle: -90,
              fill: 'hsl(var(--text-muted))',
              fontSize: 11,
              position: 'insideLeft',
              value: 'Profit (€)',
            }}
            name="Profit (€)"
            stroke="hsl(var(--text-muted))"
            tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
            tickFormatter={(value) => compactCurrency(Number(value))}
            tickLine={false}
            type="number"
            width={48}
          />
          <Tooltip content={<ScatterTooltip />} cursor={{ stroke: colors.accent, strokeOpacity: 0.2 }} />
          <Scatter
            animationDuration={600}
            animationEasing="ease-out"
            data={data}
            fill={colors.accent}
            isAnimationActive
            name="Sold item"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

function CumulativeProfitChart({
  colors,
  data,
}: {
  colors: ReturnType<typeof getChartColors>
  data: Array<{ actual: number; date: string; pace: number }>
}) {
  return (
    <ChartShell
      hasData={data.length > 0}
      legend={<DotLegend items={[{ color: colors.accent, label: 'Your profit' }, { color: colors.muted, label: 'Steady pace' }]} />}
      title="Profit Over Time"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="analytics-cumulative-profit" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={colors.accent} stopOpacity={0.25} />
              <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <ChartGrid />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
          <ChartXAxis dataKey="date" preserve rotate={false} />
          <ChartYAxis />
          <Tooltip content={<CurrencyTooltip />} cursor={{ stroke: colors.accent, strokeOpacity: 0.18 }} />
          <Area
            activeDot={{ fill: colors.accent, r: 4, strokeWidth: 0 }}
            animationDuration={600}
            animationEasing="ease-out"
            dataKey="actual"
            dot={false}
            fill="url(#analytics-cumulative-profit)"
            isAnimationActive
            name="Your profit"
            stroke={colors.accent}
            strokeWidth={2}
            type="monotone"
          />
          <Line
            animationDuration={600}
            animationEasing="ease-out"
            dataKey="pace"
            dot={false}
            isAnimationActive
            name="Steady pace"
            stroke={colors.muted}
            strokeDasharray="4 4"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

function ChartShell({
  children,
  hasData,
  legend,
  title,
}: {
  children: React.ReactNode
  hasData: boolean
  legend?: React.ReactNode
  title: string
}) {
  return (
    <div className="min-h-[280px]">
      <ChartCard hasData title={title} legend={hasData ? legend : undefined}>
        {hasData ? children : <EmptyChart />}
      </ChartCard>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="grid h-[220px] place-items-center rounded-lg border border-dashed border-border-base bg-surface-2/50 text-center">
      <div>
        <PackageSearch className="mx-auto h-6 w-6 text-muted" aria-hidden="true" />
        <p className="mt-2 text-sm text-muted">No data for selected filters</p>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-xs font-medium uppercase tracking-widest text-muted">
      {children}
    </h2>
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
  colors: ReturnType<typeof getChartColors>
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

function PercentTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-border-base bg-card px-3 py-2 text-xs text-muted shadow-lg">
      <p className="mb-1 text-xs text-muted">{label}</p>
      <p className="text-xs">
        <span style={{ color: payload[0].color }}>{payload[0].name}: </span>
        <span className="text-xs font-bold text-base">{payload[0].value.toFixed(1)}%</span>
      </p>
    </div>
  )
}

function ScatterTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const datum = payload[0].payload as { days: number; name: string; profit: number }

  return (
    <div className="rounded-lg border border-border-base bg-card px-3 py-2 text-xs text-muted shadow-lg">
      <p className="mb-1 max-w-56 truncate text-xs text-base">{datum.name}</p>
      <p>
        Held {datum.days} days · earned{' '}
        <span className="font-bold text-base">{formatCurrency(datum.profit)}</span>
      </p>
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
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-lg border border-border-base bg-card"
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

function buildSummary(items: Item[]) {
  const aggregateItems = getFlippingAggregateItems(items)
  const soldItems = aggregateItems.filter(
    (item) =>
      getEffectiveItemStatus(item, items) === 'sold' &&
      calculateItemSellValue(item, items) > 0,
  )
  const activeItems = aggregateItems.filter((item) =>
    ['holding', 'listed'].includes(getEffectiveItemStatus(item, items)),
  )
  const soldStats = soldItems.map((item) => {
    const profit = calculateItemProfit(item, items)
    const roi = calculateItemROI(item, items) ?? 0

    return {
      item,
      profit,
      roi,
    }
  })
  const totalRevenue = sumCurrency(
    soldItems.map((item) => calculateItemSellValue(item, items)),
  )
  const totalProfit = sumCurrency(soldStats.map((stat) => stat.profit))
  const averageRoi =
    soldStats.length > 0
      ? soldStats.reduce((sum, stat) => sum + stat.roi, 0) / soldStats.length
      : 0
  const bestStat = soldStats.toSorted((a, b) => b.profit - a.profit)[0]
  const worstStat = soldStats.toSorted((a, b) => a.profit - b.profit)[0]

  return {
    activeInventoryValue: sumCurrency(activeItems.map((item) => item.buy_price)),
    averageProfit: soldStats.length > 0 ? totalProfit / soldStats.length : 0,
    averageRoi,
    bestFlip: bestStat
      ? { name: bestStat.item.name, profit: bestStat.profit, roi: bestStat.roi }
      : null,
    soldItemsCount: soldItems.length,
    totalProfit,
    totalRevenue,
    unrealisedBuyCost: sumCurrency(activeItems.map((item) => item.buy_price)),
    unrealisedItemsCount: activeItems.length,
    worstFlip: worstStat
      ? { name: worstStat.item.name, profit: worstStat.profit, roi: worstStat.roi }
      : null,
  }
}

function buildMonthlyPerformance(items: Item[]): ChartDatum[] {
  const monthlyData = new Map<string, { profit: number; revenue: number }>()

  for (const item of getSoldAggregateItems(items)) {
    const soldAt = getEffectiveSoldAt(item, items)

    if (!soldAt) {
      continue
    }

    const label = monthLabel(soldAt)
    const current = monthlyData.get(label) ?? { profit: 0, revenue: 0 }
    current.profit = sumCurrency([current.profit, calculateItemProfit(item, items)])
    current.revenue = sumCurrency([current.revenue, calculateItemSellValue(item, items)])
    monthlyData.set(label, current)
  }

  return Array.from(monthlyData, ([label, values]) => ({
    label,
    ...values,
  })).sort((a, b) => monthValue(a.label) - monthValue(b.label))
}

function buildProfitBreakdown(items: Item[], getLabel: (item: Item) => string): ChartDatum[] {
  const data = new Map<string, number>()

  for (const item of getSoldAggregateItems(items)) {
    const label = getLabel(item)
    data.set(label, sumCurrency([data.get(label) ?? 0, calculateItemProfit(item, items)]))
  }

  return Array.from(data, ([label, profit]) => ({ label, profit })).sort(
    (a, b) => (b.profit ?? 0) - (a.profit ?? 0),
  )
}

function buildRoiDistribution(items: Item[]): ChartDatum[] {
  const roisByCategory = new Map<string, number[]>()

  for (const item of getSoldAggregateItems(items)) {
    const roi = calculateItemROI(item, items)

    if (roi === null) {
      continue
    }

    const label = item.category || 'Uncategorized'
    roisByCategory.set(label, [...(roisByCategory.get(label) ?? []), roi])
  }

  return Array.from(roisByCategory, ([label, rois]) => ({
    label,
    roi: average(rois),
  })).sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))
}

function buildDurationProfit(items: Item[]) {
  return getSoldAggregateItems(items)
    .map((item) => {
      const soldAt = getEffectiveSoldAt(item, items)
      const boughtAt = item.bought_at

      if (!soldAt || !boughtAt) {
        return null
      }

      return {
        days: Math.max(0, Math.round((dateValue(soldAt) - dateValue(boughtAt)) / 86_400_000)),
        name: item.name,
        profit: calculateItemProfit(item, items),
      }
    })
    .filter((entry): entry is { days: number; name: string; profit: number } => Boolean(entry))
}

function buildCumulativeProfit(items: Item[]) {
  const soldItems = getSoldAggregateItems(items).sort(
    (a, b) => dateValue(getEffectiveSoldAt(a, items)) - dateValue(getEffectiveSoldAt(b, items)),
  )
  const totalProfit = sumCurrency(
    soldItems.map((item) => calculateItemProfit(item, items)),
  )
  let runningProfit = 0

  return soldItems.map((item, index) => {
    runningProfit = sumCurrency([runningProfit, calculateItemProfit(item, items)])

    return {
      actual: runningProfit,
      date: shortDate(getEffectiveSoldAt(item, items)),
      pace: totalProfit * ((index + 1) / soldItems.length),
    }
  })
}

function getFilteredCalculationItems(
  items: Item[],
  filters: {
    buyPlatforms: string[]
    categories: string[]
    dateRange: { from: Date | null; to: Date | null }
    sellPlatforms: string[]
    statuses: FilterStatus[]
  },
) {
  const aggregateItems = items.filter(isAggregateItem)
  const matchedAggregateItems = aggregateItems.filter((item) =>
    matchesFilters(item, items, filters),
  )
  const matchedIds = new Set(matchedAggregateItems.map((item) => item.tsid))
  const childItems = items.filter((item) => item.bundle_id && matchedIds.has(item.bundle_id))

  return [...matchedAggregateItems, ...childItems]
}

function matchesFilters(
  item: Item,
  allItems: Item[],
  filters: {
    buyPlatforms: string[]
    categories: string[]
    dateRange: { from: Date | null; to: Date | null }
    sellPlatforms: string[]
    statuses: FilterStatus[]
  },
) {
  const status = normalizeStatus(item, allItems)
  const date = new Date(
    status === 'sold' ? getEffectiveSoldAt(item, allItems) ?? item.sold_at ?? item.bought_at : item.bought_at,
  )

  return (
    matchesOption(filters.categories, item.category) &&
    matchesOption(filters.buyPlatforms, getBuyPlatform(item)) &&
    matchesOption(filters.sellPlatforms, getSellPlatform(item)) &&
    (filters.statuses.length === 0 || filters.statuses.includes(status)) &&
    isWithinDateRange(date, filters.dateRange)
  )
}

function getFlippingAggregateItems(items: Item[]) {
  return items.filter(isAggregateItem).filter((item) => !isKeepingItem(item))
}

function getSoldAggregateItems(items: Item[]) {
  return getFlippingAggregateItems(items).filter(
    (item) =>
      getEffectiveItemStatus(item, items) === 'sold' &&
      calculateItemSellValue(item, items) > 0,
  )
}

function normalizeStatus(item: Item, allItems: Item[]): FilterStatus {
  return isKeepingItem(item) ? 'keeper' : getEffectiveItemStatus(item, allItems)
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

function getDateRange(preset: DatePreset, customFrom: string, customTo: string) {
  const now = new Date()
  const end = endOfDay(now)

  if (preset === 'all') {
    return { from: null, to: null }
  }

  if (preset === 'custom') {
    return {
      from: customFrom ? startOfDay(new Date(customFrom)) : null,
      to: customTo ? endOfDay(new Date(customTo)) : null,
    }
  }

  if (preset === 'year') {
    return { from: new Date(now.getFullYear(), 0, 1), to: end }
  }

  const months = preset === '12m' ? 12 : preset === '6m' ? 6 : 3
  const from = new Date(now)
  from.setMonth(from.getMonth() - months)

  return { from: startOfDay(from), to: end }
}

function isWithinDateRange(date: Date, range: { from: Date | null; to: Date | null }) {
  if (Number.isNaN(date.getTime())) {
    return false
  }

  if (range.from && date < range.from) {
    return false
  }

  if (range.to && date > range.to) {
    return false
  }

  return true
}

function startOfDay(date: Date) {
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfDay(date: Date) {
  date.setHours(23, 59, 59, 999)
  return date
}

function matchesOption(selectedValues: string[], value: string) {
  return (
    selectedValues.length === 0 ||
    selectedValues.some((selectedValue) => selectedValue.toLowerCase() === value.toLowerCase())
  )
}

function uniqueValues(values: string[]) {
  const valuesByLowercase = new Map<string, string>()

  for (const value of values) {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      continue
    }

    const normalizedValue = trimmedValue.toLowerCase()

    if (!valuesByLowercase.has(normalizedValue)) {
      valuesByLowercase.set(normalizedValue, trimmedValue)
    }
  }

  return Array.from(valuesByLowercase.values()).sort((a, b) => a.localeCompare(b))
}

function average(values: number[]) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function truncateText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}...` : value
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

function shortDate(value: string | null) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function dateValue(value: string | null) {
  return value ? new Date(value).getTime() : 0
}

function referenceLabel(value: string) {
  return {
    fill: 'hsl(var(--text-muted))',
    fontSize: 11,
    position: 'insideTopRight' as const,
    value,
  }
}

function compactCurrency(value: number) {
  const formatted = new Intl.NumberFormat('fi-FI', {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
    notation: Math.abs(value) >= 1000 ? 'compact' : 'standard',
  }).format(value)

  return `${formatted}€`
}

function getChartColors() {
  return {
    accent: getCSSVar('--accent'),
    muted: getCSSVar('--text-muted'),
    negative: getCSSVar('--negative'),
    positive: getCSSVar('--positive'),
  }
}

const getCSSVar = (variable: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(variable).trim()})`

const filterControlClassName =
  'h-10 min-w-40 max-w-56 rounded-lg border border-border-base bg-card px-3 pr-10 text-sm text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10'
