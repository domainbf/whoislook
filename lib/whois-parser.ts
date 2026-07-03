export interface WhoisData {
  domainName?: string
  creationDate?: string
  expiryDate?: string
  updatedDate?: string
  dnssec?: string
  registrar: { name?: string; website?: string; email?: string; phone?: string; ianaId?: string }
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
}

type RdapEntity = {
  roles?: string[]
  handle?: string
  vcardArray?: unknown[]
  entities?: RdapEntity[]
  publicIds?: { type?: string; identifier?: string }[]
}

type RdapResponse = {
  ldhName?: string
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

export function parseRdapData(domain: string, json: RdapResponse): WhoisData {
  const registrar = findEntity(json.entities, 'registrar')
  const registrant = findEntity(json.entities, 'registrant')

  const registrarIanaId = registrar?.publicIds?.find((p) =>
    /iana/i.test(p.type ?? ''),
  )?.identifier

  // registrar 的滥用联系通常在其嵌套的 abuse 实体里
  const abuse = findEntity(registrar?.entities, 'abuse')

  return {
    domainName: json.ldhName?.toLowerCase() ?? domain,
    creationDate: eventDate(json.events, 'registration'),
    expiryDate: eventDate(json.events, 'expiration'),
    updatedDate: eventDate(json.events, 'last changed'),
    dnssec:
      json.secureDNS?.delegationSigned === true
        ? 'signedDelegation'
        : json.secureDNS?.delegationSigned === false
          ? 'unsigned'
          : undefined,
    registrar: {
      name: vcardValue(registrar?.vcardArray, 'fn'),
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
