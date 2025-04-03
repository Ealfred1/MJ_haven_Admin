"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { PropertyCard } from "@/components/property-card"
import { Mail, Pencil, Upload, Calendar, CheckCircle, Clock, AlertTriangle, Heart } from "lucide-react"
import { propertiesService, type Property } from "@/services/properties"
import { bookingsService, type Booking } from "@/services/bookings"
import api from "@/services/api"
import { motion, AnimatePresence } from "framer-motion"

interface Transaction extends Booking {
  payments: {
    id: number
    booking_id: string
    property_title: string
    amount: string
    status: string
    tx_ref: string
    payment_reference: string
    created_at: string
    updated_at: string
  }[]
}

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("saved")
  const [isEditMode, setIsEditMode] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/")
    } else if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user, isLoading, router])

  // Fetch saved properties
  useEffect(() => {
    if (user && activeTab === "saved") {
      fetchSavedProperties()
    }
  }, [user, activeTab])

  // Fetch transactions
  useEffect(() => {
    if (user && activeTab === "transactions") {
      fetchTransactions()
    }
  }, [user, activeTab])

  const fetchSavedProperties = async () => {
    if (!user) return

    setIsLoadingProperties(true)
    try {
      // Fetch favorites
      const favorites = await propertiesService.getFavorites()

      // Fetch full property details for each favorite
      const propertyPromises = favorites.map(async (favorite) => {
        try {
          return await propertiesService.getProperty(favorite.property_details.id)
        } catch (error) {
          console.error(`Failed to fetch property ${favorite.property_details.id}:`, error)
          return null
        }
      })

      const properties = await Promise.all(propertyPromises)
      setSavedProperties(properties.filter(Boolean) as Property[])
    } catch (error) {
      console.error("Failed to fetch saved properties:", error)
      toast({
        title: "Error",
        description: "Failed to load saved properties",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProperties(false)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return

    setIsLoadingTransactions(true)
    try {
      const response = await bookingsService.getTransactions()
      setTransactions(response)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    const success = await updateProfile({ name, email })
    setIsUpdating(false)

    if (success) {
      setIsEditMode(false)
      toast({
        title: "Success",
        description: "Your profile has been updated",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("profile_image", file)

      await api.post("/api/users/update_profile_image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Refresh user data to get the new profile image
      await updateProfile({ name, email })

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      })
    } catch (error) {
      console.error("Failed to upload profile image:", error)
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading || !user) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative group">
                  <div
                    onClick={handleProfileImageClick}
                    className={`w-32 h-32 rounded-full overflow-hidden cursor-pointer relative ${isUploading ? "opacity-70" : ""}`}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage || "/placeholder.svg"}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300">
                    <Upload className="h-8 w-8 text-white" />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  {isEditMode ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="px-5 py-3 bg-primary text-white rounded-lg font-medium transition-colors hover:bg-primary-600 disabled:opacity-70"
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsEditMode(false)
                            setName(user.name)
                            setEmail(user.email)
                          }}
                          className="px-5 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                        <div className="flex items-center text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{user.email || "N/A"}</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditMode(true)}
                        className="mt-4 md:mt-0 px-5 py-2 border border-primary text-primary rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Profile
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t">
              <div className="flex overflow-x-auto">
                <motion.button
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  onClick={() => setActiveTab("saved")}
                  className={`px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "saved"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Saved Properties
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  onClick={() => setActiveTab("transactions")}
                  className={`px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "transactions"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Transaction History
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  onClick={() => setActiveTab("activities")}
                  className={`px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "activities"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Activities
                </motion.button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLoadingProperties ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : savedProperties.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No saved properties yet</h2>
                    <p className="text-gray-500 mb-6">Properties you save will appear here for easy access.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/properties")}
                      className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                      Browse Properties
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <PropertyCard
                          id={property.id}
                          title={property.title}
                          price={Number.parseFloat(property.price)}
                          address={property.address || property.location.split(",")[0] || property.location}
                          area={property.location.split(",")[1] || ""}
                          city={property.location.split(",")[2] || ""}
                          beds={property.bedrooms}
                          baths={property.bathrooms}
                          size={property.area ? `${property.area} m²` : "N/A"}
                          imageUrl={property.main_image_url}
                          isFavorite={true}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "transactions" && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              > 
                {isLoadingTransactions ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No transactions yet</h2>
                    <p className="text-gray-500 mb-6">Your booking transactions will appear here.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/properties")}
                      className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                      Browse Properties
                    </motion.button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.property_detail?.title || "Unknown Property"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                maximumFractionDigits: 0,
                              })
                                .format(Number(transaction.total_price))
                                .replace("NGN", "₦")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : transaction.status === "cancelled" || transaction.status === "canceled"
                                      ? "bg-red-100 text-red-800"
                                      : transaction.status === "confirmed"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "activities" && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Booking Confirmed</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your booking for 2 Bedroom Room has been confirmed. Check-in date: May 15, 2023
                      </p>
                      <p className="text-xs text-gray-400 mt-2">2 days ago</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Payment Successful</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your payment of ₦200,095 for 2 Bedroom Room has been processed successfully.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">2 days ago</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Property Viewed</p>
                      <p className="text-sm text-gray-600 mt-1">You viewed 3 Bedroom Flat property details.</p>
                      <p className="text-xs text-gray-400 mt-2">5 days ago</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </>
  )
}

