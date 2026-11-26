import { Check } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { categoryColors, categoryPalette } from '@/lib/category-palette'
import { getCategoryLabel, saveCategory, useCategories, type Category, type CategoryChanges } from '@/lib/data'

const swatches = Object.entries(categoryPalette) as [keyof typeof categoryPalette, string][]

type CategoryFormProps = { category?: Category; newColor: string; onEdit: () => void; onSave: (id: string) => void }

function CategoryForm({ category, newColor, onEdit, onSave }: CategoryFormProps) {
  const { t } = useTranslation()
  const colorGroup = useId()
  const nameInput = useRef<HTMLInputElement>(null)
  const [changes, setChanges] = useState<CategoryChanges>({})
  const [error, setError] = useState<'empty' | 'duplicate' | null>(null)
  const originalName = category ? getCategoryLabel(category, t) : ''
  const originalColor = category?.color ?? newColor
  const name = changes.name ?? originalName
  const color = changes.color ?? originalColor

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = saveCategory(category?.id ?? null, category ? changes : { name, color }, t)
    if (!result.ok) {
      setError(result.reason)
      nameInput.current?.focus()
      return
    }

    setChanges({})
    setError(null)
    onSave(result.id)
  }

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <FormField
        ref={nameInput}
        id="statement-category-name"
        label={t('statement.categories.name')}
        error={error ? t(error === 'duplicate' ? 'statement.categories.duplicate' : 'statement.categories.invalid') : undefined}
        value={name}
        onChange={(event) => {
          const value = event.currentTarget.value
          setChanges((previous) => ({ ...previous, name: value === originalName ? undefined : value }))
          setError(null)
          onEdit()
        }}
        required
      />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t('statement.categories.color')}</legend>
        <div className="flex flex-wrap gap-2">
          {swatches.map(([key, value]) => (
            <label key={key} title={t(`statement.colors.${key}`)} className="relative grid size-11 place-items-center rounded-md border border-input has-checked:border-primary has-focus-visible:outline-2 has-focus-visible:outline-ring">
              <input
                className="sr-only"
                type="radio"
                name={colorGroup}
                aria-label={t(`statement.colors.${key}`)}
                checked={color === value}
                onChange={() => {
                  setChanges((previous) => ({ ...previous, color: value === originalColor ? undefined : value }))
                  onEdit()
                }}
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
  const newColor = categoryColors.find((color) => !categories.some((item) => item.color === color)) ?? categoryPalette.violet

  return (
    <details className="rounded-lg border border-border bg-card px-4 py-3 sm:px-5">
      <summary className="rounded-sm py-2 font-semibold focus-visible:outline-2 focus-visible:outline-ring">
        {t('statement.categories.title')}
      </summary>
      <div className="mt-4 max-w-xl space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" htmlFor="statement-category-select">{t('statement.categories.select')}</label>
          <Select
            ref={select}
            id="statement-category-select"
            value={category?.id ?? ''}
            onChange={(event) => {
              setSelected(event.currentTarget.value)
              setSaved(false)
            }}
            className="w-full"
          >
            <option value="">{t('statement.categories.new')}</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{getCategoryLabel(item, t)}</option>)}
          </Select>
        </div>
        <CategoryForm
          key={category?.id ?? 'new'}
          category={category}
          newColor={newColor}
          onEdit={() => setSaved(false)}
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
