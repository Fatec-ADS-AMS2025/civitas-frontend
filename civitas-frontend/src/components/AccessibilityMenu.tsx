'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const MIN_FONT = 14
const DEFAULT_FONT = 16
const MAX_FONT = 22

export default function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT)
  const [highContrast, setHighContrast] = useState(false)
  const pathname = usePathname()

  const applyContrast = (enabled: boolean) => {
    const mainTarget = document.getElementById('conteudo-principal')
    const dashboardTarget = document.querySelector<HTMLElement>('[data-contrast-target="content"]')
    const resolvedTarget = dashboardTarget ?? mainTarget

    mainTarget?.classList.remove('high-contrast-shell')
    mainTarget?.classList.remove('high-contrast')
    dashboardTarget?.classList.remove('high-contrast')

    if (enabled) {
      mainTarget?.classList.add('high-contrast-shell')
      resolvedTarget?.classList.add('high-contrast')
    }
  }

  useEffect(() => {
    const savedFont = localStorage.getItem('app-font-size')
    const savedContrast = localStorage.getItem('app-high-contrast')

    if (savedFont) {
      const parsed = Number(savedFont)
      setFontSize(parsed)
      document.documentElement.style.fontSize = `${parsed}px`
    }

    if (savedContrast === 'true') {
      setHighContrast(true)
      applyContrast(true)
    }
  }, [])

  useEffect(() => {
    applyContrast(highContrast)
  }, [highContrast, pathname])

  const updateFontSize = (size: number) => {
    const next = Math.max(MIN_FONT, Math.min(MAX_FONT, size))
    setFontSize(next)
    document.documentElement.style.fontSize = `${next}px`
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

  return (
    <div
      aria-label="Menu de acessibilidade"
      className="
        fixed right-[14px] top-[88px] z-[9999]
        lg:right-[18px] lg:top-[96px]
        flex flex-col items-center
        w-[46px]
        rounded-[999px]
        bg-[#FF981F]
        px-[6px] py-[8px]
        border border-[#F2A94D]
        shadow-[0_10px_20px_rgba(0,0,0,0.18)]
        backdrop-blur-[2px]
      "
    >
      <button
        type="button"
        onClick={increaseFont}
        aria-label="Aumentar fonte"
        className="text-black text-[14px] leading-[14px] font-extrabold mb-[6px]"
      >
        A+
      </button>

      <button
        type="button"
        onClick={resetFont}
        aria-label="Restaurar fonte"
        className="text-black text-[14px] leading-[14px] font-extrabold mb-[6px]"
      >
        Aa
      </button>

      <button
        type="button"
        onClick={decreaseFont}
        aria-label="Diminuir fonte"
        className="text-black text-[14px] leading-[14px] font-extrabold mb-[8px]"
      >
        A-
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
          border-[2px] border-black
          overflow-hidden
        "
      >
        <span className="absolute left-0 top-0 h-full w-1/2 bg-black"></span>
        <span className="absolute right-0 top-0 h-full w-1/2 bg-white"></span>
      </button>
    </div>
  )
}
