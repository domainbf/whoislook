import { Globe } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/theme-toggle'

export default function SiteHeader() {
  return (
    <div className="flex justify-center px-4 pt-6">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            W
          </span>
          <span className="text-lg font-bold tracking-[0.2em] text-foreground">WHOIS</span>
        </Link>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <Link
          href="/"
          aria-label="首页"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
        </Link>
        <ThemeToggle />
      </div>
    </div>
  )
}
