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

/** 尝试用 RDAP（HTTPS/443）查询，失败或无数据时返回 null 以便回退 */
async function tryRdap(normalized: string): Promise<WhoisData | null> {
  try {
    const res = await fetch(`${RDAP_BOOTSTRAP}${encodeURIComponent(normalized)}`, {
      redirect: 'follow',
      headers: { Accept: 'application/rdap+json' },
      next: { revalidate: 3600 },
    })

    // 404 表示 RDAP 明确查无此域名 —— 但部分 ccTLD 无 RDAP 服务，
    // 交给上层回退到端口 43 再确认，避免误报"可注册"
    if (res.status === 404) return null
    if (!res.ok) return null

    const json = await res.json()
    const data = parseRdapData(normalized, json)
    return hasUsefulData(data) ? data : null
  } catch {
    return null
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
  const rdapData = await tryRdap(normalized)
  if (rdapData) {
    rdapData.elapsedMs = Date.now() - start
    return rdapData
  }

  // 回退：端口 43 WHOIS
  try {
    const legacy = await lookupDomainLegacy(normalized)
    legacy.elapsedMs = Date.now() - start
    return legacy
  } catch (err) {
    // 两种方式都失败时，抛出可读错误
    throw new Error(
      `无法查询该域名信息（RDAP 与 WHOIS 均未返回数据）：${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }
}
