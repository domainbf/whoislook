import { parseWhoisData } from '@/lib/whois-parser';
import { whois as whoisLookup } from '@/lib/whois';

export default async function ResultsPage({
  searchParams,
}: {
  searchParams?: Promise<{ domain?: string }>
}) {
  const domain = (await searchParams)?.domain;
  if (!domain) {
    return <div className="text-center py-10">请输入域名</div>;
  }

  const whoisRaw = await whoisLookup(domain);
  const whois = parseWhoisData(whoisRaw);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">WHOIS查询结果</h1>
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">注册商信息</h2>
        <ul>
          <li>名称：{whois.registrar.name || '未知'}</li>
          <li>网址：{whois.registrar.website || '未知'}</li>
          <li>邮箱：{whois.registrar.email || '未知'}</li>
          <li>电话：{whois.registrar.phone || '未知'}</li>
        </ul>
      </section>
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">注册人信息</h2>
        <ul>
          <li>名称：{whois.registrant.name || '未知'}</li>
          <li>邮箱：{whois.registrant.email || '未知'}</li>
          <li>电话：{whois.registrant.phone || '未知'}</li>
        </ul>
      </section>
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">域名状态</h2>
        <ul>
          {whois.domainStatus?.length
            ? whois.domainStatus.map((s, i) => <li key={i}>{s}</li>)
            : <li>未知</li>}
        </ul>
      </section>
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Name Servers</h2>
        <ul>
          {whois.nameServers?.length
            ? whois.nameServers.map((ns, i) => <li key={i}>{ns}</li>)
            : <li>未知</li>}
        </ul>
      </section>
    </div>
  );
}
