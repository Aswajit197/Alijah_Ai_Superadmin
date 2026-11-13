import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Elijah AI — SuperAdmin Control Center',
  description: 'Platform tenant management, subscription entitlements, and dynamic roles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}

