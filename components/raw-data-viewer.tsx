'use client'

import { Check, Copy, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useI18n } from '@/components/language-provider'

export default function RawDataViewer({
  domain,
  rawJson,
  rawText,
}: {
  domain: string
  rawJson?: string
  rawText?: string
}) {
  const { t } = useI18n()
  const tabs = useMemo(() => {
    const list: { key: 'rdap' | 'whois'; label: string; content: string }[] = []
    if (rawJson) list.push({ key: 'rdap', label: 'RDAP', content: rawJson })
    if (rawText) list.push({ key: 'whois', label: 'Whois', content: rawText })
    return list
  }, [rawJson, rawText])

  const [active, setActive] = useState(tabs[0]?.key ?? 'rdap')
  const [copied, setCopied] = useState(false)

  if (tabs.length === 0) return null

  const current = tabs.find((t) => t.key === active) ?? tabs[0]

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  function save() {
    const blob = new Blob([current.content], {
      type: current.key === 'rdap' ? 'application/json' : 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${domain}.${current.key === 'rdap' ? 'json' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                active === t.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={save}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('save')}
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto px-5 py-4 font-mono text-xs leading-relaxed text-muted-foreground">
        {current.content}
      </pre>
    </section>
  )
}
