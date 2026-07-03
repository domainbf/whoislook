import PriceCard from '@/components/price-card'
import { extractTld, fetchPricing } from '@/lib/pricing'

/**
 * 异步服务端组件：拉取后缀价格。
 * 由外层 <Suspense> 包裹，实现价格流式加载，不阻塞 WHOIS 结果显示。
 */
export default async function PriceSection({ domain }: { domain: string }) {
  const tld = extractTld(domain)
  const pricing = await fetchPricing(tld)
  if (!pricing || pricing.rows.length === 0) return null
  return <PriceCard tld={pricing.tld} rows={pricing.rows} />
}
