import { UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function StatementUpload({ onAccept }: { onAccept: () => void }) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    function preventFileNavigation(event: DragEvent) {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault()
    }

    window.addEventListener('dragover', preventFileNavigation)
    window.addEventListener('drop', preventFileNavigation)
    return () => {
      window.removeEventListener('dragover', preventFileNavigation)
      window.removeEventListener('drop', preventFileNavigation)
    }
  }, [])

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const valid = files.length === 1 && /\.(csv|ofx|pdf)$/i.test(files[0].name)
    setInvalid(!valid)
    if (valid) onAccept()
  }

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        aria-label={t('statement.upload.choose')}
        aria-describedby={invalid ? 'statement-upload-hint statement-upload-error' : 'statement-upload-hint'}
        className={cn('h-auto w-full flex-col gap-3 rounded-lg border border-dashed border-input px-4 py-8 text-center', dragging && 'border-primary bg-accent')}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
      >
        <UploadCloud aria-hidden="true" className="text-primary" />
        <span id="statement-upload-hint" className="text-muted-foreground">{t('statement.upload.hint')}</span>
        <span className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{t('statement.upload.choose')}</span>
      </Button>
      <Input
        ref={input}
        type="file"
        accept=".csv,.ofx,.pdf"
        className="hidden"
        aria-label={t('statement.upload.choose')}
        onChange={(event) => {
          handleFiles(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
      {invalid && <p id="statement-upload-error" role="alert" className="text-sm text-negative">{t('statement.upload.invalid')}</p>}
    </div>
  )
}
