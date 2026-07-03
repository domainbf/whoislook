import { AlertTriangle } from 'lucide-react'
import RecordHistory from '@/components/record-history'
import SearchBox from '@/components/search-box'
import SiteHeader from '@/components/site-header'
import WhoisResult from '@/components/whois-result'
import { getLang } from '@/lib/get-lang'
import { createT } from '@/lib/i18n'
import { normalizeDomain } from '@/lib/normalize-domain'
import { lookupDomain } from '@/lib/whois'
import type { WhoisData } from '@/lib/whois-parser'

export default async function ResultsPage({
  searchParams,
}: {
  searchParams?: Promise<{ domain?: string }>
}) {
  const raw = (await searchParams)?.domain
  const domain = raw ? normalizeDomain(raw) : undefined
  const t = createT(await getLang())

  if (!domain) {
    return (
      <main className="min-h-dvh bg-dots">
        <SiteHeader />
        <div className="mx-auto mt-8 max-w-2xl px-4">
          <SearchBox />
        </div>
      </main>
    )
  }

  let data: WhoisData | null = null
  let error: string | null = null

  try {
    data = await lookupDomain(domain)
  } catch (err) {
    error = err instanceof Error ? err.message : '查询失败，请稍后重试'
  }

  return (
    <main className="min-h-dvh bg-dots">
      <SiteHeader />
      <RecordHistory domain={domain} />
      <div className="mx-auto mt-8 max-w-2xl px-4">
        <SearchBox />
      </div>
      {error && (
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex flex-col items-center rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-foreground">{t('lookupFailed')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
      {data !== null && <WhoisResult domain={domain} data={data} />}
    </main>
  )
}
