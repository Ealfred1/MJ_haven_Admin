"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Bed, Bath, Square, Star } from "lucide-react"
import { propertiesService } from "@/services/properties"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PropertyCardProps {
  id: string | number
  title: string
  price: number
  address: string
  area: string
  city: string
  beds: number
  baths: number
  size: string
  popular?: boolean
  imageUrl?: string
  isFavorite?: boolean
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void
}

export function PropertyCard({
  id,
  title,
  price,
  address,
  area,
  city,
  beds,
  baths,
  size,
  popular = false,
  imageUrl = "/placeholder.svg?height=300&width=400",
  isFavorite: initialIsFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isToggling, setIsToggling] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const propertyId = typeof id === "string" ? Number.parseInt(id) : id
  const cardRef = useRef<HTMLDivElement>(null)

  // Check if property is in local favorites for unauthenticated users
  useEffect(() => {
    if (!user && !initialIsFavorite) {
      const isLocalFavorite = propertiesService.isPropertyFavorited(propertyId)
      setIsFavorite(isLocalFavorite)
    } else {
      setIsFavorite(initialIsFavorite)
    }
  }, [initialIsFavorite, propertyId, user])

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("NGN", "₦")

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isToggling) return
    setIsToggling(true)

    try {
      const result = await propertiesService.toggleFavorite(propertyId)

      // Determine if the property is now favorited based on the response
      const newFavoriteState = result.id !== undefined || result.action === "added"
      setIsFavorite(newFavoriteState)

      if (onFavoriteToggle) {
        onFavoriteToggle(propertyId, newFavoriteState)
      }

      toast({
        title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: newFavoriteState
          ? `${title} has been added to your favorites`
          : `${title} has been removed from your favorites`,
      })
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  // Mouse move effect for 3D tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return

    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group"
      style={{
        maxWidth: "360px",
        maxHeight: "424px",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Card background with glassmorphism effect */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-300"></div>

      {/* Card content */}
      <div className="relative z-10 p-3">
        <div className="relative overflow-hidden rounded-xl">
          <Link href={`/properties/${id}`}>
            <div className="overflow-hidden rounded-xl">
              <motion.img
                src={imageUrl || "/placeholder.svg?height=300&width=400"}
                alt={title}
                className="object-cover w-full h-[200px] transition-transform duration-700"
                whileHover={{ scale: 1.1 }}
                style={{
                  width: "100%",
                  height: "200px",
                }}
              />
            </div>
          </Link>

          {/* Favorite button */}
          <motion.button
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md ${
              isFavorite ? "bg-red-500/90 text-white" : "bg-white/80 text-gray-700 hover:bg-white/90"
            } ${isToggling ? "opacity-50" : ""} shadow-sm transition-all duration-300`}
            onClick={handleFavoriteToggle}
            disabled={isToggling}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            whileTap={{ scale: 0.9 }}
            style={{ width: "36px", height: "36px" }}
          >
            <Heart className="h-5 w-5 mx-auto" fill={isFavorite ? "currentColor" : "none"} />
          </motion.button>

          {/* Popular badge */}
          {popular && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-sm"
            >
              <Star className="h-3 w-3" fill="currentColor" />
              <span className="uppercase font-medium">Popular</span>
            </motion.div>
          )}
        </div>

        <div className="p-3">
          <div className="flex justify-between items-start">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <p className="text-lg font-bold text-primary">
                {formattedPrice} <span className="text-sm font-normal text-gray-500">/per day</span>
              </p>
            </motion.div>
          </div>

          <Link href={`/properties/${id}`}>
            <motion.h3
              className="text-xl font-bold mt-2 hover:text-primary transition-colors line-clamp-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h3>
          </Link>

          <motion.p
            className="text-gray-500 text-sm mt-1 mb-4 line-clamp-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {address}, {area}, {city}
          </motion.p>

          <motion.div
            className="border-t pt-4 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between text-gray-700 text-sm">
              <motion.div className="flex items-center" whileHover={{ scale: 1.05, color: "#66773B" }}>
                <Bed className="h-5 w-5 mr-2 text-gray-500" />
                <span>
                  {beds} {beds === 1 ? "Bed" : "Beds"}
                </span>
              </motion.div>

              <motion.div className="flex items-center" whileHover={{ scale: 1.05, color: "#66773B" }}>
                <Bath className="h-5 w-5 mr-2 text-gray-500" />
                <span>
                  {baths} {baths === 1 ? "Bath" : "Baths"}
                </span>
              </motion.div>

              <motion.div className="flex items-center" whileHover={{ scale: 1.05, color: "#66773B" }}>
                <Square className="h-5 w-5 mr-2 text-gray-500" />
                <span>{size}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hover effect - glow */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle at center, rgba(102, 119, 59, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
      />
    </motion.div>
  )
}

