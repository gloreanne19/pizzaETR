import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Paquito's Pizza - Best Homemade Pizza",
  description: 'Order fresh, authentic homemade pizzas online with fast delivery.',
  icons: {
    icon: '/images/pizzalogo32x32.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/images/pizzalogo32x32.png" />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

