import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '../components/providers/toast-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aihio.ai - Tekoälybotti Alusta',
  description: 'Luo ja hallitse tekoälybotteja verkkosivustollesi',
  keywords: [
    'tekoäly',
    'chatbot',
    'asiakaspalvelu',
    'automaatio',
    'verkkosivusto',
    'keskustelu',
    'botti'
  ],
  authors: [{ name: 'Aihio.ai' }],
  openGraph: {
    title: 'Aihio.ai - Tekoälybotti Alusta',
    description: 'Luo ja hallitse tekoälybotteja verkkosivustollesi',
    type: 'website',
    locale: 'fi_FI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aihio.ai - Tekoälybotti Alusta',
    description: 'Luo ja hallitse tekoälybotteja verkkosivustollesi',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
