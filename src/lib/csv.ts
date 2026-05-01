export type CsvRow = Record<string, string>

export function toCsv(rows: Array<Record<string, string | number | boolean | null | undefined>>) {
  if (rows.length === 0) {
    return ''
  }

  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(','),
    ),
  ]

  return lines.join('\n')
}

export function parseCsv(text: string): CsvRow[] {
  const records = parseCsvRecords(text)

  if (records.length === 0) {
    return []
  }

  const [headers, ...rows] = records
  const normalizedHeaders = headers.map((header) => header.trim())

  return rows
    .filter((row) => row.some((value) => value.trim()))
    .map((row) =>
      normalizedHeaders.reduce<CsvRow>((record, header, index) => {
        record[header] = row[index]?.trim() ?? ''
        return record
      }, {}),
    )
}

export function downloadCsv(fileName: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function parseCsvRecords(text: string) {
  const records: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"' && inQuotes && nextCharacter === '"') {
      field += '"'
      index += 1
      continue
    }

    if (character === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (character === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      row.push(field)
      records.push(row)
      row = []
      field = ''
      continue
    }

    field += character
  }

  row.push(field)
  records.push(row)

  return records.filter((record) => record.some((value) => value.trim()))
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value)

  return `"${text.replaceAll('"', '""')}"`
}
