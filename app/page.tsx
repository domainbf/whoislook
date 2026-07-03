import { Volume2 } from 'lucide-react'
import SearchBox from '@/components/search-box'
import SearchHistory from '@/components/search-history'
import SiteHeader from '@/components/site-header'

export default function Page() {
  return (
    <main className="relative flex min-h-dvh flex-col bg-dots">
      <SiteHeader />

      <div className="flex flex-1 flex-col px-4 pb-16 pt-16 sm:pt-24">
        <div className="w-full">
          <SearchBox />
          <SearchHistory />
        </div>
      </div>

      <footer className="border-t border-border/60 px-4 py-6">
        <p className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Volume2 className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />
          <span className="font-medium">本站提供域名查询服务，不储存任何搜索及查询数据信息。</span>
        </p>
      </footer>
    </main>
  )
}
