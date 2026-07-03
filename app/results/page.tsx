import { lookupDomain } from '@/lib/whois'
import type { WhoisData } from '@/lib/whois-parser'
import WhoisResult from '@/components/whois-result'
import Header from '@/components/header'
import { AlertTriangle } from 'lucide-react'

export default async function ResultsPage({
  searchParams,
}: {
  searchParams?: Promise<{ domain?: string }>
}) {
  const domain = (await searchParams)?.domain

  if (!domain) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-muted-foreground">
          请输入域名
        </div>
      </>
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
    <>
      <Header />
      {error && (
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-foreground">查询失败</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
      {data !== null && <WhoisResult domain={domain} data={data} />}
    </>
  )
}
