import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import TimeTracker from '@/components/providers/TimeTracker'

import './globals.css'

export const metadata: Metadata = {
  title: 'Memori',
  description: 'Memori language learning app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-primary">
        <ThemeProvider>
          <TimeTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
