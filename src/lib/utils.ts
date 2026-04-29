import { format } from 'date-fns'

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '$0.00'
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
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
