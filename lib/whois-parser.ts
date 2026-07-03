export interface WhoisData {
  domainName?: string
  registryDomainId?: string
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
}

function firstMatch(raw: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const value = raw.match(pattern)?.[1]?.trim()
    if (value) return value
  }
  return undefined
}

function allMatches(raw: string, pattern: RegExp, stripper: RegExp): string[] {
  const found = raw.match(pattern)?.map((line) => line.replace(stripper, '').trim())
  // 去重并过滤空值
  return Array.from(new Set((found ?? []).filter(Boolean)))
}

export function parseWhoisData(raw: string): WhoisData {
  const notFound =
    /(No match for|NOT FOUND|No Data Found|Domain not found|Status:\s*free|is available for registration)/i.test(
      raw,
    )

  return {
    domainName: firstMatch(raw, [/Domain Name:\s*(.*)/i, /domain:\s*(.*)/i]),
    registryDomainId: firstMatch(raw, [/Registry Domain ID:\s*(.*)/i]),
    creationDate: firstMatch(raw, [
      /Creation Date:\s*(.*)/i,
      /Created On:\s*(.*)/i,
      /Registered on:\s*(.*)/i,
      /created:\s*(.*)/i,
    ]),
    expiryDate: firstMatch(raw, [
      /Registry Expiry Date:\s*(.*)/i,
      /Expiry Date:\s*(.*)/i,
      /Expiration Date:\s*(.*)/i,
      /paid-till:\s*(.*)/i,
    ]),
    updatedDate: firstMatch(raw, [/Updated Date:\s*(.*)/i, /last-update:\s*(.*)/i, /changed:\s*(.*)/i]),
    dnssec: firstMatch(raw, [/DNSSEC:\s*(.*)/i]),
    registrar: {
      name: firstMatch(raw, [/Registrar:\s*(.*)/i, /Sponsoring Registrar:\s*(.*)/i]),
      website: firstMatch(raw, [/Registrar URL:\s*(.*)/i]),
      email: firstMatch(raw, [/Registrar Abuse Contact Email:\s*(.*)/i]),
      phone: firstMatch(raw, [/Registrar Abuse Contact Phone:\s*(.*)/i]),
      ianaId: firstMatch(raw, [/Registrar IANA ID:\s*(.*)/i]),
    },
    registrant: {
      name: firstMatch(raw, [/Registrant Name:\s*(.*)/i]),
      organization: firstMatch(raw, [/Registrant Organization:\s*(.*)/i]),
      email: firstMatch(raw, [/Registrant Email:\s*(.*)/i]),
      phone: firstMatch(raw, [/Registrant Phone:\s*(.*)/i]),
      country: firstMatch(raw, [/Registrant Country:\s*(.*)/i]),
    },
    domainStatus: allMatches(raw, /Domain Status:\s*(.*)/gi, /Domain Status:\s*/i),
    nameServers: allMatches(raw, /Name Server:\s*(.*)/gi, /Name Server:\s*/i),
    isAvailable: notFound,
  }
}
