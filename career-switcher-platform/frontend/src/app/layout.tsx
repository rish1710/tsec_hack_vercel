import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Career Switcher - AI-Powered Learning Platform',
  description: 'Personalized learning paths for career switchers and first-time job seekers',
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
