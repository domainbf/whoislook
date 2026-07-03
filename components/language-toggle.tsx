'use client'

import { Languages } from 'lucide-react'
import { LANG_LABEL, type Lang } from '@/lib/i18n'
import { useI18n } from '@/components/language-provider'

export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n()

  function toggle() {
    const next: Lang = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('switchLang')}
      className="flex h-8 items-center gap-1.5 rounded-full px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="text-xs font-semibold tabular-nums">{LANG_LABEL[lang]}</span>
    </button>
  )
}
