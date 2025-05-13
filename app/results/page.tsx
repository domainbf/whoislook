import { parseWhoisData, WhoisData } from '@/lib/whois-parser';

export default async function ResultsPage({ searchParams }: { searchParams: { domain?: string } }) {
  const domain = searchParams?.domain;

  if (!domain) {
    return <div className="text-center">Please provide a domain name.</div>;
  }

  const response = await fetch(`/api/whois?domain=${domain}`);
  const rawData = await response.text();
  const whoisData: WhoisData = parseWhoisData(rawData);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">WHOIS Lookup Results for {domain}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Registrar Information</h2>
        <ul>
          <li><strong>Name:</strong> {whoisData.registrar.name || "Unknown"}</li>
          <li><strong>Website:</strong> {whoisData.registrar.website || "Unknown"}</li>
          <li><strong>Email:</strong> {whoisData.registrar.email || "Unknown"}</li>
          <li><strong>Phone:</strong> {whoisData.registrar.phone || "Unknown"}</li>
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Registrant Information</h2>
        <ul>
          <li><strong>Name:</strong> {whoisData.registrant.name || "Unknown"}</li>
          <li><strong>Email:</strong> {whoisData.registrant.email || "Unknown"}</li>
          <li><strong>Phone:</strong> {whoisData.registrant.phone || "Unknown"}</li>
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Domain Status</h2>
        <ul>
          {whoisData.domainStatus?.map((status, index) => <li key={index}>{status}</li>) || <li>Unknown</li>}
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Name Servers</h2>
        <ul>
          {whoisData.nameServers?.map((ns, index) => <li key={index}>{ns}</li>) || <li>Unknown</li>}
        </ul>
      </div>
    </div>
  );
}
