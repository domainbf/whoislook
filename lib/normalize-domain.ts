/**
 * 智能规范化用户输入的域名。
 * 处理常见的多余内容，尽量提取出可查询的裸域名：
 *  - 去除 http:// https:// ftp:// 等协议前缀
 *  - 去除 URL 认证信息（user:pass@）、路径、查询串、锚点
 *  - 去除端口号（:8080）
 *  - 去除前后空白、首尾的点、以及连续重复的点（whois..com -> whois.com）
 *  - 去除结尾的斜杠
 *  - 统一小写；对中文域名（IDN）保留原样交由后续处理
 */
export function normalizeDomain(input: string): string {
  if (!input) return ''

  let s = input.trim()

  // 去掉协议前缀（含 // 或不含）
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
  s = s.replace(/^\/\//, '')

  // 去掉 URL 认证信息 user:pass@
  s = s.replace(/^[^/@\s]+@/, '')

  // 只取第一个空白之前的部分
  s = s.split(/\s+/)[0] ?? ''

  // 去掉路径 / 查询串 / 锚点（第一个 / ? # 之后的内容）
  s = s.split(/[/?#]/)[0] ?? ''

  // 去掉端口号
  s = s.replace(/:\d+$/, '')

  // 去掉 email 前缀（如果用户粘贴了邮箱，取 @ 之后的域名）
  if (s.includes('@')) {
    const parts = s.split('@')
    s = parts[parts.length - 1] ?? ''
  }

  // 折叠连续的点，去掉首尾的点
  s = s.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '')

  // 去掉两侧非法字符（保留字母数字、连字符、点、以及非 ASCII 的 IDN 字符）
  s = s.replace(/[^\p{L}\p{N}.-]/gu, '')

  return s.toLowerCase()
}

/** 校验规范化后的字符串是否像一个合法域名 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false
  // 至少包含一个点，且每一段合法
  if (!domain.includes('.')) return false
  return /^(?=.{1,253}$)([\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,63}$/u.test(
    domain,
  )
}
