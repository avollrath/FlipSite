export const getCSSVar = (variable: string): string =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(variable).trim()})`

export const getChartColors = (theme: string, dark: boolean) => {
  void theme
  void dark

  return {
    accent: getCSSVar('--accent'),
    border: getCSSVar('--border'),
    muted: getCSSVar('--text-muted'),
    negative: getCSSVar('--negative'),
    positive: getCSSVar('--positive'),
  }
}

export const formatCompactCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.', ',')}k€`
  }

  return `${value.toFixed(2).replace('.', ',')}€`
}
