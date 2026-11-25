export const categories = [
  { id: 'food', labelKey: 'categories.food', color: '#a78bfa' },
  { id: 'housing', labelKey: 'categories.housing', color: '#60a5fa' },
  { id: 'transport', labelKey: 'categories.transport', color: '#2dd4bf' },
  { id: 'health', labelKey: 'categories.health', color: '#fb7185' },
  { id: 'leisure', labelKey: 'categories.leisure', color: '#fbbf24' },
  { id: 'subscriptions', labelKey: 'categories.subscriptions', color: '#f472b6' },
  { id: 'education', labelKey: 'categories.education', color: '#a3e635' },
  { id: 'uncategorized', labelKey: 'categories.uncategorized', color: '#94a3b8' },
] as const

export type CategoryId = (typeof categories)[number]['id']
