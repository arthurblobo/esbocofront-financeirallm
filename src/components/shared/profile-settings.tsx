import { LoaderCircle, LockKeyhole } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { FormField } from '@/components/shared/form-field'
import { ProfileAvatar } from '@/components/shared/profile-avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { resizeAvatar } from '@/lib/avatar-image'
import { mockProfile } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { formatPhone, phoneDigits } from '@/lib/phone'
import { saveProfilePhone, saveProfilePhoto, useProfile } from '@/lib/profile'
import { updateSessionName, type User } from '@/lib/session'

type FieldError = 'nameRequired' | 'phoneFormat' | 'storage'
type PhotoError = 'photoType' | 'photoSize' | 'photoRead' | 'photoStorage'
type Status = 'profileSaved' | 'photoSaved' | 'photoRemoved' | 'photoProcessing'

export function ProfileSettings({ user }: { user: User }) {
  const { t } = useTranslation()
  const profile = useProfile(user.email)
  const [draftName, setDraftName] = useState<string>()
  const [draftPhone, setDraftPhone] = useState<string>()
  const [errors, setErrors] = useState<{ name?: FieldError; phone?: FieldError }>({})
  const [photoError, setPhotoError] = useState<PhotoError>()
  const [status, setStatus] = useState<Status>()
  const [processing, setProcessing] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const phoneInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const photoButton = useRef<HTMLButtonElement>(null)
  const photoRequest = useRef(0)
  const name = draftName ?? user.name
  const phone = draftPhone ?? formatPhone(profile.phone)

  useEffect(() => () => {
    photoRequest.current += 1
  }, [])

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(undefined)
    const trimmedName = name.trim()
    const digits = phoneDigits(phone)
    const nextErrors: typeof errors = {
      name: trimmedName ? undefined : 'nameRequired',
      phone: digits && !/^\d{10,11}$/.test(digits) ? 'phoneFormat' : undefined,
    }

    if (!nextErrors.name && !nextErrors.phone) {
      if (updateSessionName(trimmedName)) setDraftName(undefined)
      else nextErrors.name = 'storage'

      if (saveProfilePhone(user.email, digits)) setDraftPhone(undefined)
      else nextErrors.phone = 'storage'
    }

    setErrors(nextErrors)
    if (nextErrors.name) nameInput.current?.focus()
    else if (nextErrors.phone) phoneInput.current?.focus()
    else setStatus('profileSaved')
  }

  async function choosePhoto(file: File) {
    const request = ++photoRequest.current
    setProcessing(true)
    setPhotoError(undefined)
    setStatus('photoProcessing')
    const result = await resizeAvatar(file)
    if (request !== photoRequest.current) return

    setProcessing(false)
    setStatus(undefined)
    if (!result.ok) {
      setPhotoError(result.reason)
      return
    }

    if (saveProfilePhoto(user.email, result.photo)) setStatus('photoSaved')
    else setPhotoError('photoStorage')
  }

  function removePhoto() {
    if (processing) return

    setPhotoError(undefined)
    setStatus(undefined)
    photoButton.current?.focus()
    if (saveProfilePhoto(user.email, null)) setStatus('photoRemoved')
    else setPhotoError('photoStorage')
  }

  const lockedFields = [
    { key: 'email', value: user.email },
    { key: 'cpf', value: mockProfile.maskedCpf },
    { key: 'birthDate', value: formatDate(mockProfile.birthDate, { day: '2-digit', month: '2-digit', year: 'numeric' }) },
  ] as const

  return (
    <Card className="min-w-0 space-y-5 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">{t('settings.profile')}</h2>

      <div className="flex flex-wrap items-center gap-4 border-b border-border pb-5">
        <ProfileAvatar name={user.name} photo={profile.photo} className="size-16 text-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm font-medium">{t('settings.photo.title')}</h3>
          <p className="text-sm text-muted-foreground" id="profile-photo-hint">{t('settings.photo.hint')}</p>
          <Input
            ref={fileInput}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label={t('settings.photo.choose')}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              event.currentTarget.value = ''
              if (file && !processing) void choosePhoto(file)
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              ref={photoButton}
              aria-label={t('settings.photo.choose')}
              aria-describedby={photoError ? 'profile-photo-hint profile-photo-error' : 'profile-photo-hint'}
              aria-disabled={processing}
              onClick={() => { if (!processing) fileInput.current?.click() }}
            >
              {processing && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
              {t('settings.photo.choose')}
            </Button>
            {profile.photo && (
              <Button variant="ghost" aria-label={t('settings.photo.remove')} aria-disabled={processing} onClick={removePhoto}>
                {t('settings.photo.remove')}
              </Button>
            )}
          </div>
          {photoError && <p id="profile-photo-error" role="alert" className="text-sm text-negative">{t(`settings.errors.${photoError}`)}</p>}
        </div>
      </div>

      <form className="space-y-4" onSubmit={save} noValidate>
        <FormField
          ref={nameInput}
          id="profile-name"
          autoComplete="name"
          label={t('settings.fields.name')}
          value={name}
          required
          error={errors.name ? t(`settings.errors.${errors.name}`) : undefined}
          onChange={(event) => {
            setDraftName(event.currentTarget.value)
            setErrors((previous) => ({ ...previous, name: undefined }))
            setStatus(undefined)
          }}
        />
        <FormField
          ref={phoneInput}
          id="profile-phone"
          type="tel"
          autoComplete="tel-national"
          label={t('settings.fields.phone')}
          value={phone}
          error={errors.phone ? t(`settings.errors.${errors.phone}`) : undefined}
          onChange={(event) => {
            setDraftPhone(formatPhone(event.currentTarget.value))
            setErrors((previous) => ({ ...previous, phone: undefined }))
            setStatus(undefined)
          }}
        />
        <Button type="submit" variant="primary" aria-label={t('settings.save')}>{t('settings.save')}</Button>
      </form>

      <p role="status" className="empty:sr-only text-sm text-muted-foreground">{status ? t(`settings.status.${status}`) : ''}</p>

      <section aria-labelledby="profile-locked" className="space-y-3 border-t border-border pt-5">
        <h3 id="profile-locked" className="text-sm font-semibold">{t('settings.locked.title')}</h3>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lockedFields.map(({ key, value }) => (
            <div className="min-w-0 space-y-1 rounded-md border border-border bg-muted px-3 py-2" key={key}>
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole aria-hidden="true" className="size-4 shrink-0" />
                {t(`settings.fields.${key}`)}
              </dt>
              <dd className="wrap-anywhere text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">{t('settings.locked.reason')}</p>
      </section>
    </Card>
  )
}
