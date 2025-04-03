import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MJ's Haven Admin",
  description: "Admin dashboard for MJ's Haven property management",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationsProvider>
            {children}
            <Toaster />
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

