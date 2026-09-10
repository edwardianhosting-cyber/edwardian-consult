import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Edwardian Educational Consult',
    template: '%s | Edwardian Educational Consult',
  },
  description: 'Your pathway to academic excellence. Join thousands of successful students who have gained admission into their dream universities.',
  keywords: ['education', 'JAMB', 'Post-UTME', 'WAEC', 'NECO', 'tutorial', 'Nigeria', 'admission', 'Edwardian'],
  authors: [{ name: 'Edwardian Educational Consult' }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  themeColor: '#0B3D91',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Edwardian Educational Consult',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Edwardian Educational Consult',
    title: 'Edwardian Educational Consult',
    description: 'Your pathway to academic excellence',
  },
};

export const viewport = {
  themeColor: '#0B3D91',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Script src="/app.js" defer />
      </body>
    </html>
  );
}
