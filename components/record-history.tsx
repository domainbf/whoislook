'use client'

import { useEffect } from 'react'
import { addHistory } from '@/lib/search-history'

export default function RecordHistory({ domain }: { domain: string }) {
  useEffect(() => {
    if (domain) addHistory(domain.toLowerCase())
  }, [domain])
  return null
}
