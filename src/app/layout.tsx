import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import TimeTracker from '@/components/providers/TimeTracker'

import './globals.css'

export const metadata: Metadata = {
  title: 'Memori',
  description: 'Memori language learning app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Memori',
  },
  icons: {
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Memori" />
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body className="min-h-screen bg-bg text-primary">
        <ThemeProvider>
          <TimeTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
