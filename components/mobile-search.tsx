"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileSearch() {
  const router = useRouter()
  const [searchLocation, setSearchLocation] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/properties?location=${encodeURIComponent(searchLocation)}`)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Search for Shortlist near you</h2>

      <form onSubmit={handleSearch}>
        <div className="relative mb-4">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search Location"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter size={18} />
          <span>Filter</span>
        </button>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Browse Properties
        </button>
      </form>
    </div>
  )
}

