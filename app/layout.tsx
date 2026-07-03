import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'WHOIS · 域名信息查询',
  description: '快速查询域名的注册信息、注册商、状态与域名服务器，支持 RDAP 与传统 WHOIS。',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
}

// 深色模式无闪烁：在页面渲染前根据 localStorage / 系统偏好设置 class
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && m)) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
