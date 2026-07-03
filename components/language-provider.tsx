'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createT, DEFAULT_LANG, type Lang, type TFunc } from '@/lib/i18n'

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TFunc
}

const I18nContext = createContext<I18nContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: createT(DEFAULT_LANG),
})

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang
  children: React.ReactNode
}) {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next)
      try {
        document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`
        localStorage.setItem('lang', next)
      } catch {
        // ignore
      }
      // 让服务端组件（结果页等）以新语言重新渲染
      router.refresh()
    },
    [router],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: createT(lang) }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
