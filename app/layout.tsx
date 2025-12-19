import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgriSaarthi - Multilingual Farm Chatbot',
  description: 'One chat. Every crop. Every language. Powered by Bhashini AI.',
  keywords: 'agriculture, chatbot, multilingual, farming, bhashini, ai',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-agri-light to-white">
          {children}
        </div>
      </body>
    </html>
  )
}
