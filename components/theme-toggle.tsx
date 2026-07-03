'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
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
      aria-label={dark ? '切换到浅色模式' : '切换到深色模式'}
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
