"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function SearchSection() {
  const [location, setLocation] = useState("Lagos, Nigeria")
  const [date, setDate] = useState<Date>()
  const [priceRange, setPriceRange] = useState("₦200-₦500")
  const [propertyType, setPropertyType] = useState("House")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <h1 className="text-3xl font-bold">Search for Shortlist near you</h1>

          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for properties"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">When</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select Move-in Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="₦200-₦500">₦200-₦500</option>
              <option value="₦500-₦1000">₦500-₦1000</option>
              <option value="₦1000-₦2000">₦1000-₦2000</option>
              <option value="₦2000+">₦2000+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Room">Room</option>
              <option value="Flat">Flat</option>
              <option value="Suite">Suite</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/properties"
            className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  )
}

