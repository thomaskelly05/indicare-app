import './globals.css'
import { NotificationBell } from '@/components/layout/NotificationBell'

export const metadata = {
  title: 'IndiCare OS',
  description: 'Operational Copilot for residential children\'s care',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body>
        <div className="fixed right-4 top-4 z-50">
          <NotificationBell />
        </div>
        {children}
      </body>
    </html>
  )
}
