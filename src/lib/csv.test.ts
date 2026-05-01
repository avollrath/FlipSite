import { describe, expect, it } from 'vitest'
import { parseCsv, toCsv } from '@/lib/csv'

describe('CSV helpers', () => {
  it('exports quoted CSV and parses it back', () => {
    const csv = toCsv([
      {
        category: 'Games',
        name: 'Console, boxed',
        notes: 'Includes "rare" cable',
      },
    ])

    expect(csv).toContain('"Console, boxed"')
    expect(parseCsv(csv)).toEqual([
      {
        category: 'Games',
        name: 'Console, boxed',
        notes: 'Includes "rare" cable',
      },
    ])
  })

  it('ignores blank rows', () => {
    expect(parseCsv('name,category\nItem,Games\n\n')).toEqual([
      { category: 'Games', name: 'Item' },
    ])
  })
})
