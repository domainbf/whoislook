export interface WhoisData {
  registrar: { name?: string; website?: string; email?: string; phone?: string; };
  registrant: { name?: string; email?: string; phone?: string; };
  domainStatus?: string[];
  nameServers?: string[];
}

export function parseWhoisData(raw: string): WhoisData {
  return {
    registrar: {
      name: raw.match(/Registrar:\s*(.*)/i)?.[1]?.trim(),
      website: raw.match(/Registrar URL:\s*(.*)/i)?.[1]?.trim(),
      email: raw.match(/Registrar Abuse Contact Email:\s*(.*)/i)?.[1]?.trim(),
      phone: raw.match(/Registrar Abuse Contact Phone:\s*(.*)/i)?.[1]?.trim(),
    },
    registrant: {
      name: raw.match(/Registrant Name:\s*(.*)/i)?.[1]?.trim(),
      email: raw.match(/Registrant Email:\s*(.*)/i)?.[1]?.trim(),
      phone: raw.match(/Registrant Phone:\s*(.*)/i)?.[1]?.trim(),
    },
    domainStatus: raw.match(/Domain Status:\s*(.*)/gi)?.map(line => line.replace(/Domain Status:\s*/i, '').trim()),
    nameServers: raw.match(/Name Server:\s*(.*)/gi)?.map(line => line.replace(/Name Server:\s*/i, '').trim()),
  };
}
