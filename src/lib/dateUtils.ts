import { format, parseISO } from 'date-fns'

export const toMonthKey = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM')

export const formatMonthKey = (key: string): string =>
  format(parseISO(`${key}-01`), 'MMM yyyy')
