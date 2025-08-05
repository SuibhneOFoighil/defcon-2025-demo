import { Inter, Barlow } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700'], // for headings/labels
  variable: '--font-barlow',
  display: 'swap',
}); 