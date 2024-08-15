import './globals.css';

import { Suspense } from 'react';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { cx } from 'class-variance-authority';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const fetchCache = 'default-cache';

export const metadata: Metadata = {
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
    url: false,
  },
  title: {
    template: 'TMDB Playground - %s',
    default: 'TMDB Playground',
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cx(
          'flex min-h-screen select-none flex-col overflow-x-hidden overscroll-y-none bg-neutral-800 text-white subpixel-antialiased',
          inter.className,
        )}
      >
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              const scrollable = document.createElement("div");
              scrollable.style.overflow = "scroll";
              scrollable.style.width = "10px";
              scrollable.style.height = "10px";
              scrollable.style.position = "absolute";
              scrollable.style.top = "0px";
              scrollable.style.visibility = "hidden";
              if (document.body) {
                document.body.appendChild(scrollable);
                if (scrollable.scrollWidth !== scrollable.offsetWidth) {
                  document.body.classList.add("scrollbar-is-visible");
                }
                document.body.removeChild(scrollable);
              }
            `,
          }}
        />
        <Header />
        {children}
        {modal}
        <Analytics />
        <SpeedInsights />
        <Suspense>
          <Footer />
        </Suspense>
        <div id="modal-root" />
      </body>
    </html>
  );
}
