import {
  calculateItemProfit,
  calculateItemSellValue,
  getEffectiveItemStatus,
  isAggregateItem,
  isKeepingItem,
  sumCurrency,
} from '@/lib/utils'
import { toMonthKey } from '@/lib/dateUtils'
import type { Item } from '@/types'

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

    const label = toMonthKey(soldAt)
    const current = monthlyData.get(label) ?? { profit: 0, revenue: 0 }
    current.profit = sumCurrency([current.profit, calculateItemProfit(item, items)])
    current.revenue = sumCurrency([current.revenue, revenue])
    monthlyData.set(label, current)
  }

  return Array.from(monthlyData, ([label, values]) => ({
    label,
    ...values,
  })).sort((a, b) => a.label.localeCompare(b.label))
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
        totalBuyValue: sumCurrency(aggregateItems.map((item) => item.buy_price)),
        totalProfit: sumCurrency(
          flippingAggregateItems.map((item) => calculateItemProfit(item, items)),
        ),
        totalSellValue: sumCurrency(
          flippingAggregateItems.map((item) => calculateItemSellValue(item, items)),
        ),
      }
    })
    .sort((a, b) => a.category.localeCompare(b.category))
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
