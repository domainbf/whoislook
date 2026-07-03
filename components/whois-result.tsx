import {
  Building2,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import type { WhoisData } from '@/lib/whois-parser'

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function daysUntil(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType
  label: string
  value?: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value ? (
            href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {value}
              </a>
            ) : (
              value
            )
          ) : (
            <span className="text-muted-foreground/60">—</span>
          )}
        </dd>
      </div>
    </div>
  )
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
      </div>
      <dl className="divide-y divide-border">{children}</dl>
    </section>
  )
}

export default function WhoisResult({
  domain,
  data,
  raw,
}: {
  domain: string
  data: WhoisData
  raw: string
}) {
  if (data.isAvailable) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-card-foreground">{domain}</h1>
          <p className="mt-2 text-sm text-muted-foreground">该域名目前可注册（未找到 WHOIS 记录）</p>
        </div>
      </div>
    )
  }

  const expiryDays = daysUntil(data.expiryDate)
  const expiringSoon = expiryDays !== undefined && expiryDays >= 0 && expiryDays <= 30
  const expired = expiryDays !== undefined && expiryDays < 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 概要头部 */}
      <header className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">{data.domainName || domain}</h1>
            <p className="text-xs text-muted-foreground">WHOIS 查询结果</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            已注册
          </span>
          {expired && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
              已过期
            </span>
          )}
          {expiringSoon && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {expiryDays} 天后到期
            </span>
          )}
        </div>
      </header>

      {/* 关键日期概览 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium">注册时间</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-card-foreground">
            {formatDate(data.creationDate) || '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium">更新时间</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-card-foreground">
            {formatDate(data.updatedDate) || '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium">到期时间</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-card-foreground">
            {formatDate(data.expiryDate) || '—'}
          </p>
        </div>
      </div>

      {/* 模块化信息网格 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="注册商信息" icon={Building2}>
          <InfoRow icon={Building2} label="注册商" value={data.registrar.name} />
          <InfoRow
            icon={Globe}
            label="网址"
            value={data.registrar.website}
            href={data.registrar.website}
          />
          <InfoRow
            icon={Mail}
            label="投诉邮箱"
            value={data.registrar.email}
            href={data.registrar.email ? `mailto:${data.registrar.email}` : undefined}
          />
          <InfoRow icon={Phone} label="投诉电话" value={data.registrar.phone} />
        </Card>

        <Card title="注册人信息" icon={User}>
          <InfoRow icon={User} label="名称" value={data.registrant.name} />
          <InfoRow icon={Building2} label="组织" value={data.registrant.organization} />
          <InfoRow
            icon={Mail}
            label="邮箱"
            value={data.registrant.email}
            href={data.registrant.email ? `mailto:${data.registrant.email}` : undefined}
          />
          <InfoRow icon={Phone} label="电话" value={data.registrant.phone} />
          <InfoRow icon={MapPin} label="国家/地区" value={data.registrant.country} />
        </Card>

        <Card title="域名状态" icon={Shield}>
          {data.domainStatus && data.domainStatus.length > 0 ? (
            <div className="flex flex-wrap gap-2 py-2">
              {data.domainStatus.map((status, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {status.split(' ')[0]}
                </span>
              ))}
            </div>
          ) : (
            <p className="py-2 text-sm text-muted-foreground/60">—</p>
          )}
          {data.dnssec && (
            <div className="border-t border-border">
              <InfoRow icon={ShieldCheck} label="DNSSEC" value={data.dnssec} />
            </div>
          )}
        </Card>

        <Card title="域名服务器 (Name Servers)" icon={Server}>
          {data.nameServers && data.nameServers.length > 0 ? (
            <div className="space-y-2 py-2">
              {data.nameServers.map((ns, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate font-mono text-sm text-foreground">{ns.toLowerCase()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 text-sm text-muted-foreground/60">—</p>
          )}
        </Card>
      </div>

      {/* 原始数据 */}
      <details className="mt-6 rounded-xl border border-border bg-card shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-card-foreground">
          查看原始 WHOIS 数据
        </summary>
        <pre className="overflow-x-auto border-t border-border px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          {raw}
        </pre>
      </details>
    </div>
  )
}
