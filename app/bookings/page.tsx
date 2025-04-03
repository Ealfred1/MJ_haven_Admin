"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { MoreVertical, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"
import { formatCurrency } from "@/lib/utils"

interface Property {
  id: number
  title: string
  property_type: string
  property_type_display: string
  price: string
  duration: string
  duration_display: string
  location: string
  bedrooms: number
  bathrooms: number
  area: string | null
  is_available: boolean
  main_image_url: string
  created_at: string
  is_favorited?: boolean
}

interface Payment {
  id: number
  booking_id: string
  property_title: string
  amount: string
  status: string
  tx_ref: string
  payment_reference: string | null
  created_at: string
  updated_at: string
}

interface Booking {
  id: number
  booking_id: string
  user: number
  property: number
  property_detail: Property
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: string
  status: string
  payment_status: string
  payment_method: string
  payment_reference: string | null
  tax_amount: string
  notes: string
  created_at: string
  updated_at: string
  payments: Payment[]
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export default function BookingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBookings, setTotalBookings] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)

  // Counters for different booking statuses
  const [allCount, setAllCount] = useState(0)
  const [ongoingCount, setOngoingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [cancelledCount, setCancelledCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)

  const fetchBookings = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())

      const response = await api.get<PaginatedResponse<Booking>>(`/api/bookings/admin/bookings/?${params.toString()}`)

      setBookings(response.data.results)
      setTotalBookings(response.data.count)
      setAllCount(response.data.count)
      setHasNextPage(!!response.data.next)
      setHasPreviousPage(!!response.data.previous)

      // Count bookings by status
      const ongoing = response.data.results.filter((booking) =>
        ["pending", "active"].includes(booking.status.toLowerCase()),
      ).length

      const completed = response.data.results.filter((booking) => booking.status.toLowerCase() === "completed").length

      const cancelled = response.data.results.filter((booking) => booking.status.toLowerCase() === "cancelled").length

      const failed = response.data.results.filter((booking) => booking.payment_status.toLowerCase() === "failed").length

      setOngoingCount(ongoing)
      setCompletedCount(completed)
      setCancelledCount(cancelled)
      setFailedCount(failed)
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(currentPage)
  }, [currentPage])

  const getFilteredBookings = () => {
    switch (activeTab) {
      case "ongoing":
        return bookings.filter((booking) => ["pending", "active"].includes(booking.status.toLowerCase()))
      case "completed":
        return bookings.filter((booking) => booking.status.toLowerCase() === "completed")
      case "cancelled":
        return bookings.filter((booking) => booking.status.toLowerCase() === "cancelled")
      case "failed":
        return bookings.filter((booking) => booking.payment_status.toLowerCase() === "failed")
      default:
        return bookings
    }
  }

  const filteredBookings = getFilteredBookings()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusClass = (status: string) => {
    status = status.toLowerCase()
    if (status === "active") return "bg-green-100 text-green-800"
    if (status === "pending") return "bg-yellow-100 text-yellow-800"
    if (status === "completed") return "bg-blue-100 text-blue-800"
    return "bg-red-100 text-red-800" // cancelled or other statuses
  }

  const getPaymentStatusClass = (status: string) => {
    status = status.toLowerCase()
    if (status === "paid") return "bg-green-100 text-green-800"
    if (status === "pending") return "bg-yellow-100 text-yellow-800"
    if (status === "refunded") return "bg-blue-100 text-blue-800"
    return "bg-red-100 text-red-800" // failed or other statuses
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64 w-full pt-16 lg:pt-0">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/dashboard" className="hover:text-primary">
                  Home
                </Link>
                <span>/</span>
                <Link href="/bookings" className="hover:text-primary">
                  Bookings
                </Link>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">Manage Bookings</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage all property, booking, payment, and user management 😊
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 md:px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                activeTab === "all" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Bookings{" "}
              <span className="ml-1 px-1.5 py-0.5 bg-gray-500 text-white text-xs rounded-full">{allCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("ongoing")}
              className={`px-3 md:px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                activeTab === "ongoing"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ongoing{" "}
              <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{ongoingCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 md:px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Completed{" "}
              <span className="ml-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">{completedCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-3 md:px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                activeTab === "cancelled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Cancelled{" "}
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{cancelledCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("failed")}
              className={`px-3 md:px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                activeTab === "failed" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Failed{" "}
              <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{failedCount}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {activeTab === "failed" ? (
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Calendar className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No {activeTab} bookings found</h3>
              <p className="text-gray-500">There are currently no {activeTab} bookings to display.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Booking ID
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Property
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Check-in
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Check-out
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Payment
                      </th>
                      <th scope="col" className="relative px-4 md:px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                          #{booking.booking_id.substring(0, 8)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-md overflow-hidden">
                              <img
                                src={booking.property_detail.main_image_url || "/placeholder.svg"}
                                alt={booking.property_detail.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                                {booking.property_detail.title}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {booking.property_detail.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {formatDate(booking.check_in_date)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {formatDate(booking.check_out_date)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                          {formatCurrency(Number(booking.total_price))}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(booking.payment_status)}`}
                          >
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-500">
                            <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(hasNextPage || hasPreviousPage) && (
                <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t">
                  <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
                    Showing {filteredBookings.length} of {totalBookings} bookings
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                        !hasPreviousPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                        !hasNextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

