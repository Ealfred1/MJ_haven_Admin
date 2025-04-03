"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [date, setDate] = useState()

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <img
          src="/house.jpeg"
          alt="Luxury apartment interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2F3523] bg-opacity-80"></div>
      </div>

      <div className="container w-full max-w-[811px] mx-auto px-4 z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-[58px] font-bold text-[#FEFEFE] mb-4">
          Experience Luxury Shortlet Stays with MJ Haven
        </h1>
        <p className="text-[20px] font-medium max-w-[448px] text-[#FEFEFE] mb-8 mx-auto">
          Find and book premium short-term rentals with ease.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-auto text-left">
              <h2 className="text-[16px] font-medium text-[#1C1B20B2] mb-1">Location</h2>
              <div className="text-[18px] text-[#1C1B20] font-bold">Lagos, Nigeria</div>
            </div>

            <div className="w-full md:w-auto text-left">
              <h2 className="text-[16px] font-medium text-[#1C1B20B2] mb-1">When</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start border-none ring-0 outline-0 px-0 text-[#1C1B20] font-bold text-left", !date && "text-muted-foreground")}
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

            <Button 
              className="w-full h-[56px] rounded-[8px] md:w-[209px] bg-[#66773B] hover:bg-[#5A6B42] text-white"
            >
              Browse Properties
            </Button>
          </div>
        </div>

        {/* Counters section */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-8 text-white">
            <div className="text-center">
              <h3 className="text-5xl font-bold">50k+</h3>
              <p className="text-xl mt-2">Renters</p>
            </div>
            
            <div className="h-16 w-px bg-white/30"></div>
            
            <div className="text-center">
              <h3 className="text-5xl font-bold">10k+</h3>
              <p className="text-xl mt-2">Shortlet</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}