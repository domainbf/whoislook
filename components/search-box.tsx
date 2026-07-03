'use client'

import { Loader2, Search, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/language-provider'
import { normalizeDomain } from '@/lib/normalize-domain'
import { addHistory } from '@/lib/search-history'

export default function SearchBox() {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 路由变化后（结果页已加载）解除加载态
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  // 键盘快捷键：/ 聚焦，Esc 清除/失焦
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setValue('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const domain = normalizeDomain(value)
    if (!domain || loading) return
    setLoading(true)
    addHistory(domain)
    router.push(`/${encodeURIComponent(domain)}`)
  }

  function clear() {
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-5 pr-2 shadow-sm transition-shadow focus-within:shadow-md">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
          /
        </kbd>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
          }}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={t('searchPlaceholder')}
          aria-label={t('domain')}
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value && !loading && (
          <button
            type="button"
            onClick={clear}
            aria-label={t('clear')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          aria-label={t('query')}
          disabled={loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-80"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {t('query')}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">/</kbd>
        </span>
        <span className="flex items-center gap-1.5">
          {t('clearBlur')}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Esc</kbd>
        </span>
      </div>
    </form>
  )
}
