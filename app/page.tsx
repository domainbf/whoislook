"use client";
import { useState } from "react";

interface WhoisData {
  domainName?: string;
  registrar?: string;
  registrationDate?: string;
  expiryDate?: string;
  error?: string;
}

export default function HomePage() {
  const [domain, setDomain] = useState("");
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!domain) return;
    setLoading(true);
    setWhoisData(null);
    try {
      const response = await fetch(`/api/whois?domain=${domain}`);
      const data = await response.json();
      setWhoisData(data);
    } catch {
      setWhoisData({ error: "查询失败，请稍后重试。" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Whois 查询</h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <input
          type="text"
          placeholder="输入域名 (如: example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "查询中..." : "查询"}
        </button>
      </div>

      {/* 查询结果展示 */}
      {whoisData && (
        <div className="w-full max-w-md mt-6 bg-white shadow-lg rounded-lg p-6">
          {whoisData.error ? (
            <div className="text-red-500 font-bold">{whoisData.error}</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-gray-800">
                  {whoisData.domainName || "未知"}
                </span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-red-500 text-white rounded-lg">
                    查询错误
                  </span>
                  <span className="px-3 py-1 bg-gray-400 text-white rounded-lg">
                    状态不明
                  </span>
                </div>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center gap-2">
                  <span>🏢 注册商:</span>
                  <span>{whoisData.registrar || "未知"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📅 注册日期:</span>
                  <span>{whoisData.registrationDate || "未知"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📅 到期日期:</span>
                  <span>{whoisData.expiryDate || "未知"}</span>
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
