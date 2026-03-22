import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'

export const metadata = {
  title: 'Swell — Surf Session Tracker',
  description: 'Track every surf session, monitor conditions, and watch your progress over time.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
