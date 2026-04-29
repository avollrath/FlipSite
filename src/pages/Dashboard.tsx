import {
  Banknote,
  Boxes,
  Crown,
  Package,
  Percent,
  TrendingUp,
} from 'lucide-react'
import { useMemo } from 'react'
import { KPICard } from '@/components/charts/KPICard'
import { useItems } from '@/hooks/useItems'
import { calcProfit, calcROI, formatCurrency } from '@/lib/utils'

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
    const holdingCount = items.filter((item) => item.status === 'holding').length

    return {
      avgRoi,
      bestFlip,
      holdingCount,
      totalInvested,
      totalProfit,
      totalRevenue,
    }
  }, [items])

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
            title="Holding"
            value={kpis.holdingCount}
            subtitle="Items waiting to be listed or sold"
            icon={Boxes}
            trend="neutral"
            color="violet"
          />
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
