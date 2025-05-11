import { whois } from '@/lib/whois';

interface WhoisData {
  domainName?: string;
  creationDate?: string;
  updateDate?: string;
  expiryDate?: string;
  domainStatus?: string[];
  nameServers?: string[];
  registrar?: {
    name?: string;
    id?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
}

async function fetchWhoisData(domain: string): Promise<WhoisData> {
  try {
    const rawData = await whois(domain);

    // 使用健壮的正则表达式解析 WHOIS 原始数据
    const parsedData: WhoisData = {
      domainName: rawData.match(/(?:Domain Name|DOMAIN|Domain):\s*([\w.-]+)/i)?.[1]?.trim() || 'Unknown',
      creationDate: rawData.match(/(?:Creation Date|Registered On|Created On):\s*([\w\s:-]+)/i)?.[1]?.trim() || 'Unknown',
      updateDate: rawData.match(/(?:Updated Date|Last Updated On|Modified On):\s*([\w\s:-]+)/i)?.[1]?.trim() || 'Unknown',
      expiryDate: rawData.match(/(?:Expiry Date|Expiration Date|Expires On):\s*([\w\s:-]+)/i)?.[1]?.trim() || 'Unknown',
      domainStatus: rawData
        .match(/(?:Domain Status|Status):\s*([\w\s,-]+)/gi)
        ?.map((status) => status.replace(/(?:Domain Status|Status):/i, '').trim()) || ['Unknown'],
      nameServers: rawData
        .match(/(?:Name Server|Nameserver|Nserver):\s*([\w.-]+)/gi)
        ?.map((ns) => ns.replace(/(?:Name Server|Nameserver|Nserver):/i, '').trim()) || ['Unknown'],
      registrar: {
        name: rawData.match(/(?:Registrar|Sponsoring Registrar):\s*([\w\s.-]+)/i)?.[1]?.trim() || 'Unknown',
        id: rawData.match(/(?:Registrar IANA ID|IANA ID):\s*([\d]+)/i)?.[1]?.trim() || 'Unknown',
        email: rawData.match(/(?:Registrar Abuse Contact Email|Contact Email):\s*([\w@.-]+)/i)?.[1]?.trim() || 'Unknown',
        phone: rawData.match(/(?:Registrar Abuse Contact Phone|Contact Phone):\s*([\+\d\s()-]+)/i)?.[1]?.trim() || 'Unknown',
        website: 'Unknown', // WHOIS 数据中通常没有直接提供注册商网址
      },
    };

    return parsedData;
  } catch (error) {
    console.error('Error fetching WHOIS data:', error);
    throw new Error('Failed to fetch WHOIS data.');
  }
}
