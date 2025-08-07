
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import AppLayout from '@/components/layout/app-layout';

export const metadata: Metadata = {
  title: 'Lucky Sevens Casino',
  description: 'Welcome to Lucky Sevens, your virtual casino experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
