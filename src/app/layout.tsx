import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/theme-provider';
import ErrorBoundary from '@/components/error-boundary';

// Use dynamic import with ssr: false for client components
const Header = dynamic(() => import('@/components/layout/Header').then(mod => mod.default), { ssr: true });
const Footer = dynamic(() => import('@/components/layout/Footer').then(mod => mod.default), { ssr: true });

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'AI Tools Catalog - Discover the Best AI Tools',
  description: 'Explore a curated collection of the best AI tools for productivity, creativity, and development.',
  keywords: ['AI tools', 'artificial intelligence', 'productivity tools', 'AI software', 'machine learning tools'],
  authors: [{ name: 'AI Tools Catalog Team' }],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-tools-catalog.vercel.app',
    title: 'AI Tools Catalog - Discover the Best AI Tools',
    description: 'Explore a curated collection of the best AI tools for productivity, creativity, and development.',
    siteName: 'AI Tools Catalog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools Catalog',
    description: 'Discover the best AI tools for your workflow',
    creator: '@aitoolscatalog',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ErrorBoundary>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
