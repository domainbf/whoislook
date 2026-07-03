'use client'

import { ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { clearHistory, getHistory, type HistoryItem } from '@/lib/search-history'

const PAGE_SIZE = 6

function relativeTime(time: number): string {
  const d = new Date(time)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  if (sameDay) return `今天 ${hh}:${mm}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${hh}:${mm}`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ` ${hh}:${mm}`
}

export default function SearchHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [page, setPage] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setItems(getHistory())
  }, [])

  if (!mounted || items.length === 0) return null

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current = Math.min(page, totalPages - 1)
  const pageItems = items.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  return (
    <section className="mx-auto mt-14 w-full max-w-2xl">
      <div className="mb-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-muted-foreground">查询历史</h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pageItems.map((item) => (
          <Link
            key={item.domain}
            href={`/${encodeURIComponent(item.domain)}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/20"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Globe className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-foreground">{item.domain}</span>
              <span className="mt-1 flex items-center gap-2">
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-muted-foreground">
                  DOMAIN
                </span>
                <span className="text-xs text-muted-foreground">{relativeTime(item.time)}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            aria-label="上一页"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-sm text-muted-foreground">
            {current + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={current === totalPages - 1}
            aria-label="下一页"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            clearHistory()
            setItems([])
          }}
          className="text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          清除历史记录
        </button>
      </div>
    </section>
  )
}
