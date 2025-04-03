"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { formatCurrency } from "@/lib/utils"
import { Building, Calendar, DollarSign, Clock, ArrowDown, MoreVertical, Search, Bell, Plus } from "lucide-react"
import Link from "next/link"
import { PropertyModal } from "@/components/property-modal"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"

interface DashboardStats {
  total_revenue: string
  total_properties_listed: number
  total_active_bookings: number
  pending_bookings: number
  sales_revenue: {
    last_month: string
    this_month: string
    monthly_breakdown: {
      [key: string]: string
    }
  }
  recent_transactions: Transaction[]
}

interface Transaction {
  id?: number
  booking_id?: string
  property_title?: string
  amount: string
  status: string
  tx_ref?: string
  payment_reference?: string | null
  created_at: string
  updated_at?: string
}

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

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [chartData, setChartData] = useState<{ month: string; value: number }[]>([])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch dashboard stats
      const statsResponse = await api.get<DashboardStats>("/api/users/dashboard-stats/")
      setStats(statsResponse.data)

      // Set transactions from the stats response
      setTransactions(statsResponse.data.recent_transactions || [])

      // Process monthly data for chart
      const monthlyData = statsResponse.data.sales_revenue.monthly_breakdown
      const processedChartData = Object.entries(monthlyData).map(([month, value]) => ({
        month,
        value: Number.parseFloat(value),
      }))
      setChartData(processedChartData)

      // Fetch recent bookings (limited to 5)
      const bookingsResponse = await api.get<PaginatedResponse<Booking>>("/api/bookings/admin/bookings/?page_size=5")
      setBookings(bookingsResponse.data.results)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handlePropertyCreated = () => {
    // Refresh dashboard data after creating a new property
    toast({
      title: "Success",
      description: "Property created successfully. Refreshing data...",
    })

    // Fetch updated stats
    fetchDashboardData()
  }

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-4 md:p-8 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 w-full">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Welcome {user?.name}</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage all property, booking, payment, and user management 😊
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                  {/* Notification indicator */}
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                </div>

                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-medium">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
            <Link href="/bookings" className="block">
              <button className="w-full sm:w-auto px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
                View Bookings
              </button>
            </Link>

            <button
              onClick={() => setIsPropertyModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center sm:justify-start gap-2"
            >
              <Plus className="h-4 w-4" />
              Add a New Property
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <h3 className="text-xl md:text-2xl font-bold">{formatCurrency(Number(stats?.total_revenue || 0))}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Properties Listed</p>
                  <h3 className="text-xl md:text-2xl font-bold">{stats?.total_properties_listed || 0}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Active Bookings</p>
                  <h3 className="text-xl md:text-2xl font-bold">{stats?.total_active_bookings || 0}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Booking</p>
                  <h3 className="text-xl md:text-2xl font-bold">{stats?.pending_bookings || 0}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Revenue Chart */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold">Sales Revenue</h3>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    <span className="text-gray-500">
                      Last Month: {formatCurrency(Number(stats?.sales_revenue.last_month || 0))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-gray-500">
                      This Month: {formatCurrency(Number(stats?.sales_revenue.this_month || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-48 md:h-64 flex items-end justify-between overflow-x-auto">
                {/* Chart based on real data */}
                {Object.entries(stats?.sales_revenue.monthly_breakdown || {}).map(([month, value]) => {
                  // Calculate height based on the value (with a minimum height for visibility)
                  const numericValue = Number.parseFloat(value)
                  const maxValue = Math.max(
                    ...Object.values(stats?.sales_revenue.monthly_breakdown || {}).map((v) => Number.parseFloat(v)),
                    1,
                  )
                  const heightPercentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0
                  const height = Math.max(heightPercentage, 5) // Minimum 5% height for visibility

                  return (
                    <div key={month} className="flex flex-col items-center min-w-[30px]">
                      <div
                        className={`w-6 ${numericValue > 0 ? "bg-primary" : "bg-gray-200"}`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs mt-2 text-gray-500">{month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Link href="/payments" className="text-sm text-primary hover:underline">
                  See all
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent transactions found</div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <ArrowDown className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.property_title ? `for ${transaction.property_title}` : "Payment"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.booking_id
                              ? `Booking #${transaction.booking_id.substring(0, 8)}`
                              : "Transaction"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-green-600 text-sm">
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500 text-right">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="mt-6 md:mt-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <Link href="/bookings" className="text-sm text-primary hover:underline">
                See all
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-gray-500">There are currently no bookings to display.</p>
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
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Modal */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={selectedProperty}
        onSuccess={handlePropertyCreated}
      />
    </div>
  )
}

