import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finora.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Finora — Your Money, Your Control',
    template: '%s | Finora',
  },
  description:
    'Aplikasi pengelola keuangan pribadi yang menjaga privasi. Catat pemasukan dan pengeluaran, atur anggaran bulanan, dan pantau target tabungan langsung dari perangkat Anda.',
  applicationName: 'Finora',
  keywords: [
    'manajemen keuangan pribadi',
    'aplikasi pengelola uang',
    'catatan keuangan offline',
    'anggaran bulanan',
    'target tabungan',
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Finora',
    title: 'Finora — Your Money, Your Control',
    description:
      'Catat transaksi, atur anggaran, dan pantau target tabungan dengan tenang—tanpa daftar, tanpa akun, dan data tersimpan langsung di perangkat Anda.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Finora — Pengelola Keuangan Pribadi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finora — Your Money, Your Control',
    description:
      'Catat transaksi, atur anggaran, dan pantau target tabungan langsung di perangkat Anda.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'Finora',
    statusBarStyle: 'default',
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
  themeColor: '#F8FAFC',
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
      data-theme="light"
      data-nonce={nonce}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
