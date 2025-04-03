import api from "./api"
import type { Property } from "./properties"

export interface Booking {
  id: number
  booking_id: string
  property: number
  property_detail: Property
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: string
  status: "pending" | "confirmed" | "cancelled" | "canceled" | "completed"
  payment_status: "pending" | "paid" | "failed"
  payment_method: string
  payment_reference: string | null
  tax_amount: string
  notes: string
  created_at: string
  updated_at: string
}

export interface BookingCreateData {
  property: number
  check_in_date: string
  check_out_date: string
  guests: number
  payment_method: string
  notes?: string
}

export interface Payment {
  id: number
  booking_id: string
  property_title: string
  amount: string
  status: string
  tx_ref: string
  payment_reference: string
  created_at: string
  updated_at: string
}

export const bookingsService = {
  // Get all bookings
  getBookings: async (): Promise<Booking[]> => {
    const response = await api.get("/api/bookings/")
    return response.data.results
  },

  // Create a new booking
  createBooking: async (data: BookingCreateData): Promise<Booking> => {
    const response = await api.post("/api/bookings/", data)
    return response.data
  },

  // Get a single booking by ID
  getBooking: async (id: number): Promise<Booking> => {
    const response = await api.get(`/api/bookings/${id}/`)
    return response.data
  },

  // Cancel a booking
  cancelBooking: async (id: number): Promise<{ detail: string; booking: Booking }> => {
    const response = await api.post(`/api/bookings/${id}/cancel/`)
    return response.data
  },

  // Process payment for a booking
  processPayment: async (id: number): Promise<{ detail: string; payment_link: string }> => {
    const response = await api.post(`/api/bookings/${id}/process-payment/`)
    return response.data
  },

  // Get all payments
  getPayments: async (): Promise<Payment[]> => {
    const response = await api.get("/api/bookings/payments/")
    return response.data
  },

  // Get all transactions (paid bookings)
  getTransactions: async (): Promise<Booking[]> => {
    const response = await api.get("/api/bookings/transactions/")
    return response.data.results
  },
}

