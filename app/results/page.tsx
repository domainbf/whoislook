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
  const parsedData: WhoisData = {
    domainName: domain,
    creationDate: '2023-01-01',
    updateDate: '2023-06-01',
    expiryDate: '2024-01-01',
    domainStatus: ['active'],
    nameServers: ['ns1.example.com', 'ns2.example.com'],
    registrar: {
      name: 'Example Registrar',
      id: '12345',
      email: 'support@example.com',
      phone: '+1234567890',
      website: 'https://example.com',
    },
  };

  return parsedData;
}

export default async function ResultsPage({ searchParams }: { searchParams: { domain: string } }) {
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
          <li>Status: {whoisData.domainStatus?.join(', ') || 'Unknown'}</li>
          <li>Name Servers: {whoisData.nameServers?.join(', ') || 'Unknown'}</li>
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
