import { LoaderCircle, Wallet } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const fields = [
  { name: 'name', type: 'text', autoComplete: 'name' },
  { name: 'email', type: 'email', autoComplete: 'email' },
  { name: 'password', type: 'password', autoComplete: 'current-password' },
] as const

type Field = (typeof fields)[number]['name']

export function LoginPage({ onLogin }: { onLogin: (name: string, email: string) => void }) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({})
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    const form = event.currentTarget
    const nameInput = form.elements.namedItem('name') as HTMLInputElement
    const emailInput = form.elements.namedItem('email') as HTMLInputElement
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement
    const name = nameInput.value.trim()
    const email = emailInput.value.trim()
    const nextErrors = {
      name: !name,
      email: !email || emailInput.validity.typeMismatch,
      password: !passwordInput.value,
    }

    setErrors(nextErrors)
    const invalid = fields.find((field) => nextErrors[field.name])
    if (invalid) {
      const invalidInput = form.elements.namedItem(invalid.name) as HTMLInputElement
      invalidInput.focus()
      return
    }

    setLoading(true)
    timer.current = window.setTimeout(() => onLogin(name, email), 450)
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <Card className="w-full max-w-md px-5 py-7 sm:px-8 sm:py-8">
        <header className="mb-7 space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Wallet aria-hidden="true" className="size-5" />
            </span>
            {t('app.name')}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('login.title')}</h1>
        </header>
        <form className="space-y-4" noValidate onSubmit={submit} aria-busy={loading}>
          {fields.map(({ name, type, autoComplete }) => (
            <div key={name} className="space-y-1.5">
              <label className="block text-sm font-medium" htmlFor={`login-${name}`}>
                {t(`login.fields.${name}`)}
              </label>
              <input
                id={`login-${name}`}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-negative"
                name={name}
                type={type}
                autoComplete={autoComplete}
                required
                readOnly={loading}
                aria-invalid={errors[name] || undefined}
                aria-describedby={errors[name] ? `login-${name}-error` : undefined}
              />
              {errors[name] && (
                <p id={`login-${name}-error`} className="text-sm text-negative" role="alert">
                  {t(`login.errors.${name}`)}
                </p>
              )}
            </div>
          ))}
          <Button
            type="submit"
            variant="primary"
            className="mt-2 w-full"
            disabled={loading}
            aria-label={t(loading ? 'login.loading' : 'login.submit')}
          >
            {loading && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
            {t(loading ? 'login.loading' : 'login.submit')}
          </Button>
        </form>
      </Card>
    </main>
  )
}
