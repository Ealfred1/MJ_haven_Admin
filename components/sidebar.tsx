"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import {
  Home,
  Building,
  Bell,
  Calendar,
  Users,
  Settings,
  LogOut,
  CreditCard,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "./logo"

export function Sidebar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // Close sidebar by default on mobile
      if (window.innerWidth < 1024) {
        setIsOpen(false)
      } else {
        setIsOpen(true) // Always open on desktop
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  // If no user, don't render sidebar
  if (!user) return null

  const navItems = [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Manage Properties", icon: Building, href: "/properties" },
    { name: "Bookings", icon: Calendar, href: "/bookings" },
    { name: "Payments", icon: CreditCard, href: "/payments" },
    { name: "Customers", icon: Users, href: "/customers" },
    {
      name: "Notifications",
      icon: Bell,
      href: "/notifications",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: "Admin Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <>
      {/* Mobile Navbar - Only visible on mobile */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 lg:hidden">
        <Logo />
        <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && isMobile && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            {/* Close button - only on mobile */}
            {isMobile && (
              <button
                className="p-1 rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary"}`}
                      />
                      <span>{item.name}</span>

                      {item.badge !== undefined && (
                        <span
                          className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                            isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                          }`}
                        >
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User profile */}
          <div className="p-4 border-t mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {user.profileImage ? (
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 font-medium">{user.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full mt-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

