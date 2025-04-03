import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mj_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("mj_refresh_token")
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/token/refresh/`,
            { refresh: refreshToken },
          )

          const { access } = response.data
          localStorage.setItem("mj_token", access)

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return axios(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("mj_token")
        localStorage.removeItem("mj_refresh_token")
        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  },
)

export default api