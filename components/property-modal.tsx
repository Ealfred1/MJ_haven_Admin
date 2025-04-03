"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Upload, MapPin, Home, Plus, Trash2, Image, Check, Loader2, FileVideo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"

interface PropertyImage {
  id: number
  image_url: string
  is_main: boolean
  is_video?: boolean
}

interface Property {
  id?: number
  title?: string
  description?: string
  property_type?: string
  property_type_display?: string
  price?: string
  duration?: string
  duration_display?: string
  location?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  bedrooms?: number
  bathrooms?: number
  area?: string | null
  is_available?: boolean
  main_image_url?: string
  images?: PropertyImage[]
  features?: any[]
  is_favorited?: boolean
  created_at?: string
  updated_at?: string
  owner?: number
}

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  onSuccess?: () => void
}

export function PropertyModal({ isOpen, onClose, property, onSuccess }: PropertyModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [propertyType, setPropertyType] = useState("house")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("per_day")
  const [location, setLocation] = useState("")
  const [address, setAddress] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [area, setArea] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState("")
  const [mainImageId, setMainImageId] = useState<number | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
    { url: string; id?: number; isVideo?: boolean }[]
  >([])
  const [videos, setVideos] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<{ url: string; id?: number }[]>([])
  const [clearImages, setClearImages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [isPropertyLoading, setIsPropertyLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const additionalImagesInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Reset form when modal opens/closes or property changes
  useEffect(() => {
    if (isOpen && property) {
      setIsPropertyLoading(true)

      // Fetch the latest property data
      if (property.id) {
        fetchPropertyDetails(property.id)
      } else {
        initializeFormWithProperty(property)
        setIsPropertyLoading(false)
      }
    } else if (isOpen && !property) {
      // Reset form for new property
      resetForm()
    }
  }, [isOpen, property])

  const fetchPropertyDetails = async (propertyId: number) => {
    try {
      const response = await api.get<Property>(`/api/properties/${propertyId}/`)
      initializeFormWithProperty(response.data)
    } catch (error) {
      console.error("Failed to fetch property details:", error)
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPropertyLoading(false)
    }
  }

  const initializeFormWithProperty = (propertyData: Property) => {
    setTitle(propertyData.title || "")
    setDescription(propertyData.description || "")
    setPropertyType(propertyData.property_type || "house")
    setPrice(propertyData.price || "")
    setDuration(propertyData.duration || "per_day")
    setLocation(propertyData.location || "")
    setAddress(propertyData.address || "")
    setBedrooms(propertyData.bedrooms?.toString() || "")
    setBathrooms(propertyData.bathrooms?.toString() || "")
    setArea(propertyData.area || "")
    setIsAvailable(propertyData.is_available !== undefined ? propertyData.is_available : true)
    setClearImages(false)

    // Reset file inputs
    setMainImage(null)
    setVideos([])

    // Set main image preview from property
    if (propertyData.images && propertyData.images.length > 0) {
      const mainImg = propertyData.images.find((img) => img.is_main)
      if (mainImg) {
        setMainImagePreview(mainImg.image_url)
        setMainImageId(mainImg.id)
      } else {
        setMainImagePreview(propertyData.main_image_url || "")
        setMainImageId(null)
      }

      // Set additional images and videos
      const nonMainImages = propertyData.images.filter((img) => !img.is_main)

      // Separate videos from images
      const videoItems = nonMainImages.filter((img) => img.is_video)
      const imageItems = nonMainImages.filter((img) => !img.is_video)

      setAdditionalImagePreviews(imageItems.map((img) => ({ url: img.image_url, id: img.id })))

      setVideoPreviews(videoItems.map((video) => ({ url: video.image_url, id: video.id })))
    } else {
      setMainImagePreview(propertyData.main_image_url || "")
      setMainImageId(null)
      setAdditionalImagePreviews([])
      setVideoPreviews([])
    }

    // Reset new images and videos
    setAdditionalImages([])
    setVideos([])
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPropertyType("house")
    setPrice("")
    setDuration("per_day")
    setLocation("")
    setAddress("")
    setBedrooms("")
    setBathrooms("")
    setArea("")
    setIsAvailable(true)
    setMainImage(null)
    setMainImagePreview("")
    setMainImageId(null)
    setAdditionalImages([])
    setAdditionalImagePreviews([])
    setVideos([])
    setVideoPreviews([])
    setClearImages(false)
    setUploadProgress({})
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (max 50MB for images)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 50MB",
          variant: "destructive",
        })
        return
      }

      setMainImage(file)
      setMainImagePreview(URL.createObjectURL(file))
      setMainImageId(null) // Reset main image ID since we're uploading a new one
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)

      // Check each file size (max 50MB for images)
      const validFiles = filesArray.filter((file) => {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Warning",
            description: `Image ${file.name} is larger than 50MB and will be skipped`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      setAdditionalImages((prev) => [...prev, ...validFiles])

      const newPreviews = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
      }))

      setAdditionalImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)

      // Check each file size (max 50MB for videos)
      const validFiles = filesArray.filter((file) => {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Warning",
            description: `Video ${file.name} is larger than 50MB and will be skipped`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      setVideos((prev) => [...prev, ...validFiles])

      const newPreviews = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
      }))

      setVideoPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeAdditionalImage = async (index: number) => {
    const imageToRemove = additionalImagePreviews[index]

    // If this is an existing image with an ID, delete it from the server
    if (imageToRemove.id && property?.id) {
      setIsImageLoading(true)
      try {
        await api.delete(`/api/properties/${property.id}/delete_image/`, {
          data: { image_id: imageToRemove.id },
        })

        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
      } catch (error) {
        console.error("Failed to delete image:", error)
        toast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
          variant: "destructive",
        })
        setIsImageLoading(false)
        return
      }
      setIsImageLoading(false)
    }

    // Remove from previews
    setAdditionalImagePreviews((prev) => {
      const newPreviews = [...prev]
      newPreviews.splice(index, 1)
      return newPreviews
    })

    // If it's a new image, remove it from the additionalImages array
    if (!imageToRemove.id) {
      const newImageIndex = additionalImagePreviews.slice(0, index).filter((img) => !img.id).length

      setAdditionalImages((prev) => {
        const newImages = [...prev]
        newImages.splice(newImageIndex, 1)
        return newImages
      })
    }
  }

  const removeVideo = async (index: number) => {
    const videoToRemove = videoPreviews[index]

    // If this is an existing video with an ID, delete it from the server
    if (videoToRemove.id && property?.id) {
      setIsImageLoading(true)
      try {
        await api.delete(`/api/properties/${property.id}/delete_image/`, {
          data: { image_id: videoToRemove.id },
        })

        toast({
          title: "Success",
          description: "Video deleted successfully",
        })
      } catch (error) {
        console.error("Failed to delete video:", error)
        toast({
          title: "Error",
          description: "Failed to delete video. Please try again.",
          variant: "destructive",
        })
        setIsImageLoading(false)
        return
      }
      setIsImageLoading(false)
    }

    // Remove from previews
    setVideoPreviews((prev) => {
      const newPreviews = [...prev]
      newPreviews.splice(index, 1)
      return newPreviews
    })

    // If it's a new video, remove it from the videos array
    if (!videoToRemove.id) {
      const newVideoIndex = videoPreviews.slice(0, index).filter((video) => !video.id).length

      setVideos((prev) => {
        const newVideos = [...prev]
        newVideos.splice(newVideoIndex, 1)
        return newVideos
      })
    }
  }

  const handleDeleteMainImage = async () => {
    if (mainImageId && property?.id) {
      setIsImageLoading(true)
      try {
        await api.delete(`/api/properties/${property.id}/delete_image/`, {
          data: { image_id: mainImageId },
        })

        toast({
          title: "Success",
          description: "Main image deleted successfully",
        })

        // Reset main image
        setMainImagePreview("")
        setMainImageId(null)

        // Refresh property data to get the new main image if one was automatically set
        const response = await api.get<Property>(`/api/properties/${property.id}/`)

        if (response.data.main_image_url) {
          setMainImagePreview(response.data.main_image_url)
          const mainImg = response.data.images?.find((img) => img.is_main)
          if (mainImg) {
            setMainImageId(mainImg.id)
          }
        }

        // Update additional images
        if (response.data.images) {
          const nonMainImages = response.data.images.filter((img) => !img.is_main && !img.is_video)
          setAdditionalImagePreviews(nonMainImages.map((img) => ({ url: img.image_url, id: img.id })))

          const videoItems = response.data.images.filter((img) => img.is_video)
          setVideoPreviews(videoItems.map((video) => ({ url: video.image_url, id: video.id })))
        }
      } catch (error) {
        console.error("Failed to delete main image:", error)
        toast({
          title: "Error",
          description: "Failed to delete main image. Please try again.",
          variant: "destructive",
        })
      }
      setIsImageLoading(false)
    } else {
      // Just clear the preview for a new image
      setMainImage(null)
      setMainImagePreview("")
    }
  }

  const setImageAsMain = async (index: number) => {
    const imageToSetAsMain = additionalImagePreviews[index]

    if (imageToSetAsMain.id && property?.id) {
      setIsImageLoading(true)
      try {
        await api.post(`/api/properties/${property.id}/set_main_image/`, {
          image_id: imageToSetAsMain.id,
        })

        toast({
          title: "Success",
          description: "Main image updated successfully",
        })

        // Update UI
        const oldMainImageUrl = mainImagePreview
        const oldMainImageId = mainImageId

        // Set the selected image as main
        setMainImagePreview(imageToSetAsMain.url)
        setMainImageId(imageToSetAsMain.id)

        // Remove from additional images
        setAdditionalImagePreviews((prev) => {
          const newPreviews = [...prev]
          newPreviews.splice(index, 1)

          // If there was a previous main image, add it to additional images
          if (oldMainImageUrl && oldMainImageId) {
            newPreviews.push({ url: oldMainImageUrl, id: oldMainImageId })
          }

          return newPreviews
        })
      } catch (error) {
        console.error("Failed to set main image:", error)
        toast({
          title: "Error",
          description: "Failed to set main image. Please try again.",
          variant: "destructive",
        })
      }
      setIsImageLoading(false)
    }
  }

  const handleClearAllImages = () => {
    if (confirm("Are you sure you want to clear all images and videos? This cannot be undone.")) {
      setMainImage(null)
      setMainImagePreview("")
      setMainImageId(null)
      setAdditionalImages([])
      setAdditionalImagePreviews([])
      setVideos([])
      setVideoPreviews([])
      setClearImages(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !price || !location || !address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress({})

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("property_type", propertyType)
      formData.append("price", price)
      formData.append("duration", duration)
      formData.append("location", location)
      formData.append("address", address)

      if (bedrooms) formData.append("bedrooms", bedrooms)
      if (bathrooms) formData.append("bathrooms", bathrooms)
      if (area) formData.append("area", area)

      formData.append("is_available", isAvailable.toString())

      // Handle images
      if (clearImages) {
        formData.append("clear_images", "true")
      }

      // Add main image if changed
      if (mainImage) {
        formData.append("main_image", mainImage)
      }

      // Add additional images
      additionalImages.forEach((image, index) => {
        formData.append("images", image)
      })

      // Add videos
      videos.forEach((video, index) => {
        formData.append("videos", video)
      })

      let response

      if (property?.id) {
        // Update existing property
        response = await api.patch(`/api/properties/${property.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress((prev) => ({ ...prev, total: percentCompleted }))
            }
          },
        })
      } else {
        // Create new property
        response = await api.post("/api/properties/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress((prev) => ({ ...prev, total: percentCompleted }))
            }
          },
        })
      }

      toast({
        title: "Success",
        description: property?.id ? "Property updated successfully" : "Property created successfully",
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error: any) {
      console.error("Failed to save property:", error)

      // Extract error message from response if available
      let errorMessage = "Failed to save property. Please try again."
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        errorMessage = Object.keys(errors)
          .map((key) => `${key}: ${errors[key].join(", ")}`)
          .join("; ")
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress({})
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Property Information</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isPropertyLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Loading property details...</p>
          </div>
        ) : (
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Property Media*
                      <span className="text-xs font-normal text-gray-500 ml-1">(Images & Videos: max 50MB each)</span>
                    </label>

                    {(mainImagePreview || additionalImagePreviews.length > 0 || videoPreviews.length > 0) && (
                      <button
                        type="button"
                        onClick={handleClearAllImages}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear All Media
                      </button>
                    )}
                  </div>

                  {/* Main image section */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Cover Image</h3>
                    <div className="relative border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                      {mainImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={mainImagePreview || "/placeholder.svg"}
                            alt="Main property"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                            <button
                              type="button"
                              onClick={handleDeleteMainImage}
                              className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md z-10"
                              disabled={isImageLoading}
                            >
                              {isImageLoading ? (
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                            <p className="text-white text-sm font-medium">Cover Image</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isImageLoading || isSubmitting}
                          />
                          <Image className="h-12 w-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 font-medium">Upload Cover Image</span>
                          <span className="text-xs text-gray-400 mt-1">Click or drag and drop</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional images section */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Additional Images</h3>
                      <button
                        type="button"
                        onClick={() => additionalImagesInputRef.current?.click()}
                        className="text-xs text-primary hover:text-primary-600 flex items-center"
                        disabled={isImageLoading || isSubmitting}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add More Images
                      </button>
                      <input
                        ref={additionalImagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="hidden"
                        disabled={isImageLoading || isSubmitting}
                      />
                    </div>

                    {additionalImagePreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {additionalImagePreviews.map((image, index) => (
                          <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden h-32">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={`Property ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => setImageAsMain(index)}
                                  className="bg-white rounded-full p-1.5 shadow-md"
                                  title="Set as cover image"
                                  disabled={isImageLoading || isSubmitting}
                                >
                                  {isImageLoading ? (
                                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3 text-green-500" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalImage(index)}
                                  className="bg-white rounded-full p-1.5 shadow-md"
                                  title="Remove image"
                                  disabled={isImageLoading || isSubmitting}
                                >
                                  {isImageLoading ? (
                                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3 text-red-500" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add more images tile */}
                        <div
                          onClick={() => !isImageLoading && !isSubmitting && additionalImagesInputRef.current?.click()}
                          className={`border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 bg-gray-50 ${!isImageLoading && !isSubmitting ? "hover:bg-gray-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                        >
                          <Plus className="h-8 w-8 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Add More</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isImageLoading && !isSubmitting && additionalImagesInputRef.current?.click()}
                        className={`border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-gray-50 ${!isImageLoading && !isSubmitting ? "hover:bg-gray-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload Additional Images</span>
                        <span className="text-xs text-gray-400 mt-1">Click or drag and drop</span>
                      </div>
                    )}
                  </div>

                  {/* Videos section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Videos (Max 50MB each)</h3>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="text-xs text-primary hover:text-primary-600 flex items-center"
                        disabled={isImageLoading || isSubmitting}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Videos
                      </button>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={isImageLoading || isSubmitting}
                      />
                    </div>

                    {videoPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {videoPreviews.map((video, index) => (
                          <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden h-32">
                            <video src={video.url} className="w-full h-full object-cover" controls />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => removeVideo(index)}
                                  className="bg-white rounded-full p-1.5 shadow-md"
                                  title="Remove video"
                                  disabled={isImageLoading || isSubmitting}
                                >
                                  {isImageLoading ? (
                                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3 text-red-500" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add more videos tile */}
                        <div
                          onClick={() => !isImageLoading && !isSubmitting && videoInputRef.current?.click()}
                          className={`border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 bg-gray-50 ${!isImageLoading && !isSubmitting ? "hover:bg-gray-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                        >
                          <FileVideo className="h-8 w-8 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Add Video</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isImageLoading && !isSubmitting && videoInputRef.current?.click()}
                        className={`border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-gray-50 ${!isImageLoading && !isSubmitting ? "hover:bg-gray-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                      >
                        <FileVideo className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload Videos</span>
                        <span className="text-xs text-gray-400 mt-1">Max 50MB per video</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="property-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name*
                  </label>
                  <input
                    id="property-name"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your property name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location*
                    </label>
                    <div className="relative">
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location (e.g., Downtown)"
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                        disabled={isSubmitting}
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address*
                    </label>
                    <div className="relative">
                      <input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address"
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                        disabled={isSubmitting}
                      />
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price*
                    </label>
                    <input
                      id="price"
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter your Price"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration*
                    </label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="per_day">Per Day</option>
                      <option value="per_week">Per Week</option>
                      <option value="per_month">Per Month</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      id="bedrooms"
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      placeholder="Number of bedrooms"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      id="bathrooms"
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      placeholder="Number of bathrooms"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                      Area
                    </label>
                    <input
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g., 1200"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type*
                  </label>
                  <select
                    id="property-type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="flat">Flat</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="room">Room</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Property descriptions*
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      (Include min. 260 characters to make it easier for buyers to understand and find your product)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Type Something here.."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px]"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="is-available"
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="is-available" className="ml-2 block text-sm text-gray-700">
                    Property is available for booking
                  </label>
                </div>

                {/* Upload progress bar */}
                {isSubmitting && uploadProgress.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading media...</span>
                      <span>{uploadProgress.total}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${uploadProgress.total}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isImageLoading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : property?.id ? (
                      "Update Property"
                    ) : (
                      "Add Property"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

