'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const MIN_FONT = 14
const DEFAULT_FONT = 16
const MAX_FONT = 22
const updateAccessibilityScale = (size: number) => {
  const scale = Number((size / DEFAULT_FONT).toFixed(3))
  document.documentElement.style.setProperty('--accessibility-font-size', `${size}px`)
  document.documentElement.style.setProperty('--accessibility-ui-scale', String(scale))
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
        className={`flex h-10 w-10 items-center justify-center rounded-sm text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] bg-primary-1 text-white`}
      >
        {children}
      </button>

      <span
        className="
          pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 translate-x-1
          whitespace-nowrap rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)]
          px-3 py-1.5 text-xs font-medium text-[var(--foreground)]
          opacity-0 shadow-[0_6px_18px_rgba(15,43,49,0.08)] transition-all duration-150
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
  const [darkTheme, setDarkTheme] = useState(false)
  const pathname = usePathname()

  const applyContrast = (enabled: boolean) => {
    const root = document.documentElement
    const body = document.body

    if (enabled) {
      root.classList.add('high-contrast')
      body.classList.add('high-contrast-shell')
    } else {
      root.classList.remove('high-contrast')
      body.classList.remove('high-contrast-shell')
    }
  }

  const applyTheme = (enabled: boolean) => {
    const root = document.documentElement
    root.classList.toggle('theme-dark', enabled)
    root.dataset.theme = enabled ? 'dark' : 'light'
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
    }

    const savedTheme = localStorage.getItem('app-dark-theme')
    if (savedTheme === 'true') {
      setDarkTheme(true)
      applyTheme(true)
    }
  }, [])

  useEffect(() => {
    applyContrast(highContrast)
  }, [highContrast, pathname])

  useEffect(() => {
    applyTheme(darkTheme)
  }, [darkTheme, pathname])

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
    localStorage.setItem('app-high-contrast', String(next))
  }

  const toggleTheme = () => {
    const next = !darkTheme
    setDarkTheme(next)
    localStorage.setItem('app-dark-theme', String(next))
  }

  return (
    <aside
      aria-label="Menu de acessibilidade"
      className="
<<<<<<< Updated upstream
        fixed bottom-4 right-4 z-[120]
        flex flex-col gap-2 rounded-sm
        border border-[var(--border-soft)] bg-secundary-1
        p-2 shadow-[0_10px_24px_rgba(15,43,49,0.10)]
        backdrop-blur-[6px]
        sm:bottom-5 sm:right-5
=======
        fixed right-[14px] top-[88px] z-[9999]
        lg:right-[18px] lg:top-[96px]
        flex flex-col items-center
        w-[46px]
        rounded-[999px]
        bg-[var(--accessibility-bg)]
        px-[6px] py-[8px]
        border border-[var(--accessibility-border)]
        shadow-[0_10px_20px_rgba(0,0,0,0.18)]
        backdrop-blur-[2px]
>>>>>>> Stashed changes
      "
    >

      <AccessibilityAction
        label="Aumentar fonte"
        ariaLabel="Aumentar fonte"
        onClick={increaseFont}
<<<<<<< Updated upstream
=======
        aria-label="Aumentar fonte"
        className="text-[var(--accessibility-text)] text-[14px] leading-[14px] font-extrabold mb-[6px]"
>>>>>>> Stashed changes
      >
        A+
      </AccessibilityAction>

      <AccessibilityAction
        label="Restaurar fonte"
        ariaLabel="Restaurar fonte"
        onClick={resetFont}
<<<<<<< Updated upstream
=======
        aria-label="Restaurar fonte"
        className="text-[var(--accessibility-text)] text-[14px] leading-[14px] font-extrabold mb-[6px]"
>>>>>>> Stashed changes
      >
        Aa
      </AccessibilityAction>

      <AccessibilityAction
        label="Diminuir fonte"
        ariaLabel="Diminuir fonte"
        onClick={decreaseFont}
<<<<<<< Updated upstream
=======
        aria-label="Diminuir fonte"
        className="text-[var(--accessibility-text)] text-[14px] leading-[14px] font-extrabold mb-[8px]"
>>>>>>> Stashed changes
      >
        A-
      </AccessibilityAction>

<<<<<<< Updated upstream
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
          <span className="absolute right-0 top-0 h-full w-1/2 bg-white" />
        </span>
      </AccessibilityAction>
    </aside>
=======
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={darkTheme ? "Alternar para tema claro" : "Alternar para tema escuro"}
        title={darkTheme ? "Alternar para tema claro" : "Alternar para tema escuro"}
        className="mb-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full text-[var(--accessibility-text)]"
      >
        <span className="material-symbols-outlined !text-[19px]">
          {darkTheme ? "light_mode" : "dark_mode"}
        </span>
      </button>

      <button
        type="button"
        onClick={toggleContrast}
        aria-label="Alternar contraste"
        title="Alternar contraste"
        className="
          relative
          w-[22px] h-[22px]
          rounded-full
          border-[2px] border-[var(--accessibility-text)]
          overflow-hidden
        "
      >
        <span className="absolute left-0 top-0 h-full w-1/2 bg-[var(--accessibility-text)]"></span>
        <span className="absolute right-0 top-0 h-full w-1/2 bg-[var(--accessibility-inverse)]"></span>
      </button>
    </div>
>>>>>>> Stashed changes
  )
}
