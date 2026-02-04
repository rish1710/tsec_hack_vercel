import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finternet Teaching Session MVP',
  description: 'Live teaching sessions with Finternet payment integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
