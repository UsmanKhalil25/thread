import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://thread-ai.app'),
  title: 'Thread — On-device AI Assistant',
  description:
    'A private, on-device AI assistant. All inference happens locally on your phone. No data leaves your device.',
  keywords: [
    'AI assistant',
    'private AI',
    'on-device AI',
    'local LLM',
    'open source',
    'offline AI',
  ],
  authors: [{ name: 'Thread' }],
  creator: 'Thread',
  publisher: 'Thread',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thread-ai.app',
    siteName: 'Thread',
    title: 'Thread — On-device AI Assistant',
    description:
      'A private, on-device AI assistant. All inference happens locally on your phone. No data leaves your device.',
  },
  twitter: {
    card: 'summary',
    title: 'Thread — On-device AI Assistant',
    description: 'A private, on-device AI assistant. All inference happens locally on your phone.',
  },
  alternates: {
    canonical: 'https://thread-ai.app',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Thread',
              description:
                'A private, on-device AI assistant that runs open models locally on your phone.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Android',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
