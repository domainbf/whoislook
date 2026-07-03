import { lookupDomain } from '@/lib/whois'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params
  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  try {
    const data = await lookupDomain(domain)
    return NextResponse.json(data)
  } catch (error) {
    console.error('RDAP lookup failed:', error)
    return NextResponse.json({ error: 'RDAP lookup failed' }, { status: 500 })
  }
}
