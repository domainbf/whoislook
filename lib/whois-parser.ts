export interface WhoisData {
  domainName?: string
  creationDate?: string
  expiryDate?: string
  updatedDate?: string
  dnssec?: string
  registryDomainId?: string
  whoisServer?: string
  source?: 'rdap' | 'whois'
  elapsedMs?: number
  registrar: {
    name?: string
    website?: string
    email?: string
    phone?: string
    ianaId?: string
  }
  registrant: {
    name?: string
    organization?: string
    email?: string
    phone?: string
    country?: string
  }
  domainStatus?: string[]
  nameServers?: string[]
  isAvailable: boolean
  /** 更细粒度的可用性：已注册 / 可注册 / 已保留 / 禁止注册 */
  availability?: 'registered' | 'available' | 'reserved' | 'prohibited'
  rawJson?: string
  rawText?: string
}

type RdapLink = { rel?: string; href?: string; value?: string }

type RdapEntity = {
  roles?: string[]
  handle?: string
  vcardArray?: unknown[]
  entities?: RdapEntity[]
  publicIds?: { type?: string; identifier?: string }[]
  links?: RdapLink[]
}

type RdapResponse = {
  ldhName?: string
  handle?: string
  port43?: string
  status?: string[]
  events?: { eventAction?: string; eventDate?: string }[]
  nameservers?: { ldhName?: string }[]
  entities?: RdapEntity[]
  secureDNS?: { delegationSigned?: boolean }
}

/** 从 vCard 数组中读取指定属性值（如 fn、email、tel、org、adr） */
function vcardValue(vcardArray: unknown[] | undefined, prop: string): string | undefined {
  if (!Array.isArray(vcardArray) || vcardArray.length < 2) return undefined
  const entries = vcardArray[1]
  if (!Array.isArray(entries)) return undefined
  for (const entry of entries) {
    if (Array.isArray(entry) && entry[0] === prop) {
      const value = entry[3]
      const clean = (v: string) => v.trim().replace(/^(tel|mailto):/i, '')
      if (typeof value === 'string' && value.trim()) return clean(value)
      if (Array.isArray(value)) {
        const joined = value.filter(Boolean).join(', ').trim()
        if (joined) return clean(joined)
      }
    }
  }
  return undefined
}

/** 从 vCard 的 adr 属性中提取国家（数组最后一段） */
function vcardCountry(vcardArray: unknown[] | undefined): string | undefined {
  if (!Array.isArray(vcardArray) || vcardArray.length < 2) return undefined
  const entries = vcardArray[1]
  if (!Array.isArray(entries)) return undefined
  for (const entry of entries) {
    if (Array.isArray(entry) && entry[0] === 'adr') {
      const value = entry[3]
      if (Array.isArray(value)) {
        const country = value[value.length - 1]
        if (typeof country === 'string' && country.trim()) return country.trim()
      }
    }
  }
  return undefined
}

function findEntity(entities: RdapEntity[] | undefined, role: string): RdapEntity | undefined {
  if (!entities) return undefined
  for (const entity of entities) {
    if (entity.roles?.includes(role)) return entity
    const nested = findEntity(entity.entities, role)
    if (nested) return nested
  }
  return undefined
}

function eventDate(events: RdapResponse['events'], action: string): string | undefined {
  return events?.find((e) => e.eventAction === action)?.eventDate
}

/** 将 RDAP 状态码（如 "client transfer prohibited"）转成人类可读文本 */
function humanizeStatus(status?: string[]): string[] {
  return (status ?? []).map((s) => s.trim()).filter(Boolean)
}

const REDACTED_RE =
  /^(redacted|not disclosed|data protected|not available|withheld|n\/a|none|private|statutory masking enabled)\b/i

/** 转义正则特殊字符，允许键名里包含空格/括号等 */
function escapeKey(key: string): string {
  return key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 从原始 WHOIS 文本中读取某个字段的第一个匹配值（支持多个候选键名）。
 * 兼容以 ":" 或空白分隔的不规则 ccTLD 格式（如 .jp / .de / .fr）。
 */
function textField(text: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const k = escapeKey(key)
    // 同时兼容 "key: value" 与 "key   value"（部分 ccTLD 用制表符/空格对齐）
    const re = new RegExp(`^\\s*\\[?${k}\\]?\\s*[:：]?[\\t ]+(.+?)\\s*$`, 'im')
    const m = text.match(re)
    if (m?.[1] && m[1].trim() && !REDACTED_RE.test(m[1].trim())) {
      return m[1].trim()
    }
  }
  return undefined
}

/** 尝试把各类 ccTLD 日期格式规范化为 ISO（无法识别则原样返回） */
function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined
  const v = value.trim()
  // 已是 ISO 或标准可解析格式
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v
  // DD.MM.YYYY 或 DD/MM/YYYY（.de/.ru 等常见）
  let m = v.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  // YYYY.MM.DD 或 YYYY/MM/DD（.jp 等）
  m = v.match(/^(\d{4})[.\/](\d{1,2})[.\/](\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  // DD-MMM-YYYY（如 05-Jan-2024）
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  }
  m = v.match(/^(\d{1,2})[-\s]([a-z]{3})[-\s](\d{4})/i)
  if (m) {
    const mo = months[m[2].toLowerCase()]
    if (mo) return `${m[3]}-${mo}-${m[1].padStart(2, '0')}`
  }
  return v
}

/** 从原始 WHOIS 文本中读取某个字段的所有匹配值（如 name server、status） */
function textFieldAll(text: string, keys: string[]): string[] {
  const values: string[] = []
  for (const key of keys) {
    const re = new RegExp(`^\\s*${key}\\s*:\\s*(.+?)\\s*$`, 'gim')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const v = m[1].trim()
      if (v) values.push(v)
    }
  }
  return Array.from(new Set(values.map((v) => v.toLowerCase())))
}

/**
 * 解析传统端口 43 WHOIS 的纯文本响应。
 * WHOIS 文本格式因注册局而异，这里尽量覆盖常见字段名。
 */
export function parseWhoisText(domain: string, raw: string): WhoisData {
  const text = raw ?? ''

  // 判断域名被保留（注册局保留，暂不可公开注册）
  const reserved =
    /(reserved (?:name|domain|by)|is reserved|Reserved Domain Name|restricted for registration|该域名已被保留|保留域名|registry reserved|reserved for registry)/i.test(
      text,
    )
  if (reserved) {
    return {
      domainName: domain,
      isAvailable: false,
      availability: 'reserved',
      registrar: {},
      registrant: {},
      rawText: text,
    }
  }

  // 判断域名被禁止/限制注册
  const prohibited =
    /(prohibited from registration|blocked for registration|registration (?:is )?(?:not allowed|forbidden|prohibited)|禁止注册|不允许注册|banned)/i.test(
      text,
    )
  if (prohibited) {
    return {
      domainName: domain,
      isAvailable: false,
      availability: 'prohibited',
      registrar: {},
      registrant: {},
      rawText: text,
    }
  }

  // 判断域名是否未注册（可注册）
  const notFound =
    /(No match for|NOT FOUND|No Data Found|Domain not found|No entries found|is free|Status:\s*free|No such domain|not registered|Domain Status:\s*No Object Found|available for registration|nothing found)/i.test(
      text,
    )
  if (notFound) {
    return {
      domainName: domain,
      isAvailable: true,
      availability: 'available',
      registrar: {},
      registrant: {},
    }
  }

  const status = textFieldAll(text, ['Domain Status', 'Status', 'state'])
    // 去掉状态值后面的 URL（如 "clientTransferProhibited https://..."）
    .map((s) => s.replace(/\s*https?:\/\/\S+/i, '').trim())
    .filter(Boolean)

  return {
    domainName: (
      textField(text, ['Domain Name', 'domain', 'Domain', 'domain name']) ?? domain
    ).toLowerCase(),
    creationDate: normalizeDate(
      textField(text, [
        'Creation Date',
        'Created On',
        'Created Date',
        'created',
        'Registration Time',
        'Registration Date',
        'Registered on',
        'Registered',
        'Domain Registration Date',
        'record created',
        'Registered Date',
        '[Registered Date]',
      ]),
    ),
    expiryDate: normalizeDate(
      textField(text, [
        'Registry Expiry Date',
        'Expiration Date',
        'Registrar Registration Expiration Date',
        'Expiry Date',
        'Expiry date',
        'expires',
        'expire',
        'paid-till',
        'Expiration Time',
        'Domain Expiration Date',
        'renewal date',
        '[Expires on]',
      ]),
    ),
    updatedDate: normalizeDate(
      textField(text, [
        'Updated Date',
        'Last Modified',
        'Last Updated',
        'last-update',
        'changed',
        'Modified',
        'Domain Last Updated Date',
        '[Last Updated]',
      ]),
    ),
    dnssec: textField(text, ['DNSSEC', 'DNSSEC signed', 'dnssec']),
    registryDomainId: textField(text, ['Registry Domain ID', 'Domain ID']),
    whoisServer: textField(text, ['Registrar WHOIS Server', 'WHOIS Server', 'whois']),
    source: 'whois',
    registrar: {
      name: textField(text, [
        'Registrar',
        'Sponsoring Registrar',
        'Registrar Name',
        'registrar',
        'Registration Service Provider',
      ]),
      website: textField(text, ['Registrar URL', 'Registrar Web', 'Registrar URL (registration services)', 'url']),
      email: textField(text, ['Registrar Abuse Contact Email', 'Abuse Contact Email']),
      phone: textField(text, ['Registrar Abuse Contact Phone', 'Abuse Contact Phone']),
      ianaId: textField(text, ['Registrar IANA ID', 'IANA ID']),
    },
    registrant: {
      name: textField(text, ['Registrant Name', 'Registrant', 'Registrant Contact Name', 'owner']),
      organization: textField(text, [
        'Registrant Organization',
        'Registrant Organisation',
        'org',
        'Organization',
      ]),
      email: textField(text, ['Registrant Email', 'Registrant Contact Email']),
      phone: textField(text, ['Registrant Phone', 'Registrant Contact Phone']),
      country: textField(text, ['Registrant Country', 'Registrant Country/Economy', 'country']),
    },
    domainStatus: status,
    nameServers: textFieldAll(text, [
      'Name Server',
      'Nameserver',
      'Name Servers',
      'nserver',
      'ns',
      'Domain servers in listed order',
    ]),
    isAvailable: false,
    availability: 'registered',
    rawText: text,
  }
}

export function parseRdapData(domain: string, json: RdapResponse): WhoisData {
  const registrar = findEntity(json.entities, 'registrar')
  const registrant = findEntity(json.entities, 'registrant')

  const registrarIanaId = registrar?.publicIds?.find((p) =>
    /iana/i.test(p.type ?? ''),
  )?.identifier

  // registrar 的滥用联系通常在其嵌套的 abuse 实体里
  const abuse = findEntity(registrar?.entities, 'abuse')

  // registrar 网址：优先 vcard url，其次 links 中 rel=about
  const registrarUrl =
    vcardValue(registrar?.vcardArray, 'url') ??
    registrar?.links?.find((l) => l.rel === 'about')?.href ??
    registrar?.links?.find((l) => l.href)?.href

  return {
    domainName: json.ldhName?.toLowerCase() ?? domain,
    creationDate: eventDate(json.events, 'registration'),
    expiryDate: eventDate(json.events, 'expiration'),
    updatedDate: eventDate(json.events, 'last changed'),
    registryDomainId: json.handle,
    whoisServer: json.port43,
    source: 'rdap',
    dnssec:
      json.secureDNS?.delegationSigned === true
        ? 'signedDelegation'
        : json.secureDNS?.delegationSigned === false
          ? 'unsigned'
          : undefined,
    registrar: {
      name: vcardValue(registrar?.vcardArray, 'fn'),
      website: registrarUrl,
      email: vcardValue(abuse?.vcardArray, 'email') ?? vcardValue(registrar?.vcardArray, 'email'),
      phone: vcardValue(abuse?.vcardArray, 'tel') ?? vcardValue(registrar?.vcardArray, 'tel'),
      ianaId: registrarIanaId,
    },
    registrant: {
      name: vcardValue(registrant?.vcardArray, 'fn'),
      organization: vcardValue(registrant?.vcardArray, 'org'),
      email: vcardValue(registrant?.vcardArray, 'email'),
      phone: vcardValue(registrant?.vcardArray, 'tel'),
      country: vcardCountry(registrant?.vcardArray),
    },
    domainStatus: humanizeStatus(json.status),
    nameServers: (json.nameservers ?? [])
      .map((n) => n.ldhName?.toLowerCase())
      .filter((n): n is string => Boolean(n)),
    isAvailable: false,
    availability: 'registered',
    rawJson: JSON.stringify(json, null, 2),
  }
}
