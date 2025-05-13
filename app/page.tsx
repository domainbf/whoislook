"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain) {
      router.push(`/results?domain=${domain}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Whois Lookup</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <input
          type="text"
          placeholder="Enter a domain (e.g., example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-600"
        >
          Search
        </button>
      </form>
    </div>
  );
}
