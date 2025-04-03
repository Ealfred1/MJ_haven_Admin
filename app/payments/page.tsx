"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { MoreVertical, Download, Filter } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import api from "@/services/api"
import { useToast } from "@/hooks/use-toast"

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

export default function PaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayments, setSelectedPayments] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)

  const fetchPayments = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())

      const response = await api.get<PaginatedResponse<Payment>>(`/api/bookings/admin/payments/?${params.toString()}`)

      setPayments(response.data.results)
      setTotalPayments(response.data.count)
      setHasNextPage(!!response.data.next)
      setHasPreviousPage(!!response.data.previous)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Error",
        description: "Failed to load payments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments(currentPage)
  }, [currentPage])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPayments(payments.map((payment) => payment.id))
    } else {
      setSelectedPayments([])
    }
  }

  const handleSelectPayment = (e: React.ChangeEvent<HTMLInputElement>, paymentId: number) => {
    if (e.target.checked) {
      setSelectedPayments((prev) => [...prev, paymentId])
    } else {
      setSelectedPayments((prev) => prev.filter((id) => id !== paymentId))
    }
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
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
                <Link href="/payments" className="hover:text-primary">
                  Payments
                </Link>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">Payments</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage all property, booking, payment, and user management 😊
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                Filter
              </button>

              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 w-full sm:w-auto">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-gray-500">There are currently no payments to display.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 md:px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          onChange={handleSelectAll}
                          checked={selectedPayments.length === payments.length && payments.length > 0}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
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
                        Payment Type
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative px-4 md:px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            onChange={(e) => handleSelectPayment(e, payment.id)}
                            checked={selectedPayments.includes(payment.id)}
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium">
                              {getInitial(payment.property_title)}
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                                {payment.property_title}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                Booking #{payment.booking_id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            {payment.tx_ref ? payment.tx_ref.split("_")[0] : "Label"}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
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
                    Showing {payments.length} of {totalPayments} payments
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={!hasPreviousPage}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                        !hasPreviousPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
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

