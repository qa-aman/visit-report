import type { Metadata } from 'next'
import './globals.css'
import ToastProviderWrapper from '@/components/ToastProviderWrapper'

export const metadata: Metadata = {
  title: 'Visit Report System',
  description: 'Modern visit report management for sales teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProviderWrapper>{children}</ToastProviderWrapper>
      </body>
    </html>
  )
}

