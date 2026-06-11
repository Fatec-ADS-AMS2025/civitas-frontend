'use client'

import { useEffect, useState } from 'react'

const MIN_FONT = 14
const DEFAULT_FONT = 16
const MAX_FONT = 22

const updateAccessibilityScale = (size: number) => {
  const scale = Number((size / DEFAULT_FONT).toFixed(3))
  document.documentElement.style.setProperty('--accessibility-font-size', `${size}px`)
  document.documentElement.style.setProperty('--accessibility-ui-scale', String(scale))
}

const syncRootColorScheme = (root: HTMLElement, forceHighContrast: boolean) => {
  root.style.colorScheme = forceHighContrast
    ? 'dark'
    : root.dataset.theme === 'dark'
      ? 'dark'
      : 'light'
}

type AccessibilityActionProps = {
  label: string
  ariaLabel: string
  onClick: () => void
  children: React.ReactNode
  isActive?: boolean
}

function AccessibilityAction({
  label,
  ariaLabel,
  onClick,
  children,
  isActive = false,
}: AccessibilityActionProps) {
  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        className={`flex h-10 w-10 items-center justify-center rounded-sm border text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] ${
          isActive
            ? "border-[var(--secundary-1)] bg-[var(--secundary-1)] text-[var(--text-on-brand)]"
            : "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
        }`}
      >
        {children}
      </button>

      <span
        className="
          pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 translate-x-1
          whitespace-nowrap rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)]
          px-3 py-1.5 text-xs font-medium text-[var(--foreground)]
          opacity-0 shadow-[var(--shadow-sm)] transition-all duration-150
          group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100
        "
      >
        {label}
      </span>
    </div>
  )
}

export default function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT)
  const [highContrast, setHighContrast] = useState(false)

  const applyContrast = (enabled: boolean) => {
    const root = document.documentElement
    root.dataset.contrast = enabled ? 'high' : 'normal'
    syncRootColorScheme(root, enabled)
  }

  useEffect(() => {
    const savedFont = localStorage.getItem('app-font-size')
    const savedContrast = localStorage.getItem('app-high-contrast')

    if (savedFont) {
      const parsed = Number(savedFont)
      setFontSize(parsed)
      updateAccessibilityScale(parsed)
    } else {
      updateAccessibilityScale(DEFAULT_FONT)
    }

    if (savedContrast === 'true') {
      setHighContrast(true)
      applyContrast(true)
    } else {
      applyContrast(false)
    }
  }, [])

  const updateFontSize = (size: number) => {
    const next = Math.max(MIN_FONT, Math.min(MAX_FONT, size))
    setFontSize(next)
    updateAccessibilityScale(next)
    localStorage.setItem('app-font-size', String(next))
  }

  const increaseFont = () => updateFontSize(fontSize + 1)
  const decreaseFont = () => updateFontSize(fontSize - 1)
  const resetFont = () => updateFontSize(DEFAULT_FONT)

  const toggleContrast = () => {
    const next = !highContrast
    setHighContrast(next)
    applyContrast(next)
    localStorage.setItem('app-high-contrast', String(next))
  }

  return (
    <aside
      aria-label="Menu de acessibilidade"
      className="
        fixed bottom-4 right-4 z-[120]
        flex max-w-[calc(100vw-1rem)] flex-col gap-2 rounded-sm
        border border-[var(--border-soft)] bg-[var(--surface-elevated)]
        p-2 shadow-[var(--shadow-sm)]
        backdrop-blur-[6px]
        sm:bottom-5 sm:right-5
      "
    >

      <AccessibilityAction
        label="Aumentar fonte"
        ariaLabel="Aumentar fonte"
        onClick={increaseFont}
      >
        A+
      </AccessibilityAction>

      <AccessibilityAction
        label="Restaurar fonte"
        ariaLabel="Restaurar fonte"
        onClick={resetFont}
      >
        Aa
      </AccessibilityAction>

      <AccessibilityAction
        label="Diminuir fonte"
        ariaLabel="Diminuir fonte"
        onClick={decreaseFont}
      >
        A-
      </AccessibilityAction>

      <AccessibilityAction
        label={highContrast ? 'Desativar contraste' : 'Ativar contraste'}
        ariaLabel="Alternar contraste"
        onClick={toggleContrast}
        isActive={highContrast}
      >
        <span
          className="
            relative h-5 w-5 overflow-hidden rounded-sm border
            border-current
          "
        >
          <span className="absolute left-0 top-0 h-full w-1/2 bg-current" />
          <span className="absolute right-0 top-0 h-full w-1/2 bg-[var(--surface-elevated)]" />
        </span>
      </AccessibilityAction>
    </aside>
  )
}
