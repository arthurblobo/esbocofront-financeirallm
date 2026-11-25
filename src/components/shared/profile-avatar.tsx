import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

type ProfileAvatarProps = { name: string; photo: string | null; className?: string }

export function ProfileAvatar({ name, photo, className }: ProfileAvatarProps) {
  const { t } = useTranslation()
  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials = [words[0], words.length > 1 ? words.at(-1) : undefined]
    .map((word) => Array.from(word ?? '')[0] ?? '')
    .join('').toLocaleUpperCase()

  return (
    <span
      role="img"
      aria-label={t('settings.photo.avatar', { name })}
      className={cn('inline-grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-accent font-semibold text-accent-foreground', className)}
    >
      {photo ? <img className="size-full object-cover" src={photo} width={128} height={128} alt="" /> : initials}
    </span>
  )
}
