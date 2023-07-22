import './globals.css'
import { Inter } from 'next/font/google'
import Recoil from '@/contexts/recoil'
import SplashScreen from '@/components/SplashScreen/SplashScreen'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nijoow Drawing',
  description: 'SVG Drawing App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full h-full">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com/css?family=Montserrat"
        />
      </head>
      <body className={`${inter.className} overflow-hidden w-full h-full`}>
        <Recoil>
          <SplashScreen />
          {children}
        </Recoil>
      </body>
    </html>
  )
}
