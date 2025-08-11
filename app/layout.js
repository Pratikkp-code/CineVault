import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Decentralized Cinema - Movie Rental Platform',
  description: 'Upload, rent, and remix movies on the blockchain',
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
