export function formatDateInputValue(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return formatDateParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  )
}

export function formatNativeDateValue(value: string) {
  const dateParts = parseDateInputValue(value)

  if (!dateParts) {
    return ''
  }

  return [
    String(dateParts.year).padStart(4, '0'),
    String(dateParts.month).padStart(2, '0'),
    String(dateParts.day).padStart(2, '0'),
  ].join('-')
}

export function formatTodayDateInputValue() {
  const date = new Date()

  return formatDateParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  )
}

export function formatDateInputFromNativeValue(value: string) {
  const [yearText, monthText, dayText] = value.split('-')
  const year = Number.parseInt(yearText, 10)
  const month = Number.parseInt(monthText, 10)
  const day = Number.parseInt(dayText, 10)

  if (!isValidDateParts(year, month, day)) {
    return ''
  }

  return formatDateParts(year, month, day)
}

export function toSupabaseTimestamp(value: string) {
  const dateParts = parseDateInputValue(value)

  if (!dateParts) {
    return null
  }

  return new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
  ).toISOString()
}

export function isValidDateInputValue(value: string) {
  return Boolean(parseDateInputValue(value))
}

function parseDateInputValue(value: string) {
  const trimmedValue = value.trim()
  const germanMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue)
  const nativeMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmedValue)

  if (germanMatch) {
    const [, dayText, monthText, yearText] = germanMatch
    const day = Number.parseInt(dayText, 10)
    const month = Number.parseInt(monthText, 10)
    const year = Number.parseInt(yearText, 10)

    return isValidDateParts(year, month, day) ? { day, month, year } : null
  }

  if (nativeMatch) {
    const [, yearText, monthText, dayText] = nativeMatch
    const day = Number.parseInt(dayText, 10)
    const month = Number.parseInt(monthText, 10)
    const year = Number.parseInt(yearText, 10)

    return isValidDateParts(year, month, day) ? { day, month, year } : null
  }

  return null
}

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day)

  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function formatDateParts(year: number, month: number, day: number) {
  return [
    String(day).padStart(2, '0'),
    String(month).padStart(2, '0'),
    String(year).padStart(4, '0'),
  ].join('/')
}
