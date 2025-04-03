"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Bed, Bath, Square, Heart, Share2, Zap, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { useAuth } from "@/contexts/auth-context"
import { PropertyCard } from "@/components/property-card"
import { propertiesService, type Property } from "@/services/properties"
import { ImageGallery } from "@/components/image-gallery"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0)

  useEffect(() => {
    const fetchPropertyData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const propertyId = params.id
        if (!propertyId) {
          router.push("/properties")
          return
        }

        const propertyData = await propertiesService.getProperty(propertyId)
        setProperty(propertyData)

        if (user) {
          setIsFavorite(propertyData.is_favorited || false)
        } else {
          const isLocalFavorite = propertiesService.isPropertyFavorited(Number(propertyId))
          setIsFavorite(isLocalFavorite)
        }

        const filters: any = {
          property_type: propertyData.property_type,
        }
        const response = await propertiesService.getProperties(filters)
        const filteredProperties = response.results.filter((p) => p.id !== propertyData.id).slice(0, 3)
        setSimilarProperties(filteredProperties)
      } catch (err) {
        console.error("Failed to fetch property:", err)
        setError("Failed to load property details")
        toast({
          title: "Error",
          description: "Failed to load property details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyData()
  }, [params.id, router, toast, user])

  // Sync local favorites to server after login
  useEffect(() => {
    if (user) {
      propertiesService.syncLocalFavoritesToServer()
    }
  }, [user])

  const handleToggleFavorite = async () => {
    if (!property) return

    try {
      const result = await propertiesService.toggleFavorite(property.id)

      // Determine if the property is now favorited based on the response
      const newFavoriteState = result.id !== undefined || result.action === "added"
      setIsFavorite(newFavoriteState)

      toast({
        title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: newFavoriteState
          ? `${property.title} has been added to your favorites`
          : `${property.title} has been removed from your favorites`,
      })
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBookNow = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    if (!property) return

    // Get current date for default check-in date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    // Default to 3 days stay
    const checkoutDate = new Date(tomorrow)
    checkoutDate.setDate(checkoutDate.getDate() + 3)
    const checkoutStr = checkoutDate.toISOString().split("T")[0]

    router.push(`/bookings/confirm?propertyId=${property.id}&checkIn=${tomorrowStr}&checkOut=${checkoutStr}`)
  }

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    })
      .format(numericPrice)
      .replace("NGN", "₦")
  }

  const openGallery = (index: number) => {
    setGalleryInitialIndex(index)
    setIsGalleryOpen(true)
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedThumbnailIndex(index)
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading property details...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !property) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500">{error || "Property not found"}</p>
          <button onClick={() => router.push("/properties")} className="mt-4 text-primary hover:text-primary-600">
            Browse other properties
          </button>
        </div>
        <Footer />
      </>
    )
  }

  // Get all images
  const allImages = property.images || []
  const mainImageUrl =
    property.main_image_url || (allImages.length > 0 ? allImages[0].image_url : "/placeholder.svg?height=600&width=800")

  // Create an array of all image URLs for the gallery
  const galleryImages = [mainImageUrl, ...allImages.filter((img) => !img.is_main).map((img) => img.image_url)]

  // Get the currently displayed main image based on selected thumbnail
  const displayedMainImage =
    selectedThumbnailIndex === 0
      ? mainImageUrl
      : allImages.filter((img) => !img.is_main)[selectedThumbnailIndex - 1]?.image_url || mainImageUrl

  return (
    <>
      <Navigation />

      <main className="py-8 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#374027] hover:text-primary font-semibold text-[16px] mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-[40px] tracking-tight text-[#1C1B20] font-bold mb-1">{property.title}</h1>
                <p className="text-[#000929] font-medium text-[18px]">{property.address || property.location}</p>
              </div>

              <div className="flex mt-4 md:mt-0 gap-2">
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-[#F6F9EA] w-[125px] h-[50px] justify-center rounded-[8px] border border-[#D6DDB9] hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast({
                      title: "Link Copied",
                      description: "Property link copied to clipboard",
                    })
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                <button
                  className={`flex items-center gap-1 px-4 py-2 w-[125px] h-[50px] justify-center rounded-[8px] transition-colors ${
                    isFavorite
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#F6F9EA] hover:bg-gray-200 border border-[#D6DDB9]"
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                  <span>Favorite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="mb-8 p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
              {/* Main large image */}
              <div className="md:col-span-2 relative">
                <div
                  className="cursor-pointer"
                  onClick={() => openGallery(selectedThumbnailIndex)}
                  style={{ height: "556px", borderRadius: "12px", overflow: "hidden" }}
                >
                  <img
                    src={displayedMainImage || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Thumbnails container */}
              <div className="grid grid-rows-2 gap-[10px] p-[10px]">
                {/* Main image thumbnail */}
                <div
                  className={`cursor-pointer ${selectedThumbnailIndex === 0 ? "ring-2 ring-primary" : ""}`}
                  onClick={() => handleThumbnailClick(0)}
                  style={{ width: "342px", height: "260px", borderRadius: "8px", overflow: "hidden" }}
                >
                  <img
                    src={mainImageUrl || "/placeholder.svg"}
                    alt={`${property.title} main`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Second thumbnail */}
                {allImages.filter((img) => !img.is_main).length > 0 ? (
                  <div
                    className={`cursor-pointer ${selectedThumbnailIndex === 1 ? "ring-2 ring-primary" : ""}`}
                    onClick={() => handleThumbnailClick(1)}
                    style={{ width: "342px", height: "260px", borderRadius: "8px", overflow: "hidden" }}
                  >
                    <img
                      src={allImages.filter((img) => !img.is_main)[0]?.image_url || "/placeholder.svg"}
                      alt={`${property.title} 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    style={{ width: "342px", height: "260px", borderRadius: "8px", overflow: "hidden" }}
                  >
                    <img src="/placeholder.svg" alt="Placeholder" className="w-full h-full object-cover" />
                  </div>
                )}

                {allImages.filter((img) => !img.is_main).length > 2 && (
                  <button
                    className="absolute bottom-4 right-6 bg-white/80 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <Camera className="h-4 w-4" />
                    View all photos
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="border rounded-lg mb-6">
            <div className="flex justify-between items-center p-4">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(property.price)} <span className="text-sm font-normal text-gray-500">/per day</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {property.is_available ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Unavailable
                  </span>
                )}
                <button
                  onClick={handleBookNow}
                  disabled={!property.is_available}
                  className={`py-2 px-4 rounded-md text-white text-sm font-medium ${
                    property.is_available ? "bg-[#66773B] hover:bg-[#5c6a35]" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* About Section */}
            <div className="border rounded-lg">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">About Shortlet</h2>
                <p className="text-gray-700 mb-6">
                  {property.description ||
                    "Discover your own piece of paradise with the Seaside Serenity Villa. With an open floor plan, breathtaking ocean views from every room, and direct access to a pristine sandy beach, this property is the epitome of coastal living."}
                </p>

                <div className="flex border-t pt-4">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Bed className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-500 text-sm">Bedrooms</span>
                    </div>
                    <span className="text-lg font-bold">{property.bedrooms.toString().padStart(2, "0")}</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Bath className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-500 text-sm">Bathrooms</span>
                    </div>
                    <span className="text-lg font-bold">{property.bathrooms.toString().padStart(2, "0")}</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Square className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-500 text-sm">Area</span>
                    </div>
                    <span className="text-lg font-bold">
                      {property.area ? `${property.area} m²` : "4 x 5 meter ft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div className="border rounded-lg">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Key Features and Amenities</h2>
                <div className="space-y-4">
                  {property.features && property.features.length > 0 ? (
                    property.features.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-3">
                        <div className="mt-1 text-[#66773B]">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          {feature.description && <p className="text-gray-600 text-sm">{feature.description}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#66773B]">
                          <Zap className="h-5 w-5" />
                        </div>
                        <p>Expansive oceanfront terrace for outdoor entertaining</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#66773B]">
                          <Zap className="h-5 w-5" />
                        </div>
                        <p>Luxurious penthouse suite with panoramic city views</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#66773B]">
                          <Zap className="h-5 w-5" />
                        </div>
                        <p>State-of-the-art fitness center with modern equipment</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border rounded-lg mb-8">
            <div className="p-4">
              <h3 className="font-medium mb-4">You want to talk to us?</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/placeholder.svg?height=40&width=40" alt="Staff" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">Damilola David</p>
                    <p className="text-sm text-gray-500">Staff at MJ's Haven</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                    onClick={() => {
                      toast({
                        title: "Question",
                        description: "Your question has been sent to our staff.",
                      })
                    }}
                  >
                    Ask a question
                  </button>
                  <button
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                    onClick={() => {
                      toast({
                        title: "Info",
                        description: "More information has been sent to your email.",
                      })
                    }}
                  >
                    Get more info
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties Section */}
          {similarProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map((similarProperty) => (
                  <PropertyCard
                    key={similarProperty.id}
                    id={similarProperty.id}
                    title={similarProperty.title}
                    price={Number.parseFloat(similarProperty.price)}
                    address={
                      similarProperty.address || similarProperty.location.split(",")[0] || similarProperty.location
                    }
                    area={similarProperty.location.split(",")[1] || ""}
                    city={similarProperty.location.split(",")[2] || ""}
                    beds={similarProperty.bedrooms}
                    baths={similarProperty.bathrooms}
                    size={similarProperty.area ? `${similarProperty.area} m²` : "N/A"}
                    imageUrl={similarProperty.main_image_url}
                    isFavorite={similarProperty.is_favorited}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Image Gallery Modal */}
      <ImageGallery
        images={galleryImages}
        isOpen={isGalleryOpen}
        initialIndex={galleryInitialIndex}
        onClose={() => setIsGalleryOpen(false)}
      />

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

