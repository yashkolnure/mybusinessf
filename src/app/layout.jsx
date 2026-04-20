import { Plus_Jakarta_Sans, Syne, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/shared/Providers';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata = {
  title: { default: 'MyBusiness', template: '%s — MyBusiness' },
  description: 'Modular business management platform',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: 'var(--font-plus-jakarta)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: 'var(--bg-elevated)' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-elevated)' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
