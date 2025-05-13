import { whois } from "@/lib/whois";

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
  const rawData = await whois(domain);

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
      website: 'Unknown',
    },
  };

  return parsedData;
}

export default async function ResultsPage({ searchParams }: { searchParams: { domain?: string } }) {
  const domain = searchParams?.domain;

  if (!domain) {
    return <div className="text-center">Please provide a domain name.</div>;
  }

  const whoisData = await fetchWhoisData(domain);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">WHOIS Lookup Results for {whoisData.domainName}</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Domain Information</h2>
        <ul className="mb-4">
          <li>Registration Date: {whoisData.creationDate || 'Unknown'}</li>
          <li>Last Updated: {whoisData.updateDate || 'Unknown'}</li>
          <li>Expiry Date: {whoisData.expiryDate || 'Unknown'}</li>
          <li>Status: {whoisData.domainStatus?.join(", ") || 'Unknown'}</li>
          <li>Name Servers: {whoisData.nameServers?.join(", ") || 'Unknown'}</li>
        </ul>

        <h2 className="text-xl font-bold mb-2">Registrar Information</h2>
        <ul>
          <li>Registrar: {whoisData.registrar?.name || 'Unknown'}</li>
          <li>Registrar ID: {whoisData.registrar?.id || 'Unknown'}</li>
          <li>Email: {whoisData.registrar?.email || 'Unknown'}</li>
          <li>Phone: {whoisData.registrar?.phone || 'Unknown'}</li>
          <li>Website: {whoisData.registrar?.website || 'Unknown'}</li>
        </ul>
      </div>
    </div>
  );
}
