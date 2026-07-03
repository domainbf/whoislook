import { Ban, Building2, CheckCircle2, Clock, Lock, Server, Shield, ShieldCheck } from 'lucide-react'
import { Suspense } from 'react'
import PriceSection from '@/components/price-section'
import RawDataViewer from '@/components/raw-data-viewer'
import SpinningGlobe from '@/components/spinning-globe'
import { describeStatus } from '@/lib/domain-status'
import { getLang } from '@/lib/get-lang'
import { createT, type TFunc } from '@/lib/i18n'
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

/** 相对当前的过去时间描述 */
function pastRelative(value: string | undefined, t: TFunc) {
  const d = toDate(value)
  if (!d) return undefined
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 0) return undefined
  if (days >= 365) return t('yearsAgo', { n: Math.floor(days / 365) })
  if (days >= 30) return t('monthsAgo', { n: Math.floor(days / 30) })
  if (days >= 1) return t('daysAgo', { n: days })
  return t('todayRel')
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

/** 价格卡加载骨架 */
function PriceSkeleton() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 h-6 w-28 animate-pulse rounded-full bg-muted" />
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    </section>
  )
}

/** 可用性提示卡（可注册 / 已保留 / 禁止注册） */
function AvailabilityCard({
  domain,
  kind,
  t,
}: {
  domain: string
  kind: 'available' | 'reserved' | 'prohibited'
  t: TFunc
}) {
  const config = {
    available: {
      Icon: CheckCircle2,
      color: 'text-success',
      ring: 'border-success/30 bg-success/5',
      title: t('availableTitle'),
      desc: t('availableDesc'),
    },
    reserved: {
      Icon: Lock,
      color: 'text-warning',
      ring: 'border-warning/30 bg-warning/5',
      title: t('reservedTitle'),
      desc: t('reservedDesc'),
    },
    prohibited: {
      Icon: Ban,
      color: 'text-destructive',
      ring: 'border-destructive/30 bg-destructive/5',
      title: t('prohibitedTitle'),
      desc: t('prohibitedDesc'),
    },
  }[kind]

  const { Icon } = config

  return (
    <div className={`flex flex-col items-center rounded-3xl border p-8 text-center shadow-sm ${config.ring}`}>
      <Icon className={`h-12 w-12 ${config.color}`} aria-hidden="true" />
      <h1 className="mt-4 w-full break-all text-xl font-bold text-card-foreground sm:text-2xl">
        {domain}
      </h1>
      <p className="mt-1 text-base font-semibold text-foreground">{config.title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{config.desc}</p>
    </div>
  )
}

export default async function WhoisResult({ domain, data }: { domain: string; data: WhoisData }) {
  const lang = await getLang()
  const t = createT(lang)

  const availability =
    data.availability ?? (data.isAvailable ? 'available' : 'registered')

  // 未注册 / 已保留 / 禁止注册
  if (availability !== 'registered') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
        <AvailabilityCard domain={domain} kind={availability} t={t} />
        {availability === 'available' && (
          <Suspense fallback={<PriceSkeleton />}>
            <PriceSection domain={domain} />
          </Suspense>
        )}
      </div>
    )
  }

  const displayName = (data.domainName || domain).toUpperCase()
  const age = yearsSince(data.creationDate)
  const expiryDays = daysUntil(data.expiryDate)
  const expired = expiryDays !== undefined && expiryDays < 0

  const state = expired
    ? { label: t('expired'), dot: 'bg-destructive' }
    : { label: t('active'), dot: 'bg-success' }

  const statusList = (data.domainStatus ?? []).map((s) => describeStatus(s, lang))
  const elapsedSec = data.elapsedMs !== undefined ? (data.elapsedMs / 1000).toFixed(2) : undefined

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
      {/* 概要卡 */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="pointer-events-none absolute right-3 top-3 h-24 w-24 text-muted-foreground/40 sm:h-32 sm:w-32">
          <SpinningGlobe className="h-full w-full" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border px-3 py-1 font-mono text-xs font-semibold tracking-wide text-foreground">
              DOMAIN
            </span>
          </div>

          <h1 className="mt-3 max-w-[calc(100%-4rem)] break-all text-2xl font-bold tracking-tight text-foreground sm:max-w-[calc(100%-6rem)] sm:text-3xl">
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
                {t('ageYears', { n: age })}
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
              <p className="text-xs text-muted-foreground">{t('createdDate')}</p>
              <p className="mt-1 w-fit max-w-full truncate border-b border-dashed border-border pb-0.5 font-mono text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {formatDate(data.creationDate)}
              </p>
              {pastRelative(data.creationDate, t) && (
                <p className="mt-1 text-xs text-muted-foreground">{pastRelative(data.creationDate, t)}</p>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('expiryDate')}</p>
              <p className="mt-1 w-fit max-w-full truncate border-b border-dashed border-border pb-0.5 font-mono text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {formatDate(data.expiryDate)}
              </p>
              {expiryDays !== undefined && (
                <p
                  className={`mt-1 text-xs font-medium ${
                    expired ? 'text-destructive' : 'text-success'
                  }`}
                >
                  {expired
                    ? t('expiredDays', { n: Math.abs(expiryDays) })
                    : t('daysLeft', { n: expiryDays })}
                </p>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('updatedDate')}</p>
              <p className="mt-1 w-fit max-w-full truncate border-b border-dashed border-border pb-0.5 font-mono text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {formatDate(data.updatedDate)}
              </p>
              {pastRelative(data.updatedDate, t) && (
                <p className="mt-1 text-xs text-muted-foreground">{pastRelative(data.updatedDate, t)}</p>
              )}
            </div>
          </div>

          {/* 注册人联系 */}
          {(data.registrant.email || data.registrant.phone) && (
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{t('registrantEmail')}</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {data.registrant.email || <span className="text-muted-foreground/50">—</span>}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{t('registrantPhone')}</p>
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
          <h2 className="text-lg font-bold text-foreground">{t('statusTitle')}</h2>
        </div>
        {statusList.length > 0 ? (
          <ul className="space-y-4">
            {statusList.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{s.label}</p>
                  <p className="mt-0.5 break-all font-mono text-sm text-muted-foreground">{s.code}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground/60">{t('noStatus')}</p>
        )}
      </section>

      {/* NS 服务器卡 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">{t('nsTitle')}</h2>
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
          <p className="text-sm text-muted-foreground/60">{t('noNs')}</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {t('dnssec')}
          </span>
          <span className="text-sm font-medium text-foreground">
            {data.dnssec === 'signedDelegation' ? t('signed') : t('unsigned')}
          </span>
        </div>
      </section>

      {/* 后缀价格卡（流式加载，不阻塞上方结果） */}
      <Suspense fallback={<PriceSkeleton />}>
        <PriceSection domain={data.domainName || domain} />
      </Suspense>

      {/* 注册商卡 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">{t('registrarTitle')}</h2>

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
              {data.registrar.name || t('unknownRegistrar')}
            </p>
            {data.registrar.website && (
              <a
                href={data.registrar.website.startsWith('http') ? data.registrar.website : `http://${data.registrar.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-info hover:underline"
              >
                {data.registrar.website}
              </a>
            )}
          </div>
        </div>

        <dl className="divide-y divide-border border-b border-border">
          <Field label={t('whoisServer')} value={data.whoisServer} mono />
          <Field label={t('registryId')} value={data.registryDomainId} mono />
          <Field label={t('ianaId')} value={data.registrar.ianaId} mono />
        </dl>

        <div className="pt-4">
          <p className="mb-1 text-sm font-medium text-muted-foreground">{t('abuseContact')}</p>
          <dl className="divide-y divide-border">
            <Field
              label={t('email')}
              value={data.registrar.email}
              href={data.registrar.email ? `mailto:${data.registrar.email}` : undefined}
            />
            <Field label={t('phone')} value={data.registrar.phone} />
          </dl>
        </div>
      </section>

      {/* 原始数据 */}
      <RawDataViewer domain={data.domainName || domain} rawJson={data.rawJson} rawText={data.rawText} />
    </div>
  )
}
