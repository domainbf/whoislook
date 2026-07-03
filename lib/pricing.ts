export interface PriceRow {
  registrar: string
  registrarName: string
  registrarWeb: string
  new: number
  renew: number
  transfer: number
  currency: string
  currencyName: string
  promo: { new: boolean; renew: boolean; transfer: boolean }
  updatedTime: string
}

export interface PricingResult {
  tld: string
  rows: PriceRow[]
}

export type PriceOrder = 'new' | 'renew' | 'transfer'

/** 常见的二级后缀，避免把 example.co.uk 的后缀误判为 uk */
const TWO_LEVEL_TLDS = new Set([
  'co.uk', 'org.uk', 'me.uk', 'gov.uk', 'ac.uk',
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn',
  'com.au', 'net.au', 'org.au', 'com.br', 'com.tw',
  'com.hk', 'com.sg', 'co.jp', 'co.kr', 'co.nz', 'co.in',
])

/** 从域名中提取用于价格查询的后缀（如 example.com -> com, a.co.uk -> co.uk） */
export function extractTld(domain: string): string {
  const d = domain.toLowerCase().replace(/^\.+|\.+$/g, '')
  const parts = d.split('.').filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? d
  const lastTwo = parts.slice(-2).join('.')
  if (TWO_LEVEL_TLDS.has(lastTwo)) return lastTwo
  return parts[parts.length - 1]
}

interface NazhumiPrice {
  registrar?: string
  registrarname?: string
  registrarweb?: string
  new?: number
  renew?: number
  transfer?: number
  currency?: string
  currencyname?: string
  promocode?: { new?: boolean; renew?: boolean; transfer?: boolean }
  updatedtime?: string
}

/** 调用 nazhumi 接口获取某后缀在各注册商的价格 */
export async function fetchPricing(tld: string): Promise<PricingResult | null> {
  const clean = tld.replace(/^\.+/, '')
  if (!clean) return null
  try {
    const res = await fetch(
      `https://www.nazhumi.com/api/v1?domain=${encodeURIComponent(clean)}&order=new`,
      {
        headers: { Accept: 'application/json' },
        // 价格变化不频繁，缓存 6 小时，加快后续查询速度
        next: { revalidate: 21600 },
      },
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      code?: number
      data?: { domain?: string; price?: NazhumiPrice[] }
    }
    if (json.code !== 100 || !Array.isArray(json.data?.price)) return null

    const rows: PriceRow[] = json.data!.price!
      .filter((p) => typeof p.new === 'number' || typeof p.renew === 'number')
      .map((p) => ({
        registrar: p.registrar ?? '',
        registrarName: p.registrarname ?? p.registrar ?? '',
        registrarWeb: p.registrarweb ?? '',
        new: typeof p.new === 'number' ? p.new : Number.POSITIVE_INFINITY,
        renew: typeof p.renew === 'number' ? p.renew : Number.POSITIVE_INFINITY,
        transfer: typeof p.transfer === 'number' ? p.transfer : Number.POSITIVE_INFINITY,
        currency: p.currency ?? 'usd',
        currencyName: p.currencyname ?? '',
        promo: {
          new: Boolean(p.promocode?.new),
          renew: Boolean(p.promocode?.renew),
          transfer: Boolean(p.promocode?.transfer),
        },
        updatedTime: p.updatedtime ?? '',
      }))

    return { tld: json.data!.domain ?? clean, rows }
  } catch {
    return null
  }
}
