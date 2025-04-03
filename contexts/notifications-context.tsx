"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { notificationsService, type Notification } from "@/services/notifications"
import { useAuth } from "./auth-context"

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const { user } = useAuth()

  const fetchNotifications = async () => {
    if (!user) return

    // Don't start a new fetch if one is already in progress
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)

    try {
      const data = await notificationsService.getNotifications()
      setNotifications(data)

      const count = await notificationsService.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      setError(null)
      return
    }

    // Initial fetch
    fetchNotifications()

    // Set up polling for new notifications (every 30 seconds)
    if (!isPolling) {
      setIsPolling(true)
      const interval = setInterval(() => {
        fetchNotifications()
      }, 30000)

      return () => {
        clearInterval(interval)
        setIsPolling(false)
      }
    }
  }, [user])

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id)

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))

      // Update unread count
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
      throw err
    }
  }

  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}