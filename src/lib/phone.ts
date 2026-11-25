export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, '')
  const local = (digits.length === 12 || digits.length === 13) && digits.startsWith('55')
    ? digits.slice(2)
    : digits
  return local.slice(0, 11)
}

export function isValidPhone(digits: string): boolean {
  return digits === '' || /^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(digits)
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
