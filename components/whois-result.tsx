import { Building2, CheckCircle2, Clock, Server, Shield, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import RawDataViewer from '@/components/raw-data-viewer'
import { describeStatus } from '@/lib/domain-status'
import type { WhoisData } from '@/lib/whois-parser'

function toDate(value?: string) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDate(value?: string) {
  const d = toDate(value)
  if (!d) return '—'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 相对当前的过去时间描述，如 "29年前"、"2个月前"、"5天前" */
function pastRelative(value?: string) {
  const d = toDate(value)
  if (!d) return undefined
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 0) return undefined
  if (days >= 365) return `${Math.floor(days / 365)}年前`
  if (days >= 30) return `${Math.floor(days / 30)}个月前`
  if (days >= 1) return `${days}天前`
  return '今天'
}

function yearsSince(value?: string) {
  const d = toDate(value)
  if (!d) return undefined
  return Math.floor((Date.now() - d.getTime()) / (86400000 * 365))
}

function daysUntil(value?: string) {
  const d = toDate(value)
  if (!d) return undefined
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

function faviconOf(website?: string) {
  if (!website) return undefined
  try {
    const url = website.startsWith('http') ? website : `http://${website}`
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  } catch {
    return undefined
  }
}

function Field({ label, value, href, mono }: { label: string; value?: string; href?: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}
      >
        {value ? (
          href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </dd>
    </div>
  )
}

export default function WhoisResult({ domain, data }: { domain: string; data: WhoisData }) {
  if (data.isAvailable) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-card-foreground">{domain}</h1>
          <p className="mt-2 text-sm text-muted-foreground">该域名目前可注册（未找到注册记录）</p>
        </div>
      </div>
    )
  }

  const displayName = (data.domainName || domain).toUpperCase()
  const age = yearsSince(data.creationDate)
  const expiryDays = daysUntil(data.expiryDate)
  const expired = expiryDays !== undefined && expiryDays < 0

  const state = expired
    ? { label: '已过期', dot: 'bg-destructive' }
    : { label: '活跃', dot: 'bg-success' }

  const statusList = (data.domainStatus ?? []).map(describeStatus)
  const elapsedSec = data.elapsedMs !== undefined ? (data.elapsedMs / 1000).toFixed(2) : undefined

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
      {/* 概要卡 */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="pointer-events-none absolute right-4 top-4 h-32 w-32 opacity-60 sm:h-40 sm:w-40">
          <Image
            src="/globe-wireframe.png"
            alt=""
            width={160}
            height={160}
            className="h-full w-full object-contain dark:opacity-40 dark:invert"
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border px-3 py-1 font-mono text-xs font-semibold tracking-wide text-foreground">
              DOMAIN
            </span>
          </div>

          <h1 className="mt-4 break-all text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {displayName}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background">
              <span className={`h-2 w-2 rounded-full ${state.dot}`} aria-hidden="true" />
              {state.label}
            </span>
            {age !== undefined && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {age} 年
              </span>
            )}
          </div>

          {(elapsedSec || data.source) && (
            <p className="mt-3 font-mono text-sm text-muted-foreground">
              {elapsedSec ? `${elapsedSec}s` : ''}
              {elapsedSec && data.source ? ' · ' : ''}
              {data.source ?? ''}
            </p>
          )}

          {/* 日期 */}
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-6">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">创建日期</p>
              <p className="mt-1.5 w-fit max-w-full truncate border-b border-dashed border-border pb-1 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {formatDate(data.creationDate)}
              </p>
              {pastRelative(data.creationDate) && (
                <p className="mt-1.5 text-xs text-muted-foreground">{pastRelative(data.creationDate)}</p>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">到期日期</p>
              <p className="mt-1.5 w-fit max-w-full truncate border-b border-dashed border-border pb-1 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {formatDate(data.expiryDate)}
              </p>
              {expiryDays !== undefined && (
                <p
                  className={`mt-1.5 text-xs font-medium ${
                    expired ? 'text-destructive' : 'text-success'
                  }`}
                >
                  {expired ? `已过期 ${Math.abs(expiryDays)} 天` : `剩余 ${expiryDays} 天`}
                </p>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">更新日期</p>
              <p className="mt-1.5 w-fit max-w-full truncate border-b border-dashed border-border pb-1 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {formatDate(data.updatedDate)}
              </p>
              {pastRelative(data.updatedDate) && (
                <p className="mt-1.5 text-xs text-muted-foreground">{pastRelative(data.updatedDate)}</p>
              )}
            </div>
          </div>

          {/* 注册人联系 */}
          {(data.registrant.email || data.registrant.phone) && (
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">注册人邮箱</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {data.registrant.email || <span className="text-muted-foreground/50">—</span>}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">注册人电话</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {data.registrant.phone || <span className="text-muted-foreground/50">—</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 域名状态卡 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">域名状态</h2>
        </div>
        {statusList.length > 0 ? (
          <ul className="space-y-4">
            {statusList.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">{s.label}</p>
                  <p className="mt-0.5 font-mono text-sm text-muted-foreground">{s.code}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground/60">无状态信息</p>
        )}
      </section>

      {/* NS 服务器卡 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">NS 服务器</h2>
        </div>
        {data.nameServers && data.nameServers.length > 0 ? (
          <ul className="space-y-3">
            {data.nameServers.map((ns, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-muted-foreground">
                  {ns.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground/60">无域名服务器信息</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            DNS 安全扩展
          </span>
          <span className="text-sm font-medium text-foreground">
            {data.dnssec === 'signedDelegation' ? '已签名' : '未签名'}
          </span>
        </div>
      </section>

      {/* 注册商卡 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">注册商</h2>

        <div className="mt-4 flex items-center gap-4 border-b border-border pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-foreground">
            {faviconOf(data.registrar.website) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconOf(data.registrar.website)}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
            ) : (
              <Building2 className="h-6 w-6 text-background" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">
              {data.registrar.name || '未知注册商'}
            </p>
            {data.registrar.website && (
              <a
                href={data.registrar.website.startsWith('http') ? data.registrar.website : `http://${data.registrar.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-info hover:underline"
              >
                {data.registrar.website}
              </a>
            )}
          </div>
        </div>

        <dl className="divide-y divide-border border-b border-border">
          <Field label="WHOIS 服务器" value={data.whoisServer} mono />
          <Field label="注册局 ID" value={data.registryDomainId} mono />
          <Field label="注册商 IANA ID" value={data.registrar.ianaId} mono />
        </dl>

        <div className="pt-4">
          <p className="mb-1 text-sm font-medium text-muted-foreground">滥用联系</p>
          <dl className="divide-y divide-border">
            <Field
              label="邮箱"
              value={data.registrar.email}
              href={data.registrar.email ? `mailto:${data.registrar.email}` : undefined}
            />
            <Field label="电话" value={data.registrar.phone} />
          </dl>
        </div>
      </section>

      {/* 原始数据 */}
      <RawDataViewer domain={data.domainName || domain} rawJson={data.rawJson} rawText={data.rawText} />
    </div>
  )
}
