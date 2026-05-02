import { format } from 'date-fns'
import type { Item, ItemStatus } from '@/types'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(0)
  }

  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function calcProfit(
  buyPrice: number | null | undefined,
  sellPrice: number | null | undefined,
) {
  if (buyPrice === null || buyPrice === undefined) {
    return null
  }

  if (sellPrice === null || sellPrice === undefined) {
    return null
  }

  return sellPrice - buyPrice
}

export function calcROI(
  buyPrice: number | null | undefined,
  sellPrice: number | null | undefined,
) {
  const profit = calcProfit(buyPrice, sellPrice)

  if (profit === null || !buyPrice) {
    return null
  }

  return (profit / buyPrice) * 100
}

export function parseMoneyInput(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(',', '.')

  if (!normalized) {
    return null
  }

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return null
  }

  const parsed = Number.parseFloat(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

export function calculateItemSellValue(item: Item, allItems: Item[]) {
  if (isKeepingItem(item)) {
    return 0
  }

  if (item.is_bundle_parent) {
    const childrenSell = allItems
      .filter((child) => child.bundle_id === item.tsid && !isKeepingItem(child))
      .reduce((sum, child) => sum + (child.sell_price ?? 0), 0)

    return (item.sell_price ?? 0) + childrenSell
  }

  return item.sell_price ?? 0
}

export function calculateItemProfit(item: Item, allItems: Item[]) {
  if (isKeepingItem(item)) {
    return 0
  }

  if (item.is_bundle_parent) {
    return calculateItemSellValue(item, allItems) - (item.buy_price ?? 0)
  }

  if (item.bundle_id) {
    return item.sell_price ?? 0
  }

  return (item.sell_price ?? 0) - (item.buy_price ?? 0)
}

export function calculateItemROI(item: Item, allItems: Item[]) {
  if (isKeepingItem(item)) {
    return null
  }

  if (item.bundle_id && !item.is_bundle_parent) {
    return item.buy_price > 0
      ? ((item.sell_price ?? 0) - item.buy_price) / item.buy_price * 100
      : null
  }

  if (!item.buy_price) {
    return null
  }

  return (calculateItemProfit(item, allItems) / item.buy_price) * 100
}

export function isAggregateItem(item: Item) {
  return !item.bundle_id || Boolean(item.is_bundle_parent)
}

export function isKeepingItem(item: Item) {
  const status = String(item.status).trim().toLowerCase()
  const category = item.category.trim().toLowerCase()

  return (
    status === 'keeper' ||
    status === 'keeping' ||
    category === 'keeper' ||
    category === 'keeping'
  )
}

export function getBuyPlatform(item: Item) {
  return item.buy_platform ?? item.platform ?? ''
}

export function getSellPlatform(item: Item) {
  return item.sell_platform ?? ''
}

export function getItemPlatformSearchText(item: Item) {
  return [getBuyPlatform(item), getSellPlatform(item)].filter(Boolean).join(' ')
}

export function getEffectiveItemStatus(item: Item, allItems: Item[]) {
  if (!item.is_bundle_parent) {
    return isKeepingItem(item) ? 'keeper' : item.status
  }

  if (isKeepingItem(item)) {
    return 'keeper'
  }

  const children = allItems.filter((child) => child.bundle_id === item.tsid)

  if (children.length > 0 && children.every((child) => child.status === 'sold')) {
    return 'sold'
  }

  return item.status
}

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return format(date, 'MMM d, yyyy')
}

export function getStatusLabel(status: ItemStatus) {
  const labels: Record<ItemStatus, string> = {
    holding: 'In Inventory',
    keeper: 'Keeping',
    listed: 'Listed for Sale',
    sold: 'Sold',
  }

  return labels[status]
}

export const selectTriggerClass =
  'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-base bg-surface px-3 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50'
