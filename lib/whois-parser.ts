export interface WhoisData {
  domain: {
    name?: string
    registryDomainId?: string
    whoisServer?: string
    registrarUrl?: string
    updatedDate?: string
    creationDate?: string
    expiryDate?: string
  }
  registrar: {
    name?: string
    ianaId?: string
    url?: string
    whoisServer?: string
    email?: string
    phone?: string
    address?: string
  }
  registrant: {
    name?: string
    organization?: string
    email?: string
    phone?: string
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  admin: {
    name?: string
    email?: string
    phone?: string
    organization?: string
  }
  tech: {
    name?: string
    email?: string
    phone?: string
    organization?: string
  }
  domainStatus: string[]
  nameServers: string[]
  dnssec?: string
}

function match(raw: string, pattern: RegExp): string | undefined {
  const m = raw.match(pattern)
  return m?.[1]?.trim() || undefined
}

function matchAll(raw: string, pattern: RegExp): string[] {
  const results: string[] = []
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    const v = m[1]?.trim()
    if (v) results.push(v)
  }
  return Array.from(new Set(results))
}

export function parseWhoisData(raw: string): WhoisData {
  return {
    domain: {
      name: match(raw, /Domain Name:\s*(.+)/i),
      registryDomainId: match(raw, /Registry Domain ID:\s*(.+)/i),
      whoisServer: match(raw, /Registrar WHOIS Server:\s*(.+)/i),
      registrarUrl: match(raw, /Registrar URL:\s*(.+)/i),
      updatedDate: match(raw, /Updated Date:\s*(.+)/i),
      creationDate: match(raw, /Creation Date:\s*(.+)/i) || match(raw, /Created(?: On)?:\s*(.+)/i),
      expiryDate:
        match(raw, /Registry Expiry Date:\s*(.+)/i) ||
        match(raw, /Registrar Registration Expiration Date:\s*(.+)/i) ||
        match(raw, /Expir(?:y|ation) Date:\s*(.+)/i),
    },
    registrar: {
      name: match(raw, /Registrar:\s*(.+)/i),
      ianaId: match(raw, /Registrar IANA ID:\s*(.+)/i),
      url: match(raw, /Registrar URL:\s*(.+)/i),
      whoisServer: match(raw, /Registrar WHOIS Server:\s*(.+)/i),
      email:
        match(raw, /Registrar Abuse Contact Email:\s*(.+)/i) ||
        match(raw, /Registrar Email:\s*(.+)/i),
      phone:
        match(raw, /Registrar Abuse Contact Phone:\s*(.+)/i) ||
        match(raw, /Registrar Phone:\s*(.+)/i),
      address: match(raw, /Registrar Street Address:\s*(.+)/i),
    },
    registrant: {
      name: match(raw, /Registrant Name:\s*(.+)/i),
      organization: match(raw, /Registrant Organization:\s*(.+)/i),
      email: match(raw, /Registrant Email:\s*(.+)/i),
      phone: match(raw, /Registrant Phone:\s*(.+)/i),
      street: match(raw, /Registrant Street:\s*(.+)/i),
      city: match(raw, /Registrant City:\s*(.+)/i),
      state: match(raw, /Registrant State\/Province:\s*(.+)/i),
      postalCode: match(raw, /Registrant Postal Code:\s*(.+)/i),
      country: match(raw, /Registrant Country:\s*(.+)/i),
    },
    admin: {
      name: match(raw, /Admin(?:istrative)? Name:\s*(.+)/i),
      email: match(raw, /Admin(?:istrative)? Email:\s*(.+)/i),
      phone: match(raw, /Admin(?:istrative)? Phone:\s*(.+)/i),
      organization: match(raw, /Admin(?:istrative)? Organization:\s*(.+)/i),
    },
    tech: {
      name: match(raw, /Tech(?:nical)? Name:\s*(.+)/i),
      email: match(raw, /Tech(?:nical)? Email:\s*(.+)/i),
      phone: match(raw, /Tech(?:nical)? Phone:\s*(.+)/i),
      organization: match(raw, /Tech(?:nical)? Organization:\s*(.+)/i),
    },
    domainStatus: matchAll(raw, /Domain Status:\s*(.+)/gi).map((s) => s.replace(/\s*https?:\/\/\S+/i, '').trim()),
    nameServers: matchAll(raw, /Name Server:\s*(.+)/gi).map((s) => s.toLowerCase()),
    dnssec: match(raw, /DNSSEC:\s*(.+)/i),
  }
}

export function hasAnyValue(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v !== undefined && v !== null && v !== '')
}
