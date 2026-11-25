export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatPhone(value: string): string {
  const digits = phoneDigits(value)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`

  const area = digits.slice(0, 2)
  const number = digits.slice(2)
  const prefixLength = number.length > 8 ? 5 : 4
  const suffix = number.slice(prefixLength)
  return `(${area}) ${number.slice(0, prefixLength)}${suffix ? `-${suffix}` : ''}`
}
