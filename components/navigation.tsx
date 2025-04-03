"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Logo } from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { LoginModal } from "./login-modal"
import { SignupModal } from "./signup-modal"
import { Menu, X, Bell, ChevronDown, LogOut, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function Navigation() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    setIsProfileDropdownOpen(false)
  }

  return (
    <>
      <header className="bg-white flex h-[96px] border-b border-b-[#F0EFFB] sticky top-0 z-40">
        <div className="container max-w-[1324px] mx-auto flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation - Only show for non-authenticated users */}
          {!user && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/about"
                className="text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/properties"
                className="text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                Explore Properties
              </Link>
              <Link
                href="/contact"
                className="text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/faqs"
                className="text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                FAQs
              </Link>
            </nav>
          )}

          {/* Desktop Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/notifications" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-medium">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border animate-in fade-in-0 zoom-in-95">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-[16px] font-semibold text-[#606D93] hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-primary w-[118px] h-[48px] hover:bg-primary-600 text-white px-4 py-2 rounded-[8px] text-sm font-medium transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <Logo />
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {user && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="p-4">
            <ul className="space-y-4">
              {!user && (
                <>
                  <li>
                    <Link
                      href="/about"
                      className="block text-gray-800 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/properties"
                      className="block text-gray-800 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Explore Properties
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="block text-gray-800 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faqs"
                      className="block text-gray-800 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQs
                    </Link>
                  </li>
                </>
              )}

              {user && (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="block text-gray-800 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/bookings"
                      className="block text-gray-800 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/notifications"
                      className="block text-gray-800 hover:text-primary flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white h-[10px] flex items-center justify-center text-[10px] rounded-full">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {!user && (
            <div className="p-4 border-t mt-auto">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsLoginModalOpen(true)
                  }}
                  className="px-4 py-2 border border-primary text-primary rounded-md text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsSignupModalOpen(true)
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-md text-center"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignupClick={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </>
  )
}

