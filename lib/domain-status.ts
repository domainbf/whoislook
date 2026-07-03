// EPP 域名状态码 → 中文短名与解释
const STATUS_MAP: Record<string, { cn: string; code: string; desc: string }> = {
  clientdeleteprohibited: { cn: '禁止客户删除', code: 'clientDeleteProhibited', desc: '注册商已设置此状态，禁止删除该域名。' },
  clienttransferprohibited: { cn: '禁止客户转移', code: 'clientTransferProhibited', desc: '注册商已锁定该域名，禁止转移至其他注册商。' },
  clientupdateprohibited: { cn: '禁止客户更新', code: 'clientUpdateProhibited', desc: '注册商已设置此状态，禁止更新该域名信息。' },
  clientrenewprohibited: { cn: '禁止客户续费', code: 'clientRenewProhibited', desc: '注册商已设置此状态，禁止续费该域名。' },
  clienthold: { cn: '客户暂停解析', code: 'clientHold', desc: '注册商已暂停该域名解析，域名暂时无法访问。' },
  serverdeleteprohibited: { cn: '禁止服务器删除', code: 'serverDeleteProhibited', desc: '注册局已设置此状态，禁止删除该域名。' },
  servertransferprohibited: { cn: '禁止服务器转移', code: 'serverTransferProhibited', desc: '注册局已锁定该域名，禁止转移。' },
  serverupdateprohibited: { cn: '禁止服务器更新', code: 'serverUpdateProhibited', desc: '注册局已设置此状态，禁止更新该域名信息。' },
  serverrenewprohibited: { cn: '禁止服务器续费', code: 'serverRenewProhibited', desc: '注册局已设置此状态，禁止续费该域名。' },
  serverhold: { cn: '服务器暂停解析', code: 'serverHold', desc: '注册局已暂停该域名解析，域名暂时无法访问。' },
  ok: { cn: '正常', code: 'ok', desc: '域名状态正常，无任何限制。' },
  active: { cn: '活跃', code: 'active', desc: '域名处于活跃状态。' },
  inactive: { cn: '未激活', code: 'inactive', desc: '该域名尚未设置域名服务器。' },
  pendingdelete: { cn: '等待删除', code: 'pendingDelete', desc: '域名正在等待删除，即将被释放。' },
  pendingtransfer: { cn: '等待转移', code: 'pendingTransfer', desc: '域名转移申请正在处理中。' },
  pendingrenew: { cn: '等待续费', code: 'pendingRenew', desc: '域名续费申请正在处理中。' },
  pendingupdate: { cn: '等待更新', code: 'pendingUpdate', desc: '域名更新申请正在处理中。' },
  pendingcreate: { cn: '等待注册', code: 'pendingCreate', desc: '域名注册申请正在处理中。' },
  redemptionperiod: { cn: '赎回期', code: 'redemptionPeriod', desc: '域名已过期，处于赎回期，可联系注册商恢复。' },
  autorenewperiod: { cn: '自动续费期', code: 'autoRenewPeriod', desc: '域名处于自动续费宽限期。' },
  addperiod: { cn: '新注册期', code: 'addPeriod', desc: '域名处于新注册宽限期。' },
}

/** 将 RDAP/WHOIS 状态文本规整为对比用的 key（去空格、连字符、转小写） */
function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[\s_-]+/g, '')
}

export interface DomainStatusInfo {
  /** 中文短名（作标题） */
  label: string
  /** 原始 EPP 代码（作副文本） */
  code: string
  desc?: string
}

export function describeStatus(raw: string): DomainStatusInfo {
  const key = normalize(raw)
  const found = STATUS_MAP[key]
  if (found) return { label: found.cn, code: found.code, desc: found.desc }
  const trimmed = raw.trim()
  return { label: trimmed, code: trimmed }
}
