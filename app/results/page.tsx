import { parseWhoisData, WhoisData } from '@/lib/whois-parser';

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ domain?: string }> }) {
  // 解包 Promise 类型的 searchParams
  const params = await searchParams;
  const domain = params?.domain;

  if (!domain) {
    return <div className="text-center py-10">Please provide a domain name.</div>;
  }

  const response = await fetch(`/api/whois?domain=${domain}`);
  const rawData = await response.text();
  const whoisData: WhoisData = parseWhoisData(rawData);

  return (
    <div className="container mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">WHOIS Lookup Results for {domain}</h1>
      
      {/* Registrar Information */}
      <div className="bg-gray-100 shadow-md rounded-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Registrar Information</h2>
        <ul className="space-y-2">
          <li><strong>Name:</strong> {whoisData.registrar.name || "Unknown"}</li>
          <li><strong>Website:</strong> {whoisData.registrar.website || "Unknown"}</li>
          <li><strong>Email:</strong> {whoisData.registrar.email || "Unknown"}</li>
          <li><strong>Phone:</strong> {whoisData.registrar.phone || "Unknown"}</li>
        </ul>
      </div>

      {/* Registrant Information */}
      <div className="bg-gray-100 shadow-md rounded-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Registrant Information</h2>
        <ul className="space-y-2">
          <li><strong>Name:</strong> {whoisData.registrant.name || "Unknown"}</li>
          <li><strong>Email:</strong> {whoisData.registrant.email || "Unknown"}</li>
          <li><strong>Phone:</strong> {whoisData.registrant.phone || "Unknown"}</li>
        </ul>
      </div>

      {/* Domain Status */}
      <div className="bg-gray-100 shadow-md rounded-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Domain Status</h2>
        <ul className="space-y-1">
          {whoisData.domainStatus?.length
            ? whoisData.domainStatus.map((status, index) => <li key={index}>{status}</li>)
            : <li>Unknown</li>}
        </ul>
      </div>

      {/* Name Servers */}
      <div className="bg-gray-100 shadow-md rounded-md p-6">
        <h2 className="text-2xl font-bold mb-4">Name Servers</h2>
        <ul className="space-y-1">
          {whoisData.nameServers?.length
            ? whoisData.nameServers.map((ns, index) => <li key={index}>{ns}</li>)
            : <li>Unknown</li>}
        </ul>
      </div>
    </div>
  );
}
