import { describe, expect, it } from 'vitest'
import {
  formatDateInputFromNativeValue,
  formatDateInputValue,
  formatNativeDateValue,
  isValidDateInputValue,
  toSupabaseTimestamp,
} from '@/lib/dateInput'

describe('date input helpers', () => {
  it('formats ISO timestamps as German date input values', () => {
    expect(formatDateInputValue('2026-05-01T00:00:00.000Z')).toBe('01/05/2026')
  })

  it('formats native picker values as German date input values', () => {
    expect(formatDateInputFromNativeValue('2026-05-01')).toBe('01/05/2026')
  })

  it('keeps cleared native picker values empty', () => {
    expect(formatDateInputFromNativeValue('')).toBe('')
  })

  it('keeps native yyyy-mm-dd manual input compatible', () => {
    expect(formatNativeDateValue('2026-05-01')).toBe('2026-05-01')
    expect(formatNativeDateValue('01/05/2026')).toBe('2026-05-01')
  })

  it('rejects invalid dates clearly', () => {
    expect(isValidDateInputValue('31/02/2026')).toBe(false)
    expect(toSupabaseTimestamp('31/02/2026')).toBeNull()
  })

  it('converts German input to an ISO timestamp for Supabase', () => {
    expect(toSupabaseTimestamp('01/05/2026')).toMatch(
      /^2026-04-30T|^2026-05-01T/,
    )
  })
})
