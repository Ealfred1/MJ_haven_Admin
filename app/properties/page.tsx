"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { formatCurrency } from "@/lib/utils"
import {
  Search,
  Filter,
  Plus,
  Bed,
  Bath,
  Square,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { PropertyModal } from "@/components/property-modal"
import { FeatureModal } from "@/components/feature-modal"
import api from "@/services/api"
import { useToast } from "@/hooks/use-toast"

interface PropertyImage {
  id: number
  image_url: string
  is_main: boolean
  is_video?: boolean
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
  address: string
  bedrooms: number
  bathrooms: number
  area: string | null
  is_available: boolean
  main_image_url: string
  images: PropertyImage[]
  features?: any[]
  created_at: string
  is_favorited?: boolean
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export default function PropertiesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPropertyDetailLoading, setIsPropertyDetailLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalProperties, setTotalProperties] = useState(0)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchProperties = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())

      if (search) {
        params.append("search", search)
      }

      const response = await api.get<PaginatedResponse<Property>>(`/api/properties/?${params.toString()}`)

      setProperties(response.data.results)
      setTotalProperties(response.data.count)
      setHasNextPage(!!response.data.next)
      setHasPreviousPage(!!response.data.previous)

      // Calculate total pages
      const pageSize = response.data.results.length
      const totalPages = pageSize > 0 ? Math.ceil(response.data.count / pageSize) : 1
      setTotalPages(totalPages)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties(currentPage, searchTerm)
  }, [currentPage])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    fetchProperties(1, searchTerm)
  }

  const handleOpenPropertyModal = (property: Property | null = null) => {
    if (property) {
      // Fetch full property details including images
      fetchPropertyDetails(property.id)
    } else {
      setSelectedProperty(null)
      setIsPropertyModalOpen(true)
    }
  }

  const fetchPropertyDetails = async (propertyId: number) => {
    setIsPropertyDetailLoading(true)
    try {
      const response = await api.get<Property>(`/api/properties/${propertyId}/`)
      setSelectedProperty(response.data)
      setIsPropertyModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch property details:", error)
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPropertyDetailLoading(false)
    }
  }

  const handlePropertyCreated = () => {
    // Refresh the properties list after creating a new property
    fetchProperties(currentPage, searchTerm)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const toggleDropdown = (propertyId: number) => {
    if (activeDropdown === propertyId) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(propertyId)
    }
  }

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/api/properties/${propertyId}/`)

      toast({
        title: "Success",
        description: "Property deleted successfully",
      })

      // Refresh the properties list
      fetchProperties(currentPage, searchTerm)
    } catch (error) {
      console.error("Failed to delete property:", error)
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddFeatures = (property: Property) => {
    setSelectedProperty(property)
    setIsFeatureModalOpen(true)
    setActiveDropdown(null)
  }

  const handleEditProperty = (property: Property) => {
    handleOpenPropertyModal(property)
    setActiveDropdown(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/dashboard" className="hover:text-primary">
                  Home
                </Link>
                <span>/</span>
                <Link href="/properties" className="hover:text-primary">
                  Properties
                </Link>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">Manage Properties</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage all property, booking, payment, and user management 😊
              </p>
            </div>

            <button
              onClick={() => handleOpenPropertyModal()}
              className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors w-full md:w-auto"
              disabled={isPropertyDetailLoading}
            >
              {isPropertyDetailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add New Property
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex items-center">
                <span className="font-medium mr-2">Properties:</span>
                <span>{totalProperties}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    size={18}
                    onClick={handleSearch}
                  />
                </div>

                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <img src="/placeholder.svg?height=120&width=120" alt="No properties" className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-gray-500 mb-6">
                  Click "add new property" button to get started in adding your first property to your platform.
                </p>
                <button
                  onClick={() => handleOpenPropertyModal()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors mx-auto"
                  disabled={isPropertyDetailLoading}
                >
                  {isPropertyDetailLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add New Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={property.main_image_url || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => handleOpenPropertyModal(property)}
                          className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
                          title="View property"
                          disabled={isPropertyDetailLoading}
                        >
                          {isPropertyDetailLoading ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                        <div className="relative" ref={dropdownRef}>
                          <button
                            className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
                            onClick={() => toggleDropdown(property.id)}
                            disabled={isPropertyDetailLoading}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>

                          {activeDropdown === property.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditProperty(property)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  disabled={isPropertyDetailLoading}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Property
                                </button>
                                <button
                                  onClick={() => handleAddFeatures(property)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  disabled={isPropertyDetailLoading}
                                >
                                  <PlusCircle className="h-4 w-4 mr-2" />
                                  Add Features
                                </button>
                                <button
                                  onClick={() => handleDeleteProperty(property.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  disabled={isPropertyDetailLoading}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Property
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{formatCurrency(Number(property.price))}</h3>
                        <span className="text-xs bg-primary-100 text-primary px-2 py-1 rounded-full">
                          {property.duration_display}
                        </span>
                      </div>

                      <h4 className="font-medium mb-1 line-clamp-1">{property.title}</h4>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-1">{property.location}</p>

                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{property.bedrooms} Beds</span>
                        </div>

                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{property.bathrooms} Bathrooms</span>
                        </div>

                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{property.area || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && properties.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage || isLoading}
                    className={`px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500 ${!hasPreviousPage || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center overflow-x-auto">
                    {/* Generate page buttons */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum = currentPage - 2 + i

                      // Adjust if we're at the beginning or end
                      if (currentPage < 3) {
                        pageNum = i + 1
                      } else if (currentPage > totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      }

                      // Skip if page number is out of range
                      if (pageNum < 1 || pageNum > totalPages) {
                        return null
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 ${
                            currentPage === pageNum
                              ? "bg-primary text-white rounded-md"
                              : "border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500"
                          }`}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {/* Show ellipsis if there are more pages */}
                    {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

                    {/* Show last page if not visible in the range */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500"
                        disabled={isLoading}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage || isLoading}
                    className={`px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500 ${!hasNextPage || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Next
                  </button>
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

      {/* Feature Modal */}
      {selectedProperty && (
        <FeatureModal
          isOpen={isFeatureModalOpen}
          onClose={() => setIsFeatureModalOpen(false)}
          propertyId={selectedProperty.id}
          onSuccess={handlePropertyCreated}
        />
      )}
    </div>
  )
}

