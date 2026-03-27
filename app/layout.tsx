// SendGem - Main Layout
import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SendGem - AI-Powered Cold Email Platform',
  description: 'Generate hyper-personalized email sequences and automate your outreach',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0a0a0a] text-white min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}