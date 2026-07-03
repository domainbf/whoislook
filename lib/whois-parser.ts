export interface WhoisData {
  domainName?: string
  creationDate?: string
  expiryDate?: string
  updatedDate?: string
  dnssec?: string
  registryDomainId?: string
  whoisServer?: string
  source?: 'rdap' | 'whois'
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

/** 从原始 WHOIS 文本中读取某个字段的第一个匹配值（支持多个候选键名） */
function textField(text: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const re = new RegExp(`^\\s*${key}\\s*:\\s*(.+?)\\s*$`, 'im')
    const m = text.match(re)
    if (m?.[1] && m[1].trim() && !/^(redacted|not disclosed|data protected)/i.test(m[1].trim())) {
      return m[1].trim()
    }
  }
  return undefined
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

  // 判断域名是否未注册（可注册）
  const notFound =
    /(No match for|NOT FOUND|No Data Found|Domain not found|No entries found|is free|Status:\s*free)/i.test(
      text,
    )
  if (notFound) {
    return { domainName: domain, isAvailable: true, registrar: {}, registrant: {} }
  }

  const status = textFieldAll(text, ['Domain Status', 'Status', 'state'])
    // 去掉状态值后面的 URL（如 "clientTransferProhibited https://..."）
    .map((s) => s.replace(/\s*https?:\/\/\S+/i, '').trim())
    .filter(Boolean)

  return {
    domainName: (textField(text, ['Domain Name', 'domain']) ?? domain).toLowerCase(),
    creationDate: textField(text, [
      'Creation Date',
      'Created On',
      'created',
      'Registration Time',
      'Registered on',
    ]),
    expiryDate: textField(text, [
      'Registry Expiry Date',
      'Expiration Date',
      'Expiry Date',
      'paid-till',
      'Expiration Time',
    ]),
    updatedDate: textField(text, ['Updated Date', 'Last Modified', 'changed', 'Last Updated']),
    dnssec: textField(text, ['DNSSEC']),
    registryDomainId: textField(text, ['Registry Domain ID']),
    whoisServer: textField(text, ['Registrar WHOIS Server', 'WHOIS Server', 'whois']),
    source: 'whois',
    registrar: {
      name: textField(text, ['Registrar', 'Sponsoring Registrar', 'registrar']),
      website: textField(text, ['Registrar URL', 'Registrar Web', 'url']),
      email: textField(text, ['Registrar Abuse Contact Email']),
      phone: textField(text, ['Registrar Abuse Contact Phone']),
      ianaId: textField(text, ['Registrar IANA ID']),
    },
    registrant: {
      name: textField(text, ['Registrant Name', 'Registrant']),
      organization: textField(text, ['Registrant Organization', 'org']),
      email: textField(text, ['Registrant Email']),
      phone: textField(text, ['Registrant Phone']),
      country: textField(text, ['Registrant Country']),
    },
    domainStatus: status,
    nameServers: textFieldAll(text, ['Name Server', 'Nameserver', 'nserver', 'ns']),
    isAvailable: false,
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
    rawJson: JSON.stringify(json, null, 2),
  }
}
