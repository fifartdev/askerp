import React from 'react'
import './styles.css'

export const metadata = {
  title: 'AskService ERP',
  description: 'Σύστημα Διαχείρισης Εντολών Εργασίας',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body className="antialiased">{children}</body>
    </html>
  )
}
