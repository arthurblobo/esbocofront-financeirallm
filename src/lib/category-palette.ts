export const categoryPalette = {
  violet: '#8b5cf6',
  blue: '#3b82f6',
  teal: '#0d9488',
  rose: '#e11d48',
  amber: '#d57406',
  pink: '#db2777',
  olive: '#649b0d',
  slate: '#64748b',
  cyan: '#0891b2',
  emerald: '#059669',
  fuchsia: '#c026d3',
  brown: '#a16232',
} as const

export const categoryColors: readonly string[] = Object.values(categoryPalette)
