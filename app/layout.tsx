import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
