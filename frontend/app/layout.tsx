import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Murph - AI Learning Guide',
  description: 'Learn with Murph, your AI-powered learning guide. Pay-per-minute tutoring at your fingertips.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75" font-weight="bold" fill="url(%23gradient)">M</text><defs><linearGradient id="gradient"><stop offset="0%25" stop-color="%2360a5fa"/><stop offset="100%25" stop-color="%23a855f7"/></linearGradient></defs></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

