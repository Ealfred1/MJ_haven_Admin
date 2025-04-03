"use client"

import type React from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

// Client wrapper component to handle conditional layout
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <>
      <Sidebar />
      <main className={user ? "lg:pl-[280px]" : ""} style={{ transition: "padding-left 0.3s" }}>
        {children}
      </main>
    </>
  )
}

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          <NotificationsProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster />
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

