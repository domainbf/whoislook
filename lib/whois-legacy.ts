import net from 'node:net'
import { parseWhoisText } from './whois-parser'
import type { WhoisData } from './whois-parser'

// 常见 TLD 的 WHOIS 服务器映射（用于跳过 IANA 的第一跳，加快查询）
const WHOIS_SERVERS: Record<string, string> = {
  com: 'whois.verisign-grs.com',
  net: 'whois.verisign-grs.com',
  org: 'whois.pir.org',
  info: 'whois.afilias.net',
  io: 'whois.nic.io',
  co: 'whois.nic.co',
  ai: 'whois.nic.ai',
  app: 'whois.nic.google',
  dev: 'whois.nic.google',
  xyz: 'whois.nic.xyz',
  me: 'whois.nic.me',
  cn: 'whois.cnnic.cn',
  tv: 'whois.nic.tv',
  cc: 'whois.nic.cc',
  us: 'whois.nic.us',
  uk: 'whois.nic.uk',
  de: 'whois.denic.de',
  fr: 'whois.nic.fr',
  nl: 'whois.domain-registry.nl',
  ru: 'whois.tcinet.ru',
  jp: 'whois.jprs.jp',
  au: 'whois.auda.org.au',
  ca: 'whois.cira.ca',
  eu: 'whois.eu',
  in: 'whois.registry.in',
  br: 'whois.registro.br',
}

const IANA_WHOIS = 'whois.iana.org'
const WHOIS_PORT = 43
const QUERY_TIMEOUT = 8000

/** 向单个 WHOIS 服务器发起一次端口 43 查询 */
function queryServer(server: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: server, port: WHOIS_PORT, timeout: QUERY_TIMEOUT })
    let response = ''

    socket.on('connect', () => socket.write(query + '\r\n'))
    socket.on('data', (chunk) => {
      response += chunk.toString('utf8')
    })
    socket.on('end', () => resolve(response))
    socket.on('timeout', () => {
      socket.destroy()
      reject(new Error('WHOIS 查询超时'))
    })
    socket.on('error', (err) => {
      socket.destroy()
      reject(err)
    })
  })
}

/** 从原始 WHOIS 文本中提取 referral 服务器（registrar WHOIS Server 字段） */
function extractReferralServer(text: string): string | undefined {
  const match = text.match(/(?:Registrar WHOIS Server|whois|refer):\s*([a-z0-9.-]+\.[a-z]{2,})/i)
  return match?.[1]?.trim().toLowerCase()
}

/**
 * 传统端口 43 WHOIS 查询（作为 RDAP 的回退方案）。
 * 部分 ccTLD 无 RDAP 服务，此时端口 43 WHOIS 仍可能返回数据。
 * 注意：在部分无服务器/托管环境中端口 43 出站可能被阻断。
 */
export async function lookupDomainLegacy(domain: string): Promise<WhoisData> {
  const normalized = domain.trim().toLowerCase()
  const tld = normalized.split('.').pop() ?? ''

  // 选择起始 WHOIS 服务器：已知 TLD 直连，否则先问 IANA
  let server = WHOIS_SERVERS[tld]
  if (!server) {
    const ianaResp = await queryServer(IANA_WHOIS, normalized)
    server = extractReferralServer(ianaResp) ?? IANA_WHOIS
  }

  let raw = await queryServer(server, normalized)

  // 若返回中包含 registrar 的 referral 服务器，再跳一次以获取更详细数据
  const referral = extractReferralServer(raw)
  if (referral && referral !== server) {
    try {
      const detailed = await queryServer(referral, normalized)
      if (detailed && detailed.length > raw.length / 2) raw = detailed
    } catch {
      // referral 失败则沿用第一跳结果
    }
  }

  return parseWhoisText(normalized, raw)
}
