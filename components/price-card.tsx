'use client'

import { Tag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useI18n } from '@/components/language-provider'
import type { PriceOrder, PriceRow } from '@/lib/pricing'

const CURRENCY_SYMBOL: Record<string, string> = {
  usd: '$',
  cny: '¥',
  rmb: '¥',
  eur: '€',
  gbp: '£',
}

function symbolOf(currency: string) {
  return CURRENCY_SYMBOL[currency.toLowerCase()] ?? ''
}

function faviconOf(website?: string) {
  if (!website) return undefined
  try {
    const url = website.startsWith('http') ? website : `http://${website}`
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
  } catch {
    return undefined
  }
}

export default function PriceCard({ tld, rows }: { tld: string; rows: PriceRow[] }) {
  const { t } = useI18n()
  const [order, setOrder] = useState<PriceOrder>('new')

  const orders: { key: PriceOrder; label: string }[] = [
    { key: 'new', label: t('priceNew') },
    { key: 'renew', label: t('priceRenew') },
    { key: 'transfer', label: t('priceTransfer') },
  ]

  const sorted = useMemo(() => {
    return [...rows]
      .filter((r) => Number.isFinite(r[order]))
      .sort((a, b) => a[order] - b[order])
      .slice(0, 8)
  }, [rows, order])

  const lowest = sorted.length > 0 ? sorted[0][order] : undefined

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">{t('priceTitle')}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
            .{tld}
          </span>
        </div>

        {/* 排序/类型切换胶囊 */}
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {orders.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setOrder(o.key)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                order === o.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length > 0 ? (
        <ul className="space-y-2.5">
          {sorted.map((r) => {
            const price = r[order]
            const isLowest = price === lowest
            const favicon = faviconOf(r.registrarWeb)
            return (
              <li key={r.registrar}>
                <a
                  href={r.registrarWeb || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3 transition-colors hover:border-foreground/20"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
                    {favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={favicon} alt="" width={20} height={20} className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {r.registrarName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {r.registrarName}
                  </span>
                  {isLowest && (
                    <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                      {t('priceLowest')}
                    </span>
                  )}
                  <span className="shrink-0 font-mono text-base font-bold tracking-tight text-foreground">
                    {symbolOf(r.currency)}
                    {price.toFixed(2)}
                    <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                      {t('priceYear')}
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground/60">{t('priceLoading')}</p>
      )}

      <p className="mt-4 text-right text-xs text-muted-foreground/70">{t('priceSource')}</p>
    </section>
  )
}
