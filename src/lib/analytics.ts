import {
  calculateItemProfit,
  calculateItemROI,
  calculateItemSellValue,
  getEffectiveItemStatus,
  isAggregateItem,
  isKeepingItem,
} from '@/lib/utils'
import type { Item } from '@/types'

export type AnalyticsSummary = {
  activeInventoryValue: number
  averageProfit: number
  averageRoi: number
  soldItemsCount: number
  totalProfit: number
  totalRevenue: number
}

export type ChartDatum = {
  label: string
  profit?: number
  revenue?: number
}

export type CategoryStat = {
  activeCount: number
  category: string
  itemCount: number
  soldCount: number
  totalBuyValue: number
  totalProfit: number
  totalSellValue: number
}

export function getFlippingAggregateItems(items: Item[]) {
  return items.filter(isAggregateItem).filter((item) => !isKeepingItem(item))
}

export function buildAnalyticsSummary(items: Item[]): AnalyticsSummary {
  const aggregateItems = getFlippingAggregateItems(items)
  const soldItems = aggregateItems.filter(
    (item) => calculateItemSellValue(item, items) > 0,
  )
  const soldProfits = soldItems.map((item) => calculateItemProfit(item, items))
  const soldRois = soldItems
    .map((item) => calculateItemROI(item, items))
    .filter((roi): roi is number => roi !== null)
  const activeInventoryValue = aggregateItems
    .filter((item) =>
      ['holding', 'listed'].includes(getEffectiveItemStatus(item, items)),
    )
    .reduce((sum, item) => sum + item.buy_price, 0)
  const totalRevenue = soldItems.reduce(
    (sum, item) => sum + calculateItemSellValue(item, items),
    0,
  )
  const totalProfit = soldProfits.reduce((sum, profit) => sum + profit, 0)

  return {
    activeInventoryValue,
    averageProfit:
      soldProfits.length > 0
        ? totalProfit / soldProfits.length
        : 0,
    averageRoi:
      soldRois.length > 0
        ? soldRois.reduce((sum, roi) => sum + roi, 0) / soldRois.length
        : 0,
    soldItemsCount: soldItems.length,
    totalProfit,
    totalRevenue,
  }
}

export function buildMonthlyPerformance(items: Item[]): ChartDatum[] {
  const monthlyData = new Map<string, { profit: number; revenue: number }>()

  for (const item of getFlippingAggregateItems(items)) {
    const revenue = calculateItemSellValue(item, items)

    if (revenue <= 0) {
      continue
    }

    const soldAt = getEffectiveSoldAt(item, items)

    if (!soldAt) {
      continue
    }

    const label = monthLabel(soldAt)
    const current = monthlyData.get(label) ?? { profit: 0, revenue: 0 }
    current.profit += calculateItemProfit(item, items)
    current.revenue += revenue
    monthlyData.set(label, current)
  }

  return Array.from(monthlyData, ([label, values]) => ({
    label,
    ...values,
  })).sort((a, b) => monthValue(a.label) - monthValue(b.label))
}

export function buildProfitByCategory(items: Item[]): ChartDatum[] {
  return buildProfitBreakdown(items, (item) => item.category || 'Uncategorized')
}

export function buildProfitByPlatform(items: Item[]): ChartDatum[] {
  return buildProfitBreakdown(items, (item) => item.platform || 'Unknown')
}

export function buildCategoryStats(items: Item[]): CategoryStat[] {
  const categoryNames = uniqueValues(items.map((item) => item.category))

  return categoryNames
    .map((category) => {
      const categoryItems = items.filter((item) => item.category === category)
      const aggregateItems = categoryItems.filter(isAggregateItem)
      const flippingAggregateItems = aggregateItems.filter((item) => !isKeepingItem(item))

      return {
        activeCount: categoryItems.filter((item) =>
          !isKeepingItem(item) &&
          ['holding', 'listed'].includes(getEffectiveItemStatus(item, items)),
        ).length,
        category,
        itemCount: categoryItems.length,
        soldCount: categoryItems.filter(
          (item) => !isKeepingItem(item) && getEffectiveItemStatus(item, items) === 'sold',
        ).length,
        totalBuyValue: aggregateItems.reduce(
          (sum, item) => sum + item.buy_price,
          0,
        ),
        totalProfit: flippingAggregateItems.reduce(
          (sum, item) => sum + calculateItemProfit(item, items),
          0,
        ),
        totalSellValue: flippingAggregateItems.reduce(
          (sum, item) => sum + calculateItemSellValue(item, items),
          0,
        ),
      }
    })
    .sort((a, b) => a.category.localeCompare(b.category))
}

function buildProfitBreakdown(
  items: Item[],
  getLabel: (item: Item) => string,
): ChartDatum[] {
  const data = new Map<string, number>()

  for (const item of getFlippingAggregateItems(items)) {
    if (calculateItemSellValue(item, items) <= 0) {
      continue
    }

    const label = getLabel(item)
    data.set(label, (data.get(label) ?? 0) + calculateItemProfit(item, items))
  }

  return Array.from(data, ([label, profit]) => ({ label, profit })).sort(
    (a, b) => (b.profit ?? 0) - (a.profit ?? 0),
  )
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

  return Array.from(valuesByLowercase.values())
}
