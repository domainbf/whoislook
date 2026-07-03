// EPP 域名状态码 → 中文名称与解释
const STATUS_MAP: Record<string, { label: string; desc: string }> = {
  clientdeleteprohibited: { label: 'clientDeleteProhibited', desc: '注册商已设置此状态，禁止删除该域名。' },
  clienttransferprohibited: { label: 'clientTransferProhibited', desc: '注册商已锁定该域名，禁止转移至其他注册商。' },
  clientupdateprohibited: { label: 'clientUpdateProhibited', desc: '注册商已设置此状态，禁止更新该域名信息。' },
  clientrenewprohibited: { label: 'clientRenewProhibited', desc: '注册商已设置此状态，禁止续费该域名。' },
  clienthold: { label: 'clientHold', desc: '注册商已暂停该域名解析，域名暂时无法访问。' },
  serverdeleteprohibited: { label: 'serverDeleteProhibited', desc: '注册局已设置此状态，禁止删除该域名。' },
  servertransferprohibited: { label: 'serverTransferProhibited', desc: '注册局已锁定该域名，禁止转移。' },
  serverupdateprohibited: { label: 'serverUpdateProhibited', desc: '注册局已设置此状态，禁止更新该域名信息。' },
  serverrenewprohibited: { label: 'serverRenewProhibited', desc: '注册局已设置此状态，禁止续费该域名。' },
  serverhold: { label: 'serverHold', desc: '注册局已暂停该域名解析，域名暂时无法访问。' },
  ok: { label: 'ok', desc: '域名状态正常，无任何限制。' },
  active: { label: 'active', desc: '域名处于活跃状态。' },
  inactive: { label: 'inactive', desc: '该域名尚未设置域名服务器。' },
  pendingdelete: { label: 'pendingDelete', desc: '域名正在等待删除，即将被释放。' },
  pendingtransfer: { label: 'pendingTransfer', desc: '域名转移申请正在处理中。' },
  pendingrenew: { label: 'pendingRenew', desc: '域名续费申请正在处理中。' },
  pendingupdate: { label: 'pendingUpdate', desc: '域名更新申请正在处理中。' },
  pendingcreate: { label: 'pendingCreate', desc: '域名注册申请正在处理中。' },
  redemptionperiod: { label: 'redemptionPeriod', desc: '域名已过期，处于赎回期，可联系注册商恢复。' },
  autorenewperiod: { label: 'autoRenewPeriod', desc: '域名处于自动续费宽限期。' },
  addperiod: { label: 'addPeriod', desc: '域名处于新注册宽限期。' },
}

/** 将 RDAP/WHOIS 状态文本规整为对比用的 key（去空格、连字符、转小写） */
function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[\s_-]+/g, '')
}

export interface DomainStatusInfo {
  label: string
  desc?: string
}

export function describeStatus(raw: string): DomainStatusInfo {
  const key = normalize(raw)
  const found = STATUS_MAP[key]
  if (found) return found
  return { label: raw.trim() }
}
