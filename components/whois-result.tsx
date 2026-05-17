'use client'

import { useState } from 'react'
import { parseWhoisData, hasAnyValue } from '@/lib/whois-parser'

interface Props {
  domain: string
  raw: string
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function daysUntil(value?: string): number | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (isNaN(d.getTime())) return undefined
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function Field({ label, value, link }: { label: string; value?: string; link?: string }) {
  if (!value) return null
  return (
    <div className='flex flex-col gap-1 sm:flex-row sm:gap-4 py-2 border-b border-border last:border-0'>
      <dt className='text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0'>
        {label}
      </dt>
      <dd className='text-sm text-foreground break-all'>
        {link ? (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className='bg-card border border-border rounded-lg p-5 sm:p-6'>
      <h2 className='text-base font-semibold text-foreground mb-3'>{title}</h2>
      <dl>{children}</dl>
    </section>
  )
}

export default function WhoisResult({ domain, raw }: Props) {
  const [showRaw, setShowRaw] = useState(false)
  const data = parseWhoisData(raw)

  const expiryDays = daysUntil(data.domain.expiryDate)
  const expiryColor =
    expiryDays === undefined
      ? 'text-muted-foreground'
      : expiryDays < 0
      ? 'text-destructive'
      : expiryDays < 30
      ? 'text-amber-600'
      : 'text-emerald-600'

  return (
    <div className='max-w-3xl mx-auto px-4 py-6 space-y-4'>
      <div className='space-y-1'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground break-all'>
          {data.domain.name || domain}
        </h1>
        <p className='text-sm text-muted-foreground'>WHOIS 查询结果</p>
      </div>

      {/* 概览卡片 */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-xs text-muted-foreground mb-1'>注册时间</div>
          <div className='text-sm font-medium text-foreground'>
            {formatDate(data.domain.creationDate) || '—'}
          </div>
        </div>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-xs text-muted-foreground mb-1'>到期时间</div>
          <div className='text-sm font-medium text-foreground'>
            {formatDate(data.domain.expiryDate) || '—'}
          </div>
          {expiryDays !== undefined && (
            <div className={`text-xs mt-1 ${expiryColor}`}>
              {expiryDays < 0 ? `已过期 ${-expiryDays} 天` : `剩余 ${expiryDays} 天`}
            </div>
          )}
        </div>
        <div className='bg-card border border-border rounded-lg p-4'>
          <div className='text-xs text-muted-foreground mb-1'>注册商</div>
          <div className='text-sm font-medium text-foreground break-all'>
            {data.registrar.name || '—'}
          </div>
        </div>
      </div>

      {/* 域名信息 */}
      <Section title='域名信息'>
        <Field label='域名' value={data.domain.name} />
        <Field label='Registry Domain ID' value={data.domain.registryDomainId} />
        <Field label='创建时间' value={formatDate(data.domain.creationDate)} />
        <Field label='更新时间' value={formatDate(data.domain.updatedDate)} />
        <Field label='到期时间' value={formatDate(data.domain.expiryDate)} />
        <Field label='DNSSEC' value={data.dnssec} />
      </Section>

      {/* 域名状态 */}
      {data.domainStatus.length > 0 && (
        <Section title='域名状态'>
          <div className='flex flex-wrap gap-2'>
            {data.domainStatus.map((s, i) => (
              <span
                key={i}
                className='inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-mono'
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Name Servers */}
      {data.nameServers.length > 0 && (
        <Section title='Name Servers'>
          <ul className='space-y-1'>
            {data.nameServers.map((ns, i) => (
              <li key={i} className='text-sm font-mono text-foreground break-all'>
                {ns}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 注册商信息 */}
      {hasAnyValue(data.registrar) && (
        <Section title='注册商信息'>
          <Field label='名称' value={data.registrar.name} />
          <Field label='IANA ID' value={data.registrar.ianaId} />
          <Field
            label='官方网站'
            value={data.registrar.url}
            link={data.registrar.url}
          />
          <Field label='WHOIS 服务器' value={data.registrar.whoisServer} />
          <Field
            label='邮箱'
            value={data.registrar.email}
            link={data.registrar.email ? `mailto:${data.registrar.email}` : undefined}
          />
          <Field label='电话' value={data.registrar.phone} />
          <Field label='地址' value={data.registrar.address} />
        </Section>
      )}

      {/* 注册人信息 */}
      {hasAnyValue(data.registrant) && (
        <Section title='注册人信息'>
          <Field label='姓名' value={data.registrant.name} />
          <Field label='组织' value={data.registrant.organization} />
          <Field
            label='邮箱'
            value={data.registrant.email}
            link={
              data.registrant.email && !data.registrant.email.toLowerCase().includes('redacted')
                ? `mailto:${data.registrant.email}`
                : undefined
            }
          />
          <Field label='电话' value={data.registrant.phone} />
          <Field label='街道' value={data.registrant.street} />
          <Field label='城市' value={data.registrant.city} />
          <Field label='省/州' value={data.registrant.state} />
          <Field label='邮编' value={data.registrant.postalCode} />
          <Field label='国家/地区' value={data.registrant.country} />
        </Section>
      )}

      {/* 管理员联系人 */}
      {hasAnyValue(data.admin) && (
        <Section title='管理员联系人'>
          <Field label='姓名' value={data.admin.name} />
          <Field label='组织' value={data.admin.organization} />
          <Field label='邮箱' value={data.admin.email} />
          <Field label='电话' value={data.admin.phone} />
        </Section>
      )}

      {/* 技术联系人 */}
      {hasAnyValue(data.tech) && (
        <Section title='技术联系人'>
          <Field label='姓名' value={data.tech.name} />
          <Field label='组织' value={data.tech.organization} />
          <Field label='邮箱' value={data.tech.email} />
          <Field label='电话' value={data.tech.phone} />
        </Section>
      )}

      {/* 原始数据 */}
      <section className='bg-card border border-border rounded-lg overflow-hidden'>
        <button
          type='button'
          onClick={() => setShowRaw((v) => !v)}
          className='w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-secondary/50 transition-colors'
          aria-expanded={showRaw}
        >
          <span className='text-base font-semibold text-foreground'>原始 WHOIS 数据</span>
          <span className='text-sm text-muted-foreground'>
            {showRaw ? '收起' : '展开'}
          </span>
        </button>
        {showRaw && (
          <div className='px-5 sm:px-6 pb-5 sm:pb-6'>
            <pre className='text-xs font-mono bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-all'>
              {raw}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
