import { describe, expect, it } from 'vitest'
import { getEffectiveItemStatus, isKeepingItem } from '@/lib/utils'
import type { Item } from '@/types'

const baseItem: Item = {
  bought_at: '2026-05-01T00:00:00.000Z',
  buy_price: 10,
  category: 'Games',
  condition: 'Used',
  created_at: '2026-05-01T00:00:00.000Z',
  name: 'Test item',
  notes: null,
  platform: 'eBay',
  sell_price: null,
  sold_at: null,
  status: 'holding',
  tsid: 'item-1',
  user_id: 'user-1',
}

function item(overrides: Partial<Item>): Item {
  return { ...baseItem, ...overrides }
}

describe('item utility helpers', () => {
  it('detects keeping items by status or category case-insensitively', () => {
    expect(isKeepingItem(item({ status: 'keeper' }))).toBe(true)
    expect(isKeepingItem(item({ status: 'Keeping' as Item['status'] }))).toBe(
      true,
    )
    expect(isKeepingItem(item({ category: 'keeping' }))).toBe(true)
    expect(isKeepingItem(item({ category: 'Keeping' }))).toBe(true)
    expect(isKeepingItem(item({ status: 'listed', category: 'Games' }))).toBe(
      false,
    )
  })

  it('normalizes imported keeping statuses to the existing keeper status', () => {
    expect(
      getEffectiveItemStatus(item({ status: 'Keeping' as Item['status'] }), []),
    ).toBe('keeper')
  })
})
