import type { Lang } from './i18n'

// EPP 域名状态码 → 中英文短名与解释
const STATUS_MAP: Record<string, { cn: string; en: string; code: string }> = {
  clientdeleteprohibited: { cn: '禁止客户删除', en: 'Client Delete Prohibited', code: 'clientDeleteProhibited' },
  clienttransferprohibited: { cn: '禁止客户转移', en: 'Client Transfer Prohibited', code: 'clientTransferProhibited' },
  clientupdateprohibited: { cn: '禁止客户更新', en: 'Client Update Prohibited', code: 'clientUpdateProhibited' },
  clientrenewprohibited: { cn: '禁止客户续费', en: 'Client Renew Prohibited', code: 'clientRenewProhibited' },
  clienthold: { cn: '客户暂停解析', en: 'Client Hold', code: 'clientHold' },
  serverdeleteprohibited: { cn: '禁止服务器删除', en: 'Server Delete Prohibited', code: 'serverDeleteProhibited' },
  servertransferprohibited: { cn: '禁止服务器转移', en: 'Server Transfer Prohibited', code: 'serverTransferProhibited' },
  serverupdateprohibited: { cn: '禁止服务器更新', en: 'Server Update Prohibited', code: 'serverUpdateProhibited' },
  serverrenewprohibited: { cn: '禁止服务器续费', en: 'Server Renew Prohibited', code: 'serverRenewProhibited' },
  serverhold: { cn: '服务器暂停解析', en: 'Server Hold', code: 'serverHold' },
  ok: { cn: '正常', en: 'OK', code: 'ok' },
  active: { cn: '活跃', en: 'Active', code: 'active' },
  inactive: { cn: '未激活', en: 'Inactive', code: 'inactive' },
  pendingdelete: { cn: '等待删除', en: 'Pending Delete', code: 'pendingDelete' },
  pendingtransfer: { cn: '等待转移', en: 'Pending Transfer', code: 'pendingTransfer' },
  pendingrenew: { cn: '等待续费', en: 'Pending Renew', code: 'pendingRenew' },
  pendingupdate: { cn: '等待更新', en: 'Pending Update', code: 'pendingUpdate' },
  pendingcreate: { cn: '等待注册', en: 'Pending Create', code: 'pendingCreate' },
  redemptionperiod: { cn: '赎回期', en: 'Redemption Period', code: 'redemptionPeriod' },
  autorenewperiod: { cn: '自动续费期', en: 'Auto Renew Period', code: 'autoRenewPeriod' },
  addperiod: { cn: '新注册期', en: 'Add Period', code: 'addPeriod' },
}

/** 将 RDAP/WHOIS 状态文本规整为对比用的 key（去空格、连字符、转小写） */
function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[\s_-]+/g, '')
}

export interface DomainStatusInfo {
  /** 本地化短名（作标题） */
  label: string
  /** 原始 EPP 代码（作副文本） */
  code: string
}

export function describeStatus(raw: string, lang: Lang = 'zh'): DomainStatusInfo {
  const key = normalize(raw)
  const found = STATUS_MAP[key]
  if (found) return { label: lang === 'en' ? found.en : found.cn, code: found.code }
  const trimmed = raw.trim()
  return { label: trimmed, code: trimmed }
}
