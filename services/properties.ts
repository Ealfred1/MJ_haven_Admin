import api from "./api"

export interface PropertyImage {
  id: number
  image_url: string
  is_main: boolean
}

export interface PropertyFeature {
  id: number
  name: string
  description: string
}

export interface Property {
  id: number
  title: string
  description?: string
  property_type: string
  property_type_display?: string
  price: string
  duration: string
  duration_display: string
  location: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  bedrooms: number
  bathrooms: number
  area: string | null
  is_available: boolean
  main_image_url?: string
  images?: PropertyImage[]
  features?: PropertyFeature[]
  is_favorited?: boolean
  created_at: string
  updated_at?: string
  owner?: number
}

export interface PropertyFilters {
  location?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  property_type?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface FavoriteResponse {
  id?: number
  property_details?: {
    id: number
    title: string
    property_type: string
    price: string
    duration: string
    location: string
    main_image_url: string
  }
  created_at?: string
  detail?: string
  action?: "added" | "removed"
}

// Local storage key for favorites
const LOCAL_FAVORITES_KEY = "mj_local_favorites"

export const propertiesService = {
  // Get all properties with optional filters
  getProperties: async (filters?: PropertyFilters): Promise<PaginatedResponse<Property>> => {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get(`/api/properties/?${params.toString()}`)
    return response.data
  },

  // Get a single property by ID
  getProperty: async (id: number | string): Promise<Property> => {
    const response = await api.get(`/api/properties/${id}/`)
    return response.data
  },

  // Toggle favorite status for a property
  toggleFavorite: async (propertyId: number): Promise<FavoriteResponse> => {
    try {
      const token = localStorage.getItem("mj_token")

      // If user is authenticated, use the API
      if (token) {
        const response = await api.post(`/api/users/favorites/toggle/${propertyId}/`)

        // Handle both response formats
        if (response.data.detail && response.data.detail.includes("removed")) {
          return { detail: response.data.detail, action: "removed" }
        } else {
          return response.data
        }
      }
      // Otherwise, use local storage
      else {
        const localFavorites = getLocalFavorites()

        if (localFavorites.includes(propertyId)) {
          // Remove from local favorites
          const updatedFavorites = localFavorites.filter((id) => id !== propertyId)
          localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updatedFavorites))
          return { detail: "Property removed from favorites", action: "removed" }
        } else {
          // Add to local favorites
          localFavorites.push(propertyId)
          localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(localFavorites))
          return {
            id: propertyId,
            action: "added",
            detail: "Property added to favorites",
          }
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      throw error
    }
  },

  // Check if a property is favorited
  isPropertyFavorited: (propertyId: number): boolean => {
    const token = localStorage.getItem("mj_token")

    // For unauthenticated users, check local storage
    if (!token) {
      const localFavorites = getLocalFavorites()
      return localFavorites.includes(propertyId)
    }

    // For authenticated users, this will be determined by the API response
    return false
  },

  // Get favorite properties
  getFavorites: async (): Promise<{ id: number; property: Property }[]> => {
    try {
      const token = localStorage.getItem("mj_token")

      // If user is authenticated, use the API
      if (token) {
        const response = await api.get("/api/users/favorites/")
        return response.data
      }
      // Otherwise, return empty array (local favorites don't have full property data)
      else {
        return []
      }
    } catch (error) {
      console.error("Error getting favorites:", error)
      return []
    }
  },

  // Sync local favorites to server after login
  syncLocalFavoritesToServer: async (): Promise<void> => {
    const token = localStorage.getItem("mj_token")
    if (!token) return

    const localFavorites = getLocalFavorites()
    if (localFavorites.length === 0) return

    try {
      // Add each local favorite to the server
      for (const propertyId of localFavorites) {
        await api.post(`/api/users/favorites/toggle/${propertyId}/`)
      }

      // Clear local favorites after syncing
      localStorage.removeItem(LOCAL_FAVORITES_KEY)
    } catch (error) {
      console.error("Error syncing local favorites:", error)
    }
  },
}

// Helper function to get local favorites
function getLocalFavorites(): number[] {
  const favoritesJson = localStorage.getItem(LOCAL_FAVORITES_KEY)
  return favoritesJson ? JSON.parse(favoritesJson) : []
}

