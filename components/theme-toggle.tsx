'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/components/language-provider'

export default function ThemeToggle() {
  const { t } = useI18n()
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)

    // 临时启用平滑过渡，切换完成后移除，避免常驻过渡与首屏闪烁
    const root = document.documentElement
    root.classList.add('theme-transition')
    root.classList.toggle('dark', next)
    window.setTimeout(() => root.classList.remove('theme-transition'), 450)

    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t('toLight') : t('toDark')}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {mounted && dark ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
