import type { Metadata } from 'next';
import { Space_Grotesk, Work_Sans } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://clipsy.club'),
  title: 'Clipsy — Everything clipping, in one place',
  description:
    'Live clipping campaigns from every network, ranked by how hot they are running and how likely you are to actually get paid.',
  openGraph: {
    title: 'Clipsy — Everything clipping, in one place',
    description:
      'Live clipping campaigns from every network, ranked by how hot they are running and how likely you are to actually get paid.',
    siteName: 'Clipsy',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
