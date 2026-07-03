export interface HistoryItem {
  domain: string
  time: number
}

const KEY = 'whois:history'
const MAX = 24

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addHistory(domain: string): void {
  if (typeof window === 'undefined' || !domain) return
  try {
    const list = getHistory().filter((i) => i.domain !== domain)
    list.unshift({ domain, time: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
