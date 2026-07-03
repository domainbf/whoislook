export type Lang = 'zh' | 'en'

export const LANGS: Lang[] = ['zh', 'en']
export const DEFAULT_LANG: Lang = 'zh'

export const LANG_LABEL: Record<Lang, string> = {
  zh: '中文',
  en: 'EN',
}

type Entry = Record<Lang, string>

/** 所有可翻译文案。key 使用英文语义命名 */
export const dict = {
  // header
  home: { zh: '首页', en: 'Home' },
  switchLang: { zh: '切换语言', en: 'Switch language' },
  toDark: { zh: '切换到深色模式', en: 'Switch to dark mode' },
  toLight: { zh: '切换到浅色模式', en: 'Switch to light mode' },

  // search box
  searchPlaceholder: { zh: '输入域名进行查询，例如 example.com', en: 'Enter a domain, e.g. example.com' },
  domain: { zh: '域名', en: 'Domain' },
  query: { zh: '查询', en: 'Search' },
  clear: { zh: '清除', en: 'Clear' },
  clearBlur: { zh: '清除 / 失焦', en: 'Clear / blur' },

  // home footer
  footerNote: {
    zh: '本站提供域名查询服务，不储存任何搜索及查询数据信息。',
    en: 'This site provides domain lookup only and stores no search or query data.',
  },

  // search history
  historyTitle: { zh: '查询历史', en: 'Search History' },
  clearHistory: { zh: '清除历史记录', en: 'Clear history' },
  prevPage: { zh: '上一页', en: 'Previous' },
  nextPage: { zh: '下一页', en: 'Next' },
  today: { zh: '今天', en: 'Today' },
  yesterday: { zh: '昨天', en: 'Yesterday' },

  // result summary
  active: { zh: '活跃', en: 'Active' },
  expired: { zh: '已过期', en: 'Expired' },
  ageYears: { zh: '{n} 年', en: '{n} yr' },
  createdDate: { zh: '创建日期', en: 'Created' },
  expiryDate: { zh: '到期日期', en: 'Expires' },
  updatedDate: { zh: '更新日期', en: 'Updated' },
  daysLeft: { zh: '剩余 {n} 天', en: '{n} days left' },
  expiredDays: { zh: '已过期 {n} 天', en: 'Expired {n} days ago' },
  registrantEmail: { zh: '注册人邮箱', en: 'Registrant Email' },
  registrantPhone: { zh: '注册人电话', en: 'Registrant Phone' },
  yearsAgo: { zh: '{n}年前', en: '{n}y ago' },
  monthsAgo: { zh: '{n}个月前', en: '{n}mo ago' },
  daysAgo: { zh: '{n}天前', en: '{n}d ago' },
  todayRel: { zh: '今天', en: 'today' },

  // status card
  statusTitle: { zh: '域名状态', en: 'Domain Status' },
  noStatus: { zh: '无状态信息', en: 'No status information' },

  // nameservers card
  nsTitle: { zh: 'NS 服务器', en: 'Name Servers' },
  noNs: { zh: '无域名服务器信息', en: 'No name server information' },
  dnssec: { zh: 'DNS 安全扩展', en: 'DNSSEC' },
  signed: { zh: '已签名', en: 'Signed' },
  unsigned: { zh: '未签名', en: 'Unsigned' },

  // registrar card
  registrarTitle: { zh: '注册商', en: 'Registrar' },
  unknownRegistrar: { zh: '未知注册商', en: 'Unknown registrar' },
  whoisServer: { zh: 'WHOIS 服务器', en: 'WHOIS Server' },
  registryId: { zh: '注册局 ID', en: 'Registry ID' },
  ianaId: { zh: '注册商 IANA ID', en: 'Registrar IANA ID' },
  abuseContact: { zh: '滥用联系', en: 'Abuse Contact' },
  email: { zh: '邮箱', en: 'Email' },
  phone: { zh: '电话', en: 'Phone' },

  // availability
  availableTitle: { zh: '该域名目前可注册', en: 'This domain is available' },
  availableDesc: { zh: '未找到注册记录，你可以立即注册它。', en: 'No registration record found — you can register it now.' },
  reservedTitle: { zh: '该域名已被保留', en: 'This domain is reserved' },
  reservedDesc: { zh: '注册局保留了该域名，暂时无法公开注册。', en: 'The registry has reserved this domain; it is not openly available.' },
  prohibitedTitle: { zh: '该域名禁止注册', en: 'Registration prohibited' },
  prohibitedDesc: { zh: '该域名被限制或禁止注册。', en: 'This domain is restricted or prohibited from registration.' },

  // price card
  priceTitle: { zh: '后缀价格', en: 'TLD Pricing' },
  priceNew: { zh: '注册', en: 'Register' },
  priceRenew: { zh: '续费', en: 'Renew' },
  priceTransfer: { zh: '转入', en: 'Transfer' },
  priceLowest: { zh: '最低', en: 'Lowest' },
  priceSource: { zh: '价格数据来源 nazhumi', en: 'Pricing data by nazhumi' },
  priceLoading: { zh: '正在加载价格…', en: 'Loading prices…' },
  priceYear: { zh: '/年', en: '/yr' },

  // error
  lookupFailed: { zh: '查询失败', en: 'Lookup failed' },

  // raw viewer
  save: { zh: '保存', en: 'Save' },
  copy: { zh: '复制', en: 'Copy' },
  copied: { zh: '已复制', en: 'Copied' },
} satisfies Record<string, Entry>

export type TKey = keyof typeof dict

export type TFunc = (key: TKey, vars?: Record<string, string | number>) => string

/** 生成翻译函数 */
export function createT(lang: Lang): TFunc {
  return (key, vars) => {
    let s = dict[key]?.[lang] ?? dict[key]?.zh ?? String(key)
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]))
      }
    }
    return s
  }
}
