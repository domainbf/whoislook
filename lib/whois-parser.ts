export interface WhoisData {
  registrar: {
    name?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  registrant: {
    name?: string;
    email?: string;
    phone?: string;
  };
  domainStatus?: string[];
  nameServers?: string[];
}

export function parseWhoisData(rawData: string): WhoisData {
  return {
    registrar: {
      name: rawData.match(/(?:Registrar|Sponsoring Registrar):\s*([\w\s.-]+)/i)?.[1]?.trim(),
      website: rawData.match(/(?:Registrar URL|Registrar Homepage):\s*([\w\s.:/-]+)/i)?.[1]?.trim(),
      email: rawData.match(/(?:Registrar Abuse Contact Email|Contact Email):\s*([\w@.-]+)/i)?.[1]?.trim(),
      phone: rawData.match(/(?:Registrar Abuse Contact Phone|Contact Phone):\s*([\+\d\s()-]+)/i)?.[1]?.trim()
    },
    registrant: {
      name: rawData.match(/(?:Registrant Name|Name):\s*([\w\s.-]+)/i)?.[1]?.trim(),
      email: rawData.match(/(?:Registrant Email|Email):\s*([\w@.-]+)/i)?.[1]?.trim(),
      phone: rawData.match(/(?:Registrant Phone|Phone):\s*([\+\d\s()-]+)/i)?.[1]?.trim()
    },
    domainStatus: rawData
      .match(/(?:Domain Status|Status):\s*([\w\s,-]+)/gi)
      ?.map((status) => status.replace(/(?:Domain Status|Status):/i, '').trim()),
    nameServers: rawData
      .match(/(?:Name Server|Nameserver|Nserver):\s*([\w.-]+)/gi)
      ?.map((ns) => ns.replace(/(?:Name Server|Nameserver|Nserver):/i, '').trim())
  };
}
