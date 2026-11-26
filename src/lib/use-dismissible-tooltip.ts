import { useEffect, useState } from 'react'

export function useDismissibleTooltip(enabled: boolean) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const visible = enabled && (hovered || focused) && !dismissed

  useEffect(() => {
    if (!visible) return

    function dismiss(event: KeyboardEvent) {
      if (event.key === 'Escape') setDismissed(true)
    }

    document.addEventListener('keydown', dismiss)
    return () => document.removeEventListener('keydown', dismiss)
  }, [visible])

  return {
    visible,
    hoverProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => {
        setHovered(false)
        if (!focused) setDismissed(false)
      },
    },
    focusProps: {
      onFocus: () => setFocused(true),
      onBlur: () => {
        setFocused(false)
        if (!hovered) setDismissed(false)
      },
    },
  }
}
