import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-editorial-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finora.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Finora — Your Money, Your Control',
    template: '%s | Finora',
  },
  description:
    'Aplikasi manajemen keuangan pribadi local-first dan offline-first. Catat transaksi IDR, atur anggaran, pantau target tabungan, dan simpan data 100% di browser Anda tanpa login.',
  applicationName: 'Finora',
  keywords: [
    'manajemen keuangan pribadi',
    'aplikasi keuangan local-first',
    'catatan keuangan offline PWA',
    'anggaran bulanan IDR',
    'privacy-first personal finance',
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Finora',
    title: 'Finora — Your Money, Your Control',
    description:
      'Catat transaksi, kelola anggaran, dan pantau target tabungan secara offline langsung di browser Anda—tanpa registrasi, tanpa server, dan tanpa pelacakan.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Finora — Manajemen Keuangan Pribadi Local-First',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finora — Your Money, Your Control',
    description:
      'Manajemen keuangan pribadi local-first & offline-first. 100% tersimpan di perangkat Anda.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'Finora',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1220',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang="id"
      data-theme="dark"
      data-nonce={nonce}
      className={`${plusJakarta.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
