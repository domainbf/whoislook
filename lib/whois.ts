import { parseRdapData, type WhoisData } from './whois-parser'
import { lookupDomainLegacy } from './whois-legacy'

const RDAP_BOOTSTRAP = 'https://rdap.org/domain/'

/** 判断一次查询结果是否"有效"（含关键字段），用于决定是否需要回退 */
function hasUsefulData(data: WhoisData): boolean {
  return Boolean(
    data.isAvailable ||
      data.creationDate ||
      data.expiryDate ||
      data.registrar.name ||
      (data.nameServers && data.nameServers.length > 0),
  )
}

type RdapResult =
  | { status: 'found'; data: WhoisData }
  | { status: 'notfound' } // RDAP 明确 404：查无此域名
  | { status: 'error' } // 网络/解析失败，无法判定

/** 尝试用 RDAP（HTTPS/443）查询，返回细分状态以便上层决策 */
async function tryRdap(normalized: string): Promise<RdapResult> {
  try {
    const res = await fetch(`${RDAP_BOOTSTRAP}${encodeURIComponent(normalized)}`, {
      redirect: 'follow',
      headers: { Accept: 'application/rdap+json' },
      next: { revalidate: 3600 },
    })

    // 404 表示 RDAP 明确查无此域名（对 gTLD 权威，对无 RDAP 的 ccTLD 需再确认）
    if (res.status === 404) return { status: 'notfound' }
    if (!res.ok) return { status: 'error' }

    const json = await res.json()
    const data = parseRdapData(normalized, json)
    return hasUsefulData(data) ? { status: 'found', data } : { status: 'notfound' }
  } catch {
    return { status: 'error' }
  }
}

/**
 * 查询域名信息：优先使用 RDAP（现代协议、HTTPS、在托管环境稳定），
 * 当 RDAP 无结果时回退到传统端口 43 WHOIS（覆盖部分无 RDAP 的 ccTLD）。
 */
export async function lookupDomain(domain: string): Promise<WhoisData> {
  const normalized = domain.trim().toLowerCase()
  const start = Date.now()

  // 第一优先：RDAP
  const rdap = await tryRdap(normalized)
  if (rdap.status === 'found') {
    rdap.data.elapsedMs = Date.now() - start
    return rdap.data
  }

  // 回退：端口 43 WHOIS
  try {
    const legacy = await lookupDomainLegacy(normalized)
    // WHOIS 返回但无有效数据，且 RDAP 已明确查无 → 判定为可注册
    if (!hasUsefulData(legacy) && rdap.status === 'notfound') {
      return {
        domainName: normalized,
        isAvailable: true,
        availability: 'available',
        registrar: {},
        registrant: {},
        elapsedMs: Date.now() - start,
      }
    }
    legacy.elapsedMs = Date.now() - start
    return legacy
  } catch (err) {
    // WHOIS 失败，但 RDAP 已明确 404（对 gTLD 权威）→ 直接判定为可注册，
    // 避免因托管环境屏蔽端口 43 而误报"查询失败"
    if (rdap.status === 'notfound') {
      return {
        domainName: normalized,
        isAvailable: true,
        availability: 'available',
        registrar: {},
        registrant: {},
        elapsedMs: Date.now() - start,
        source: 'rdap',
      }
    }
    // 两种方式都失败且无法判定时，抛出可读错误
    throw new Error(
      `无法查询该域名信息（RDAP 与 WHOIS 均未返回数据）：${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }
}
