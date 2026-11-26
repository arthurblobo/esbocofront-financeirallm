import { LoaderCircle, Wallet } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { login } from '@/lib/session'
import { getLoginDestination } from '@/routes'

const fields = [
  { name: 'name', type: 'text', autoComplete: 'name' },
  { name: 'email', type: 'email', autoComplete: 'email' },
  { name: 'password', type: 'password', autoComplete: 'current-password' },
] as const
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = (typeof fields)[number]['name']

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({})
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useLayoutEffect(() => {
    if (navigationType !== 'POP' && location.state?.focusAfterAuth) heading.current?.focus()
  }, [location, navigationType])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (timer.current !== undefined) return

    const form = event.currentTarget
    const nameInput = form.elements.namedItem('name') as HTMLInputElement
    const emailInput = form.elements.namedItem('email') as HTMLInputElement
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement
    const name = nameInput.value.trim()
    const email = emailInput.value.trim()
    const nextErrors = {
      name: !name,
      email: emailInput.validity.typeMismatch || !emailPattern.test(email),
      password: !passwordInput.value.trim(),
    }

    setErrors(nextErrors)
    const invalid = fields.find((field) => nextErrors[field.name])
    if (invalid) {
      const invalidInput = form.elements.namedItem(invalid.name) as HTMLInputElement
      invalidInput.focus()
      return
    }

    setLoading(true)
    timer.current = window.setTimeout(() => {
      flushSync(() => {
        login(name, email)
        void navigate(getLoginDestination(location.state), { replace: true, state: { focusAfterAuth: true } })
      })
    }, 450)
  }

  return (
    <main data-page-content className="grid min-h-dvh place-items-center px-4 py-8">
      <Card className="w-full max-w-md px-5 py-7 sm:px-8 sm:py-8">
        <header className="mb-7 space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Wallet aria-hidden="true" className="size-5" />
            </span>
            {t('app.name')}
          </div>
          <h1
            ref={heading}
            tabIndex={-1}
            className="rounded-sm text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t('login.title')}
          </h1>
        </header>
        <form className="space-y-4" noValidate onSubmit={submit} aria-busy={loading}>
          {fields.map(({ name, type, autoComplete }) => (
            <FormField
              key={name}
              id={`login-${name}`}
              label={t(`login.fields.${name}`)}
              error={errors[name] ? t(`login.errors.${name}`) : undefined}
              name={name}
              type={type}
              autoComplete={autoComplete}
              required
              readOnly={loading}
              onChange={() => {
                if (errors[name]) setErrors((previous) => ({ ...previous, [name]: false }))
              }}
            />
          ))}
          <Button
            type="submit"
            variant="primary"
            className="mt-2 w-full aria-disabled:opacity-50"
            aria-disabled={loading}
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
