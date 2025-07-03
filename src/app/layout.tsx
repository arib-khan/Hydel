import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from './components'
import Footer from './components/Footer/Footer' // Import the Footer component

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Hydel Marketing & Services | Premium Industrial Sealing Solutions',
    template: '%s | Hydel'
  },
  description: 'Leading manufacturer of high-quality gaskets, seals, and industrial sealing solutions since 1998.',
  keywords: ['industrial seals', 'gaskets', 'hydraulic seals', 'rubber gaskets', 'industrial solutions'],
  authors: [{ name: 'Hydel Marketing & Services' }],
  openGraph: {
    title: 'Hydel Marketing & Services',
    description: 'Premium industrial sealing solutions for demanding applications',
    url: 'https://hydel.in',
    siteName: 'Hydel',
    images: [
      {
        url: 'https://hydel.in/hydel.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  icons: {
    icon: 'https://hydel.in/hydel.png',
    shortcut: 'https://hydel.in/hydel.png',
    apple: 'https://hydel.in/hydel.png',
  },
  metadataBase: new URL('https://hydel.in'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}