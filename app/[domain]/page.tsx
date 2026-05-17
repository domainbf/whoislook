import Header from '@/components/header'
import WhoisResult from '@/components/whois-result'
import { whois } from '@/lib/whois'
import { unstable_cache } from 'next/cache'

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params

  const data = await unstable_cache(async () => whois(domain), [domain], {
    revalidate: 3600,
  })()

  return (
    <>
      <Header />
      {data && <WhoisResult domain={domain} raw={data} />}
    </>
  )
}
