import Link from 'next/link'
import LanguageToggle from '@/components/language-toggle'
import ThemeToggle from '@/components/theme-toggle'

export default function SiteHeader() {
  return (
    <div className="flex justify-center px-4 pt-6">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 shadow-sm backdrop-blur sm:gap-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            W
          </span>
          <span className="text-lg font-bold tracking-[0.2em] text-foreground">WHOIS</span>
        </Link>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  )
}
