import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const startsWithLetter = /^\p{L}/u

export function profileInitials(name: string): string {
  const graphemes = (word: string) => [...segmenter.segment(word)].map(({ segment }) => segment)
  const words = name.trim().split(/\s+/).filter((word) => startsWithLetter.test(word))
  const selected = words.length > 1 ? [words[0], words.at(-1)!] : words
  const firstLetters = selected.map((word) => graphemes(word)[0]).join('')
  const fallback = graphemes(name.trim())
  return (firstLetters || fallback.find((part) => startsWithLetter.test(part)) || fallback[0] || '').toLocaleUpperCase()
}

type ProfileAvatarProps = { name: string; photo: string | null; className?: string }

export function ProfileAvatar({ name, photo, className }: ProfileAvatarProps) {
  const { t } = useTranslation()
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null)

  return (
    <span
      role="img"
      aria-label={t('settings.photo.avatar', { name })}
      className={cn('inline-grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-accent font-semibold text-accent-foreground', className)}
    >
      {photo && photo !== failedPhoto ? (
        <img key={photo} className="size-full object-cover" src={photo} width={128} height={128} alt="" onError={() => setFailedPhoto(photo)} />
      ) : profileInitials(name)}
    </span>
  )
}
