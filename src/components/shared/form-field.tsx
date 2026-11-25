import type { ComponentProps } from 'react'

import { Input } from '@/components/ui/input'

type FormFieldProps = ComponentProps<typeof Input> & { id: string; label: string; error?: string }

export function FormField({
  id,
  label,
  error,
  'aria-describedby': describedBy,
  ...props
}: FormFieldProps) {
  const errorId = `${id}-error`
  const description = error ? [describedBy, errorId].filter(Boolean).join(' ') : describedBy

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" htmlFor={id}>{label}</label>
      <Input {...props} id={id} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={description} />
      {error && <p id={errorId} className="text-sm text-negative" role="alert">{error}</p>}
    </div>
  )
}
