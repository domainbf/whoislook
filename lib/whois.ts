import { parseRdapData, type WhoisData } from './whois-parser'

const RDAP_BOOTSTRAP = 'https://rdap.org/domain/'

/**
 * 使用 RDAP 协议（HTTPS/443）查询域名信息。
 * 相比传统 WHOIS 端口 43，RDAP 在无服务器/托管环境（如 Vercel）中可用，
 * 且返回标准化 JSON，解析更可靠。
 */
export async function lookupDomain(domain: string): Promise<WhoisData> {
  const normalized = domain.trim().toLowerCase()

  const res = await fetch(`${RDAP_BOOTSTRAP}${encodeURIComponent(normalized)}`, {
    redirect: 'follow',
    headers: { Accept: 'application/rdap+json' },
    // 结果可缓存一段时间，避免频繁查询
    next: { revalidate: 3600 },
  })

  // 404 通常表示域名未注册（可注册）
  if (res.status === 404) {
    return { domainName: normalized, isAvailable: true, registrar: {}, registrant: {} }
  }

  if (!res.ok) {
    throw new Error(`RDAP 查询失败（HTTP ${res.status}）`)
  }

  const json = await res.json()
  return parseRdapData(normalized, json)
}
