import { Check } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { categoryPalette } from '@/lib/category-palette'
import { getCategoryLabel, saveCategory, useCategories, type Category } from '@/lib/data'

const swatches = Object.entries(categoryPalette) as [keyof typeof categoryPalette, string][]

function CategoryForm({ category, onSave }: { category?: Category; onSave: (id: string) => void }) {
  const { t } = useTranslation()
  const colorGroup = useId()
  const [name, setName] = useState(() => category ? getCategoryLabel(category, t) : '')
  const [color, setColor] = useState(category?.color ?? categoryPalette.violet)
  const [invalid, setInvalid] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const keepTranslatedName = category?.labelKey && category.name === undefined && name === getCategoryLabel(category, t)
    const id = saveCategory(category?.id ?? null, keepTranslatedName ? undefined : name, color)
    if (id) onSave(id)
    else setInvalid(true)
  }

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <FormField
        id="statement-category-name"
        label={t('statement.categories.name')}
        error={invalid ? t('statement.categories.invalid') : undefined}
        value={name}
        onChange={(event) => {
          setName(event.currentTarget.value)
          setInvalid(false)
        }}
        required
      />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t('statement.categories.color')}</legend>
        <div className="flex flex-wrap gap-2">
          {swatches.map(([key, value]) => (
            <label key={key} title={t(`statement.colors.${key}`)} className="relative grid size-11 cursor-pointer place-items-center rounded-md border border-input has-checked:border-primary has-focus-visible:outline-2 has-focus-visible:outline-ring">
              <input
                className="sr-only"
                type="radio"
                name={colorGroup}
                aria-label={t(`statement.colors.${key}`)}
                checked={color === value}
                onChange={() => setColor(value)}
              />
              <span aria-hidden="true" className="size-5 rounded-full" style={{ backgroundColor: value }} />
              {color === value && <Check aria-hidden="true" className="absolute -right-1 -top-1 size-4 rounded-full bg-primary text-primary-foreground" />}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" variant="primary" aria-label={t(category ? 'statement.categories.save' : 'statement.categories.create')}>
        {t(category ? 'statement.categories.save' : 'statement.categories.create')}
      </Button>
    </form>
  )
}

export function CategoryManager() {
  const { t } = useTranslation()
  const categories = useCategories()
  const select = useRef<HTMLSelectElement>(null)
  const [selected, setSelected] = useState('')
  const [saved, setSaved] = useState(false)
  const category = categories.find(({ id }) => id === selected)

  return (
    <details className="rounded-lg border border-border bg-card px-4 py-3 sm:px-5">
      <summary className="cursor-pointer rounded-sm py-2 font-semibold focus-visible:outline-2 focus-visible:outline-ring">
        {t('statement.categories.title')}
      </summary>
      <div className="mt-4 max-w-xl space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" htmlFor="statement-category-select">{t('statement.categories.select')}</label>
          <select
            ref={select}
            id="statement-category-select"
            value={category?.id ?? ''}
            onChange={(event) => {
              setSelected(event.currentTarget.value)
              setSaved(false)
            }}
            className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          >
            <option value="">{t('statement.categories.new')}</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{getCategoryLabel(item, t)}</option>)}
          </select>
        </div>
        <CategoryForm
          key={category?.id ?? 'new'}
          category={category}
          onSave={(id) => {
            if (id !== selected) select.current?.focus()
            setSelected(id)
            setSaved(true)
          }}
        />
        <p role="status" className="text-sm text-positive">{saved ? t('statement.categories.saved') : ''}</p>
      </div>
    </details>
  )
}
