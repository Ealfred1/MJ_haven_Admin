"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Info, ArrowLeft, Check, Clock, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { propertiesService, type Property } from "@/services/properties"
import { bookingsService } from "@/services/bookings"
import { motion, AnimatePresence } from "framer-motion"
import { differenceInDays, format, addDays } from "date-fns"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [nights, setNights] = useState(1)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("flutterwave")
  const [isPropertyLoading, setIsPropertyLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [minCheckOutDate, setMinCheckOutDate] = useState("")

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setIsLoginModalOpen(true)
      return
    } else {
      setFullName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
    }

    // Get property ID from URL
    const propertyId = searchParams.get("propertyId")
    if (!propertyId) {
      router.push("/properties")
      return
    }

    // Get check-in and check-out dates from URL if available
    const checkInParam = searchParams.get("checkIn")
    const checkOutParam = searchParams.get("checkOut")

    if (checkInParam) {
      setCheckInDate(checkInParam)
      // Set minimum check-out date to be the day after check-in
      const nextDay = addDays(new Date(checkInParam), 1)
      setMinCheckOutDate(format(nextDay, "yyyy-MM-dd"))
    } else {
      // Set default check-in date to today
      const today = new Date()
      setCheckInDate(format(today, "yyyy-MM-dd"))
      // Set minimum check-out date to tomorrow
      const tomorrow = addDays(today, 1)
      setMinCheckOutDate(format(tomorrow, "yyyy-MM-dd"))
    }

    if (checkOutParam) {
      setCheckOutDate(checkOutParam)

      // Calculate nights if both dates are provided
      if (checkInParam) {
        const days = differenceInDays(new Date(checkOutParam), new Date(checkInParam))
        if (days > 0) setNights(days)
      }
    }

    // Fetch property details
    fetchPropertyDetails(propertyId)
  }, [searchParams, router, user])

  const fetchPropertyDetails = async (propertyId: string) => {
    setIsPropertyLoading(true)
    try {
      const propertyData = await propertiesService.getProperty(propertyId)
      setProperty(propertyData)
    } catch (error) {
      console.error("Failed to fetch property:", error)
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again.",
        variant: "destructive",
      })
      router.push("/properties")
    } finally {
      setIsPropertyLoading(false)
    }
  }

  // Update nights and min check-out date when check-in date changes
  useEffect(() => {
    if (checkInDate) {
      const nextDay = addDays(new Date(checkInDate), 1)
      setMinCheckOutDate(format(nextDay, "yyyy-MM-dd"))

      // If check-out date is already set, recalculate nights
      if (checkOutDate) {
        const start = new Date(checkInDate)
        const end = new Date(checkOutDate)

        if (end > start) {
          const days = differenceInDays(end, start)
          setNights(days)
        } else {
          // If check-out is before or same as check-in, reset check-out
          setCheckOutDate("")
        }
      }
    }
  }, [checkInDate])

  // Update nights when check-out date changes
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)

      if (end > start) {
        const days = differenceInDays(end, start)
        setNights(days)
      }
    }
  }, [checkOutDate, checkInDate])

  const handlePayNow = async () => {
    if (!checkInDate || !checkOutDate || !fullName || !email || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!property) {
      toast({
        title: "Error",
        description: "Property details not available",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setBookingError(null)

    try {
      // Create booking
      const bookingData = {
        property: property.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests: 2, // Default to 2 guests
        payment_method: paymentMethod,
        notes: `Booking for ${nights} nights`,
      }

      const booking = await bookingsService.createBooking(bookingData)

      // Process payment
      const paymentResponse = await bookingsService.processPayment(booking.id)

      // Redirect to payment page
      if (paymentResponse.payment_link) {
        setBookingSuccess(true)
        // Short delay before redirecting to payment page
        setTimeout(() => {
          window.location.href = paymentResponse.payment_link
        }, 1500)
      } else {
        throw new Error("Payment link not received")
      }
    } catch (error) {
      console.error("Booking failed:", error)
      setBookingError(typeof error === "string" ? error : "Failed to create booking. Please try again.")
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total price based on property duration
  const calculatePrice = () => {
    if (!property) return { basePrice: 0, tax: 0, total: 0 }

    // Convert property price to number
    const propertyPrice = Number(property.price)
    let basePrice = 0

    // Calculate base price based on property duration
    if (property.duration === "per_day") {
      // For per day properties, multiply price by nights
      basePrice = propertyPrice * nights
    } else if (property.duration === "per_week") {
      // For per week properties, calculate weeks and multiply
      const weeks = nights / 7
      basePrice = propertyPrice * weeks
    } else if (property.duration === "per_month") {
      // For per month properties, calculate months (assuming 30 days per month) and multiply
      const months = nights / 30
      basePrice = propertyPrice * months
    }

    // Round to 2 decimal places
    basePrice = Math.round(basePrice * 100) / 100

    // Calculate tax (5% of base price)
    const tax = basePrice * 0.20

    // Calculate total
    const total = basePrice + tax

    return { basePrice, tax, total }
  }

  const { basePrice, tax, total } = calculatePrice()

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("NGN", "₦")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "MMMM d, yyyy")
  }

  if (isPropertyLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href="/properties" className="hover:text-primary">
                Properties
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/properties/${property?.id}`} className="hover:text-primary">
                Property Details
              </Link>
              <span className="mx-2">/</span>
              <span>Booking</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Confirm your booking</h1>
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - User Details */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-white p-6 rounded-xl mb-6 backdrop-blur-sm bg-white/80 border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Your Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
                      Check In date*
                    </label>
                    <div className="relative">
                      <input
                        id="check-in"
                        type="date"
                        value={checkInDate}
                        min={format(new Date(), "yyyy-MM-dd")}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        required
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
                      Check Out date*
                    </label>
                    <div className="relative">
                      <input
                        id="check-out"
                        type="date"
                        value={checkOutDate}
                        min={minCheckOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        required
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Enter your Full Name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Enter your Email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Enter your Phone Number"
                    required
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl backdrop-blur-sm bg-white/80 border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === "flutterwave"
                        ? "border-primary bg-primary-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="flutterwave"
                        checked={paymentMethod === "flutterwave"}
                        onChange={() => setPaymentMethod("flutterwave")}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium">Flutterwave</span>
                        <span className="text-xs text-gray-500">Pay securely with credit/debit card</span>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-primary" />
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === "paystack" ? "border-primary bg-primary-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        onChange={() => setPaymentMethod("paystack")}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium">Paystack</span>
                        <span className="text-xs text-gray-500">Fast and secure payments</span>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-primary" />
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Booking Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-white p-6 rounded-xl backdrop-blur-sm bg-white/80 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

                {property && (
                  <>
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={property.main_image_url || "/placeholder.svg?height=300&width=400"}
                        alt={property.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-lg font-bold">{property.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1 mb-2">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{property.address || property.location}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">{checkInDate ? formatDate(checkInDate) : "Select check-in"}</span>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="flex items-center gap-1 text-gray-700">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">{checkOutDate ? formatDate(checkOutDate) : "Select check-out"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {nights} {nights === 1 ? "night" : "nights"} · {property.duration_display}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-bold mb-2">Price Details</h4>
                      <div className="flex justify-between mb-2">
                        <span>
                          {formatPrice(Number(property.price))} {property.duration_display.toLowerCase()}
                          {property.duration === "per_day"
                            ? ` × ${nights} nights`
                            : property.duration === "per_week"
                              ? ` × ${(nights / 7).toFixed(2)} weeks`
                              : ` × ${(nights / 30).toFixed(2)} months`}
                        </span>
                        <span>{formatPrice(basePrice)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span>Tax (5%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {bookingSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                        >
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">Booking Successful!</p>
                            <p className="text-sm text-green-700">Redirecting to payment page...</p>
                          </div>
                        </motion.div>
                      ) : bookingError ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <p className="text-red-700">{bookingError}</p>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePayNow}
                          disabled={isSubmitting || !checkInDate || !checkOutDate}
                          className="w-full bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Proceed to Payment"
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <div className="mt-6 flex items-start gap-2 text-sm text-gray-600">
                      <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>
                        <span className="font-medium">Cancellation Policy:</span> Free cancellation before 1:00 PM on
                        the day of check-in for a partial refund.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

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

