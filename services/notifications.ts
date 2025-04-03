import api from "./api"

export interface Notification {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
  notification_type?: string
  related_object_id?: number
  related_object_type?: string
  created_at_formatted?: string
}

interface NotificationsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

export const notificationsService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/api/notifications/")
    // Extract the results array from the paginated response
    return response.data.results || []
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/api/notifications/unread/")
    return response.data.results || []
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/api/notifications/count_unread/")
    // The API returns unread_count, not count
    return response.data.unread_count || 0
  },

  // Mark a notification as read
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/api/notifications/${id}/mark_as_read/`)
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.post("/api/notifications/mark_all_as_read/")
  },
}

