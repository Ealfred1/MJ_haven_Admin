"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import api from "@/services/api"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  name: string
  email: string
  phone?: string
  profileImage?: string
} | null

type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateProfile: (data: Partial<Omit<NonNullable<User>, "id">>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("mj_user")
    const token = localStorage.getItem("mj_token")

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))

      // Verify token and get fresh user data
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/users/users/me/")
      const userData = response.data

      // Transform API user data to our User type
      const formattedUser = {
        id: userData.id.toString(),
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone || "",
        profileImage: userData.profile_image_url || "",
      }

      setUser(formattedUser)
      localStorage.setItem("mj_user", JSON.stringify(formattedUser))
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      // If token is invalid, clear everything
      localStorage.removeItem("mj_token")
      localStorage.removeItem("mj_refresh_token")
      localStorage.removeItem("mj_user")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post("/api/users/token/", { email, password })
      const { access, refresh } = response.data

      // Store tokens
      localStorage.setItem("mj_token", access)
      localStorage.setItem("mj_refresh_token", refresh)

      // Fetch user profile
      await fetchUserProfile()
      return true
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Split name into first_name and last_name 
      const nameParts = name.split(" ")
      const first_name = nameParts[0]
      const last_name = nameParts.slice(1).join(" ")

      // Register user
      await api.post("/api/users/users/", {
        email,
        password,
        full_name: name
      })

      // Login after successful registration
      return await login(email, password)
    } catch (error) {
      console.error("Signup failed:", error)
      toast({
        title: "Signup failed",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }
  }

  const updateProfile = async (data: Partial<Omit<NonNullable<User>, "id">>) => {
    setIsLoading(true)
    try {
      if (!user) return false

      // Split name into first_name and last_name if name is provided
      const updateData: Record<string, any> = {}

      if (data.name) {
        const nameParts = data.name.split(" ")
        updateData.first_name = nameParts[0]
        updateData.last_name = nameParts.slice(1).join(" ")
      }

      if (data.email) updateData.email = data.email
      if (data.phone) updateData.phone = data.phone

      // Update user profile
      await api.patch(`/api/users/users/me/`, updateData)

      // Refresh user data
      await fetchUserProfile()
      return true
    } catch (error) {
      console.error("Profile update failed:", error)
      toast({
        title: "Update failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("mj_token")
    localStorage.removeItem("mj_refresh_token")
    localStorage.removeItem("mj_user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
